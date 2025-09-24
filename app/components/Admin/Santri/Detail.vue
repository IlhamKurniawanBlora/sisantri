<template>
  <UModal v-model="isOpen" :ui="{ width: 'w-full max-w-2xl' }">
    <!-- Detail content here -->
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  icon?: string
  santri: any
  calculateAge: (date: string) => number
  onClose?: () => void
}>()

const isOpen = ref(true)
const emit = defineEmits<{
  close: [value?: any]
}>()

watch(isOpen, (newValue) => {
  if (!newValue) {
    emit('close')
  }
})
</script>