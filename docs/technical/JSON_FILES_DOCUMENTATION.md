# 📋 Documentación de Archivos JSON en la Aplicación

Lista completa de todos los archivos JSON utilizados en el proyecto y su función.

---

## 📦 **Archivos de Configuración del Proyecto**

### 1. `package.json` (raíz)
- **Ubicación**: `./package.json`
- **Función**: Configuración del proyecto raíz (si existe)
- **Contenido**: Dependencias y scripts del workspace

### 2. `tonyblanco-app/package.json`
- **Ubicación**: `tonyblanco-app/package.json`
- **Función**: Configuración principal de Next.js
- **Contenido**: 
  - Dependencias: React, Next.js, Tailwind, Lucide Icons, Google Generative AI, etc.
  - Scripts: `dev`, `build`, `start`, `lint`
- **Uso**: Gestión de dependencias del frontend

### 3. `package-lock.json` (raíz y tonyblanco-app)
- **Ubicación**: `./package-lock.json` y `tonyblanco-app/package-lock.json`
- **Función**: Lock file de versiones exactas de npm
- **Uso**: Asegura instalaciones consistentes

### 4. `tsconfig.json` (raíz y tonyblanco-app)
- **Ubicación**: `./tsconfig.json` y `tonyblanco-app/tsconfig.json`
- **Función**: Configuración de TypeScript
- **Contenido**: 
  - Compilador options
  - Paths aliases (`@/*`)
  - Includes/excludes
- **Uso**: Configuración del compilador TypeScript

### 5. `vercel.json` (raíz)
- **Ubicación**: `./vercel.json`
- **Función**: Configuración de deployment en Vercel
- **Contenido**: 
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `.next`
  - `framework`: `nextjs`
  - `rootDirectory`: `tonyblanco-app`
- **Uso**: Configuración para Vercel deployment

### 6. `tonyblanco-app/vercel.json`
- **Ubicación**: `tonyblanco-app/vercel.json`
- **Función**: Configuración alternativa de Vercel
- **Contenido**: Similar al anterior pero sin `rootDirectory`

---

## 🔮 **Archivos de Datos Cabalísticos**

### 7. `tonyblanco-app/data/seventyTwoAngels.json`
- **Ubicación**: `tonyblanco-app/data/seventyTwoAngels.json`
- **Función**: Base de datos de los 72 Ángeles de la Cábala
- **Estructura**: Array de objetos con:
  - `name`: { `he`: nombre hebreo, `en`: nombre inglés }
  - `attribute`: Atributo divino
  - `godName`: Nombre de Dios asociado
  - `angelicOrderId`: Orden angélico (seraphim, cherubim, thrones, etc.)
- **Uso**: 
  - Página de Ángeles (`/angels`)
  - Calendario de Ángeles
  - Notificaciones de Ángel Guardián
  - Componente `GuardianAngel`
- **Importado en**: 
  - `app/angels/page.tsx`
  - `components/NotificationInitializer.tsx`
  - `components/AngelCalendar.tsx`
  - `components/GuardianAngel.tsx`

### 8. `tonyblanco-app/data/hebrew_database_master.json`
- **Ubicación**: `tonyblanco-app/data/hebrew_database_master.json`
- **Función**: Base de datos maestra de palabras y conceptos hebreos
- **Estructura**:
  - `meta_config`: Versión, descripción, total de entradas, categorías
  - `alphabet_registry`: Registro completo del alfabeto hebreo con valores numéricos
  - `words`: Palabras y conceptos con:
    - Valores de Gematría (Ragil, Katan, Gadol)
    - Correspondencias cabalísticas
    - Categorías (nombres_divinos, conceptos_misticos, emociones, etc.)
- **Uso**: 
  - Cálculos de Gematría
  - Búsqueda de correspondencias
  - Análisis cabalístico de textos
- **Tamaño**: ~2,834 líneas, 180+ entradas

