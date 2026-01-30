from typing import Any, Dict, List, Optional
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from api.models import Patient, UserProfile
from api.test_models import Assignment
from assignments.select import select_questions
from jobs.compute_assignments import compute_results


def _is_therapist(profile: Optional[UserProfile]) -> bool:
    return bool(profile and profile.user_type == "therapist")


def _is_consultant(profile: Optional[UserProfile]) -> bool:
    return bool(profile and profile.user_type in ("patient", "personal"))


def _assignment_payload(assignment: Assignment, full: bool) -> Dict[str, Any]:
    base = {
        "id": assignment.id,
        "patient_id": assignment.patient_id,
        "test_type": assignment.test_type,
        "assigned_by_user_id": assignment.assigned_by_user_id,
        "assigned_to_user_id": assignment.assigned_to_user_id,
        "questions_count": len(assignment.questions or []),
        "times_assigned": assignment.times_assigned,
        "max_reassign": assignment.max_reassign,
        "status": assignment.status,
        "locked": assignment.locked,
        "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
        "completed_at": assignment.completed_at.isoformat() if assignment.completed_at else None,
    }
    if not full:
        return base
    base["questions"] = assignment.questions
    base["audit_log"] = assignment.audit_log
    base["results"] = assignment.results
    return base


class AssignmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        if not _is_therapist(profile):
            return Response(
                {"error": "forbidden", "message": "therapist_only"},
                status=status.HTTP_403_FORBIDDEN,
            )

        patient_id = request.query_params.get("patient_id")
        test_type = request.query_params.get("test_type")

        assignments = Assignment.objects.select_related("patient").filter(
            patient__therapist=request.user,
        )
        if patient_id:
            assignments = assignments.filter(patient_id=patient_id)
        if test_type:
            assignments = assignments.filter(test_type=test_type)

        payload = [_assignment_payload(a, full=True) for a in assignments]
        return Response(payload)

    def post(self, request):
        profile = getattr(request.user, "profile", None)
        if not _is_therapist(profile):
            return Response(
                {"error": "forbidden", "message": "therapist_only"},
                status=status.HTTP_403_FORBIDDEN,
            )

        patient_id = request.data.get("patient_id")
        test_type = request.data.get("test_type") or "mcmi4-mystic"
        assigned_to_user_id = request.data.get("assigned_to_user_id")
        n_questions = int(request.data.get("n_questions") or 195)

        if not patient_id or not assigned_to_user_id:
            return Response(
                {"error": "invalid_request", "message": "patient_id and assigned_to_user_id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            patient = Patient.objects.get(id=patient_id, therapist=request.user)
        except Patient.DoesNotExist:
            return Response(
                {"error": "patient_not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not patient.user or patient.user.id != int(assigned_to_user_id):
            return Response(
                {"error": "assigned_user_mismatch"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        previous = (
            Assignment.objects
            .filter(patient=patient, test_type=test_type)
            .order_by("-created_at")
            .first()
        )
        times_assigned = (previous.times_assigned + 1) if previous else 1
        max_reassign = previous.max_reassign if previous else 4
        if times_assigned > max_reassign:
            return Response(
                {"error": "max_reassign_exceeded", "message": "max_reassign_exceeded"},
                status=status.HTTP_403_FORBIDDEN,
            )

        questions, meta = select_questions(patient.id, test_type, n_questions)
        assignment = Assignment.objects.create(
            patient=patient,
            test_type=test_type,
            assigned_by_user=request.user,
            assigned_to_user=patient.user,
            # populate subject_user to satisfy DB constraint/new identity fields
            subject_user=patient.user,
            questions=questions,
            questions_hash=meta.get("questions_hash", ""),
            times_assigned=times_assigned,
            max_reassign=max_reassign,
            status="assigned",
            locked=False,
        )
        assignment.append_audit("assigned", {"n_questions": n_questions})
        if meta.get("collision"):
            assignment.append_audit("collision", {"collision_count": meta.get("collision_count", 0)})
        assignment.save()

        return Response(_assignment_payload(assignment, full=True), status=status.HTTP_201_CREATED)


class AssignmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id: int):
        assignment = Assignment.objects.select_related("patient").get(id=assignment_id)
        profile = getattr(request.user, "profile", None)

        if _is_therapist(profile):
            if assignment.patient.therapist_id != request.user.id:
                return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
            return Response(_assignment_payload(assignment, full=True))

        if _is_consultant(profile) and assignment.assigned_to_user_id == request.user.id:
            return Response(_assignment_payload(assignment, full=False))

        return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, assignment_id: int):
        assignment = Assignment.objects.select_related("patient").get(id=assignment_id)
        profile = getattr(request.user, "profile", None)

        if not _is_therapist(profile):
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if assignment.patient.therapist_id != request.user.id:
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssignmentStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id: int):
        assignment = Assignment.objects.select_related("patient").get(id=assignment_id)
        profile = getattr(request.user, "profile", None)

        if not _is_consultant(profile) or assignment.assigned_to_user_id != request.user.id:
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if assignment.locked and assignment.status == "in_progress":
            return Response({"status": assignment.status, "locked": assignment.locked})

        assignment.status = "in_progress"
        assignment.locked = True
        assignment.append_audit("start", {"user_id": request.user.id})
        assignment.save()
        return Response({"status": assignment.status, "locked": assignment.locked})


class AssignmentSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id: int):
        assignment = Assignment.objects.select_related("patient").get(id=assignment_id)
        profile = getattr(request.user, "profile", None)

        if not _is_consultant(profile) or assignment.assigned_to_user_id != request.user.id:
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        responses = request.data.get("responses") or []
        if not isinstance(responses, list) or len(responses) == 0:
            return Response({"error": "invalid_responses"}, status=status.HTTP_400_BAD_REQUEST)

        assignment.raw_responses = responses
        assignment.responses_hash = str(hash(str(responses)))
        assignment.status = "pending_compute"
        assignment.append_audit("submit", {"count": len(responses)})
        assignment.save()
        return Response({"status": assignment.status}, status=status.HTTP_202_ACCEPTED)


class AssignmentComputeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id: int):
        profile = getattr(request.user, "profile", None)
        is_admin = bool(profile and profile.is_admin) or request.user.is_staff or request.user.is_superuser
        if not is_admin:
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        results = compute_results(assignment_id)
        return Response({"status": "completed", "results": results})


class AssignmentResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, assignment_id: int):
        assignment = Assignment.objects.select_related("patient").get(id=assignment_id)
        profile = getattr(request.user, "profile", None)

        if not _is_therapist(profile):
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if assignment.patient.therapist_id != request.user.id:
            return Response({"error": "forbidden"}, status=status.HTTP_403_FORBIDDEN)

        return Response(_assignment_payload(assignment, full=True))


