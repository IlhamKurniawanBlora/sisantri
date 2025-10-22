<script setup lang="ts">
// Set middleware for authentication
definePageMeta({
  middleware: 'guest',
})

useHead({
  title: 'Profile Pengguna',
  meta: [
    { name: 'description', content: 'Halaman profil pengguna' }
  ]
})
</script>

<template>
  <div class="min-h-screen">
    <NuxtPage />
  </div>
</template>

