# Sistema de los 72 Ángeles de la Cábala

Sistema completo de integración de los 72 Nombres de Dios (Shem ha-Mephorash) en la aplicación de análisis cabalístico.

## 📁 Archivos del Sistema

### Data
- **`data/seventyTwoAngels.json`**: Base de datos completa de los 72 ángeles con:
  - Nombres en hebreo e inglés
  - Atributos divinos
  - Nombres de Dios asociados
  - Órdenes angélicos
  - Fechas de presidencia (5 días cada ángel = 360 días)
  - Textos sagrados e invocaciones
  - Salmos asociados

### Librerías
- **`lib/angels-system.ts`**: Sistema de utilidades para trabajar con los ángeles:
  - `calculateGuardianAngel()`: Calcula el ángel guardián según fecha de nacimiento
  - `formatPresidingDates()`: Formatea las fechas de presidencia
  - `getAngelsByOrder()`: Filtra ángeles por orden angélico
  - `extractInvocationInfo()`: Extrae información de invocaciones y salmos
  - `ANGELIC_ORDERS`: Los 9 órdenes de la jerarquía celestial

### Componentes
- **`components/GuardianAngel.tsx`**: Muestra el ángel guardián personal de una persona
  - Nombre en hebreo e inglés
  - Atributo divino
  - Nombre de Dios
  - Orden angélico
  - Fechas de presidencia
  - Información de invocación
  - Enseñanzas

### Páginas
- **`app/angels/page.tsx`**: Página completa de los 72 Ángeles
  - Vista previa gratuita (3 ángeles)
  - Sistema completo bloqueado para usuarios premium
  - Búsqueda por nombre (inglés o hebreo)
  - Filtros por orden angélico
  - Modal con detalles completos de cada ángel
  - CTA para upgrade premium

## 🎯 Integración en el Sistema

### 1. Reporte Cabalístico
El componente `GuardianAngel` se ha integrado en `CabalisticReport.tsx` para mostrar automáticamente el ángel guardián después de las Letras del Alma:

```tsx
{/* Ángel Guardián */}
{birthDate && (
  <GuardianAngel birthDate={birthDate} showDetails={true} />
)}
```

### 2. Marketplace
Recurso "Los 72 Nombres de Dios - Sistema Completo":
- **ID**: `angels-72-complete`
- **Tipo**: `angel_guide`
- **Categoría**: `angels`
- **Acceso requerido**: `premium`
- **Precio**: $49.99
- **URL**: `/angels`

Características incluidas:
- ✅ 72 ángeles completos con nombres hebreos
- ✅ Atributos divinos y nombres de Dios
- ✅ Invocaciones y salmos específicos
- ✅ Calendario de presidencia (365 días)
- ✅ 9 órdenes angélicos
- ✅ Textos sagrados completos

### 3. Rutas
- `/angels` - Página principal de los 72 Ángeles
- Clic en marketplace → redirige a `/angels` si recurso premium

## 🔮 Los 9 Órdenes Angélicos

La jerarquía celestial completa:

1. **Serafines** (Seraphim) - Coro 1
   - Los más cercanos a Dios, ardiendo en amor divino

2. **Querubines** (Cherubim) - Coro 2
   - Guardianes de la sabiduría divina y la luz

3. **Tronos** (Thrones) - Coro 3
   - Símbolos vivientes de la justicia divina

4. **Dominaciones** (Dominions) - Coro 4
   - Regulan los deberes de los ángeles inferiores

5. **Virtudes** (Virtues) - Coro 5
   - Otorgan gracia y valor, gobiernan la naturaleza

6. **Potestades** (Powers) - Coro 6
   - Ángeles guerreros que luchan contra el mal

7. **Principados** (Principalities) - Coro 7
   - Guían y protegen naciones e instituciones

8. **Arcángeles** (Archangels) - Coro 8
   - Mensajeros de importantes revelaciones divinas

9. **Ángeles** (Angels) - Coro 9
   - Ángeles guardianes más cercanos a la humanidad

## 📅 Calendario de Presidencia

Cada uno de los 72 ángeles preside sobre 5 días específicos del año:

