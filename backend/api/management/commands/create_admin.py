from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile

class Command(BaseCommand):
    help = 'Create or update the supertony admin user'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Creating/updating supertony admin user...')

        # Create or get the user
        user, created = User.objects.get_or_create(
            username='supertony',
            defaults={
                'email': 'admin@analisis-cabalistico-alma.com',
                'first_name': 'Super',
                'last_name': 'Tony',
                'is_staff': True,
                'is_superuser': True,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created user: {user.username}'))
        else:
            self.stdout.write(f'✅ User {user.username} already exists, updating permissions...')

        # Ensure admin permissions
        user.is_staff = True
        user.is_superuser = True
        user.save()

        # Create or update profile
        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'user_type': 'therapist',
                'full_name': 'Super Tony Admin',
                'is_admin': True,
                'subscription_status': 'active',
                'profession': 'Administrador del Sistema',
                'max_patients': 0,
            }
        )

        if profile_created:
            self.stdout.write(self.style.SUCCESS('✅ Created user profile'))
        else:
            self.stdout.write('✅ User profile exists, updating...')

        profile.is_admin = True
        profile.save()

        self.stdout.write(self.style.SUCCESS('🎉 Admin user setup complete!'))
        self.stdout.write(f'   📧 Email: {user.email}')
        self.stdout.write('   🔑 Username: supertony'
        self.stdout.write('   👑 Superuser: True'
        self.stdout.write('   🛡️  Staff: True'
        self.stdout.write('   ⚡ Admin: True'
        self.stdout.write('')
        self.stdout.write('💡 You can now access /admin with username "supertony"')