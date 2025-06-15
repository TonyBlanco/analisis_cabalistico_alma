<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-black text-white flex flex-col items-center justify-center px-4">
    <div class="max-w-2xl text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        שלום צוקים של הנשמה
      </h1>
      <p class="text-xl mb-8">
        Bienvenido al <strong>Análisis Cabalístico del Alma</strong>, un espacio donde exploramos los caminos del alma, el Tikun, y las raíces espirituales de tu existencia.
        Descubre lo que tu nombre, fecha de nacimiento y energías revelan sobre tu propósito en este mundo.
      </p>
      <NuxtLink to="/consulta" class="bg-white text-indigo-800 px-6 py-3 rounded-full text-lg font-semibold hover:bg-indigo-200 transition">
        Comenzar Consulta
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// No se necesita JS por ahora
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #000;
}
</style>
