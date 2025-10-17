<script setup lang="ts">
import { ref, h, resolveComponent, onMounted, reactive, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const USlideover = resolveComponent('USlideover')
const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')
const UInput = resolveComponent('UInput')
const UCard = resolveComponent('UCard')
const UTable = resolveComponent('UTable')
const UIcon = resolveComponent('UIcon')

const toast = useToast()
const { copy } = useClipboard()

type Carousel = {
  id: string
  image_url: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type CarouselResponse = {
  data: Carousel[]
  pagination: {
    total: number
    page: number
    limit: number
    total_pages: number
  }
}

// State management
const data = ref<Carousel[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const total = ref(0)

// Slideover states
const showSlideover = ref(false)
const mode = ref<'add' | 'edit'>('add')
const selectedRow = ref<Carousel | null>(null)

// Form state
const formState = reactive<{ file: File | null; previewUrl: string | null }>({
  file: null,
  previewUrl: null
})

// Confirm dialog state
const showConfirmDialog = ref(false)
const confirmOptions = ref<{
  title: string
  description: string
  variant?: 'destructive' | 'default'
  action?: () => Promise<void>
}>()

// Open confirm dialog
function openConfirmDialog(opts: {
  title: string
  description: string
  variant?: 'destructive' | 'default'
  action: () => Promise<void>
}) {
  confirmOptions.value = opts
  showConfirmDialog.value = true
}

// Fetch carousel data
async function fetchCarousel() {
  loading.value = true
  try {
    const response = await $fetch<CarouselResponse>('/api/carousel')
    if (response?.data) {
      data.value = response.data
      total.value = response.pagination?.total || 0
    }
  } catch (error) {
    console.error('Gagal memuat data carousel:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memuat data carousel',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Handle file change with preview
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validasi file
    if (!file.type.startsWith('image/')) {
      toast.add({ 
        title: 'File tidak valid', 
        description: 'Hanya file gambar yang diperbolehkan',
        color: 'error' 
      })
      return
    }
    
    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ 
        title: 'File terlalu besar', 
        description: 'Ukuran file maksimal 5MB',
        color: 'error' 
      })
      return
    }
    
    formState.file = file
    formState.previewUrl = URL.createObjectURL(file)
  }
}

// Handle add carousel
async function handleAdd() {
  if (!formState.file) {
    toast.add({ 
      title: 'File diperlukan', 
      description: 'Pilih gambar terlebih dahulu',
      color: 'error' 
    })
    return
  }
  
  submitLoading.value = true
  const formData = new FormData()
  formData.append('file', formState.file)
  
  try {
    await $fetch('/api/carousel', { method: 'POST', body: formData })
    toast.add({ 
      title: 'Berhasil!', 
      description: 'Gambar carousel berhasil ditambahkan',
      color: 'success',
      icon: 'i-lucide-check'
    })
    closeSlideover()
    await fetchCarousel()
  } catch (e: any) {
    console.error('Gagal menambah carousel:', e)
    toast.add({ 
      title: 'Gagal menambah carousel', 
      description: e?.data?.message || e.message || 'Terjadi kesalahan',
      color: 'error' 
    })
  } finally {
    submitLoading.value = false
  }
}

// Handle edit carousel
async function handleEdit() {
  if (!formState.file || !selectedRow.value) {
    toast.add({ 
      title: 'File diperlukan', 
      description: 'Pilih gambar baru terlebih dahulu',
      color: 'error' 
    })
    return
  }
  
  submitLoading.value = true
  const formData = new FormData()
  formData.append('file', formState.file)
  
  try {
    await $fetch(`/api/carousel/${selectedRow.value.id}`, { 
      method: 'PUT', 
      body: formData 
    })
    toast.add({ 
      title: 'Berhasil!', 
      description: 'Gambar carousel berhasil diperbarui',
      color: 'success',
      icon: 'i-lucide-check'
    })
    closeSlideover()
    await fetchCarousel()
  } catch (e: any) {
    console.error('Gagal update carousel:', e)
    toast.add({ 
      title: 'Gagal memperbarui carousel', 
      description: e?.data?.message || e.message || 'Terjadi kesalahan',
      color: 'error' 
    })
  } finally {
    submitLoading.value = false
  }
}

// Delete carousel with confirmation
function requestDeleteCarousel(carousel: Carousel) {
  openConfirmDialog({
    title: 'Hapus Gambar Carousel',
    description: 'Apakah Anda yakin ingin menghapus gambar ini?',
    variant: 'destructive',
    action: async () => {
      try {
        await $fetch(`/api/carousel/${carousel.id}`, { method: 'DELETE' })
        toast.add({ 
          title: 'Berhasil!', 
          description: 'Gambar carousel berhasil dihapus',
          color: 'success',
          icon: 'i-lucide-trash'
        })
        await fetchCarousel()
      } catch (error) {
        console.error('Gagal menghapus carousel:', error)
        toast.add({ 
          title: 'Gagal menghapus carousel',
          description: 'Terjadi kesalahan saat menghapus',
          color: 'error' 
        })
      }
    }
  })
}

// Copy ID to clipboard
function copyCarouselId(id: string) {
  copy(id)
  toast.add({ 
    title: 'ID disalin!', 
    color: 'success', 
    icon: 'i-lucide-check' 
  })
}

// Open slideover for add
function openAddSlideover() {
  mode.value = 'add'
  selectedRow.value = null
  formState.file = null
  formState.previewUrl = null
  showSlideover.value = true
}

// Open slideover for edit
function openEditSlideover(carousel: Carousel) {
  mode.value = 'edit'
  selectedRow.value = carousel
  formState.file = null
  formState.previewUrl = carousel.image_url
  showSlideover.value = true
}

// Close slideover and reset form
function closeSlideover() {
  showSlideover.value = false
  formState.file = null
  formState.previewUrl = null
  selectedRow.value = null
}

// Table columns
const columns: TableColumn<Carousel>[] = [
  {
    accessorKey: 'image_url',
    header: 'Preview',
    cell: ({ row }) => {
      const url = row.getValue('image_url')
      return h('img', {
        src: url || '/logo.png',
        alt: 'Carousel Image',
        class: 'h-16 w-28 object-cover rounded-md border shadow-sm'
      })
    }
  },
  {
    accessorKey: 'image_url',
    header: 'Image URL',
    cell: ({ row }) => {
      const url = row.getValue('image_url')
      return h('div', { class: 'flex items-center gap-2' }, [
        h('span', { 
          class: 'truncate max-w-[300px] block text-sm',
          title: String(url)
        }, String(url)),
        h(UButton, {
          icon: 'i-lucide-copy',
          size: 'xs',
          color: 'gray',
          variant: 'ghost',
          onClick: () => {
            copy(String(url))
            toast.add({ 
              title: 'URL disalin!', 
              color: 'success',
              icon: 'i-lucide-check'
            })
          }
        })
      ])
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Dibuat',
    cell: ({ row }) =>
      new Date(row.getValue('created_at')).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
  },
  {
    accessorKey: 'updated_at',
    header: 'Diperbarui',
    cell: ({ row }) =>
      new Date(row.getValue('updated_at')).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
  },
  {
    accessorKey: 'deleted_at',
    header: 'Status',
    cell: ({ row }) => {
      const deleted = row.getValue('deleted_at')
      const color = deleted ? 'error' : 'success'
      const label = deleted ? 'Tidak Aktif' : 'Aktif'
      return h(UBadge, { variant: 'subtle', color }, () => label)
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
function getRowItems(row: Row<Carousel>) {
  const carousel = row.original
  
  return [
    { type: 'label', label: 'Actions' },
    {
      label: 'Copy ID',
      icon: 'i-lucide-copy',
      onSelect: () => copyCarouselId(carousel.id)
    },
    {
      label: 'Copy URL',
      icon: 'i-lucide-link',
      onSelect: () => {
        copy(carousel.image_url)
        toast.add({ 
          title: 'URL disalin!', 
          color: 'success',
          icon: 'i-lucide-check'
        })
      }
    },
    { type: 'separator' },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect: () => openEditSlideover(carousel)
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash',
      onSelect: () => requestDeleteCarousel(carousel)
    }
  ]
}

// Submit handler
function handleSubmit() {
  if (mode.value === 'add') {
    handleAdd()
  } else {
    handleEdit()
  }
}

// Lifecycle
onMounted(() => {
  fetchCarousel()
})

// Cleanup preview URL on unmount
watch(() => formState.previewUrl, (newUrl, oldUrl) => {
  if (oldUrl && oldUrl !== selectedRow.value?.image_url) {
    URL.revokeObjectURL(oldUrl)
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-images" class="w-6 h-6" />
          Kelola Carousel
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola gambar carousel halaman utama
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="sm"
        @click="openAddSlideover"
      >
        Tambah Gambar
      </UButton>
    </div>

    <!-- Empty State -->
    <UCard v-if="data.length === 0 && !loading">
      <div class="text-center py-12">
        <UIcon name="i-lucide-images" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Belum Ada Gambar Carousel
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Mulai dengan menambahkan gambar carousel pertama untuk ditampilkan di halaman utama.
        </p>
        <UButton @click="openAddSlideover">
          <UIcon name="i-lucide-plus" class="mr-2" />
          Tambah Gambar
        </UButton>
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
    </UCard>

    <!-- Slideover Form -->
    <USlideover 
      v-model:open="showSlideover" 
      :title="mode === 'add' ? 'Tambah Gambar Carousel' : 'Edit Gambar Carousel'"
    >
      <template #body>
        <UForm @submit.prevent="handleSubmit">
          <UFormField 
            label="Upload Gambar" 
            name="file"
            help="Format: JPG, PNG, GIF. Maksimal 5MB. Resolusi disarankan: 1920x1080px"
          >
            <UInput 
              type="file" 
              accept="image/*" 
              @change="handleFileChange" 
              class="w-full"
            />
          </UFormField>
          
          <div v-if="formState.previewUrl" class="mt-6">
            <p class="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Preview:</p>
            <div class="relative rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
              <img 
                :src="formState.previewUrl" 
                class="w-full h-auto object-contain max-h-64" 
                alt="Preview"
              />
            </div>
          </div>
        </UForm>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton 
            variant="ghost" 
            @click="closeSlideover"
            :disabled="submitLoading"
          >
            Batal
          </UButton>
          <UButton 
            color="primary" 
            @click="handleSubmit"
            :loading="submitLoading"
            :disabled="!formState.file"
          >
            {{ mode === 'add' ? 'Simpan' : 'Update' }}
          </UButton>
        </div>
      </template>
    </USlideover>

    <!-- Confirm Dialog -->
    <AdminConfirmDialog
      v-if="showConfirmDialog"
      :title="confirmOptions?.title"
      :description="confirmOptions?.description"
      :variant="confirmOptions?.variant"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      @close="(confirmed) => {
        showConfirmDialog = false
        if (confirmed && confirmOptions?.action) confirmOptions.action()
      }"
    />
  </div>
</template>