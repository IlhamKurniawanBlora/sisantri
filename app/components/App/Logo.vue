<template>
  <div class="logo flex items-center gap-2">
    <!-- gambar: jangan biarkan mengecil terlalu kecil (flex-shrink-0) -->
    <img
      src="/logo.png"
      alt="SiDawam Logo"
      class="w-5 h-auto sm:w-6 md:w-8 flex-shrink-0"
    />

    <!-- teks: ukuran font responsif, jangan pecah (whitespace-nowrap) -->
    <div class="logo-text text-sm sm:text-base md:text-lg font-semibold leading-tight whitespace-nowrap">
      SiDawam
    </div>
  </div>
</template>
