<script setup lang="ts">
useHead({
  title: 'Beranda'
})

const features = [
  {
    icon: 'i-heroicons-users',
    title: 'Data Santri',
    description: 'Pencarian dan informasi lengkap data santri'
  },
  {
    icon: 'i-heroicons-newspaper',
    title: 'Blog & Berita',
    description: 'Informasi terkini dan artikel dari pesantren'
  },
  {
    icon: 'i-heroicons-shield-check',
    title: 'Sistem Terpercaya',
    description: 'Platform yang aman dan mudah digunakan'
  }
]
</script>


<template>
  <div>
    <!-- Hero Section -->
    <ULandingSection class="bg-gradient-to-br from-primary-50 to-white">
      <ULandingHero
        title="Sistem Informasi Santri"
        description="Platform digital terpadu untuk pengelolaan data santri, informasi pesantren, dan komunikasi komunitas santri."
        :links="[
          {
            label: 'Cari Data Santri',
            to: '/santri',
            color: 'primary',
            size: 'lg'
          },
          {
            label: 'Baca Blog',
            to: '/blog',
            variant: 'outline',
            color: 'primary',
            size: 'lg'
          }
        ]"
      >
        <template #headline>
          <UBadge variant="subtle" class="mb-4">
            Platform Terpercaya
          </UBadge>
        </template>
      </ULandingHero>
    </ULandingSection>

    <!-- Features Section -->
    <ULandingSection>
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Fitur Utama
          </h2>
          <p class="text-lg text-gray-600">
            Semua yang Anda butuhkan untuk mengelola informasi santri
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <UCard v-for="feature in features" :key="feature.title" class="text-center">
            <div class="flex flex-col items-center">
              <UIcon 
                :name="feature.icon" 
                class="w-12 h-12 text-primary-500 mb-4"
              />
              <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          </UCard>
        </div>
      </UContainer>
    </ULandingSection>

    <!-- CTA Section -->
    <ULandingSection class="bg-primary-50">
      <UContainer>
        <ULandingCTA
          title="Mulai Eksplorasi"
          description="Temukan informasi santri dan berita terkini dari pesantren"
          :links="[
            {
              label: 'Lihat Data Santri',
              to: '/santri',
              color: 'primary',
              size: 'lg'
            }
          ]"
        />
      </UContainer>
    </ULandingSection>
  </div>
</template>

