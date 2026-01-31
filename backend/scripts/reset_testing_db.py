#!/usr/bin/env python3
"""Reset testing DB: backup, remove, migrate, create admin users and test consultantes.

Usage: run from workspace root or backend folder with Django env available.
"""
import os
import shutil
import datetime
import random
import string

import django
from django.core.management import call_command

# Ensure Django apps are loaded when running this script directly
django.setup()


def randpass(n=12):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(n))


def main():
    BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DB_PATH = os.path.join(BASE, 'db.sqlite3')

    # Backup
    if os.path.exists(DB_PATH):
        ts = datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
        bak = DB_PATH + f'.bak.{ts}'
        print('Backing up', DB_PATH, '->', bak)
        shutil.copy2(DB_PATH, bak)
        os.remove(DB_PATH)
    else:
        print('No existing db found, continuing.')

    # Run migrations
    print('Running migrations...')
    call_command('migrate', interactive=False)

    # Create users and consultantes
    from django.contrib.auth import get_user_model
    User = get_user_model()
    from api.models import Consultante

    created = {}

    def make_user(username, email, is_superuser=True, is_staff=True):
        pw = randpass(12)
        u, created_flag = User.objects.get_or_create(username=username, defaults={'email': email})
        u.email = email
        u.is_superuser = is_superuser
        u.is_staff = is_staff
        u.set_password(pw)
        u.save()
        created[username] = {'password': pw, 'id': u.id}
        return u

    print('Creating admin accounts...')
    superadmin = make_user('superadmin', 'superadmin@local.test', is_superuser=True, is_staff=True)
    supertony = make_user('supertony', 'supertony@local.test', is_superuser=True, is_staff=True)
    admin = make_user('admin', 'admin@local.test', is_superuser=False, is_staff=True)

    # Create two consultantes with linked user_account and therapist=superadmin
    print('Creating two Consultante test records...')
    def create_consultante(name, email, username_suffix):
        user = make_user(f'user_{username_suffix}', email)
        c = Consultante.objects.create(
            full_name=name,
            email=email,
            therapist=superadmin,
            user_account=user,
            therapy_status='active'
        )
        return c, user

    c1, u1 = create_consultante('Test Patient One', 'test1@local.test', 'test1')
    c2, u2 = create_consultante('Test Patient Two', 'test2@local.test', 'test2')

    print('\nCreated accounts:')
    for k, v in created.items():
        print(f" - {k}: id={v['id']} password={v['password']}")

    print('\nCreated consultantes:')
    print(f" - {c1.full_name}: uuid={c1.uuid} user_account.id={c1.user_account.id} email={c1.email}")
    print(f" - {c2.full_name}: uuid={c2.uuid} user_account.id={c2.user_account.id} email={c2.email}")

    # Write a simple file with references to patient in repo
    print('\nScanning repository for "patient" references...')
    refs = []
    for root, dirs, files in os.walk(BASE):
        # skip migrations cached, venv, node_modules
        if 'node_modules' in root or '.venv' in root or '.git' in root:
            continue
        for fn in files:
            if fn.endswith(('.py', '.ts', '.tsx', '.md', '.json')):
                path = os.path.join(root, fn)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
                        txt = fh.read()
                except Exception:
                    continue
                if 'patient' in txt.lower():
                    refs.append(os.path.relpath(path, BASE))

    out_dir = os.path.join(BASE, 'diagnostics')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'patient_references.txt')
    with open(out_file, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(sorted(set(refs))))

    print(f'Wrote references list to {out_file} ({len(refs)} files matched)')


if __name__ == '__main__':
    main()
