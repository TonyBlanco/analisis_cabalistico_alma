from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
import csv
import os


class Command(BaseCommand):
    help = 'Purge legacy TestModule rows (DBG/LOCK/SMOKE + optional clinical) safely with dry-run and backups.'

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Actually perform deletions (default: dry-run)')
        parser.add_argument('--yes', action='store_true', help='Skip confirmation prompt when --apply is provided')
        parser.add_argument('--include-clinical', action='store_true', help='Include clinical codes phq-9,gad-7,bai,bdi-ii')
        parser.add_argument('--only-internal', dest='only_internal', action='store_true', default=True, help='Only target internal prefixed modules (default ON)')
        parser.add_argument('--no-only-internal', dest='only_internal', action='store_false', help='Disable only-internal filter')
        parser.add_argument('--export', type=str, help='Export candidate list to CSV at given path')
        parser.add_argument('--deactivate-only', action='store_true', help='Do not delete; set is_active=False instead')

    def handle(self, *args, **options):
        from api.test_models import TestModule, TestResult, UserTestAccess, UserTestLicense

        apply_changes = options.get('apply')
        assume_yes = options.get('yes')
        include_clinical = options.get('include_clinical')
        only_internal = options.get('only_internal')
        export_path = options.get('export')
        deactivate_only = options.get('deactivate_only')

        internal_prefixes = ['lock-test', 'dbg-test', 'smoke-test']
        clinical_codes = ['phq-9', 'gad-7', 'bai', 'bdi-ii']

        qs = TestModule.objects.all()

        candidates = TestModule.objects.none()

        if only_internal:
            for p in internal_prefixes:
                candidates = candidates | qs.filter(code__istartswith=p)
        else:
            for p in internal_prefixes:
                candidates = candidates | qs.filter(code__istartswith=p)

        if include_clinical:
            candidates = candidates | qs.filter(code__in=clinical_codes)

        candidates = candidates.distinct().order_by('id')

        total_candidates = candidates.count()
        if total_candidates == 0:
            self.stdout.write(self.style.SUCCESS('No candidate TestModule rows found. Nothing to do.'))
            return

        # Build report rows
        report_rows = []
        for mod in candidates:
            results_count = getattr(mod, 'results').count() if hasattr(mod, 'results') else 0
            access_count = getattr(mod, 'user_access').count() if hasattr(mod, 'user_access') else 0
            license_count = getattr(mod, 'licenses').count() if hasattr(mod, 'licenses') else 0
            report_rows.append({
                'id': mod.id,
                'code': mod.code,
                'name': mod.name,
                'is_active': mod.is_active,
                'test_type': mod.test_type,
                'required_access_level': mod.required_access_level,
                'results_count': results_count,
                'user_access_count': access_count,
                'licenses_count': license_count,
            })

        # Print summary
        self.stdout.write('Purge Legacy TestModules Report')
        self.stdout.write('Generated at: %s' % timezone.now().isoformat())
        self.stdout.write('Candidates: %d' % total_candidates)
        self.stdout.write('---')
        for r in report_rows:
            self.stdout.write("id={id} code={code} name='{name}' active={is_active} type={test_type} access={required_access_level} results={results_count} accesses={user_access_count} licenses={licenses_count}".format(**r))

        # Export CSV if requested
        if export_path:
            try:
                dirpath = os.path.dirname(export_path)
                if dirpath and not os.path.exists(dirpath):
                    os.makedirs(dirpath, exist_ok=True)
                with open(export_path, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames=list(report_rows[0].keys()))
                    writer.writeheader()
                    for row in report_rows:
                        writer.writerow(row)
                self.stdout.write(self.style.SUCCESS(f'Exported candidate list to {export_path}'))
            except Exception as e:
                raise CommandError(f'Failed to export CSV: {e}')

        # Show actions
        action = 'deactivate (is_active=False)' if deactivate_only else 'delete'
        self.stdout.write('Action: %s' % action)

        if not apply_changes:
            self.stdout.write(self.style.WARNING('Dry-run mode (no changes). Use --apply to perform deletions/changes).'))
            return

        # Confirmation prompt
        if not assume_yes:
            confirm = input(f'About to {action} {total_candidates} TestModule(s). Type YES to continue: ')
            if confirm != 'YES':
                self.stdout.write(self.style.ERROR('Aborted by user. No changes made.'))
                return

        # Perform deletions within a transaction with explicit dependency removal
        deleted_log = []
        with transaction.atomic():
            for mod in candidates.select_for_update():
                # Recompute counts
                results_qs = getattr(mod, 'results') if hasattr(mod, 'results') else TestResult.objects.none()
                access_qs = getattr(mod, 'user_access') if hasattr(mod, 'user_access') else UserTestAccess.objects.none()
                license_qs = getattr(mod, 'licenses') if hasattr(mod, 'licenses') else UserTestLicense.objects.none()

                res_count = results_qs.count()
                acc_count = access_qs.count()
                lic_count = license_qs.count()

                log_entry = {
                    'id': mod.id,
                    'code': mod.code,
                    'name': mod.name,
                    'results_deleted': 0,
                    'access_deleted': 0,
                    'licenses_deleted': 0,
                    'module_deleted': False,
                }

                if deactivate_only:
                    mod.is_active = False
                    mod.save(update_fields=['is_active'])
                    log_entry['module_deleted'] = False
                else:
                    # Delete dependent objects first
                    if res_count:
                        log_entry['results_deleted'] = results_qs.delete()[0]
                    if acc_count:
                        log_entry['access_deleted'] = access_qs.delete()[0]
                    if lic_count:
                        log_entry['licenses_deleted'] = license_qs.delete()[0]

                    # Finally delete module
                    mod.delete()
                    log_entry['module_deleted'] = True

                deleted_log.append(log_entry)

        # Write audit log CSV summarizing deletions
        ts = timezone.now().strftime('%Y%m%d_%H%M%S')
        audit_path = f'purge_legacy_testmodules_deleted_{ts}.csv'
        try:
            with open(audit_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['id', 'code', 'name', 'results_deleted', 'access_deleted', 'licenses_deleted', 'module_deleted']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                for e in deleted_log:
                    writer.writerow(e)
            self.stdout.write(self.style.SUCCESS(f'Purge completed. Audit log: {audit_path}'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Purge completed but failed to write audit log: {e}'))
