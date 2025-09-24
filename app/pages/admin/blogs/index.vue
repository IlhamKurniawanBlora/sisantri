<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import BlogForm from '~/components/Admin/BlogForm.vue'
import BlogFilters from '~/components/Admin/BlogFilters.vue'
import BlogStats from '~/components/Admin/BlogStats.vue'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UUser = resolveComponent('UUser')

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

// Reactive state
const page = ref(1)
const limit = ref(10)
const search = ref('')
const selectedCategory = ref('all')
const sortBy = ref('newest')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const selectedBlog = ref<Blog | null>(null)
const includeDeleted = ref(false)

// Debounce search input
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

// Build query parameters
const queryParams = computed(() => {
  const params: Record<string, any> = {
    page: page.value,
    limit: limit.value,
    sortBy: sortBy.value,
    includeDeleted: includeDeleted.value
  }
  
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (selectedCategory.value && selectedCategory.value !== 'all') params.category = selectedCategory.value
  
  return params
})

// Fetch blogs data
const { data: res, pending, error, refresh } = await useAsyncData(
  'admin-blogs',
  () => {
    const params = new URLSearchParams()
    Object.entries(queryParams.value).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value.toString())
      }
    })
    return $fetch(`/api/blogs?${params.toString()}`)
  },
  {
    watch: [queryParams]
  }
)

const blogs = computed(() => res.value?.data ?? [])
const total = computed(() => res.value?.pagination?.total ?? 0)

// Reset page when search/filters change
watch([debouncedSearch, selectedCategory, includeDeleted], () => {
  page.value = 1
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
  // ...existing code...
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
        'akademik': 'blue',
        'kegiatan': 'green',
        'edukasi': 'purple',
        'berita': 'yellow',
        'pengumuman': 'red'
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
    accessorKey: 'profiles',
    header: 'Penulis',
    cell: ({ row }) => {
      const profile = row.getValue('profiles') as Blog['profiles']
      if (!profile) return h('span', {}, '-')
      return h(UUser, {
        avatar: {
          src: profile.avatar_url || 'https://placehold.co/32x32?text=?'
        },
        name: profile.full_name,
        description: 'Author',
        size: 'sm'
      })
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
      return h('span', {}, date
        ? new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : '-')
    }
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h('div', { class: 'text-right' },
        h(UDropdownMenu, {
          items: getRowItems(row),
          teleport: false,
          onSelect: (item) => {
            if (item && typeof item.onSelected === 'function') item.onSelected()
            if (item && typeof item.click === 'function') item.click()
          }
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-more-vertical',
            color: 'neutral',
            variant: 'ghost',
            size: 'sm'
          })
        )
      )
  }
]
// Row actions
function getRowItems(row: Row<Blog>) {
  const blog = row.original
  const items = [
    {
      label: 'Detail',
      icon: 'i-lucide-eye',
      onSelected: () => viewBlog(blog)
    },
    {
      label: 'Lihat di Web',
      icon: 'i-lucide-external-link',
      onSelected: () => navigateTo(`/blogs/${blog.slug}`, { external: true })
    },
    {
      label: 'Edit',
      icon: 'i-lucide-edit',
      onSelected: () => editBlog(blog)
    }
  ]
  if (!blog.deleted_at) {
    items.push({
      label: 'Hapus',
      icon: 'i-lucide-trash-2',
      onSelected: () => deleteBlog(blog.slug)
    })
  } else {
    items.push({
      label: 'Pulihkan',
      icon: 'i-lucide-undo-2',
      onSelected: () => restoreBlog(blog.slug)
    })
  }
  return items
}


// Actions
const addBlog = () => {
  selectedBlog.value = null
  showAddModal.value = true
}

const viewBlog = (blog: Blog) => {
  selectedBlog.value = blog
  showDetailModal.value = true
}

const editBlog = (blog: Blog) => {
  selectedBlog.value = blog
  showEditModal.value = true
}

const deleteBlog = async (slug: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus blog ini?')) return
  try {
    await $fetch(`/api/blogs/${slug}`, { method: 'DELETE' })
    toast.add({
      title: 'Blog berhasil dihapus!',
      color: 'success'
    })
    refresh()
  } catch (error) {
    toast.add({
      title: 'Gagal menghapus blog',
      color: 'error'
    })
  }
}

const restoreBlog = async (slug: string) => {
  if (!confirm('Apakah Anda yakin ingin memulihkan blog ini?')) return
  try {
    await $fetch(`/api/blogs/${slug}/restore`, { method: 'POST' })
    toast.add({
      title: 'Blog berhasil dipulihkan!',
      color: 'success'
    })
    refresh()
  } catch (error) {
    toast.add({
      title: 'Gagal memulihkan blog',
      color: 'error'
    })
  }
}

const handleBlogSaved = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedBlog.value = null
  refresh()
  toast.add({
    title: selectedBlog.value ? 'Blog berhasil diperbarui!' : 'Blog berhasil ditambahkan!',
    color: 'success'
  })
}

// Clear filters
const clearFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  selectedCategory.value = 'all'
  page.value = 1
}

// Stats
const stats = computed(() => {
  const categories = [...new Set(blogs.value.filter(b => !b.deleted_at).map(b => b.category))]
  const published = blogs.value.filter(b => !b.deleted_at).length
  return {
    total: total.value,
    publishedBlogs: published,
    categories: categories.length,
    totalViews: 0 // implementasi jika ada views
  }
})

