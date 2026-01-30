# SHA Harmony Fix - Quick Reference

## ❌ Problema (ANTES)

```
Frontend → Backend → Resultado
-------    -------    ---------
{           Busca      "Cuestionario incompleto"
  q1: 3  →  AUDIT_01  → answered_items = 0
  q2: 4     AUDIT_02    total_score = 0/40
  ...       ...         
  q10: 5    AUDIT_10
}
```

**Causa**: Código legacy de test AUDIT (alcoholismo) usado para SHA Harmony (balance sefirótico)

---

## ✅ Solución (DESPUÉS)

```
Frontend → Backend → Resultado
-------    -------    ---------
{           Busca      {
  q1: 3  →  q1    →     harmony_index: 4.2,
  q2: 4     q2          harmony_level: 'good',
  ...       ...         sefirot_scores: {
  q10: 5    q10           Keter: 3,
}                         Chokmah: 4,
                          ...
                          Malkuth: 5
                        },
                        total_score: 42/50
                      }
```

---

## 📋 Cambios Clave

| Aspecto | Antes (v1) | Después (v2) |
|---------|------------|--------------|
| **Keys** | `AUDIT_01` ... `AUDIT_10` | `q1` ... `q10` |
| **Escala** | 0-4 (AUDIT clínico) | 1-5 (Likert holístico) |
| **Score** | 0-40 (suma) | 10-50 (suma), 1-5 (índice) |
| **Output** | `zone`, `zone_label`, `sefira` | `harmony_index`, `harmony_level`, `sefirot_scores` |
| **Schema** | `sha_harmony:v1` | `sha_harmony:v2` |

---

## 🗺️ Mapeo de Sefirot

| Pregunta | Sefirá | Dimensión |
|----------|--------|-----------|
| q1 | Keter | Propósito de vida |
| q2 | Chokmah | Valores y principios |
| q3 | Binah | Aceptación emocional |
| q4 | Chesed | Generosidad y compasión |
| q5 | Gevurah | Límites saludables |
| q6 | Tiferet | Equilibrio y armonía |
| q7 | Netzach | Energía y vitalidad |
| q8 | Hod | Honestidad y expresión |
| q9 | Yesod | Flujo creativo |
| q10 | Malkuth | Arraigo y presencia |

---

## 🧪 Test de Validación

```bash
# Backend
cd backend
python manage.py test tests.test_execute_patient_self -v 2

# Resultado esperado: OK (1 test passed)
```

---

## 📖 Documentación Completa

- **Guía completa**: [docs/TEST_LEGACY_MIGRATION.md](./TEST_LEGACY_MIGRATION.md)
- **Script de auditoría**: `audit_legacy_test_patterns.py`
- **Frontend**: `tonyblanco-app/app/(dashboard)/dashboard/patient/tests/sha-harmony/`
- **Backend**: `backend/api/test_views.py` (líneas 940-1032)

---

## 🔍 Cómo Detectar Este Problema en Otros Tests

```bash
# Ejecutar script de auditoría
python audit_legacy_test_patterns.py

# Buscar manualmente
grep -r "AUDIT_\|PHQ_\|GAD_\|EAT_\|BAI_" backend/api/test_views.py
```

---

## ⚠️ Tests en Vigilancia

| Test | Estado | Acción Requerida |
|------|--------|------------------|
| `sha_harmony` | ✅ **CORREGIDO** | Ninguna |
| `eat26-spirit` | ⚠️ **REVISAR** | Verificar si existe frontend |
| `wellness` | ✅ OK | Ninguna |
| `screening-general` | ✅ OK | Ninguna |

---

**Última actualización**: 2026-01-30  
**Commits relacionados**: f05a1669, 8d91343d
