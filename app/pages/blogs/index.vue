<script setup lang="ts">
import { ref, computed, watchEffect, watch } from 'vue'

const page = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('newest')

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
    limit: limit.value,
    sortBy: sortBy.value
  }
  
  if (debouncedSearch.value) params.search = debouncedSearch.value
  
  return params
})

const { data: res, pending, error, refresh } = await useAsyncData(
  'blogs',
  () => {
    const params = new URLSearchParams()
    Object.entries(queryParams.value).forEach(([key, value]) => {
      if (value) params.append(key, value.toString())
    })
    return $fetch(`/api/blogs/?${params.toString()}`)
  },
  {
    watch: [queryParams]
  }
)

const blogs = computed(() => res.value?.data ?? [])
const total = computed(() => res.value?.pagination?.total ?? 0)

// Reset page when search changes
watch([debouncedSearch], () => {
  page.value = 1
})

const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'A-Z', value: 'title_asc' },
  { label: 'Z-A', value: 'title_desc' }
]

const clearSearch = () => {
  search.value = ''
  debouncedSearch.value = ''
  page.value = 1
}
</script>

<template>
  <section class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-6">
          <UIcon name="i-lucide-users" class="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Blog <span class="text-primary-600 dark:text-primary-400">SiDawam</span>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Temukan berbagai artikel, berita, dan cerita menarik seputar dunia pondok pesantren dan kehidupan santri
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <UButton size="lg" to="/santri" class="text-white">
            <UIcon name="i-lucide-home" class="mr-2" />
            Beranda
          </UButton>
          <UButton size="lg" variant="outline" to="/santri">
            <UIcon name="i-lucide-users" class="mr-2" />
            Lihat Data Santri
          </UButton>
        </div>
      </div>
    </div>
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <!-- Judul + info artikel -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ search ? 'Hasil Pencarian' : 'Artikel Terbaru' }}
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mt-1">
        <template v-if="pending">
          Sedang memuat...
        </template>
        <template v-else>
          {{ total }} artikel ditemukan
        </template>
      </p>
    </div>

    <!-- Search + Sort -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full sm:w-auto">
      <!-- Search + Reset -->
      <div class="flex items-center gap-2 w-full sm:max-w-md">
        <UInput
          v-model="search"
          placeholder="Cari artikel, judul, atau konten..."
          size="lg"
          :loading="pending"
          class="flex-1"
        >
          <template #leading>
            <UIcon name="i-lucide-newspaper" class="h-5 w-5 text-gray-400" />
          </template>
        </UInput>

        <UButton
          v-if="search"
          variant="subtle"
          color="error"
          size="sm"
          @click="clearSearch"
          class="shrink-0"
        >
          <UIcon name="i-lucide-x" class="h-4 w-4" />
        </UButton>
      </div>

      <!-- Sort -->
      <USelect
        v-model="sortBy"
        :items="sortOptions"
        option-attribute="label"
        value-attribute="value"
        placeholder="Urutkan"
        size="lg"
        class="w-full sm:w-44"
      >
        <template #leading>
          <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4 text-gray-500" />
        </template>
      </USelect>
    </div>
  </div>
</div>


    <div v-if="pending" class="space-y-6">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <UIcon name="i-lucide-exclamation-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Terjadi Kesalahan
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Gagal memuat artikel. Silakan coba lagi.
      </p>
      <UButton @click="refresh" variant="outline">
        <UIcon name="i-lucide-refresh-cw" class="mr-2" />
        Coba Lagi
      </UButton>
    </div>

    <div v-else-if="blogs.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-file-text" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ search ? 'Artikel Tidak Ditemukan' : 'Belum Ada Artikel' }}
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        {{ search 
          ? `Tidak ditemukan artikel yang sesuai dengan "${search}"` 
          : 'Belum ada artikel yang dipublikasikan.'
        }}
      </p>
      <UButton v-if="search" @click="clearSearch" variant="outline">
        <UIcon name="i-lucide-refresh-cw" class="mr-2" />
        Reset Pencarian
      </UButton>
    </div>

    <div v-else class="space-y-6">
      <BlogCard
        v-for="(item, idx) in blogs"
        :key="item.id || idx"
        :title="item.title"
        :description="item.description"
        :image="item.image"
        :date="item.created_at"
        :to="`/blogs/${item.slug}`"
        :author-name="item.profiles?.full_name"
        :author-avatar="item.profiles?.avatar_url"
        :blog="item"
      />
    </div>

    <div v-if="blogs.length > 0" class="mt-12 flex justify-center">
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