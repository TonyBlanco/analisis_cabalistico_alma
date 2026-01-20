"""
Django models for MCMI-4-Mystic question bank and test instances.

This allows modular question selection with intelligent rotation to prevent
patients from seeing the same questions across multiple test applications.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import json

User = get_user_model()


class MCMI4MysticQuestionBank(models.Model):
    """
    Complete question bank for MCMI-4-Mystic.
    
    Each record represents one question that can be selected
    for test applications. Questions are organized by world,
    dimension, and mapped to specific Sephirot.
    """
    
    WORLD_CHOICES = [
        ('atzilut', 'Atzilut - Emanativo/Espiritual'),
        ('briah', 'Briah - Creativo/Intelectual'),
        ('yetzirah', 'Yetzirah - Formativo/Emocional'),
        ('assiah', 'Assiah - Material/Físico'),
    ]
    
    SEFIRAH_CHOICES = [
        ('keter', 'Keter'),
        ('chochmah', 'Chochmah'),
        ('binah', 'Binah'),
        ('chesed', 'Chesed'),
        ('gevurah', 'Gevurah'),
        ('tiferet', 'Tiferet'),
        ('netzach', 'Netzach'),
        ('hod', 'Hod'),
        ('yesod', 'Yesod'),
        ('malkhut', 'Malkhut'),
        ('multiple', 'Multiple'),
    ]
    
    # Identifiers
    question_id = models.CharField(
        max_length=20,
        unique=True,
        primary_key=True,
        help_text="Unique ID (e.g., atz_ktr_001)"
    )
    world = models.CharField(
        max_length=20,
        choices=WORLD_CHOICES,
        db_index=True
    )
    dimension_id = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Dimension identifier (e.g., atzilut_keter_purpose)"
    )
    sefirah = models.CharField(
        max_length=20,
        choices=SEFIRAH_CHOICES
    )
    
    # Question content
    text_es = models.TextField(
        help_text="Question text in Spanish"
    )
    text_en = models.TextField(
        blank=True,
        help_text="Question text in English (optional)"
    )
    
    # Scoring parameters
    reverse_scored = models.BooleanField(
        default=False,
        help_text="If True, response is inverted (3-response)"
    )
    weight = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(2.0)],
        help_text="Weight for this item in scoring"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(
        default=True,
        help_text="If False, question won't be selected"
    )
    
    class Meta:
        db_table = 'mcmi4_mystic_question_bank'
        ordering = ['world', 'dimension_id', 'question_id']
        indexes = [
            models.Index(fields=['world', 'dimension_id']),
            models.Index(fields=['dimension_id']),
        ]
    
    def __str__(self):
        return f"{self.question_id}: {self.text_es[:50]}..."


class MCMI4MysticTestInstance(models.Model):
    """
    Specific test instance applied to a patient.
    
    Tracks which questions were used, responses, and results
    for each application of the MCMI-4-Mystic test.
    """
    
    # Patient and timing
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='mcmi4_mystic_tests'
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Questions used in this instance
    questions_used = models.JSONField(
        help_text="List of question_ids selected for this test"
    )
    
    # Responses (key: question_id, value: 0-3)
    responses = models.JSONField(
        default=dict,
        help_text="Patient responses {question_id: response_value}"
    )
    
    # Results
    raw_scores = models.JSONField(
        null=True,
        blank=True,
        help_text="Raw scores by dimension and world"
    )
    structured_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Full structured results with interpretations"
    )
    
    # Status
    is_complete = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'mcmi4_mystic_test_instance'
        ordering = ['-applied_at']
    
    def __str__(self):
        status = "Complete" if self.is_complete else "In Progress"
        return f"MCMI4-Mystic for {self.patient.username} - {self.applied_at.date()} ({status})"
    
    def get_completion_percentage(self):
        """Calculate percentage of questions answered."""
        if not self.questions_used:
            return 0
        total_questions = len(self.questions_used)
        answered = len(self.responses)
        return int((answered / total_questions) * 100) if total_questions > 0 else 0


class DimensionConfig(models.Model):
    """
    Configuration for each dimension (how many questions to select, etc.).
    """
    
    dimension_id = models.CharField(
        max_length=50,
        unique=True,
        primary_key=True
    )
    world = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    sefirah = models.CharField(max_length=20)
    description = models.TextField()
    items_required = models.IntegerField(
        help_text="Number of questions to include per test"
    )
    
    class Meta:
        db_table = 'mcmi4_mystic_dimension_config'
        ordering = ['world', 'dimension_id']
    
    def __str__(self):
        return f"{self.name} ({self.items_required} items)"
