<script setup lang="ts">
// Set middleware for authentication
definePageMeta({
  middleware: 'guest',
  layout: 'default'
})

useHead({
  title: 'Profile Pengguna',
  meta: [
    { name: 'description', content: 'Halaman profil pengguna' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtPage />
  </div>
</template>

