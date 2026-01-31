from django.contrib.auth import get_user_model
from swm.tarot.models import WorkspaceInstance
from swm.tarot.services.workspace_service import WorkspaceService
from swm.tarot.services.session_service import SessionService
from django.core.exceptions import ValidationError, PermissionDenied
import traceback

User = get_user_model()

try:
    user = User.objects.get(id=8)
    inst = WorkspaceInstance.objects.filter(status__in=['created','in_progress']).order_by('-created_at').first()
    if not inst:
        print('NO_INSTANCE')
    else:
        print('INSTANCE:', inst.id, inst.status)
        try:
            # create a minimal spread
            cards = [{'position': 1, 'card_id': 0, 'reversed': False}]
            artifact = WorkspaceService.save_spread(
                instance=inst,
                user=user,
                cards=cards,
                spread_type=inst.spread_type,
                tarot_system=inst.tarot_system,
                therapist_notes='Auto-seed for sealing',
                session_context='auto-seed',
                ip_address='127.0.0.1',
                user_agent='auto-seed-script'
            )
            print('ARTIFACT_CREATED:', artifact.id)

            # Now attempt to seal
            active_session = SessionService.get_active_session(inst)
            if active_session:
                print('Ending active session', active_session.id)
                SessionService.end_session(session=active_session, user=user, ip_address='127.0.0.1', user_agent='auto-seed-script')

            instance = WorkspaceService.transition_status(
                instance=inst,
                new_status='sealed',
                user=user,
                ip_address='127.0.0.1',
                user_agent='auto-seed-script'
            )
            print('SEALED OK:', instance.id, instance.status)
        except ValidationError as e:
            print('ValidationError:', e)
        except PermissionDenied as e:
            print('PermissionDenied:', e)
        except Exception:
            print('Unexpected exception:')
            traceback.print_exc()
except Exception:
    traceback.print_exc()
