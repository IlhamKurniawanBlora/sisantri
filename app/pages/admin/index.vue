<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p class="text-gray-600">Selamat datang di panel admin Sisantri</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
            <p :class="[
              'text-xs flex items-center gap-1',
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            ]">
              <UIcon 
                :name="stat.trend === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
                class="w-3 h-3"
              />
              {{ stat.change }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-primary-50">
            <UIcon :name="stat.icon" class="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions & Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Actions -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Aksi Cepat</h2>
        </template>
        
        <div class="space-y-4">
          <UButton
            to="/admin/santri/create"
            color="primary"
            block
            size="lg"
            icon="i-heroicons-user-plus"
          >
            Tambah Santri Baru
          </UButton>
          
          <UButton
            to="/admin/berita/create"
            color="success"
            block
            size="lg"
            icon="i-heroicons-pencil-square"
          >
            Tulis Berita
          </UButton>
          
          <UButton
            to="/admin/santri"
            variant="outline"
            block
            size="lg"
            icon="i-heroicons-users"
          >
            Kelola Data Santri
          </UButton>
        </div>
      </UCard>

      <!-- Recent Activity -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Aktivitas Terbaru</h2>
        </template>
        
        <div class="space-y-4">
          <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <UIcon :name="activity.icon" :class="['w-5 h-5', activity.color]" />
            <div class="flex-1">
              <p class="text-sm font-medium">{{ activity.title }}</p>
              <p class="text-xs text-gray-600">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: 'Dashboard'
})

useHead({
  title: 'Dashboard Admin'
})

const stats = [
  {
    label: 'Total Santri',
    value: '1,247',
    change: '+12% bulan ini',
    trend: 'up',
    icon: 'i-heroicons-users'
  },
  {
    label: 'Santri Aktif',
    value: '1,189',
    change: '+5% bulan ini',
    trend: 'up',
    icon: 'i-heroicons-user-check'
  },
  {
    label: 'Total Berita',
    value: '89',
    change: '+3 berita baru',
    trend: 'up',
    icon: 'i-heroicons-newspaper'
  },
  {
    label: 'Alumni',
    value: '58',
    change: '+2 bulan ini',
    trend: 'up',
    icon: 'i-heroicons-academic-cap'
  }
]

const recentActivities = [
  {
    id: 1,
    title: 'Santri baru ditambahkan: Ahmad Fauzi',
    time: '2 jam yang lalu',
    icon: 'i-heroicons-user-plus',
    color: 'text-green-600'
  },
  {
    id: 2,
    title: 'Berita baru dipublikasi: "Kegiatan Ramadan"',
    time: '4 jam yang lalu',
    icon: 'i-heroicons-newspaper',
    color: 'text-blue-600'
  },
  {
    id: 3,
    title: 'Data santri diperbarui: Muhammad Rizki',
    time: '1 hari yang lalu',
    icon: 'i-heroicons-pencil-square',
    color: 'text-yellow-600'
  }
]
</script>