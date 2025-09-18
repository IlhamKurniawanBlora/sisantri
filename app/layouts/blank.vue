<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-2xl font-bold text-primary-600">
          <UIcon name="i-heroicons-academic-cap" class="w-10 h-10" />
          Sisantri
        </NuxtLink>
        <p class="mt-2 text-sm text-gray-600">Admin Panel</p>
      </div>

      <!-- Auth Card -->
      <UCard class="shadow-xl">
        <slot />
      </UCard>

      <!-- Back to home -->
      <div class="text-center mt-6">
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-heroicons-arrow-left"
        >
          Kembali ke Beranda
        </UButton>
      </div>
    </div>
  </div>
</template>


