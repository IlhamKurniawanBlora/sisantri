<template>
    <div class="min-h-screen flex items-center justify-center p-4">
      <UColorModeButton class="absolute top-2 right-2 z-10" />
      <div class="w-full max-w-md">
        <slot />

        <div class="text-center mt-6">
          <UButton to="/" variant="ghost" color="neutral" icon="i-lucide-arrow-left" >
            Kembali ke Beranda
          </UButton>
        </div>
      </div>
    </div>
</template>


