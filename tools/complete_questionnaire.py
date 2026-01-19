import os
import sys
import json
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from swm.mcmi4.models import WorkspaceInstance, WorkspaceSession, WorkspaceArtifact
from swm.mcmi4.services.questionnaire_service import QuestionnaireService
from django.core.exceptions import ValidationError
import uuid

WORKSPACE_ID = '56dc6785-bb8d-4fa4-96de-e5bc87b3a12f'
SESSION_ID = '5ec88352-59f6-4cd7-aef0-4d62aedf8b24'


def dump_progress(ws):
    pa = WorkspaceArtifact.objects.filter(workspace_instance=ws, artifact_type='questionnaire_progress').first()
    if not pa:
        print('No progress artifact found')
        return None
    print('--- questionnaire_progress ---')
    print(json.dumps(pa.content, indent=2, ensure_ascii=False))
    return pa.content


def list_artifacts(ws):
    arts = list(WorkspaceArtifact.objects.filter(workspace_instance=ws).values('id','artifact_type','created_by_id','created_at'))
    print('--- artifacts list ---')
    print(json.dumps(arts, indent=2, default=str))
    return arts


def workspace_state(ws):
    state = {
        'id': str(ws.id),
        'status': ws.status,
        'created_at': str(ws.created_at),
        'started_at': str(ws.started_at) if ws.started_at else None,
        'sealed_at': str(ws.sealed_at) if ws.sealed_at else None,
    }
    print('--- workspace state ---')
    print(json.dumps(state, indent=2))
    return state


def main():
    try:
        ws = WorkspaceInstance.objects.get(id=uuid.UUID(WORKSPACE_ID))
        sess = WorkspaceSession.objects.get(id=uuid.UUID(SESSION_ID))
    except Exception:
        print('ERROR: workspace or session not found')
        traceback.print_exc()
        sys.exit(2)

    # Load config artifact
    config = WorkspaceArtifact.objects.filter(workspace_instance=ws, artifact_type='questionnaire_config').first()
    if not config:
        print('No questionnaire_config artifact present. Aborting.')
        sys.exit(2)

    questions = config.content.get('questions_full', [])
    total = len(questions)
    print(f'Found {total} questions in config')

    # Iterate and answer
    answered = 0
    for q in questions:
        qid = q['id']
        # Check current progress
        progress = WorkspaceArtifact.objects.filter(workspace_instance=ws, artifact_type='questionnaire_progress').first()
        responses = progress.content.get('responses', {}) if progress else {}
        if qid in responses:
            answered = len(responses)
            continue

        try:
            progress_art, summary = QuestionnaireService.save_response(
                workspace_instance=ws,
                session=sess,
                question_id=qid,
                value=3,
                world=q.get('world')
            )
            answered = summary.get('total_answered', answered+1)
            if answered % 25 == 0 or answered == total:
                print(f'Answered {answered}/{total} (last question {qid})')
        except ValidationError as ve:
            print('FAIL: ValidationError while saving response')
            print(str(ve))
            dump_progress(ws)
            list_artifacts(ws)
            workspace_state(ws)
            traceback.print_exc()
            sys.exit(3)
        except Exception as e:
            print('FAIL: Exception while saving response')
            print(str(e))
            dump_progress(ws)
            list_artifacts(ws)
            workspace_state(ws)
            traceback.print_exc()
            sys.exit(4)

    print('All responses attempted. Finalizing questionnaire...')

    try:
        completion = QuestionnaireService.finalize_questionnaire(workspace_instance=ws, session=sess)
        print('Finalize succeeded. Completion artifact id:', str(completion.id))
    except ValidationError as ve:
        print('FAIL: ValidationError during finalize')
        print(str(ve))
        dump_progress(ws)
        list_artifacts(ws)
        workspace_state(ws)
        traceback.print_exc()
        sys.exit(5)
    except Exception as e:
        print('FAIL: Exception during finalize')
        print(str(e))
        dump_progress(ws)
        list_artifacts(ws)
        workspace_state(ws)
        traceback.print_exc()
        sys.exit(6)

    # Print final evidence
    final_progress = dump_progress(ws)
    arts = list_artifacts(ws)
    state = workspace_state(ws)

    print('\n=== SUMMARY EVIDENCE ===')
    print('final_progress_keys:', list(final_progress.keys()) if final_progress else None)
    print('artifacts_count:', len(arts))
    print('workspace_status:', state['status'])

    # Success
    sys.exit(0)


if __name__ == '__main__':
    main()
