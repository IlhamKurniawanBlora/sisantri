<script setup lang="ts">
// Meta configuration
useHead({
  htmlAttrs: {
    lang: 'id'
  },
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>
