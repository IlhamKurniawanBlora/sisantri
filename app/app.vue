<script lang="ts" setup>
// kosong dulu nggak apa-apa
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
          <NuxtPage />
        </Transition>
      </NuxtLayout>
    </UMain>
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
</style>
