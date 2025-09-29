<script setup lang="ts">
import { ref, h, resolveComponent, computed, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import BlogFormContent from '~/components/Admin/Blog/Form.vue'
import BlogDetailContent from '~/components/Admin/Blog/Detail.vue'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UUser = resolveComponent('UUser')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UCheckbox = resolveComponent('UCheckbox')
const UCard = resolveComponent('UCard')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')
const UIcon = resolveComponent('UIcon')
const USlideover = resolveComponent('USlideover')
const UModal = resolveComponent('UModal')

const toast = useToast()

type Blog = {
  id: string
  slug: string
  title: string
  description: string
  content?: string
  category: string
  tags: string[]
  author_id: string
  created_at: string
  updated_at: string
  deleted_at?: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string
  }
}

// State management
const data = ref<Blog[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const selectedCategory = ref('all')
const sortBy = ref('newest')
const includeDeleted = ref(false)
const total = ref(0)

// Modal states
const showSlideover = ref(false)
const mode = ref<'add' | 'edit'>('add')
const selectedRow = ref<Blog | null>(null)
const showDetailModal = ref(false)

// Confirm dialog state
// State untuk confirm dialog
const showConfirmDialog = ref(false)
const confirmOptions = ref<{
  title: string
  description: string
  variant?: 'destructive' | 'default'
  action?: () => Promise<void>
}>()

// Buka confirm dialog
function openConfirmDialog(opts: {
  title: string
  description: string
  variant?: 'destructive' | 'default'
  action: () => Promise<void>
}) {
  confirmOptions.value = opts
  showConfirmDialog.value = true
}

// Delete Blog
function requestDeleteBlog(blog: Blog) {
  openConfirmDialog({
    title: 'Hapus Blog',
    description: `Apakah Anda yakin ingin menghapus blog "${blog.title}"?`,
    variant: 'destructive',
    action: async () => {
      try {
        await $fetch(`/api/blogs/${blog.slug}`, { method: 'DELETE' })
        toast.add({ title: 'Blog deleted!', color: 'success', icon: 'i-lucide-trash' })
        fetchBlogs()
      } catch (error) {
        toast.add({ title: 'Failed to delete blog', color: 'error' })
      }
    }
  })
}

// Restore Blog
function requestRestoreBlog(blog: Blog) {
  openConfirmDialog({
    title: 'Pulihkan Blog',
    description: `Apakah Anda yakin ingin memulihkan blog "${blog.title}"?`,
    variant: 'default',
    action: async () => {
      try {
        await $fetch(`/api/blogs/${blog.slug}/restore`, { method: 'POST' })
        toast.add({ title: 'Blog restored!', color: 'success', icon: 'i-lucide-undo-2' })
        fetchBlogs()
      } catch (error) {
        toast.add({ title: 'Failed to restore blog', color: 'error' })
      }
    }
  })
}

// Debounced search
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

watch([debouncedSearch, selectedCategory, includeDeleted, sortBy], () => {
  page.value = 1
  fetchBlogs()
})

// Fetch data function
async function fetchBlogs() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString(),
      sortBy: sortBy.value,
      includeDeleted: includeDeleted.value.toString()
    })
    
    if (debouncedSearch.value) params.append('search', debouncedSearch.value)
    if (selectedCategory.value && selectedCategory.value !== 'all') {
      params.append('category', selectedCategory.value)
    }

    const response = await $fetch(`/api/blogs?${params.toString()}`)
    data.value = response.data || []
    total.value = response.pagination?.total || 0
  } catch (error) {
    console.error('Error fetching blogs:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memuat data blog',
      color: 'error'
    })
  }
  loading.value = false
}

onMounted(fetchBlogs)

// Watch page changes
watch(page, () => {
  fetchBlogs()
})

// Filter options
const categoryOptions = [
  { label: 'Semua Kategori', value: 'all' },
  { label: 'Akademik', value: 'akademik' },
  { label: 'Kegiatan', value: 'kegiatan' },
  { label: 'Edukasi', value: 'edukasi' },
  { label: 'Berita', value: 'berita' },
  { label: 'Pengumuman', value: 'pengumuman' }
]

const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Judul A-Z', value: 'title_asc' },
  { label: 'Judul Z-A', value: 'title_desc' }
]

