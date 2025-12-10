// Imágenes anatómicas profesionales SVG de alta calidad
// Cada sistema tiene una representación detallada y visualmente atractiva

export const BodySystemImages = {
  digestive: `
    <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stomachGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#ee5a6f;stop-opacity:0.7" />
        </linearGradient>
        <linearGradient id="intestineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fab005;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#fd7e14;stop-opacity:0.6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Esófago -->
      <rect x="140" y="20" width="20" height="80" rx="5" fill="#e03131" opacity="0.8"/>
      
      <!-- Estómago -->
      <ellipse cx="150" cy="130" rx="60" ry="50" fill="url(#stomachGrad)" filter="url(#glow)"/>
      <path d="M 110 130 Q 100 150 110 170" stroke="#c92a2a" stroke-width="2" fill="none"/>
      <path d="M 190 130 Q 200 150 190 170" stroke="#c92a2a" stroke-width="2" fill="none"/>
      
      <!-- Hígado -->
      <ellipse cx="200" cy="140" rx="45" ry="35" fill="#8b4513" opacity="0.7"/>
      <ellipse cx="210" cy="135" rx="30" ry="25" fill="#a0522d" opacity="0.6"/>
      
      <!-- Intestino Delgado -->
      <path d="M 150 180 Q 120 220 140 260 Q 160 280 150 320 Q 140 340 160 360" 
            stroke="url(#intestineGrad)" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M 150 180 Q 180 220 160 260 Q 140 280 150 320 Q 160 340 140 360" 
            stroke="url(#intestineGrad)" stroke-width="18" fill="none" stroke-linecap="round"/>
      
      <!-- Intestino Grueso -->
      <path d="M 80 240 L 80 350 Q 80 380 110 380 L 190 380 Q 220 380 220 350 L 220 240" 
            stroke="#fab005" stroke-width="22" fill="none" stroke-linecap="round" opacity="0.8"/>
      
      <!-- Colon -->
      <circle cx="150" cy="420" r="25" fill="#fd7e14" opacity="0.6"/>
      
      <!-- Detalles anatómicos -->
      <circle cx="130" cy="145" r="3" fill="#fff" opacity="0.6"/>
      <circle cx="145" cy="155" r="2" fill="#fff" opacity="0.5"/>
      <circle cx="160" cy="140" r="3" fill="#fff" opacity="0.6"/>
    </svg>
  `,

  nervous: `
    <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="brainGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#845ef7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5f3dc4;stop-opacity:0.8" />
        </radialGradient>
        <linearGradient id="spineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#7950f2;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#5f3dc4;stop-opacity:0.6" />
        </linearGradient>
      </defs>
      
      <!-- Cerebro -->
      <ellipse cx="150" cy="60" rx="70" ry="55" fill="url(#brainGrad)"/>
      
      <!-- Hemisferios cerebrales -->
      <path d="M 150 20 Q 100 40 100 70 Q 100 90 130 95" 
            stroke="#6741d9" stroke-width="3" fill="none"/>
      <path d="M 150 20 Q 200 40 200 70 Q 200 90 170 95" 
            stroke="#6741d9" stroke-width="3" fill="none"/>
      
      <!-- Circunvoluciones -->
      <path d="M 110 50 Q 120 45 130 50 Q 140 55 150 50" 
            stroke="#fff" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M 150 50 Q 160 55 170 50 Q 180 45 190 50" 
            stroke="#fff" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M 115 70 Q 125 65 135 70 Q 145 75 155 70" 
            stroke="#fff" stroke-width="2" fill="none" opacity="0.4"/>
      
      <!-- Tronco cerebral -->
      <ellipse cx="150" cy="105" rx="20" ry="15" fill="#5f3dc4"/>
      
      <!-- Médula espinal -->
      <rect x="142" y="115" width="16" height="360" rx="8" fill="url(#spineGrad)"/>
      
      <!-- Vértebras -->
      <circle cx="150" cy="140" r="12" fill="#6741d9" opacity="0.6"/>
      <circle cx="150" cy="180" r="12" fill="#6741d9" opacity="0.6"/>
      <circle cx="150" cy="220" r="12" fill="#6741d9" opacity="0.6"/>
      <circle cx="150" cy="260" r="12" fill="#6741d9" opacity="0.6"/>
      <circle cx="150" cy="300" r="12" fill="#6741d9" opacity="0.6"/>
      <circle cx="150" cy="340" r="12" fill="#6741d9" opacity="0.6"/>
      <circle cx="150" cy="380" r="12" fill="#6741d9" opacity="0.6"/>
      <circle cx="150" cy="420" r="12" fill="#6741d9" opacity="0.6"/>
      
      <!-- Nervios periféricos -->
      <line x1="150" y1="160" x2="90" y2="200" stroke="#7950f2" stroke-width="4" opacity="0.7"/>
      <line x1="150" y1="160" x2="210" y2="200" stroke="#7950f2" stroke-width="4" opacity="0.7"/>
      
      <line x1="150" y1="240" x2="80" y2="280" stroke="#7950f2" stroke-width="4" opacity="0.7"/>
      <line x1="150" y1="240" x2="220" y2="280" stroke="#7950f2" stroke-width="4" opacity="0.7"/>
      
      <line x1="150" y1="360" x2="100" y2="420" stroke="#7950f2" stroke-width="4" opacity="0.7"/>
      <line x1="150" y1="360" x2="200" y2="420" stroke="#7950f2" stroke-width="4" opacity="0.7"/>
      
      <!-- Ramificaciones nerviosas -->
      <line x1="90" y1="200" x2="70" y2="230" stroke="#9775fa" stroke-width="2" opacity="0.6"/>
      <line x1="90" y1="200" x2="60" y2="190" stroke="#9775fa" stroke-width="2" opacity="0.6"/>
      <line x1="210" y1="200" x2="230" y2="230" stroke="#9775fa" stroke-width="2" opacity="0.6"/>
      <line x1="210" y1="200" x2="240" y2="190" stroke="#9775fa" stroke-width="2" opacity="0.6"/>
      
      <!-- Sinapsis (puntos luminosos) -->
      <circle cx="90" cy="200" r="4" fill="#fff" opacity="0.9"/>
      <circle cx="210" cy="200" r="4" fill="#fff" opacity="0.9"/>
      <circle cx="80" cy="280" r="4" fill="#fff" opacity="0.9"/>
      <circle cx="220" cy="280" r="4" fill="#fff" opacity="0.9"/>
    </svg>
  `,

  circulatory: `
    <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#fa5252;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#e03131;stop-opacity:0.8" />
        </linearGradient>
        <linearGradient id="arteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#fa5252;stop-opacity:0.6" />
        </linearGradient>
        <linearGradient id="veinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#4c6ef5;stop-opacity:0.7" />
          <stop offset="100%" style="stop-color:#364fc7;stop-opacity:0.5" />
        </linearGradient>
      </defs>
      
      <!-- Corazón -->
      <path d="M 150 80 
               C 150 60, 130 40, 110 50
               C 90 60, 85 80, 90 100
               L 150 160
               L 210 100
               C 215 80, 210 60, 190 50
               C 170 40, 150 60, 150 80 Z"
            fill="url(#heartGrad)" stroke="#c92a2a" stroke-width="2"/>
      
      <!-- Aurículas -->
      <ellipse cx="130" cy="70" rx="18" ry="20" fill="#ff8787" opacity="0.8"/>
      <ellipse cx="170" cy="70" rx="18" ry="20" fill="#ff8787" opacity="0.8"/>
      
      <!-- Ventrículos (líneas de separación) -->
      <line x1="150" y1="80" x2="150" y2="140" stroke="#c92a2a" stroke-width="3"/>
      <path d="M 120 110 Q 150 120 180 110" stroke="#c92a2a" stroke-width="2" fill="none"/>
      
      <!-- Aorta -->
      <path d="M 150 50 L 150 20" stroke="url(#arteryGrad)" stroke-width="12" stroke-linecap="round"/>
      <path d="M 150 20 Q 120 15 90 30" stroke="url(#arteryGrad)" stroke-width="10" stroke-linecap="round"/>
      <path d="M 150 20 Q 180 15 210 30" stroke="url(#arteryGrad)" stroke-width="10" stroke-linecap="round"/>
      
      <!-- Arterias principales -->
      <path d="M 150 160 L 150 480" stroke="url(#arteryGrad)" stroke-width="14"/>
      
      <!-- Arterias ramificadas -->
      <line x1="150" y1="200" x2="80" y2="250" stroke="#fa5252" stroke-width="8" opacity="0.7"/>
      <line x1="150" y1="200" x2="220" y2="250" stroke="#fa5252" stroke-width="8" opacity="0.7"/>
      
      <line x1="150" y1="300" x2="90" y2="350" stroke="#fa5252" stroke-width="7" opacity="0.7"/>
      <line x1="150" y1="300" x2="210" y2="350" stroke="#fa5252" stroke-width="7" opacity="0.7"/>
      
      <line x1="150" y1="400" x2="100" y2="460" stroke="#fa5252" stroke-width="6" opacity="0.7"/>
      <line x1="150" y1="400" x2="200" y2="460" stroke="#fa5252" stroke-width="6" opacity="0.7"/>
      
      <!-- Venas (retorno) -->
      <path d="M 70 260 Q 50 300 70 340 L 130 160" stroke="url(#veinGrad)" stroke-width="10" opacity="0.7"/>
      <path d="M 230 260 Q 250 300 230 340 L 170 160" stroke="url(#veinGrad)" stroke-width="10" opacity="0.7"/>
      
      <!-- Capilares (puntos de intercambio) -->
      <circle cx="80" cy="250" r="6" fill="#ff6b6b" opacity="0.8"/>
      <circle cx="220" cy="250" r="6" fill="#ff6b6b" opacity="0.8"/>
      <circle cx="90" cy="350" r="5" fill="#ff6b6b" opacity="0.8"/>
      <circle cx="210" cy="350" r="5" fill="#ff6b6b" opacity="0.8"/>
      <circle cx="100" cy="460" r="5" fill="#ff6b6b" opacity="0.8"/>
      <circle cx="200" cy="460" r="5" fill="#ff6b6b" opacity="0.8"/>
      
      <!-- Pulso (animación simulada con círculos) -->
      <circle cx="150" cy="120" r="4" fill="#fff" opacity="0.9"/>
      <circle cx="150" cy="250" r="3" fill="#fff" opacity="0.8"/>
      <circle cx="150" cy="380" r="3" fill="#fff" opacity="0.7"/>
    </svg>
  `,

  respiratory: `
    <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lungGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#22b8cf;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#1098ad;stop-opacity:0.6" />
        </linearGradient>
        <radialGradient id="alveoliGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#66d9e8;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#3bc9db;stop-opacity:0.5" />
        </radialGradient>
      </defs>
      
      <!-- Tráquea -->
      <rect x="140" y="20" width="20" height="100" rx="5" fill="#15aabf" opacity="0.8"/>
      
      <!-- Anillos traqueales -->
      <line x1="135" y1="30" x2="165" y2="30" stroke="#0c8599" stroke-width="2"/>
      <line x1="135" y1="45" x2="165" y2="45" stroke="#0c8599" stroke-width="2"/>
      <line x1="135" y1="60" x2="165" y2="60" stroke="#0c8599" stroke-width="2"/>
      <line x1="135" y1="75" x2="165" y2="75" stroke="#0c8599" stroke-width="2"/>
      <line x1="135" y1="90" x2="165" y2="90" stroke="#0c8599" stroke-width="2"/>
      <line x1="135" y1="105" x2="165" y2="105" stroke="#0c8599" stroke-width="2"/>
      
      <!-- Bronquios principales -->
      <path d="M 150 120 Q 100 140 80 180" stroke="#15aabf" stroke-width="12" fill="none"/>
      <path d="M 150 120 Q 200 140 220 180" stroke="#15aabf" stroke-width="12" fill="none"/>
      
      <!-- Pulmón Izquierdo -->
      <ellipse cx="85" cy="260" rx="55" ry="110" fill="url(#lungGrad)" stroke="#0c8599" stroke-width="2"/>
      
      <!-- Lóbulos pulmonares izquierdos -->
      <path d="M 85 170 Q 60 200 65 240" stroke="#0ca678" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M 85 240 Q 60 280 65 320" stroke="#0ca678" stroke-width="2" fill="none" opacity="0.6"/>
      
      <!-- Pulmón Derecho -->
      <ellipse cx="215" cy="260" rx="55" ry="110" fill="url(#lungGrad)" stroke="#0c8599" stroke-width="2"/>
      
      <!-- Lóbulos pulmonares derechos -->
      <path d="M 215 170 Q 240 200 235 240" stroke="#0ca678" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M 215 240 Q 240 270 235 300" stroke="#0ca678" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M 215 300 Q 240 330 235 360" stroke="#0ca678" stroke-width="2" fill="none" opacity="0.6"/>
      
      <!-- Bronquiolos (ramificaciones finas) -->
      <path d="M 80 180 Q 70 200 75 220 Q 80 235 70 250" stroke="#22b8cf" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M 80 180 Q 90 200 85 220 Q 80 235 90 250" stroke="#22b8cf" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M 220 180 Q 210 200 215 220 Q 220 235 210 250" stroke="#22b8cf" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M 220 180 Q 230 200 225 220 Q 220 235 230 250" stroke="#22b8cf" stroke-width="3" fill="none" opacity="0.7"/>
      
      <!-- Alvéolos (grupos) -->
      <circle cx="55" cy="230" r="8" fill="url(#alveoliGrad)"/>
      <circle cx="65" cy="245" r="7" fill="url(#alveoliGrad)"/>
      <circle cx="50" cy="260" r="6" fill="url(#alveoliGrad)"/>
      <circle cx="70" cy="275" r="7" fill="url(#alveoliGrad)"/>
      <circle cx="60" cy="290" r="8" fill="url(#alveoliGrad)"/>
      
      <circle cx="245" cy="230" r="8" fill="url(#alveoliGrad)"/>
      <circle cx="235" cy="245" r="7" fill="url(#alveoliGrad)"/>
      <circle cx="250" cy="260" r="6" fill="url(#alveoliGrad)"/>
      <circle cx="230" cy="275" r="7" fill="url(#alveoliGrad)"/>
      <circle cx="240" cy="290" r="8" fill="url(#alveoliGrad)"/>
      
      <!-- Diafragma -->
      <path d="M 40 370 Q 150 400 260 370" stroke="#0c8599" stroke-width="6" fill="none" opacity="0.7" stroke-linecap="round"/>
      
      <!-- Costillas (sugeridas) -->
      <path d="M 30 180 Q 85 185 140 180" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 30 220 Q 85 225 140 220" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 30 260 Q 85 265 140 260" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 30 300 Q 85 305 140 300" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 30 340 Q 85 345 140 340" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      
      <path d="M 270 180 Q 215 185 160 180" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 270 220 Q 215 225 160 220" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 270 260 Q 215 265 160 260" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 270 300 Q 215 305 160 300" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M 270 340 Q 215 345 160 340" stroke="#868e96" stroke-width="2" fill="none" opacity="0.3"/>
      
      <!-- Oxígeno (partículas) -->
      <circle cx="75" cy="250" r="2" fill="#fff" opacity="0.9"/>
      <circle cx="85" cy="270" r="2" fill="#fff" opacity="0.8"/>
      <circle cx="225" cy="250" r="2" fill="#fff" opacity="0.9"/>
      <circle cx="215" cy="270" r="2" fill="#fff" opacity="0.8"/>
    </svg>
  `,

  skeletal: `
    <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e9ecef;stop-opacity:0.95" />
          <stop offset="100%" style="stop-color:#dee2e6;stop-opacity:0.9" />
        </linearGradient>
      </defs>
      
      <!-- Cráneo -->
      <ellipse cx="150" cy="50" rx="50" ry="45" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="3"/>
      
      <!-- Cuencas oculares -->
      <ellipse cx="130" cy="45" rx="12" ry="15" fill="#495057" opacity="0.6"/>
      <ellipse cx="170" cy="45" rx="12" ry="15" fill="#495057" opacity="0.6"/>
      
      <!-- Cavidad nasal -->
      <path d="M 145 60 L 140 70 L 145 75 L 150 70 L 155 75 L 160 70 L 155 60 Z" fill="#495057" opacity="0.5"/>
      
      <!-- Mandíbula -->
      <path d="M 110 75 Q 150 90 190 75" stroke="#adb5bd" stroke-width="6" fill="none" stroke-linecap="round"/>
      
      <!-- Columna Cervical -->
      <rect x="142" y="95" width="16" height="30" rx="4" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2"/>
      
      <!-- Clavículas -->
      <path d="M 150 125 L 90 135" stroke="url(#boneGrad)" stroke-width="8"/>
      <path d="M 150 125 L 210 135" stroke="url(#boneGrad)" stroke-width="8"/>
      
      <!-- Escápulas (omóplatos) -->
      <ellipse cx="85" cy="155" rx="25" ry="35" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2" opacity="0.8"/>
      <ellipse cx="215" cy="155" rx="25" ry="35" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2" opacity="0.8"/>
      
      <!-- Esternón -->
      <rect x="140" y="125" width="20" height="80" rx="3" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2"/>
      
      <!-- Costillas -->
      <path d="M 140 140 Q 90 150 70 180 Q 75 200 90 200 Q 120 195 140 180" 
            stroke="#ced4da" stroke-width="4" fill="none" opacity="0.7"/>
      <path d="M 160 140 Q 210 150 230 180 Q 225 200 210 200 Q 180 195 160 180" 
            stroke="#ced4da" stroke-width="4" fill="none" opacity="0.7"/>
      
      <path d="M 140 160 Q 85 170 65 200 Q 70 220 85 220 Q 115 215 140 200" 
            stroke="#ced4da" stroke-width="4" fill="none" opacity="0.7"/>
      <path d="M 160 160 Q 215 170 235 200 Q 230 220 215 220 Q 185 215 160 200" 
            stroke="#ced4da" stroke-width="4" fill="none" opacity="0.7"/>
      
      <!-- Columna Vertebral -->
      <rect x="142" y="205" width="16" height="180" rx="8" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2"/>
      
      <!-- Vértebras individuales -->
      <circle cx="150" cy="220" r="10" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
      <circle cx="150" cy="245" r="10" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
      <circle cx="150" cy="270" r="10" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
      <circle cx="150" cy="295" r="10" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
      <circle cx="150" cy="320" r="10" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
      <circle cx="150" cy="345" r="10" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
      <circle cx="150" cy="370" r="10" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
      
      <!-- Pelvis -->
      <ellipse cx="150" cy="390" rx="65" ry="30" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="3"/>
      <path d="M 100 390 Q 150 410 200 390" stroke="#adb5bd" stroke-width="3" fill="none"/>
      
      <!-- Húmeros (brazos) -->
      <rect x="70" y="135" width="12" height="100" rx="6" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2" transform="rotate(-5 76 185)"/>
      <rect x="218" y="135" width="12" height="100" rx="6" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2" transform="rotate(5 224 185)"/>
      
      <!-- Codos -->
      <circle cx="74" cy="240" r="8" fill="#dee2e6" stroke="#adb5bd" stroke-width="2"/>
      <circle cx="226" cy="240" r="8" fill="#dee2e6" stroke="#adb5bd" stroke-width="2"/>
      
      <!-- Radio y Cúbito (antebrazos) -->
      <rect x="66" y="240" width="8" height="90" rx="4" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="1.5"/>
      <rect x="222" y="240" width="8" height="90" rx="4" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="1.5"/>
      
      <!-- Muñecas -->
      <circle cx="70" cy="335" r="6" fill="#dee2e6" stroke="#adb5bd" stroke-width="1.5"/>
      <circle cx="226" cy="335" r="6" fill="#dee2e6" stroke="#adb5bd" stroke-width="1.5"/>
      
      <!-- Fémures (piernas) -->
      <rect x="120" y="410" width="15" height="130" rx="7" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2" transform="rotate(-3 127 475)"/>
      <rect x="165" y="410" width="15" height="130" rx="7" fill="url(#boneGrad)" stroke="#adb5bd" stroke-width="2" transform="rotate(3 172 475)"/>
      
      <!-- Rótulas -->
      <ellipse cx="125" cy="545" rx="10" ry="12" fill="#dee2e6" stroke="#adb5bd" stroke-width="2"/>
      <ellipse cx="175" cy="545" rx="10" ry="12" fill="#dee2e6" stroke="#adb5bd" stroke-width="2"/>
      
      <!-- Articulaciones (destacadas) -->
      <circle cx="150" cy="125" r="4" fill="#fab005" opacity="0.8"/>
      <circle cx="90" cy="135" r="4" fill="#fab005" opacity="0.8"/>
      <circle cx="210" cy="135" r="4" fill="#fab005" opacity="0.8"/>
      <circle cx="150" cy="390" r="4" fill="#fab005" opacity="0.8"/>
    </svg>
  `,

  muscular: `
    <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="muscleGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#fa5252;stop-opacity:0.7" />
        </linearGradient>
        <linearGradient id="muscleGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#e03131;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#c92a2a;stop-opacity:0.7" />
        </linearGradient>
      </defs>
      
      <!-- Trapecio -->
      <path d="M 150 90 L 90 110 L 80 140 L 120 130 Z" fill="url(#muscleGrad1)" opacity="0.8"/>
      <path d="M 150 90 L 210 110 L 220 140 L 180 130 Z" fill="url(#muscleGrad1)" opacity="0.8"/>
      
      <!-- Deltoides (hombros) -->
      <ellipse cx="80" cy="130" rx="25" ry="35" fill="url(#muscleGrad1)" transform="rotate(-20 80 130)"/>
      <ellipse cx="220" cy="130" rx="25" ry="35" fill="url(#muscleGrad1)" transform="rotate(20 220 130)"/>
      
      <!-- Pectorales -->
      <ellipse cx="120" cy="150" rx="35" ry="45" fill="url(#muscleGrad2)" opacity="0.85"/>
      <ellipse cx="180" cy="150" rx="35" ry="45" fill="url(#muscleGrad2)" opacity="0.85"/>
      
      <!-- Línea media (separación pectoral) -->
      <line x1="150" y1="120" x2="150" y2="190" stroke="#c92a2a" stroke-width="2"/>
      
      <!-- Abdominales -->
      <rect x="125" y="195" width="50" height="25" rx="3" fill="url(#muscleGrad2)" opacity="0.8"/>
      <rect x="125" y="222" width="50" height="25" rx="3" fill="url(#muscleGrad2)" opacity="0.8"/>
      <rect x="125" y="249" width="50" height="25" rx="3" fill="url(#muscleGrad2)" opacity="0.8"/>
      <rect x="125" y="276" width="50" height="25" rx="3" fill="url(#muscleGrad2)" opacity="0.8"/>
      
      <!-- Líneas de definición abdominal -->
      <line x1="150" y1="195" x2="150" y2="301" stroke="#c92a2a" stroke-width="2"/>
      <line x1="137" y1="220" x2="163" y2="220" stroke="#c92a2a" stroke-width="1.5"/>
      <line x1="137" y1="247" x2="163" y2="247" stroke="#c92a2a" stroke-width="1.5"/>
      <line x1="137" y1="274" x2="163" y2="274" stroke="#c92a2a" stroke-width="1.5"/>
      
      <!-- Oblicuos -->
      <path d="M 125 210 Q 100 230 95 260" stroke="url(#muscleGrad1)" stroke-width="15" opacity="0.7"/>
      <path d="M 175 210 Q 200 230 205 260" stroke="url(#muscleGrad1)" stroke-width="15" opacity="0.7"/>
      
      <!-- Bíceps -->
      <ellipse cx="65" cy="180" rx="18" ry="45" fill="url(#muscleGrad1)" opacity="0.85"/>
      <ellipse cx="235" cy="180" rx="18" ry="45" fill="url(#muscleGrad1)" opacity="0.85"/>
      
      <!-- Tríceps -->
      <ellipse cx="70" cy="185" rx="15" ry="40" fill="url(#muscleGrad2)" opacity="0.7" transform="rotate(10 70 185)"/>
      <ellipse cx="230" cy="185" rx="15" ry="40" fill="url(#muscleGrad2)" opacity="0.7" transform="rotate(-10 230 185)"/>
      
      <!-- Antebrazos -->
      <path d="M 65 225 L 60 310" stroke="url(#muscleGrad1)" stroke-width="22" stroke-linecap="round" opacity="0.8"/>
      <path d="M 235 225 L 240 310" stroke="url(#muscleGrad1)" stroke-width="22" stroke-linecap="round" opacity="0.8"/>
      
      <!-- Cuádriceps (muslos) -->
      <ellipse cx="120" cy="360" rx="22" ry="70" fill="url(#muscleGrad1)" opacity="0.85"/>
      <ellipse cx="140" cy="360" rx="20" ry="68" fill="url(#muscleGrad2)" opacity="0.8"/>
      <ellipse cx="160" cy="360" rx="20" ry="68" fill="url(#muscleGrad2)" opacity="0.8"/>
      <ellipse cx="180" cy="360" rx="22" ry="70" fill="url(#muscleGrad1)" opacity="0.85"/>
      
      <!-- Aductores -->
      <ellipse cx="130" cy="340" rx="15" ry="45" fill="url(#muscleGrad2)" opacity="0.7" transform="rotate(15 130 340)"/>
      <ellipse cx="170" cy="340" rx="15" ry="45" fill="url(#muscleGrad2)" opacity="0.7" transform="rotate(-15 170 340)"/>
      
      <!-- Isquiotibiales -->
      <ellipse cx="125" cy="365" rx="18" ry="60" fill="url(#muscleGrad1)" opacity="0.6" transform="rotate(5 125 365)"/>
      <ellipse cx="175" cy="365" rx="18" ry="60" fill="url(#muscleGrad1)" opacity="0.6" transform="rotate(-5 175 365)"/>
      
      <!-- Gemelos (pantorrillas) -->
      <ellipse cx="125" cy="455" rx="20" ry="50" fill="url(#muscleGrad1)" opacity="0.85"/>
      <ellipse cx="175" cy="455" rx="20" ry="50" fill="url(#muscleGrad1)" opacity="0.85"/>
      
      <!-- Tibiales anteriores -->
      <ellipse cx="115" cy="460" rx="12" ry="45" fill="url(#muscleGrad2)" opacity="0.7"/>
      <ellipse cx="185" cy="460" rx="12" ry="45" fill="url(#muscleGrad2)" opacity="0.7"/>
      
      <!-- Definición muscular (líneas de fibras) -->
      <path d="M 115 355 Q 120 360 125 355" stroke="#fff" stroke-width="1" fill="none" opacity="0.3"/>
      <path d="M 175 355 Q 180 360 185 355" stroke="#fff" stroke-width="1" fill="none" opacity="0.3"/>
      <path d="M 120 370 Q 125 375 130 370" stroke="#fff" stroke-width="1" fill="none" opacity="0.3"/>
      <path d="M 170 370 Q 175 375 180 370" stroke="#fff" stroke-width="1" fill="none" opacity="0.3"/>
      
      <!-- Puntos de tensión -->
      <circle cx="80" cy="130" r="3" fill="#fff" opacity="0.7"/>
      <circle cx="220" cy="130" r="3" fill="#fff" opacity="0.7"/>
      <circle cx="120" cy="360" r="3" fill="#fff" opacity="0.7"/>
      <circle cx="180" cy="360" r="3" fill="#fff" opacity="0.7"/>
    </svg>
  `
};

// Función helper para renderizar imagen según sistema
export function getSystemImage(system: string): string {
  const systemMap: Record<string, keyof typeof BodySystemImages> = {
    'Digestivo': 'digestive',
    'Nervioso': 'nervous',
    'Circulatorio': 'circulatory',
    'Respiratorio': 'respiratory',
    'Esquelético': 'skeletal',
    'Muscular': 'muscular'
  };
  
  const key = systemMap[system];
  return key ? BodySystemImages[key] : '';
}