class AssignmentResetView(APIView):
    """Reset an assignment to allow the patient to complete it again."""
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id: int):
        try:
            assignment = Assignment.objects.select_related("patient").get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"error": "not_found"}, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(request.user, "profile", None)

        # Only therapists can reset
        if not _is_therapist(profile):
            return Response({"error": "forbidden", "message": "Solo terapeutas pueden resetear asignaciones"}, status=status.HTTP_403_FORBIDDEN)

        # Verify ownership
        if assignment.patient.therapist_id != request.user.id:
            return Response({"error": "forbidden", "message": "No tienes permiso para resetear esta asignación"}, status=status.HTTP_403_FORBIDDEN)

        # Delete related TestResults for this patient and test_type
        from api.test_models import TestResult
        deleted_count, _ = TestResult.objects.filter(
            patient=assignment.patient,
            test_module__code=assignment.test_type
        ).delete()

        # Reset assignment status
        assignment.status = "assigned"
        assignment.results = {}  # Empty dict (NOT NULL constraint)
        assignment.raw_responses = {}  # Empty dict (NOT NULL constraint)
        assignment.responses_hash = ""  # Empty string (NOT NULL constraint)
        assignment.completed_at = None
        assignment.append_audit("reset", {"deleted_results": deleted_count, "by_user": request.user.username})
        assignment.save()

        return Response({
            "status": "reset",
            "message": f"Asignación reseteada. Se eliminaron {deleted_count} resultado(s) previo(s).",
            "assignment": _assignment_payload(assignment, full=False)
        })