// Table columns
const columns: TableColumn<Blog>[] = [
  {
    accessorKey: 'title',
    header: 'Judul Blog',
    cell: ({ row }) => {
      const blog = row.original
      return h('div', { class: 'min-w-0' }, [
        h('div', { 
          class: 'font-medium text-gray-900 dark:text-white truncate max-w-xs',
          title: blog.title 
        }, blog.title),
        h('div', { 
          class: 'text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs mt-1',
          title: blog.description 
        }, blog.description || '-')
      ])
    }
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      const colorMap = {
        'akademik': 'primary',
        'kegiatan': 'success',
        'edukasi': 'secondary',
        'berita': 'warning',
        'pengumuman': 'error'
      } as const
      const categoryMap = {
        'akademik': 'Akademik',
        'kegiatan': 'Kegiatan', 
        'edukasi': 'Edukasi',
        'berita': 'Berita',
        'pengumuman': 'Pengumuman'
      } as const
      return h(UBadge, { 
        variant: 'subtle', 
        color: colorMap[category as keyof typeof colorMap] || 'neutral'
      }, () => categoryMap[category as keyof typeof categoryMap] || category)
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isDeleted = !!row.original.deleted_at
      return h(
        UBadge,
        {
          variant: 'subtle',
          color: isDeleted ? 'error' : 'success'
        },
        () => (isDeleted ? 'Tidak Aktif' : 'Aktif')
      )
    }
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[]
      if (!tags || tags.length === 0) return h('span', {}, '-')
      return h('div', { class: 'flex flex-wrap gap-1' }, [
        ...tags.slice(0, 2).map(tag => 
          h(UBadge, { 
            key: tag, 
            size: 'xs', 
            variant: 'outline',
            color: 'primary'
          }, () => tag)
        ),
        ...(tags.length > 2 ? [
          h('span', { 
            class: 'text-xs text-gray-500 dark:text-gray-400 px-1',
            title: tags.slice(2).join(', ')
          }, `+${tags.length - 2}`)
        ] : [])
      ])
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Dibuat',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            items: getRowItems(row),
            'aria-label': 'Actions dropdown',
            content: { align: 'end' }
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              'aria-label': 'Actions'
            })
        )
      )
  }
]

// Row actions
function getRowItems(row: Row<Blog>) {
  const blog = row.original

  const items = [
    { type: 'label', label: 'Actions' },
    {
      label: 'Detail',
      icon: 'i-lucide-eye',
      onSelect() {
        selectedRow.value = blog
        showDetailModal.value = true
      }
    },
    {
      label: 'Lihat di Web',
      icon: 'i-lucide-external-link',
      onSelect() {
        navigateTo(`/blogs/${blog.slug}`, { external: true })
      }
    },
    { type: 'separator' },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() {
        mode.value = 'edit'
        selectedRow.value = blog
        showSlideover.value = true
      }
    }
  ]

  if (!blog.deleted_at) {
    items.push({
      label: 'Delete',
      icon: 'i-lucide-trash',
      onSelect: () => requestDeleteBlog(blog) // ✅ ganti ke confirm dialog
    })
  } else {
    items.push({
      label: 'Restore',
      icon: 'i-lucide-undo-2',
      onSelect: () => requestRestoreBlog(blog) // ✅ ganti ke confirm dialog
    })
  }

  return items
}

// Stats computed
const stats = computed(() => {
  const totalCount = total.value
  const activeCount = data.value.filter(b => !b.deleted_at).length
  const inactiveCount = data.value.filter(b => b.deleted_at).length
  const categories = [...new Set(data.value.filter(b => !b.deleted_at).map(b => b.category))]

  return {
    total: totalCount,
    active: activeCount,
    inactive: inactiveCount,
    categories: categories.length,
    totalViews: 0 // nanti bisa disambungkan ke field view_count kalau ada
  }
})


// Clear filters
const clearFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  selectedCategory.value = 'all'
  sortBy.value = 'newest'
  page.value = 1
}

