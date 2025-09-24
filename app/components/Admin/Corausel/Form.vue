<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; editItem?: any }>()
const emit = defineEmits(['update:modelValue', 'refresh'])

const file = ref<File | null>(null)
const loading = ref(false)

async function handleSubmit() {
  if (!file.value) return

  loading.value = true
  const formData = new FormData()
  formData.append('file', file.value)

  try {
    if (props.editItem) {
      await $fetch(`/api/carousel/${props.editItem.id}`, {
        method: 'PUT',
        body: formData
      })
    } else {
      await $fetch('/api/carousel', {
        method: 'POST',
        body: formData
      })
    }

    emit('refresh')
    emit('update:modelValue', false)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model="props.modelValue">
    <UCard>
      <template #header>
        <h3 class="font-semibold">
          {{ props.editItem ? 'Edit Carousel' : 'Tambah Carousel' }}
        </h3>
      </template>

      <UForm @submit.prevent="handleSubmit">
        <UFormField label="Upload Gambar">
          <input
            type="file"
            accept="image/*"
            @change="e => file = e.target.files?.[0] || null"
          />
        </UFormField>

        <div class="mt-4 flex justify-end gap-2">
          <UButton variant="ghost" @click="emit('update:modelValue', false)">
            Batal
          </UButton>
          <UButton type="submit" :loading="loading">
            Simpan
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>
