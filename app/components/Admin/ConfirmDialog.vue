<template>
  <UModal v-model:open="isOpen" class="max-w-md">
    <template #header>
      <h3 class="font-semibold">{{ title }}</h3>
    </template>

    <template #body>
      <p>{{ description }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" @click="handleCancel">
          {{ cancelText || 'Batal' }}
        </UButton>
        <UButton 
          :color="variant === 'destructive' ? 'error' : 'primary'"
          @click="handleConfirm"
        >
          {{ confirmText || 'Konfirmasi' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
}>()

// modal dikontrol secara internal
const isOpen = ref(true)

const emit = defineEmits<{
  close: [confirmed: boolean]
}>()

const handleConfirm = () => {
  isOpen.value = false
  emit('close', true)
}

const handleCancel = () => {
  isOpen.value = false
  emit('close', false)
}
</script>
