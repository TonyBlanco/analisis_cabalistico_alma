# Changelog: Consentimiento Holístico → Legacy Mode

**Fecha**: 2026-01-28  
**Tipo**: Simplificación de flujo UX  
**Alcance**: Módulo de Tarot Holístico (Tirada Libre Educativa)

---

## 📋 Contexto

El flujo de consentimiento explícito per-lectura fue implementado durante la fase clínica del proyecto cuando cada interpretación requería autorización individual. 

**Situación actual**:
- El consultante ya otorga consentimiento al crear su cuenta
- El consentimiento acepta: "Almacenar con consentimiento (asociado al terapeuta)"
- El modal de consentimiento se convirtió en fricción innecesaria para uso educativo

---

## ✅ Cambios Implementados

### 1. **Hook `useTarotHolistic()`**
📁 `tonyblanco-app/lib/api/swm/tarot/hooks/useTarotHolistic.ts`

**Antes**:
```typescript
const [hasConsent, setHasConsent] = useState(false);

const interpretCard = async () => {
  if (!hasConsent) {
    throw new Error('Se requiere consentimiento holístico...');
  }
  // ...
}
```

**Ahora**:
```typescript
// LEGACY: Consent now granted at consultant registration - always true
const [hasConsent, setHasConsent] = useState(true);

const interpretCard = async () => {
  // LEGACY: Consent check removed - consultant consent granted at registration
  // ...
}
```

### 2. **Componente Visual `AstrologyTarotVisualCore`**
📁 `tonyblanco-app/components/AstrologyTarotWorkspace/AstrologyTarotVisualCore.tsx`

**Removido**:
- ❌ `import { TarotHolisticConsentBanner }`
- ❌ `const [showConsentBanner, setShowConsentBanner] = useState(false)`
- ❌ Botón "Activar IA Holística" condicionado a `!hasConsent`
- ❌ Banner de consentimiento `<TarotHolisticConsentBanner />`

**Simplificado**:
- ✅ Botón "Interpretar con IA" siempre visible (sin check de consentimiento)
- ✅ UI más limpia y directa

### 3. **Documentación**
📁 `docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md`

Actualizada sección "Consentimiento" con:
- Marca temporal `[LEGACY MODE - 2026-01-28]`
- Explicación del cambio de flujo
- Referencia a consentimiento en registro de cuenta

---

## 🔄 Compatibilidad Legacy

**Mantenido para compatibilidad**:
- ✅ Función `acceptConsent()` (aunque siempre activa)
- ✅ Hook exporta `hasConsent` (siempre `true`)
- ✅ Componente `TarotHolisticConsentBanner` (no usado actualmente)

**Razón**: Evitar breaking changes en otros módulos que puedan referenciar estas APIs.

---

## 🎯 Beneficios

1. **UX mejorada**: Sin fricción innecesaria en flujo educativo
2. **Consistencia**: Consentimiento centralizado en registro de cuenta
3. **Simplicidad**: Menos estado y componentes condicionales
4. **Claridad**: Código más directo y mantenible

---

## 📝 Notas de Migración

Si en el futuro se requiere **re-introducir** consentimiento per-lectura:
1. Cambiar `useState(true)` → `useState(false)` en `useTarotHolistic.ts`
2. Restaurar checks en `interpretCard()` y `interpretSpread()`
3. Re-habilitar `TarotHolisticConsentBanner` en UI
4. Actualizar documentación removiendo marca `[LEGACY MODE]`

---

## 🔗 Referencias

- `docs/SWM_V3_INTERPRETACION_SIMBOLICA_GOBERNADA.md` - Gobernanza SWM v3
- `docs/TAROT_AI_IMPLEMENTATION_PLAN.md` - Plan original de implementación
- Backend: `backend/symbolic/swm_v3/views.py` - Endpoint sigue soportando `consent_mode`

---

**Estado**: ✅ Implementado y documentado  
**Revisión**: Pendiente de QA en próximo sprint
