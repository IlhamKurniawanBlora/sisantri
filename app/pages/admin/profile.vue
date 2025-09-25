<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useNuxtApp, useToast } from '#imports'
import type { SupabaseClient } from '@supabase/supabase-js'

definePageMeta({
  layout : 'admin'
})

const { user } = useAuth()
const supabase = useNuxtApp().$supabase as SupabaseClient
const toast = useToast()

const profile = ref<{ full_name: string; avatar_url: string | null }>({ full_name: '', avatar_url: null })
const loading = ref(false)
const avatarPreview = ref<string | null>(null)

const fetchProfile = async () => {
  if (!user.value) return
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name,avatar_url')
    .eq('id', user.value.id)
    .single()
  if (!error && data) {
    profile.value.full_name = data.full_name || ''
    profile.value.avatar_url = data.avatar_url || null
    if (data.avatar_url) {
      const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(data.avatar_url)
      avatarPreview.value = urlData.publicUrl
    }
  }
}

onMounted(fetchProfile)

const handleAvatarChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return
  const file = files[0]
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.value.id}_${Date.now()}.${fileExt}`
  loading.value = true
  const { error: uploadError } = await supabase.storage.from('avatar').upload(fileName, file, {
    cacheControl: '3600',
    upsert: true
  })
  if (uploadError) {
    toast.add({ title: 'Upload Error', description: uploadError.message, color: 'error' })
    loading.value = false
    return
  }
  profile.value.avatar_url = fileName
  const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(fileName)
  avatarPreview.value = urlData.publicUrl
  loading.value = false
}

const handleSave = async () => {
  if (!user.value) return
  loading.value = true
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: profile.value.full_name, avatar_url: profile.value.avatar_url })
    .eq('id', user.value.id)
  loading.value = false
  if (error) {
    toast.add({ title: 'Update Error', description: error.message, color: 'error' })
  } else {
    toast.add({ title: 'Success', description: 'Profile updated successfully', color: 'success' })
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-6 mt-8">
    <h2 class="text-2xl font-bold mb-6">Edit Profile</h2>
    <UForm @submit="handleSave" class="space-y-6">
      <UFormField label="Avatar" class="w-full">
        <template #default>
          <div class="flex flex-col items-center gap-4">
            <UAvatar :src="avatarPreview || '/api/placeholder/80/80'" size="lg" />
            <UInput type="file" accept="image/*" @change="handleAvatarChange" :disabled="loading" />
          </div>
        </template>
      </UFormField>
      <UFormField label="Full Name" name="full_name" required>
        <UInput v-model="profile.full_name" placeholder="Enter your full name" :disabled="loading" />
      </UFormField>
      <div class="flex justify-end">
        <UButton type="submit" :loading="loading" color="primary">Save</UButton>
      </div>
    </UForm>
  </div>
</template>
