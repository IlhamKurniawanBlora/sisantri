<script setup lang="ts">
interface Props {
  search: string
  selectedCategory: string
  sortBy: string
  loading?: boolean
}

interface Emits {
  (e: 'update:search', value: string): void
  (e: 'update:selectedCategory', value: string): void
  (e: 'update:sortBy', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Filter options
const categoryOptions = [
  { label: 'Semua Kategori', value: '' },
  { label: 'Akademik', value: 'Akademik' },
  { label: 'Kegiatan', value: 'Kegiatan' },
  { label: 'Edukasi', value: 'Edukasi' },
  { label: 'Berita', value: 'Berita' }
]

const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Judul A-Z', value: 'title_asc' },
  { label: 'Judul Z-A', value: 'title_desc' }
]

// Computed properties for v-model
const searchModel = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value)
})

const categoryModel = computed({
  get: () => props.selectedCategory,
  set: (value) => emit('update:selectedCategory', value)
})

const sortModel = computed({
  get: () => props.sortBy,
  set: (value) => emit('update:sortBy', value)
})

// Clear search
const clearSearch = () => {
  searchModel.value = ''
}

// Clear all filters
const clearAll = () => {
  emit('clear')
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return props.search || props.selectedCategory
})
</script>

<template>
  <UCard>
    <div class="flex flex-col lg:flex-row gap-4">
      <!-- Search -->
      <div class="flex-1">
        <UInput
          v-model="searchModel"
          icon="i-lucide-search"
          placeholder="Cari judul, deskripsi, atau konten blog..."
          :trailing="search ? true : false"
          :loading="loading"
          size="lg"
        >
          <template v-if="search" #trailing>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="link"
              size="xs"
              @click="clearSearch"
            />
          </template>
        </UInput>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Category Filter -->
        <USelect
          v-model="categoryModel"
          :options="categoryOptions"
          placeholder="Kategori"
          class="w-full sm:w-44"
          size="lg"
        >
          <template #leading>
            <UIcon name="i-lucide-folder" class="w-4 h-4 text-gray-400" />
          </template>
        </USelect>
        
        <!-- Sort Filter -->
        <USelect
          v-model="sortModel"
          :options="sortOptions"
          placeholder="Urutkan"
          class="w-full sm:w-36"
          size="lg"
        >
          <template #leading>
            <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4 text-gray-400" />
          </template>
        </USelect>

        <!-- Clear Filters Button -->
        <UButton
          v-if="hasActiveFilters"
          icon="i-lucide-filter-x"
          color="neutral"
          variant="outline"
          size="lg"
          @click="clearAll"
        >
          Reset
        </UButton>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <span class="text-sm text-gray-500 dark:text-gray-400">Filter aktif:</span>
      
      <UBadge
        v-if="search"
        variant="soft"
        color="warning"
        class="flex items-center gap-1"
      >
        <UIcon name="i-lucide-search" class="w-3 h-3" />
        "{{ search }}"
        <UButton
          icon="i-lucide-x"
          color="warning"
          variant="ghost"
          @click="clearSearch"
        />
      </UBadge>
      
      <UBadge
        v-if="selectedCategory"
        variant="soft"
        color="neutral"
        class="flex items-center gap-1"
      >
        <UIcon name="i-lucide-folder" class="w-3 h-3" />
        {{ selectedCategory }}
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          @click="categoryModel = ''"
        />
      </UBadge>
    </div>
  </UCard>
</template>