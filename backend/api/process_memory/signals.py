from django.db.models.signals import post_save
from django.dispatch import receiver

from api.bioemotional.models import BioEmotionalSynthesis
from api.models import AnalysisRecord
from api.process_memory.ingestion import ingest_analysis_record, ingest_bio_synthesis_close


@receiver(post_save, sender=BioEmotionalSynthesis)
def ingest_closed_bio_synthesis(sender, instance, **kwargs):
    if instance.is_closed:
        ingest_bio_synthesis_close(instance)


@receiver(post_save, sender=AnalysisRecord)
def ingest_analysis_record_snapshot(sender, instance, **kwargs):
    ingest_analysis_record(instance)
