from datetime import date
from typing import Any
from django.contrib.auth.models import User


class UserProfile:
    user: User
    user_type: str
    full_name: str
    subscription_plan: str
    objects: Any
    def save(self) -> None: ...


class Patient:
    id: int
    user: User
    therapist: User
    full_name: str
    email: str
    birth_date: date
    is_active: bool
    objects: Any