// Handle form save
const handleBlogSaved = () => {
  showSlideover.value = false
  fetchBlogs()
  toast.add({
    title: mode.value === 'add' ? 'Blog added successfully!' : 'Blog updated successfully!',
    color: 'success'
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-newspaper" class="w-6 h-6" />
          Kelola Blog
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola artikel dan konten blog pesantren
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="sm"
        @click="() => { mode = 'add'; selectedRow = null; showSlideover = true }"
      >
        Tambah Blog
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <!-- Total -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Blog</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
      </UCard>

      <!-- Aktif -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.active }}</p>
          </div>
        </div>
      </UCard>

      <!-- Tidak Aktif -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tidak Aktif</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.inactive }}</p>
          </div>
        </div>
      </UCard>

      <!-- Kategori -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-layers" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.categories }}</p>
          </div>
        </div>
      </UCard>
    </div>


    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Cari judul, konten, atau tag blog..."
            :trailing="search ? true : false"
            :loading="loading"
          >
            <template v-if="search" #trailing>
              <UButton
                icon="i-lucide-x"
                color="gray"
                variant="link"
                size="xs"
                @click="search = ''"
              />
            </template>
          </UInput>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-2">
          <USelect
            v-model="selectedCategory"
            :items="categoryOptions"
            placeholder="Filter Kategori"
            class="w-full sm:w-40"
          >
            <template #leading>
              <UIcon name="i-lucide-layers" class="w-4 h-4 text-gray-400" />
            </template>
          </USelect>

          <USelect
            v-model="sortBy"
            :items="sortOptions"
            placeholder="Urutkan"
            class="w-full sm:w-32"
          >
            <template #leading>
              <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4 text-gray-400" />
            </template>
          </USelect>

          <UCheckbox
            v-model="includeDeleted"
            label="Tampilkan yang dihapus"
            class="flex items-center"
          />

          <UButton
            v-if="search || (selectedCategory && selectedCategory !== 'all') || sortBy !== 'newest'"
            icon="i-lucide-x"
            color="gray"
            variant="outline"
            size="sm"
            @click="clearFilters"
          >
            Reset
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Empty State -->
    <UCard v-if="data.length === 0 && !loading">
      <div class="text-center py-12">
        <UIcon name="i-lucide-file-text" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ search ? 'Blog Tidak Ditemukan' : 'Belum Ada Blog' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ search 
            ? `Tidak ditemukan blog yang sesuai dengan pencarian "${search}"` 
            : 'Belum ada blog yang dibuat. Mulai dengan menambahkan blog pertama.'
          }}
        </p>
        <div class="flex justify-center gap-2">
          <UButton v-if="search" @click="clearFilters" variant="outline">
            <UIcon name="i-lucide-refresh-cw" class="mr-2" />
            Reset Pencarian
          </UButton>
          <UButton @click="() => { mode = 'add'; selectedRow = null; showSlideover = true }">
            <UIcon name="i-lucide-plus" class="mr-2" />
            Tambah Blog
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Data Table -->
    <UCard v-else>
      <UTable 
        :data="data" 
        :columns="columns" 
        :loading="loading"
        class="w-full"
      />

      <template #footer v-if="total > limit">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {{ ((page - 1) * limit) + 1 }}-{{ Math.min(page * limit, total) }} 
            dari {{ total }} blog
          </p>
          
          <UPagination
            v-model="page"
            :total="total"
            :page-count="limit"
            :max="7"
            show-first
            show-last
          />
        </div>
      </template>
    </UCard>

      <!-- Slideover Form -->
    <USlideover v-model:open="showSlideover" :title="mode === 'add' ? 'Tambah Blog' : 'Edit Blog'">
      <template #body>
        <BlogFormContent
          :mode="mode"
          :blog="selectedRow"
          @saved="handleBlogSaved"
          @close="showSlideover = false"
        />
      </template>
    </USlideover>

  <UModal v-model:open="showDetailModal" class="w-full max-w-4xl">
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-file-text" class="w-6 h-6 text-primary" />
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Detail Blog
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Informasi lengkap artikel blog
          </p>
        </div>
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <BlogDetailContent
        v-if="selectedRow"
        :blog="selectedRow"
      />
    </template> 

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="outline"
          icon="i-lucide-external-link"
          @click="navigateTo(`/blogs/${selectedRow?.slug}`, { external: true })"
        >
          Lihat di Web
        </UButton>
        <UButton @click="showDetailModal = false" variant="outline">
          Tutup
        </UButton>
      </div>
    </template>
  </UModal>

    <AdminConfirmDialog
      v-if="showConfirmDialog"
      :title="confirmOptions?.title"
      :description="confirmOptions?.description"
      :variant="confirmOptions?.variant"
      confirm-text="Ya"
      cancel-text="Batal"
      @close="(confirmed) => {
        showConfirmDialog = false
        if (confirmed && confirmOptions?.action) confirmOptions.action()
      }"
    />
  </div>
</template>