- **Inicio del año angélico**: 20 de marzo (Equinoccio de primavera)
- **Ciclo completo**: 72 ángeles × 5 días = 360 días
- **Períodos**: Cada ángel tiene 5 fechas distribuidas a lo largo del año

Ejemplo (Vehuiah - Primer Ángel):
- 20 de marzo
- 30 de abril
- 11 de agosto
- 22 de octubre
- 2 de enero

## 🔐 Sistema de Acceso

### Acceso Gratuito
- Vista previa de 3 ángeles (Vehuiah, Jeliel, Sitael)
- Calculadora de ángel guardián en reportes cabalísticos
- Información básica de cada ángel en marketplace

### Acceso Premium ($49.99)
- Los 72 ángeles completos
- Sistema de búsqueda y filtros
- Información detallada de invocaciones
- Textos sagrados completos
- Calendario completo de presidencia
- Modal con detalles expandidos

## 🛠️ Funciones Principales

### `calculateGuardianAngel(birthDate, angels)`
Calcula el ángel guardián según la fecha de nacimiento.

```typescript
const angel = calculateGuardianAngel(new Date('1990-05-15'), angelsData);
```

### `formatPresidingDates(dates)`
Convierte las fechas de presidencia a formato legible en español.

```typescript
const dates = formatPresidingDates([[3, 20], [4, 30]]);
// ["20 de Marzo", "30 de Abril"]
```

### `getAngelsByOrder(angels, orderId)`
Filtra ángeles por su orden angélico.

```typescript
const seraphim = getAngelsByOrder(angelsData, 'seraphim');
```

## 📊 Estructura de Datos de Ángel

```typescript
{
  name: {
    he: "והויה",    // Nombre en hebreo
    en: "Vehuiah"   // Nombre en inglés
  },
  attribute: {
    en: "God is High and Exalted above all things."
  },
  godName: "Jehovah",           // Nombre de Dios asociado
  angelicOrderId: "seraphim",   // Orden angélico
  presidesOver: [               // Fechas de presidencia [mes, día]
    [3, 20],  // 20 de marzo
    [4, 30],  // 30 de abril
    ...
  ],
  text: {
    en: "..." // Texto sagrado completo con enseñanzas
  }
}
```

## 🎨 Diseño Visual

### Colores
- **Principal**: Gradiente púrpura-azul (`from-purple-900 to-blue-900`)
- **Acento**: Púrpura brillante (`purple-500`)
- **Premium**: Naranja-púrpura (`from-orange-500 to-purple-500`)
- **Fondo**: Negro con overlays translúcidos

### Iconos
- ✨ Sparkles: Ángeles y sistema completo
- ⭐ Star: Ángel individual
- 📖 Book: Nombre de Dios
- 📅 Calendar: Fechas de presidencia
- 🕐 Clock: Horas de invocación
- 💜 Heart: Enseñanzas
- 🔒 Lock: Contenido bloqueado
- 👑 Crown: Premium

## 🚀 Mejoras Futuras

### Fase 2
- [ ] Traducción de textos sagrados al español
- [ ] Audio de pronunciación de nombres hebreos
- [ ] Meditaciones guiadas por ángel
- [ ] Generador de talismanes y sigillos
- [ ] Notificaciones en días de presidencia

### Fase 3
- [ ] Sistema de invocación paso a paso
- [ ] Calendario angélico interactivo
- [ ] Conexión con fases lunares
- [ ] Interpretación de sincronicidades
- [ ] Diario de experiencias angélicas

## 📖 Referencias

Los datos están basados en textos tradicionales de la Cábala:
- Shem ha-Mephorash (El Nombre de 72 Letras)
- Jerarquía celestial de Pseudo-Dionisio Areopagita
- Tratados cabalísticos clásicos sobre invocación angelical

## 🔗 Enlaces Internos

- `/angels` - Página principal de los 72 Ángeles
- `/marketplace` - Marketplace con recurso premium
- `/pricing` - Planes premium para desbloquear acceso
- Reporte cabalístico - Incluye ángel guardián automáticamente

---

**Nota**: El sistema está diseñado para expandirse con más funcionalidades según las necesidades de los usuarios. La estructura de datos JSON permite fácil extensión con traducciones, imágenes, audio y contenido adicional.