### 9. `tonyblanco-app/data/hebrew_words_database.json`
- **Ubicación**: `tonyblanco-app/data/hebrew_words_database.json`
- **Función**: Versión anterior o alternativa de la base de datos hebrea
- **Uso**: Posible backup o versión legacy

### 10. `tonyblanco-app/data/hebrew_words_database_clean.json`
- **Ubicación**: `tonyblanco-app/data/hebrew_words_database_clean.json`
- **Función**: Versión limpia/sanitizada de la base de datos hebrea
- **Uso**: Datos normalizados sin duplicados o errores

### 11. `tonyblanco-app/data/seventyTwoAngels_temp.json`
- **Ubicación**: `tonyblanco-app/data/seventyTwoAngels_temp.json`
- **Función**: Archivo temporal de trabajo con los 72 Ángeles
- **Uso**: Probablemente usado durante desarrollo/migración

---

## 🎴 **Archivos de Tarot**

### 12. `tonyblanco-app/public/tarot/tarot_index.json`
- **Ubicación**: `tonyblanco-app/public/tarot/tarot_index.json`
- **Función**: Índice de referencias a imágenes de cartas del Tarot
- **Estructura**: Array de objetos con:
  - `pdf`: Ruta al archivo PDF de la carta
  - `png`: Ruta a la imagen PNG de la carta
- **Uso**: 
  - Carga de imágenes de cartas del Tarot
  - Módulo "Tarot del Alma"
  - Visualización de Arcanos Mayores (0-21)
- **Integración**: Usado en componentes de Tarot para mapear números a archivos

---

## 📚 **Archivos de Datos Archivados** (`src/_archive`)

### 13. `tonyblanco-app/src/_archive/kabbalah/data/seventyTwoAngels.json`
- **Función**: Versión archivada de los 72 Ángeles
- **Uso**: Código legacy, posiblemente no activo

### 14. `tonyblanco-app/src/_archive/kabbalah/data/sephirot.json`
- **Función**: Datos de las 10 Sefirot del Árbol de la Vida
- **Uso**: Referencia archivada

### 15. `tonyblanco-app/src/_archive/kabbalah/data/paths.json`
- **Función**: Datos de los 22 Senderos del Árbol de la Vida
- **Uso**: Referencia archivada

### 16. `tonyblanco-app/src/_archive/kabbalah/data/archangels.json`
- **Función**: Datos de los Arcángeles cabalísticos
- **Uso**: 
  - Importado en `src/lib/kabbalah/types/Archangels.ts`
  - Referencia archivada

### 17. `tonyblanco-app/src/_archive/kabbalah/data/godNames.json`
- **Función**: Nombres de Dios en la Cábala
- **Uso**: 
  - Importado en `src/lib/kabbalah/types/GodNames.ts`
  - Referencia archivada

### 18. `tonyblanco-app/src/_archive/kabbalah/data/angelicOrders.json`
- **Función**: Órdenes angélicas (Serafines, Querubines, Tronos, etc.)
- **Uso**: 
  - Importado en `src/_archive/kabbalah/types/AngelicOrders.ts`
  - Referencia archivada

### 19. `tonyblanco-app/src/_archive/kabbalah/data/fourWorlds.json`
- **Función**: Los 4 Mundos de la Cábala (Atzilut, Beriah, Yetzirah, Assiah)
- **Uso**: 
  - Importado en `src/_archive/kabbalah/types/FourWorlds.ts`
  - Referencia archivada

### 20. `tonyblanco-app/src/_archive/kabbalah/data/tribesOfIsrael.json`
- **Función**: Las 12 Tribus de Israel y sus correspondencias
- **Uso**: 
  - Importado en `src/lib/kabbalah/types/TribesOfIsrael.ts`
  - Referencia archivada

### 21. `tonyblanco-app/src/_archive/kabbalah/data/kerubim.json`
- **Función**: Datos de los Querubines
- **Uso**: 
  - Importado en `src/_archive/kabbalah/types/Kerubim.ts`
  - Referencia archivada

