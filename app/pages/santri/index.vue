<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const page = ref(1)
const limit = ref(8) // Increased limit for better grid layout
const search = ref('')

const debouncedSearch = ref('')
let searchTimeout: NodeJS.Timeout

const debounceSearch = (value: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = value
  }, 500)
}

watch(search, (newValue) => {
  debounceSearch(newValue)
})

const queryParams = computed(() => {
  const params: Record<string, any> = {
    page: page.value,
    limit: limit.value
  }
  
  if (debouncedSearch.value) params.search = debouncedSearch.value
  
  return params
})

const { data: res, pending, error, refresh } = await useAsyncData(
  'santris',
  () => {
    const params = new URLSearchParams()
    Object.entries(queryParams.value).forEach(([key, value]) => {
      if (value) params.append(key, value.toString())
    })
    return $fetch(`/api/santris/?${params.toString()}`)
  },
  {
    watch: [queryParams]
  }
)

const santris = computed(() => res.value?.data ?? [])
const total = computed(() => res.value?.pagination?.total ?? 0)

watch([debouncedSearch], () => {
  page.value = 1
})

const clearFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  page.value = 1
}

</script>

<template>
  <!-- Hero Section -->
  <section class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-6">
          <UIcon name="i-lucide-users" class="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Data Santri <span class="text-primary-600 dark:text-primary-400">SiDawam</span>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Jelajahi data lengkap santri di pesantren kami. Temukan informasi detail tentang setiap santri, termasuk profil, status, dan alamat mereka.
        </p>
        
        <!-- Navigation Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <UButton size="lg" to="/" class="text-white">
            <UIcon name="i-lucide-home" class="mr-2" />
            Beranda
          </UButton>
          <UButton size="lg" variant="outline" to="/blogs">
            <UIcon name="i-lucide-newspaper" class="mr-2" />
            Lihat Berita
          </UButton>
        </div>
      </div>
    </div>
  </section>

  <!-- Content Section -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Results Info -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ search ? 'Hasil Pencarian' : 'Daftar Santri' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mt-1">
            <template v-if="pending">
              Sedang memuat...
            </template>
            <template v-else>
              {{ total }} santri ditemukan
            </template>
          </p>
        </div>
        
        <div class="hidden md:flex items-center gap-2">
          <div class="flex-1">
            <UInput
              v-model="search"
              placeholder="Cari santri berdasarkan nama..."
              size="lg"
              :loading="pending"
              class="w-full min-w-80"
            >
              <template #leading>
                <UIcon name="i-lucide-users" class="h-5 w-5 text-gray-400" />
              </template>
            </UInput>
          </div>
          
          <UButton
            v-if="search"
            variant="subtle"
            color="error"
            size="lg"
            @click="clearFilters"
            class="shrink-0"
          >
            <UIcon name="i-lucide-x" class="h-5 w-5" />
          </UButton>
        </div>

      </div>

      <!-- Mobile Search -->
      <div class="md:hidden mt-4 flex items-center gap-2">
        <UInput
          v-model="search"
          placeholder="Cari santri berdasarkan nama..."
          size="lg"
          :loading="pending"
          class="w-full"
        >
          <template #leading>
            <UIcon name="i-lucide-users" class="h-5 w-5 text-gray-400" />
          </template>
        </UInput>

        <UButton
          v-if="search"
          variant="subtle"
          color="error"
          size="lg"
          @click="clearFilters"
          class="shrink-0"
        >
          <UIcon name="i-lucide-x" class="h-5 w-5" />
        </UButton>
      </div>

    </div>

    <!-- Loading State -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <UIcon name="i-lucide-triangle-alert" class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Terjadi Kesalahan
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Gagal memuat data santri. Silakan coba lagi.
      </p>
      <UButton @click="refresh" variant="outline">
        <UIcon name="i-lucide-refresh" class="mr-2" />
        Coba Lagi
      </UButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="santris.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-users" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ search ? 'Santri Tidak Ditemukan' : 'Belum Ada Data Santri' }}
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        {{ search 
          ? `Tidak ditemukan santri yang sesuai dengan "${search}"` 
          : 'Belum ada data santri yang tersedia.'
        }}
      </p>
      <UButton v-if="search" @click="clearFilters" variant="outline">
        <UIcon name="i-lucide-x" class="mr-2" />
        Reset Pencarian
      </UButton>
    </div>

    <!-- Santri Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <SantriCard
        v-for="(item, idx) in santris"
        :key="item.id || idx"
        :student="item" 
        :show-stats="true"
      />
    </div>

    <!-- Pagination -->
    <div v-if="santris.length > 0" class="mt-12 flex justify-center">
      <UPagination
        v-model="page"
        :total="total"
        :page-count="limit"
        show-first
        show-last
        :max="7"
      />
    </div>
  </section>
</template>