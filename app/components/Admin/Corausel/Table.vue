<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UAvatar = resolveComponent('UAvatar')

const toast = useToast()
const { copy } = useClipboard()

type Carousel = {
  id: string
  image_url: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const props = defineProps<{ refresh: () => void; onEdit: (item: Carousel) => void }>()

const { data, refresh } = await useFetch<Carousel[]>('/api/carousel')

const columns: TableColumn<Carousel>[] = [
  {
    accessorKey: 'image_url',
    header: 'Image',
    cell: ({ row }) =>
      h(UAvatar, {
        src: row.getValue('image_url'),
        alt: 'Carousel Image',
        size: 'md',
        class: 'rounded-md'
      })
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
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: { align: 'end' },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              'aria-label': 'Actions dropdown'
            })
        )
      )
  }
]

function getRowItems(row: Row<Carousel>) {
  return [
    {
      label: 'Copy ID',
      onSelect() {
        copy(row.original.id)
        toast.add({ title: 'ID copied!', color: 'success', icon: 'i-lucide-circle-check' })
      }
    },
    { type: 'separator' },
    {
      label: 'Edit',
      onSelect() {
        props.onEdit(row.original)
      }
    },
    {
      label: 'Delete',
      onSelect: async () => {
        await $fetch(`/api/carousel/${row.original.id}`, { method: 'DELETE' })
        toast.add({ title: 'Deleted successfully', color: 'success' })
        props.refresh()
      }
    }
  ]
}
</script>

<template>
  <UTable :data="data || []" :columns="columns" class="flex-1" />
</template>
