<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-4 py-12 flex items-center justify-center">
    <div class="max-w-xl w-full bg-white/5 backdrop-blur rounded-xl shadow-lg p-8">
      <h1 class="text-3xl md:text-4xl font-bold mb-4 text-center text-yellow-400">Análisis Cabalístico del Alma</h1>
      <p class="text-center text-white/90 mb-8">
        Descubre los secretos numerológicos de tu alma y el propósito sagrado de tu existencia.
      </p>

      <form @submit.prevent="leerAlma" class="space-y-5">
        <div>
          <label for="nombre" class="block text-sm font-medium mb-1">🟡 Nombre Completo *</label>
          <input v-model="nombre" id="nombre" type="text" required class="w-full px-4 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tu nombre completo tal como aparece en tu documento" />
        </div>

        <div>
          <label for="fecha" class="block text-sm font-medium mb-1">📅 Fecha de Nacimiento *</label>
          <input v-model="fechaNacimiento" id="fecha" type="date" required class="w-full px-4 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label for="lugar" class="block text-sm font-medium mb-1">📍 Lugar de Nacimiento (opcional)</label>
          <input v-model="lugarNacimiento" id="lugar" type="text" class="w-full px-4 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ciudad, País" />
        </div>

        <div>
          <label for="hora" class="block text-sm font-medium mb-1">⏰ Hora de Nacimiento (opcional)</label>
          <input v-model="horaNacimiento" id="hora" type="time" class="w-full px-4 py-2 bg-white/10 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <button type="submit" class="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black rounded font-semibold text-lg transition">
          ⭐ Revelar mi Análisis Cabalístico
        </button>
      </form>

      <div v-if="resultado" class="mt-8 text-indigo-200 border-t border-white/10 pt-6">
        <h2 class="text-xl font-bold mb-2">Resultado espiritual</h2>
        <p>{{ resultado }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const nombre = ref('')
const fechaNacimiento = ref('')
const lugarNacimiento = ref('')
const horaNacimiento = ref('')
const resultado = ref('')

function leerAlma() {
  resultado.value = `Querido ${nombre.value}, tu alma refleja un propósito elevado. Naciste en una fecha significativa con potencial de revelar luz a través de tu corrección espiritual (Tikún). Sigue el camino de la sabiduría.`
}
</script>
