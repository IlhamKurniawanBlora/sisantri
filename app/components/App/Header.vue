<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'i-lucide-home',
    active: route.path === '/'
  },
  {
    label: 'Santri',
    to: '/santri',
    icon: 'i-lucide-users',
    active: route.path.startsWith('/santri')
  },
  {
    label: 'Blog',
    to: '/blog',
    icon: 'i-lucide-newspaper',
    active: route.path.startsWith('/blog')
  }
])
</script>

<template>
  <UHeader>
    <template #title>
      <AppLogo class="h-6 w-auto" />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

