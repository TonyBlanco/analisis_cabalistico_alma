from django.test import TestCase

from api.test_models import TestModule
from api.test_serializers import TestModuleSerializer


class TestModuleSerializerExecutionModeTests(TestCase):
    def _create_module(self, code: str, available_for_therapists: bool, available_for_personal: bool) -> TestModule:
        return TestModule.objects.create(
            code=code,
            name=f"{code} name",
            description=f"{code} description",
            test_type="basic",
            available_for_therapists=available_for_therapists,
            available_for_personal=available_for_personal,
        )

    def test_execution_mode_patient_self_only(self):
        module = self._create_module("tm_personal", False, True)
        data = TestModuleSerializer(module).data
        self.assertEqual(data["execution_mode"], "patient_self")

    def test_execution_mode_therapist_only(self):
        module = self._create_module("tm_therapist", True, False)
        data = TestModuleSerializer(module).data
        self.assertEqual(data["execution_mode"], "therapist_clinical")

    def test_execution_mode_both_available(self):
        module = self._create_module("tm_both", True, True)
        data = TestModuleSerializer(module).data
        self.assertIsNone(data["execution_mode"])

    def test_execution_mode_none_available(self):
        module = self._create_module("tm_none", False, False)
        data = TestModuleSerializer(module).data
        self.assertIsNone(data["execution_mode"])
