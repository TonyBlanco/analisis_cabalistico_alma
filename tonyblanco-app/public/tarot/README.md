# Imágenes del Tarot para Letras del Alma

Esta carpeta contiene las imágenes del Tarot asociadas con las letras hebreas sagradas.

## Estructura de archivos

Las imágenes están nombradas según el número del Arcano Mayor en formato PNG:

```
public/tarot/
├── 0-el-loco.png
├── 1-el-mago.png
├── 2-la-suma-sacerdotisa.png
├── 3-la-emperatriz-luminosa.png
├── 4-el-emperador.png
├── 5-el-sumo-sacerdote.png
├── 6-los-enamorados.png
├── 7-el-carro.png
├── 8-la-justicia.png
├── 9-el-ermitano.png
├── 10-la-rueda-de-la-fortuna.png
├── 11-la-fuerza.png
├── 12-el-colgado.png
├── 13-la-muerte.png
├── 14-la-templanza.png
├── 15-el-diablo.png
├── 16-la-torre.png
├── 17-la-estrella.png
├── 18-la-luna.png
├── 19-el-sol.png
├── 20-el-juicio-final.png
├── 21-el-mundo.png
├── tarot_index.json
└── README.md
```

## Correspondencias Letra Hebrea → Tarot → Número

| Letra | Nombre | Tarot | Número | Archivo |
|-------|--------|-------|--------|---------|
| א | Alef | El Loco | 0 | 0-el-loco.png |
| ב | Bet | La Sacerdotisa | 2 | 2-la-suma-sacerdotisa.png |
| ג | Guimel | La Emperatriz | 3 | 3-la-emperatriz-luminosa.png |
| ד | Dalet | El Emperador | 4 | 4-el-emperador.png |
| ה | He | El Hierofante | 5 | 5-el-sumo-sacerdote.png |
| ו | Vav | Los Enamorados | 6 | 6-los-enamorados.png |
| ז | Zayin | El Carro | 7 | 7-el-carro.png |
| ח | Jet | La Fuerza | 8 | 8-la-justicia.png |
| ט | Tet | El Ermitaño | 9 | 9-el-ermitano.png |
| י | Yud | La Rueda de la Fortuna | 10 | 10-la-rueda-de-la-fortuna.png |
| ל | Lamed | La Justicia | 11 | 11-la-fuerza.png |
| מ | Mem | El Colgado | 12 | 12-el-colgado.png |
| ש | Shin | El Juicio | 20 | 20-el-juicio-final.png |

## Formato de imágenes

- **Formato**: PNG (con transparencia)
- **Resolución**: Variable (optimizada para web)
- **Fondo**: Transparente o fondo oscuro compatible con tema púrpura
- **Conjunto completo**: 22 Arcanos Mayores (0-21)

## Índice JSON

El archivo `tarot_index.json` contiene referencias a las versiones PDF y PNG de cada carta:

```json
[
  {
    "pdf": "0-el-loco.pdf",
    "png": "png/0-el-loco.png"
  },
  ...
]
```

## Integración en la app

Las imágenes se cargan automáticamente en el componente `LetrasDelAlma` mediante la función `getTarotImagePath()`:

```tsx
<LetrasDelAlma nombre="MARIA" />
```

Cuando el sistema encuentra la letra Mem (מ) en "MARIA":
- Muestra la carta: El Colgado (12)
- Carga la imagen: `/tarot/12-el-colgado.png`
- Presenta la meditación y correspondencias asociadas

## Actualización de imágenes

Para agregar o actualizar una imagen del Tarot:

1. Nombrar el archivo según: `{número}-{nombre-completo}.png`
2. Colocar en `/public/tarot/`
3. La imagen se cargará automáticamente sin cambios en el código
