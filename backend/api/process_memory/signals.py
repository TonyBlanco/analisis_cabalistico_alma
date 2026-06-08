from django.db.models.signals import post_save
from django.dispatch import receiver

from api.bioemotional.models import BioEmotionalSynthesis
from api.models import AnalysisRecord
from api.process_memory.ingestion import (
    ingest_analysis_record,
    ingest_bio_synthesis_close,
    ingest_tarot_seal,
    resolve_tarot_workspace_patient,
    build_tarot_spread_from_instance,
)


@receiver(post_save, sender=BioEmotionalSynthesis)
def ingest_closed_bio_synthesis(sender, instance, **kwargs):
    if instance.is_closed:
        ingest_bio_synthesis_close(instance)


@receiver(post_save, sender=AnalysisRecord)
def ingest_analysis_record_snapshot(sender, instance, **kwargs):
    ingest_analysis_record(instance)


def _register_tarot_signal() -> None:
    """Late-bind the WorkspaceInstance signal to avoid circular imports at startup."""
    try:
        from swm.tarot.models import WorkspaceInstance, WorkspaceStatus

        @receiver(post_save, sender=WorkspaceInstance, weak=False)
        def ingest_sealed_tarot_workspace(sender, instance, **kwargs):
            if instance.status != WorkspaceStatus.SEALED or not instance.sealed_at:
                return
            patient = resolve_tarot_workspace_patient(instance)
            if not patient:
                return
            spread = build_tarot_spread_from_instance(instance)
            ingest_tarot_seal(
                therapist=instance.creator_user,
                patient=patient,
                source_id=str(instance.id),
                spread=spread,
            )

    except Exception:
        pass


_register_tarot_signal()
