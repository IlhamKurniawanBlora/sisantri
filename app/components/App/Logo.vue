<template>
  <div class="logo flex items-center gap-2">
    <!-- gambar logo lebih besar di mobile -->
    <img
      src="/logo.png"
      alt="SiDawam Logo"
      class="w-8 h-auto sm:w-6 md:w-8 flex-shrink-0"
    />

    <!-- teks hanya muncul mulai sm -->
    <div class="logo-text hidden sm:block text-base sm:text-lg md:text-xl font-semibold leading-tight whitespace-nowrap">
      SiDawam
    </div>
  </div>
</template>
