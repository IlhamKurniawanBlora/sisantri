<script setup lang="ts">
import { ref, h, resolveComponent, onMounted, reactive } from 'vue'
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

const toast = useToast()
const { copy } = useClipboard()

type Carousel = {
  id: string
  image_url: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const data = ref<Carousel[]>([])
const loading = ref(false)

// slideover states
const showSlideover = ref(false)
const mode = ref<'add' | 'edit'>('add')
const selectedRow = ref<Carousel | null>(null)

// form state for carousel
const formState = reactive<{ file: File | null; previewUrl: string | null }>({
  file: null,
  previewUrl: null
})

// fetch data carousel
async function fetchCarousel() {
  loading.value = true
  const { data: res, error } = await useFetch<Carousel[]>('/api/carousel')
  if (!error.value && res.value) {
    data.value = res.value
  }
  loading.value = false
}
onMounted(fetchCarousel)

// kolom tabel
const columns: TableColumn<Carousel>[] = [
  {
    accessorKey: 'image_url',
    header: 'Preview',
    cell: ({ row }) => {
      const url = row.getValue('image_url')
      return h('img', {
        src: url || '/logo.png',
        alt: 'Carousel Image',
        class: 'h-16 w-28 object-cover rounded-md border'
      })
    }
  },
  {
    accessorKey: 'image_url',
    header: 'Image URL',
    cell: ({ row }) => {
      const url = row.getValue('image_url')
      return h('span', { class: 'truncate max-w-[200px] block' }, String(url))
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) =>
      new Date(row.getValue('created_at')).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated',
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
      const label = deleted ? 'Deleted' : 'Active'
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

// row actions
function getRowItems(row: Row<Carousel>) {
  return [
    { type: 'label', label: 'Actions' },
    {
      label: 'Copy ID',
      icon: 'i-lucide-copy',
      onSelect() {
        copy(row.original.id)
        toast.add({ title: 'ID copied!', color: 'success', icon: 'i-lucide-check' })
      }
    },
    { type: 'separator' },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() {
        mode.value = 'edit'
        selectedRow.value = row.original
        formState.previewUrl = row.original.image_url // tampilkan preview lama
        showSlideover.value = true
      }
    },
    {
      label: 'Delete',
      icon: 'i-lucide-trash',
      class: 'text-red-500',
      onSelect: async () => {
        await $fetch(`/api/carousel/${row.original.id}`, { method: 'DELETE' })
        toast.add({ title: 'Deleted!', color: 'error', icon: 'i-lucide-trash' })
        fetchCarousel()
      }
    }
  ]
}

async function handleAdd() {
  if (!formState.file) {
    toast.add({ title: 'Pilih file terlebih dahulu', color: 'error' })
    return
  }
  const formData = new FormData()
  formData.append('file', formState.file)
  try {
    await $fetch('/api/carousel', { method: 'POST', body: formData })
    toast.add({ title: 'Carousel ditambahkan', color: 'success' })
    showSlideover.value = false
    formState.file = null
    formState.previewUrl = null
    await fetchCarousel()
  } catch (e: any) {
    toast.add({ title: 'Gagal menambah carousel', description: e?.data?.message || e.message, color: 'error' })
  }
}

async function handleEdit() {
  if (!formState.file || !selectedRow.value) {
    toast.add({ title: 'Pilih file terlebih dahulu', color: 'error' })
    return
  }
  const formData = new FormData()
  formData.append('file', formState.file)
  try {
    await $fetch(`/api/carousel/${selectedRow.value.id}`, { method: 'PUT', body: formData })
    toast.add({ title: 'Carousel diperbarui', color: 'success' })
    showSlideover.value = false
    formState.file = null
    formState.previewUrl = null
    await fetchCarousel()
  } catch (e: any) {
    toast.add({ title: 'Gagal update carousel', description: e?.data?.message || e.message, color: 'error' })
  }
}

// handle file change + preview
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formState.file = target.files[0]
    formState.previewUrl = URL.createObjectURL(target.files[0])
  }
}
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Carousel</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola gambar carousel
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        size="sm"
        @click="() => { mode = 'add'; selectedRow = null; formState.previewUrl = null; showSlideover = true }"
      >
        Tambah Gambar
      </UButton>
    </div>

    <UTable :data="data" :columns="columns" :loading="loading" class="flex-1" />

    <USlideover v-model:open="showSlideover" :title="mode === 'add' ? 'Tambah Carousel' : 'Edit Carousel'">
      <template #body>
        <UForm @submit.prevent="mode === 'add' ? handleAdd() : handleEdit()">
          <UFormField label="Upload Gambar" name="file">
            <UInput type="file" accept="image/*" @change="handleFileChange" />
          </UFormField>
          <div v-if="formState.previewUrl" class="mt-4">
            <p class="text-sm mb-2">Preview:</p>
            <img :src="formState.previewUrl" class="max-h-48 rounded-md border object-contain" />
          </div>
        </UForm>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showSlideover = false">Batal</UButton>
          <UButton type="submit" color="primary" @click="mode === 'add' ? handleAdd() : handleEdit()" :loading="loading">
            {{ mode === 'add' ? 'Simpan' : 'Update' }}
          </UButton>
        </div>
      </template>
    </USlideover>
  </div>
</template>
