<script setup lang="ts">
// No additional interfaces needed for this version
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="text-center py-16">
      <div class="max-w-4xl mx-auto">
        <UIcon name="i-lucide-users" class="h-16 w-16 text-primary-600 mx-auto mb-6" />
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Tentang SiDawam
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Sistem Informasi Digital untuk Pondok Pesantren Dawam - 
          Menghubungkan tradisi dengan teknologi modern dalam pengelolaan data santri dan informasi pesantren.
        </p>
      </div>
    </section>

    <!-- What is SiDawam -->
    <section class="py-16">
      <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Apa itu SiDawam?
            </h2>
            <div class="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                SiDawam (Sistem Informasi Dawam) adalah platform digital yang dikembangkan khusus untuk mendukung operasional dan manajemen Pondok Pesantren Dawam. Aplikasi ini menyediakan solusi terintegrasi untuk pengelolaan data santri, publikasi berita, dan penyebaran informasi kepada masyarakat.
              </p>
              <p>
                Dengan menggabungkan nilai-nilai tradisional pesantren dan teknologi modern, SiDawam memungkinkan transparansi informasi yang lebih baik antara pesantren dengan keluarga santri dan masyarakat umum.
              </p>
              <p>
                Platform ini dapat diakses oleh <strong>administrator pesantren</strong> untuk mengelola konten dan data, serta <strong>pengunjung umum</strong> untuk mencari informasi santri dan membaca berita terkini dari pondok pesantren.
              </p>
            </div>
          </div>
          <div class="relative">
            <div class="bg-primary-50 dark:bg-primary-950 rounded-3xl p-8">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <UIcon name="i-lucide-users" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Data Santri</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Kelola profil santri</p>
                </div>
                <div class="text-center">
                  <UIcon name="i-lucide-newspaper" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Berita</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Publikasi informasi</p>
                </div>
                <div class="text-center">
                  <UIcon name="i-lucide-search" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Pencarian</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Cari dengan mudah</p>
                </div>
                <div class="text-center">
                  <UIcon name="i-lucide-globe" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Online</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Akses 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Pondok Pesantren Dawam -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900 rounded-3xl">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Pondok Pesantren Dawam
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Lembaga pendidikan Islam yang mengakar dalam tradisi dan berinovasi dengan teknologi
          </p>
        </div>
        
        <div class="space-y-12">
          <!-- Sejarah dan Visi Misi -->
          <div class="grid lg:grid-cols-2 gap-8">
            <UCard>
              <template #header>
                <div class="flex items-center space-x-3">
                  <UIcon name="i-lucide-book-open" class="h-6 w-6 text-primary-600" />
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Sejarah & Profil</h3>
                </div>
              </template>
              
              <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  Pondok Pesantren Dawam merupakan lembaga pendidikan Islam yang telah berdiri dan mengabdi dalam mencerdaskan kehidupan bangsa melalui pendidikan berbasis nilai-nilai Islami.
                </p>
                <p>
                  Dengan nama "Dawam" yang berarti "kontinyu" atau "berkesinambungan", pesantren ini berkomitmen untuk memberikan pendidikan yang berkelanjutan dan relevan dengan perkembangan zaman.
                </p>
                <p>
                  Pesantren ini menggabungkan kurikulum tradisional pesantren dengan pendidikan modern, menciptakan lulusan yang berakhlak mulia, berpengetahuan luas, dan siap menghadapi tantangan masa depan.
                </p>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="flex items-center space-x-3">
                  <UIcon name="i-lucide-target" class="h-6 w-6 text-primary-600" />
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Visi & Misi</h3>
                </div>
              </template>
              
              <div class="space-y-4">
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Visi</h4>
                  <p class="text-gray-600 dark:text-gray-300">
                    Menjadi pondok pesantren unggul yang menghasilkan generasi Muslim yang berakhlak mulia, berpengetahuan luas, dan berkontribusi positif bagi masyarakat.
                  </p>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Misi</h4>
                  <ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Menyelenggarakan pendidikan Islam yang komprehensif dan berkualitas</li>
                    <li>Membentuk karakter santri yang berakhlak mulia dan berjiwa leadership</li>
                    <li>Mengintegrasikan ilmu agama dan ilmu umum dalam pembelajaran</li>
                    <li>Mengembangkan potensi santri di bidang akademik dan non-akademik</li>
                  </ul>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Program Pendidikan -->
          <UCard>
            <template #header>
              <div class="flex items-center space-x-3">
                <UIcon name="i-lucide-graduation-cap" class="h-6 w-6 text-primary-600" />
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Program Pendidikan</h3>
              </div>
            </template>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="space-y-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">Pendidikan Formal</h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Madrasah Tsanawiyah (MTs)</li>
                  <li>• Madrasah Aliyah (MA)</li>
                  <li>• Program Tahfidz Al-Qur'an</li>
                </ul>
              </div>
              <div class="space-y-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">Pendidikan Diniyah</h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Kajian Kitab Kuning</li>
                  <li>• Bahasa Arab & Inggris</li>
                  <li>• Fiqh dan Ushul Fiqh</li>
                </ul>
              </div>
              <div class="space-y-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">Ekstrakurikuler</h4>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Seni & Budaya Islam</li>
                  <li>• Olahraga & Kesehatan</li>
                  <li>• Kewirausahaan</li>
                </ul>
              </div>
            </div>
          </UCard>

          <!-- Fasilitas -->
          <UCard>
            <template #header>
              <div class="flex items-center space-x-3">
                <UIcon name="i-lucide-building" class="h-6 w-6 text-primary-600" />
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Fasilitas Pesantren</h3>
              </div>
            </template>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center space-y-3">
                <div class="p-3 bg-primary-50 dark:bg-primary-950 rounded-full w-fit mx-auto">
                  <UIcon name="i-lucide-home" class="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">Asrama</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Hunian nyaman untuk santri putra dan putri</p>
                </div>
              </div>
              
              <div class="text-center space-y-3">
                <div class="p-3 bg-primary-50 dark:bg-primary-950 rounded-full w-fit mx-auto">
                  <UIcon name="i-lucide-book" class="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">Perpustakaan</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Koleksi buku agama dan umum yang lengkap</p>
                </div>
              </div>
              
              <div class="text-center space-y-3">
                <div class="p-3 bg-primary-50 dark:bg-primary-950 rounded-full w-fit mx-auto">
                  <UIcon name="i-lucide-users" class="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">Aula</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Ruang serbaguna untuk kegiatan bersama</p>
                </div>
              </div>
              
              <div class="text-center space-y-3">
                <div class="p-3 bg-primary-50 dark:bg-primary-950 rounded-full w-fit mx-auto">
                  <UIcon name="i-lucide-wifi" class="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white">Internet</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Akses internet untuk pembelajaran digital</p>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-16 text-center">
      <div class="max-w-3xl mx-auto space-y-6">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Jelajahi Informasi Pesantren
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Temukan informasi lengkap tentang santri dan berita terbaru dari Pondok Pesantren Dawam melalui platform SiDawam.
        </p>
        <div class="space-x-4">
          <UButton to="/santri" color="primary" size="lg">
            <UIcon name="i-lucide-users" class="mr-2" />
            Cari Data Santri
          </UButton>
          <UButton to="/blogs" variant="outline" color="primary" size="lg">
            <UIcon name="i-lucide-newspaper" class="mr-2" />
            Baca Berita
          </UButton>
        </div>
      </div>
    </section>
  </div>  
</template>