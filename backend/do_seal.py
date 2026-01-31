from django.contrib.auth import get_user_model
from swm.tarot.models import WorkspaceInstance
from swm.tarot.services.session_service import SessionService
from swm.tarot.services.workspace_service import WorkspaceService
from django.core.exceptions import ValidationError, PermissionDenied
import traceback

User = get_user_model()

try:
    user = User.objects.get(id=8)
    inst = WorkspaceInstance.objects.filter(status__in=['created','in_progress']).order_by('-created_at').first()
    if not inst:
        print('NO_INSTANCE')
    else:
        print('TRY_SEAL_INSTANCE:', inst.id, inst.status)
        try:
            active_session = SessionService.get_active_session(inst)
            if active_session:
                print('Ending active session', active_session.id)
                SessionService.end_session(session=active_session, user=user, ip_address='127.0.0.1', user_agent='seal-test')
            instance = WorkspaceService.transition_status(
                instance=inst,
                new_status='sealed',
                user=user,
                ip_address='127.0.0.1',
                user_agent='seal-test'
            )
            print('SEALED OK:', instance.id, instance.status)
        except ValidationError as e:
            print('ValidationError:', str(e))
        except PermissionDenied as e:
            print('PermissionDenied:', str(e))
        except Exception as e:
            print('Unexpected exception:')
            traceback.print_exc()
except Exception:
    traceback.print_exc()
