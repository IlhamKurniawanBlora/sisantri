<script setup lang="ts">
</script>

<template>
  <UApp>
    <!-- Accessibility -->
    <NuxtRouteAnnouncer />

    <!-- Global Layout -->
    <NuxtLayout>
      <UMain>
        <Transition name="page" mode="out-in" appear>
          <!-- Bungkus NuxtPage dengan elemen tunggal -->
          <div class="page-wrapper">
            <NuxtPage />
          </div>
        </Transition>
      </UMain>
    </NuxtLayout>
  </UApp>
</template>

<style>
/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Optional: Overlay animation */
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