### 22. `tonyblanco-app/src/_archive/kabbalah/data/souls.json`
- **Función**: Datos sobre almas y reencarnación
- **Uso**: 
  - Importado en `src/_archive/data.ts`
  - Referencia archivada

### 23. `tonyblanco-app/src/_archive/hebrewLetters.json`
- **Función**: Datos del alfabeto hebreo
- **Uso**: 
  - Importado en `src/lib/HebrewLetters.ts`
  - Referencia archivada

### 24. `tonyblanco-app/src/_archive/chakras.json`
- **Función**: Datos de los 7 Chakras
- **Uso**: 
  - Importado en `src/_archive/data.ts`
  - Referencia archivada

---

## 🔮 **Archivos de Datos Astrológicos Archivados**

### 25. `tonyblanco-app/src/_archive/astrology/data/planets.json`
- **Función**: Datos de los planetas astrológicos
- **Uso**: 
  - Importado en `src/lib/astrology/types/Planets.ts`
  - Referencia archivada

### 26. `tonyblanco-app/src/_archive/astrology/data/zodiac.json`
- **Función**: Datos de los signos del zodíaco
- **Uso**: 
  - Importado en `src/lib/astrology/types/Zodiac.ts`
  - Referencia archivada

### 27. `tonyblanco-app/src/_archive/astrology/data/retrograde.json`
- **Función**: Datos sobre períodos retrógrados
- **Uso**: 
  - Importado en `src/lib/astrology/types/Retrograde.ts`
  - Referencia archivada

### 28. `tonyblanco-app/src/_archive/astrology/data/houses.json`
- **Función**: Datos de las 12 Casas astrológicas
- **Uso**: 
  - Importado en `src/_archive/astrology/types/Houses.ts`
  - Referencia archivada

---

## 📊 **Resumen por Categoría**

### **Activos (En Uso)**
1. ✅ `seventyTwoAngels.json` - Sistema de Ángeles
2. ✅ `hebrew_database_master.json` - Base de datos hebrea principal
3. ✅ `tarot_index.json` - Índice de cartas de Tarot
4. ✅ `package.json` - Configuración del proyecto
5. ✅ `tsconfig.json` - Configuración TypeScript
6. ✅ `vercel.json` - Configuración de deployment

### **Archivados (Legacy)**
- Todos los archivos en `src/_archive/` son referencias históricas
- Pueden estar importados en código legacy pero no en producción activa

### **Temporales/Backups**
- `seventyTwoAngels_temp.json`
- `hebrew_words_database.json` (posible versión anterior)
- `hebrew_words_database_clean.json` (versión limpia)

---

## 🔍 **Cómo se Usan los JSON en el Código**

### **Importación Directa (TypeScript/Next.js)**
```typescript
import angelsData from '@/data/seventyTwoAngels.json';
import tarotIndex from '@/public/tarot/tarot_index.json';
```

### **Carga Dinámica**
```typescript
const data = await import('@/data/hebrew_database_master.json');
```

### **Fetch API (Para JSONs grandes)**
```typescript
const response = await fetch('/api/data/hebrew-database');
const data = await response.json();
```

---

## 📝 **Notas Importantes**

1. **Archivos en `src/_archive/`**: Están excluidos del build de TypeScript (`tsconfig.json` excluye `src/_archive`)

2. **Archivos Públicos**: Los JSONs en `public/` son accesibles directamente vía URL

3. **Archivos de Datos**: Los JSONs en `data/` se importan como módulos TypeScript

4. **Tamaño**: `hebrew_database_master.json` es el archivo más grande (~2,834 líneas)

5. **Actualización**: Los JSONs de datos se actualizan manualmente o mediante scripts de migración

---

## 🚀 **Recomendaciones**

- **Optimización**: Considerar migrar JSONs grandes a una base de datos o API
- **Validación**: Implementar schemas JSON (JSON Schema) para validar estructura
- **Versionado**: Los archivos de datos deberían tener versiones en `meta_config`
- **Backup**: Mantener backups de los JSONs de datos antes de actualizaciones importantes

