<script setup lang="ts">
const props = defineProps<{
  title?: string
  icon?: string
  santri?: any
  onSaved?: (isEdit: boolean) => void
  onCancel?: () => void
}>()

const isOpen = ref(true)

const handleCancel = () => {
  isOpen.value = false
  props.onCancel?.()
}

const emit = defineEmits<{
  close: [value?: any]
}>()

watch(isOpen, (newValue) => {
  if (!newValue) {
    emit('close')
  }
})
</script>

<template>
  <USlideover v-model="isOpen">
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon :name="icon" class="w-5 h-5" />
          {{ title }}
        </h2>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="handleCancel"
        />
      </div>
      
        testt      
    </div>
  </USlideover>
</template>
