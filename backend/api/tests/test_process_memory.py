from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from api.bioemotional.models import BioEmotionalSynthesis
from api.models import AIInteractionFeedback, AnalysisRecord, Patient


class ProcessMemoryPhase1Tests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.therapist = User.objects.create_user("pm_therapist", "pm@example.com", "pass")
        self.therapist.profile.user_type = "therapist"
        self.therapist.profile.save()
        self.other_therapist = User.objects.create_user(
            "pm_other", "pm-other@example.com", "pass"
        )
        self.other_therapist.profile.user_type = "therapist"
        self.other_therapist.profile.save()
        self.patient = Patient.objects.create(
            therapist=self.therapist,
            first_name="Memoria",
            last_name="Proceso",
            email="memoria@example.com",
            full_name="Memoria Proceso",
            birth_date="1990-01-01",
        )
        self.other_patient = Patient.objects.create(
            therapist=self.other_therapist,
            first_name="Otra",
            last_name="Memoria",
            email="otra-memoria@example.com",
            full_name="Otra Memoria",
            birth_date="1988-01-01",
        )

    def test_process_event_create_and_ownership(self):
        from api.process_memory.services import record_process_event
        from api.models import ProcessEvent

        event = record_process_event(
            therapist=self.therapist,
            patient=self.patient,
            event_type="swm.tarot.sealed",
            source_type="swm_tarot",
            source_id="tarot-1",
            payload={"spread": ["El Loco"]},
        )

        self.assertEqual(ProcessEvent.objects.count(), 1)
        self.assertEqual(event.therapist, self.therapist)
        self.assertEqual(event.patient, self.patient)
        self.assertEqual(event.lane, "symbolic")
        self.assertEqual(event.payload["spread"], ["El Loco"])

        with self.assertRaises(PermissionError):
            record_process_event(
                therapist=self.other_therapist,
                patient=self.patient,
                event_type="swm.tarot.sealed",
                source_type="swm_tarot",
                source_id="tarot-2",
                payload={},
            )

    def test_process_snapshot_create_and_ownership(self):
        from api.process_memory.services import create_process_snapshot
        from api.models import ProcessSnapshot

        snapshot = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="kabbalah",
            lane="symbolic",
            source_type="swm_cabala",
            source_id="tree-1",
            structured={"sefirot": ["Keter", "Malkuth"]},
            text_summary="Resumen simbolico sin nombre propio.",
        )

        self.assertEqual(ProcessSnapshot.objects.count(), 1)
        self.assertEqual(snapshot.therapist, self.therapist)
        self.assertEqual(snapshot.patient, self.patient)
        self.assertEqual(snapshot.domain, "kabbalah")
        self.assertEqual(snapshot.lane, "symbolic")

        with self.assertRaises(PermissionError):
            create_process_snapshot(
                therapist=self.other_therapist,
                patient=self.patient,
                domain="kabbalah",
                lane="symbolic",
                source_type="swm_cabala",
                source_id="tree-2",
                structured={},
                text_summary="No autorizado.",
            )

    def test_embedding_chunk_create_and_ownership(self):
        from api.process_memory.services import create_embedding_chunk, create_process_snapshot
        from api.models import EmbeddingChunk

        snapshot = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="bioemotion",
            lane="clinical_support",
            source_type="bioemotional_synthesis",
            source_id="bio-1",
            structured={"themes": ["duelo"]},
            text_summary="Sintesis terapeutica sin PHI.",
        )
        chunk = create_embedding_chunk(
            snapshot=snapshot,
            therapist=self.therapist,
            patient=self.patient,
            lane="clinical_support",
            text="duelo simbolico y regulacion emocional",
            embedding=[0.1, 0.2, 0.3],
        )

        self.assertEqual(EmbeddingChunk.objects.count(), 1)
        self.assertEqual(chunk.snapshot, snapshot)
        self.assertEqual(chunk.therapist, self.therapist)
        self.assertEqual(chunk.patient, self.patient)
        self.assertEqual(chunk.embedding, [0.1, 0.2, 0.3])

        with self.assertRaises(PermissionError):
            create_embedding_chunk(
                snapshot=snapshot,
                therapist=self.other_therapist,
                patient=self.patient,
                lane="clinical_support",
                text="no autorizado",
                embedding=[0.0],
            )

    def test_tarot_seal_ingests_snapshot(self):
        from api.process_memory.ingestion import ingest_tarot_seal
        from api.models import ProcessSnapshot

        snapshot = ingest_tarot_seal(
            therapist=self.therapist,
            patient=self.patient,
            source_id="tarot-seal-1",
            spread={"cards": ["El Loco", "La Estrella"]},
        )

        self.assertEqual(ProcessSnapshot.objects.count(), 1)
        self.assertEqual(snapshot.domain, "tarot")
        self.assertEqual(snapshot.lane, "symbolic")
        self.assertIn("El Loco", snapshot.text_summary)

    def test_bio_synthesis_close_ingests_snapshot(self):
        from api.models import ProcessSnapshot

        synthesis = BioEmotionalSynthesis.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            text="Sintesis cerrada con foco en duelo y respiracion.",
            is_closed=False,
        )
        synthesis.is_closed = True
        synthesis.save(update_fields=["is_closed"])

        snapshot = ProcessSnapshot.objects.get(source_id=str(synthesis.id))
        self.assertEqual(snapshot.domain, "bioemotion")
        self.assertEqual(snapshot.lane, "clinical_support")
        self.assertIn("duelo", snapshot.text_summary)

    def test_analysis_record_execution_ingests_snapshot(self):
        from api.models import ProcessSnapshot

        record = AnalysisRecord.objects.create(
            kind="kabbalah",
            module_code="UNIT_TREE",
            role_context="therapist",
            execution_mode="therapist_clinical",
            birth_data_snapshot={"legal_name": "Test", "birth_date": "1990-01-01"},
            algorithm_snapshot={"engine": "unit", "version": "v1", "params": {}},
            raw_input={"query": "tree"},
            computed_result={"summary": "Arbol con eje Keter activo."},
            visibility="therapist",
            created_by_user=self.therapist,
            subject_user=self.therapist,
            patient=self.patient,
            therapist=self.therapist,
        )

        snapshot = ProcessSnapshot.objects.get(source_id=str(record.id))
        self.assertEqual(snapshot.domain, "kabbalah")
        self.assertEqual(snapshot.lane, "symbolic")
        self.assertIn("Keter", snapshot.text_summary)

    def test_rag_retrieve_top_k_and_lane_separation(self):
        from api.process_memory.services import RAGService, create_process_snapshot

        create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="tarot",
            lane="symbolic",
            source_type="manual",
            source_id="sym-1",
            structured={},
            text_summary="La Estrella sugiere esperanza simbolica y reparacion.",
        )
        create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="bioemotion",
            lane="clinical_support",
            source_type="manual",
            source_id="clin-1",
            structured={},
            text_summary="Sintesis sobre ansiedad corporal y respiracion.",
        )

        symbolic = RAGService.retrieve(
            therapist=self.therapist,
            patient_id=self.patient.id,
            lane="symbolic",
            query="estrella esperanza",
            top_k=1,
        )
        clinical = RAGService.retrieve(
            therapist=self.therapist,
            patient_id=self.patient.id,
            lane="clinical_support",
            query="ansiedad respiracion",
            top_k=1,
        )

        self.assertEqual(len(symbolic), 1)
        self.assertEqual(symbolic[0]["lane"], "symbolic")
        self.assertIn("Estrella", symbolic[0]["text_summary"])
        self.assertEqual(len(clinical), 1)
        self.assertEqual(clinical[0]["lane"], "clinical_support")
        self.assertIn("respiracion", clinical[0]["text_summary"])

    def test_rag_summary_excludes_phi(self):
        from api.process_memory.services import create_process_snapshot

        snapshot = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="bioemotion",
            lane="clinical_support",
            source_type="manual",
            source_id="phi-1",
            structured={},
            text_summary="Ana Proceso explora duelo con telefono 600123123 y ana@example.com.",
        )

        self.assertNotIn("Ana", snapshot.text_summary)
        self.assertNotIn("600123123", snapshot.text_summary)
        self.assertNotIn("ana@example.com", snapshot.text_summary)
        self.assertIn("[redacted]", snapshot.text_summary)

    def test_feedback_high_rating_increases_rag_weight(self):
        from api.process_memory.services import RAGService, create_process_snapshot

        low = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="kabbalah",
            lane="symbolic",
            source_type="manual",
            source_id="low-rating",
            structured={},
            text_summary="Tema de arbol y equilibrio.",
        )
        high = create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="kabbalah",
            lane="symbolic",
            source_type="manual",
            source_id="high-rating",
            structured={},
            text_summary="Tema de arbol y equilibrio.",
        )
        AIInteractionFeedback.objects.create(
            therapist=self.therapist,
            patient=self.patient,
            feature="rag_snapshot",
            provider="groq",
            prompt_version="process_memory_v1",
            rating=5,
            correction_text=str(high.id),
        )

        results = RAGService.retrieve(
            therapist=self.therapist,
            patient_id=self.patient.id,
            lane="symbolic",
            query="arbol equilibrio",
            top_k=2,
        )

        self.assertEqual(results[0]["snapshot_id"], str(high.id))
        self.assertEqual(results[1]["snapshot_id"], str(low.id))

    def test_vector_store_lexical_backend_default(self):
        from api.process_memory.services import RAGService, create_process_snapshot
        from api.process_memory.vector_store import LexicalRankBackend, get_vector_store_backend

        create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="tarot",
            lane="symbolic",
            source_type="manual",
            source_id="lex-factory-1",
            structured={},
            text_summary="Esperanza y estrella en el camino simbolico.",
        )

        self.assertIsInstance(get_vector_store_backend(), LexicalRankBackend)
        results = RAGService.retrieve(
            therapist=self.therapist,
            patient_id=self.patient.id,
            lane="symbolic",
            query="estrella esperanza",
            top_k=1,
        )
        self.assertEqual(len(results), 1)
        self.assertIn("estrella", results[0]["text_summary"].lower())

    @override_settings(PROCESS_MEMORY_VECTOR_BACKEND="pgvector")
    def test_vector_store_pgvector_backend_not_implemented(self):
        from api.process_memory.services import RAGService, create_process_snapshot
        from api.process_memory.vector_store import PgVectorBackend, get_vector_store_backend

        create_process_snapshot(
            therapist=self.therapist,
            patient=self.patient,
            domain="kabbalah",
            lane="symbolic",
            source_type="manual",
            source_id="pg-stub-1",
            structured={},
            text_summary="Arbol y equilibrio.",
        )

        self.assertIsInstance(get_vector_store_backend(), PgVectorBackend)
        with self.assertRaises(NotImplementedError) as ctx:
            RAGService.retrieve(
                therapist=self.therapist,
                patient_id=self.patient.id,
                lane="symbolic",
                query="arbol",
                top_k=1,
            )
        self.assertIn("PgVectorBackend", str(ctx.exception))
