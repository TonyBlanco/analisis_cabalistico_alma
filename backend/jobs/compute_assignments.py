from typing import Any, Dict
from django.utils import timezone


def _responses_to_map(raw_responses):
    if isinstance(raw_responses, dict):
        return raw_responses
    responses_map = {}
    if isinstance(raw_responses, list):
        for item in raw_responses:
            if not isinstance(item, dict):
                continue
            qid = item.get("question_id")
            answer = item.get("answer")
            if qid is None:
                continue
            responses_map[str(qid)] = answer
    return responses_map


def compute_results(assignment_id: int, force: bool = False) -> Dict[str, Any]:
    from api.test_models import Assignment
    from api.models import AnalysisRecord
    from api.diagnostics import compute_mcmi4_mystic, compute_mcmi4_mystic_195

    assignment = Assignment.objects.select_related(
        "patient",
        "assigned_by_user",
        "assigned_to_user",
    ).get(id=assignment_id)

    if assignment.status == "completed" and assignment.results and not force:
        return assignment.results

    responses_map = _responses_to_map(assignment.raw_responses or {})
    if not responses_map:
        return {"error": "missing_responses"}
    input_data = {
        "responses": responses_map,
        "questions_used": assignment.questions or [],
    }

    symbolic_result: Dict[str, Any]
    try:
        symbolic_result = compute_mcmi4_mystic_195(input_data)
    except Exception:
        symbolic_result = compute_mcmi4_mystic({"responses": responses_map})

    mshe_result = None
    try:
        from api.holistic_synthesis_engine import HolisticSynthesisEngine
        if assignment.patient and assignment.assigned_by_user:
            engine = HolisticSynthesisEngine(assignment.patient, assignment.assigned_by_user)
            mshe_result = engine.compute_synthesis()
    except Exception:
        mshe_result = None

    analysis_record_id = None
    try:
        patient = assignment.patient
        record = AnalysisRecord.objects.create(
            kind="kabbalah",
            module_code=assignment.test_type,
            role_context="therapist",
            execution_mode="therapist_clinical",
            birth_data_snapshot={
                "legal_name": getattr(patient, "full_name", "") if patient else "",
                "birth_date": str(getattr(patient, "birth_date", "") or ""),
                "birth_time": str(getattr(patient, "birth_time", "") or ""),
                "city": getattr(patient, "birth_city", "") if patient else "",
                "country": getattr(patient, "birth_country", "") if patient else "",
                "lat": float(getattr(patient, "birth_latitude", 0) or 0) if patient else 0,
                "lng": float(getattr(patient, "birth_longitude", 0) or 0) if patient else 0,
                "timezone": getattr(patient, "birth_timezone", "") if patient else "",
                "geocode_source": "assignment",
            },
            algorithm_snapshot={
                "engine": "compute_mcmi4_mystic_195",
                "version": "1",
                "params": {"n_questions": len(assignment.questions or [])},
            },
            raw_input={
                "assignment_id": assignment.id,
                "questions_used": assignment.questions or [],
                "responses": responses_map,
            },
            computed_result=symbolic_result,
            legacy_output=None,
            created_by_user=assignment.assigned_by_user,
            subject_user=assignment.assigned_to_user,
            therapist=assignment.assigned_by_user,
            patient=assignment.patient,
            visibility="therapist",
        )
        analysis_record_id = str(record.id)
    except Exception:
        analysis_record_id = None

    results = {
        "symbolic": symbolic_result,
        "mshe": mshe_result,
        "analysis_record_id": analysis_record_id,
    }

    if assignment.status != "completed":
        assignment.append_audit("compute", {"status": "completed"})
    assignment.results = results
    assignment.status = "completed"
    assignment.completed_at = timezone.now()
    assignment.locked = True
    assignment.save()

    return results
