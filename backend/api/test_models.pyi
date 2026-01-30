from typing import Any, Dict, List, Optional
from datetime import date
from django.contrib.auth.models import User
from api.models import Patient


class TestModule:
    code: str
    name: str
    description: str
    test_type: str
    is_active: bool
    available_for_personal: bool
    available_for_therapists: bool
    is_assignable: bool
    is_internal: bool
    domain: str
    required_access_level: str
    objects: Any


class TestResult:
    id: int
    patient: Optional[Patient]
    details: Dict[str, Any]
    objects: Any


class Assignment:
    id: int
    patient: Patient
    test_type: str
    assigned_by_user: User
    assigned_to_user: User
    status: str
    questions: List[Any]
    results: Dict[str, Any]
    raw_responses: Dict[str, Any]
    responses_hash: str
    objects: Any


class UserTestAccess:
    user: User
    test_module: TestModule
    has_special_access: bool
    objects: Any
