from datetime import date

from django.test import TestCase
from api.mcmi4_utils import generate_mcmi4_mystic_test
from api.models import Patient
from django.contrib.auth.models import User

class Mcmi4QuestionIdTest(TestCase):
    def setUp(self):
        # Create a dummy therapist, user, and patient context for generator seeding
        self.therapist = User.objects.create_user(
            username='testtherapist', password='password', email='therapist@example.com'
        )
        self.user = User.objects.create_user(
            username='testuser', password='password', email='patient@example.com'
        )
        self.patient = Patient.objects.create(
            user=self.user,
            therapist=self.therapist,
            full_name="Test Patient",
            email='patient@example.com',
            birth_date=date(1990, 1, 1),
            is_active=True,
        )

    def test_question_id_uniqueness_and_structure(self):
        """
        Verify that generate_mcmi4_mystic_test returns 195 questions,
        each having a unique 'question_id' field.
        """
        questions = generate_mcmi4_mystic_test(self.patient.user.id)
        
        # 1. Verify count
        self.assertEqual(len(questions), 195, "Should generate exactly 195 questions")

        # 2. Verify structure
        for q in questions:
            self.assertIn('question_id', q, "Question missing 'question_id'")
            self.assertIn('world', q, "Question missing 'world'")
            self.assertIn('text', q, "Question missing 'text'")
            self.assertIn('dimension_id', q, "Question missing 'dimension_id'")
        
        # 3. Verify uniqueness of question_id
        ids = [q['question_id'] for q in questions]
        unique_ids = set(ids)
        self.assertEqual(len(ids), len(unique_ids), "Duplicate question_ids found")
        
        print(f"\nSuccessfully generated {len(questions)} unique questions.")
