<template>
  <AdminConfirmDialog
    v-if="open"
    :title="title"
    :description="description"
    confirm-text="Hapus"
    cancel-text="Batal"
    variant="destructive"
    @close="onClose"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  itemName?: string
}>()

const emit = defineEmits<{
  close: [confirmed: boolean]
}>()

const title = computed(() => `Hapus Data`)
const description = computed(
  () => `Apakah kamu yakin ingin menghapus ${props.itemName || 'item ini'}? Tindakan ini tidak bisa dibatalkan.`
)

const onClose = (confirmed: boolean) => {
  emit('close', confirmed)
}
</script>