const formatContent = (content: string, maxLength: number = 150) => {
  if (!content) return '-'
  const stripped = content.replace(/<[^>]*>/g, '')
  return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
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
          @click="addBlog"
        >
          Tambah Blog
        </UButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <BlogStats
      :total-blogs="stats.total"
      :published-blogs="stats.publishedBlogs"
      :categories="stats.categories"
      :total-views="stats.totalViews"
      class="mb-8"
    />

    <!-- Filters and Search -->
    <BlogFilters
      :search="search"
      :selected-category="selectedCategory"
      :sort-by="sortBy"
      :loading="pending"
      @update:search="val => search.value = val"
      @update:selectedCategory="val => selectedCategory.value = val"
      @update:sortBy="val => sortBy.value = val"
      @clear="clearFilters"
      class="mb-6"
    />

    <!-- Loading State -->
    <UCard v-if="pending">
      <div class="space-y-4">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </UCard>

    <!-- Error State -->
    <UCard v-else-if="error">
      <div class="text-center py-12">
        <UIcon name="i-lucide-alert-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Terjadi Kesalahan
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Gagal memuat data blog. Silakan coba lagi.
        </p>
        <UButton @click="refresh" variant="outline">
          <UIcon name="i-lucide-refresh-cw" class="mr-2" />
          Coba Lagi
        </UButton>
      </div>
    </UCard>

    <!-- Empty State -->
    <UCard v-else-if="blogs.length === 0">
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
          <UButton @click="addBlog">
            <UIcon name="i-lucide-plus" class="mr-2" />
            Tambah Blog
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Data Table -->
    <UCard v-else>
      <UTable 
        :data="blogs" 
        :columns="columns" 
        :loading="pending"
        class="w-full"
      />
      
      <!-- Pagination -->
      <template #footer>
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

    <!-- Add Blog Slideover -->
    <USlideover v-model="showAddModal" side="right">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-plus-circle" class="w-5 h-5" />
            Tambah Blog Baru
          </h2>
          <UButton
            icon="i-lucide-x"
            color="gray"
            variant="ghost"
            size="sm"
            @click="showAddModal = false"
          />
        </div>
        <BlogForm
          @saved="handleBlogSaved"
          @cancel="showAddModal = false"
        />
      </div>
    </USlideover>

    <!-- Edit Blog Slideover -->
    <USlideover v-model="showEditModal" side="right">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-edit" class="w-5 h-5" />
            Edit Blog
          </h2>
          <UButton
            icon="i-lucide-x"
            color="gray"
            variant="ghost"
            size="sm"
            @click="showEditModal = false"
          />
        </div>
        <BlogForm
          v-if="selectedBlog"
          :blog="selectedBlog"
          @saved="handleBlogSaved"
          @cancel="showEditModal = false"
        />
      </div>
    </USlideover>

    <!-- Detail Blog Modal -->
    <UModal v-model="showDetailModal" :ui="{ width: 'w-full max-w-4xl' }">
      <UCard v-if="selectedBlog" :ui="{ header: { padding: 'px-4 py-4 sm:px-6' }, body: { padding: 'px-4 py-5 sm:p-6' } }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="w-5 h-5" />
              Detail Blog
            </h3>
            <UButton
              icon="i-lucide-x"
              color="gray"
              variant="ghost"
              size="sm"
              @click="showDetailModal = false"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Blog Info -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Informasi Blog</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Judul</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedBlog.title }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</label>
                <p class="mt-1 text-sm font-mono text-gray-900 dark:text-white">{{ selectedBlog.slug }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</label>
                <div class="mt-1">
                  <UBadge variant="subtle" color="blue">{{ selectedBlog.category }}</UBadge>
                </div>
              </div>
              <div class="md:col-span-2">
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Deskripsi</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedBlog.description || '-' }}</p>
              </div>
            </div>
          </div>

          <!-- Author Info -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Penulis</h4>
            <div class="flex items-center gap-3">
              <img 
                :src="selectedBlog.profiles?.avatar_url || 'https://placehold.co/48x48?text=?'"
                :alt="selectedBlog.profiles?.full_name"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ selectedBlog.profiles?.full_name || 'Unknown' }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Author</p>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="selectedBlog.tags && selectedBlog.tags.length > 0">
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Tags</h4>
            <div class="flex flex-wrap gap-2">
              <UBadge 
                v-for="tag in selectedBlog.tags" 
                :key="tag"
                variant="outline"
                color="primary"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>

          <!-- Content Preview -->
          <div v-if="selectedBlog.content">
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Preview Konten</h4>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ formatContent(selectedBlog.content, 500) }}
              </p>
            </div>
          </div>

          <!-- Meta Info -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-4">Informasi Meta</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Dibuat</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ new Date(selectedBlog.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Diperbarui</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ new Date(selectedBlog.updated_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) }}
                </p>
              </div>
              <div v-if="selectedBlog.deleted_at">
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Dihapus</label>
                <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ new Date(selectedBlog.deleted_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <UButton
              variant="outline"
              icon="i-lucide-external-link"
              @click="navigateTo(`/blogs/${selectedBlog.slug}`, { external: true })"
            >
              Lihat di Web
            </UButton>
            <UButton
              icon="i-lucide-edit"
              @click="() => { showDetailModal = false; editBlog(selectedBlog!) }"
            >
              Edit Blog
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>