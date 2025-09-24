<script lang="ts" setup>
// Optional: Provide global values that can be accessed by overlays
// Since overlays are mounted outside page context, they can only access
// injected values from components containing UApp (like app.vue)

// Example: Provide global configuration or services
// provide('globalConfig', {
//   apiBaseUrl: '/api',
//   appName: 'Pesantren Management'
// })

// Optional: Global error handling for overlays
// const toast = useToast()
// provide('toast', toast)
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <UMain>
      <NuxtLayout>
        <Transition
          name="page"
          mode="out-in"
          appear
        >
          <div>
            <NuxtPage />
          </div>
        </Transition>
      </NuxtLayout>
    </UMain>
    
    <!-- Optional: Global overlay configuration -->
    <!-- UApp automatically handles overlay mounting, no additional setup needed -->
  </UApp>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Optional: Global overlay styles */
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>