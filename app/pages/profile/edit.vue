<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useNuxtApp, useToast } from '#imports'
import type { SupabaseClient } from '@supabase/supabase-js'

definePageMeta({
  middleware: 'guest'
})

const { user, isLoggedIn } = useAuth()
const supabase = useNuxtApp().$supabase as SupabaseClient
const toast = useToast()

// Redirect jika tidak login
onMounted(() => {
  if (!isLoggedIn.value) {
    navigateTo('/login')
  }
})

const profile = ref<{ full_name: string; avatar_url: string | null }>({
  full_name: '',
  avatar_url: null,
})
const loading = ref(false)
const uploadLoading = ref(false)
const avatarPreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

// Computed untuk cek apakah ada perubahan
const hasChanges = computed(() => {
  return selectedFile.value !== null || profile.value.full_name !== initialProfile.value.full_name
})

const initialProfile = ref({
  full_name: '',
  avatar_url: null as string | null
})

const fetchProfile = async () => {
  if (!user.value) return
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.value.id)
      .single()

    if (error) throw error

    if (data) {
      profile.value.full_name = data.full_name || ''
      profile.value.avatar_url = data.avatar_url || null
      
      // Simpan initial state
      initialProfile.value = {
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || null
      }

      if (data.avatar_url) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.avatar_url)

        avatarPreview.value = urlData.publicUrl
      }
    }
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    toast.add({ 
      title: 'Error', 
      description: error.message || 'Gagal memuat profil', 
      color: 'error' 
    })
  } finally {
    loading.value = false
  }
}

onMounted(fetchProfile)

const handleAvatarChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0]) return

  const file = files[0]
  
  // Validasi file
  if (!file.type.startsWith('image/')) {
    toast.add({ 
      title: 'File tidak valid', 
      description: 'Hanya file gambar yang diperbolehkan',
      color: 'error' 
    })
    return
  }
  
  // Validasi ukuran (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ 
      title: 'File terlalu besar', 
      description: 'Ukuran file maksimal 2MB',
      color: 'error' 
    })
    return
  }

  selectedFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const handleSave = async () => {
  if (!user.value) return
  
  // Validasi nama tidak boleh kosong
  if (!profile.value.full_name.trim()) {
    toast.add({ 
      title: 'Validasi Error', 
      description: 'Nama lengkap tidak boleh kosong',
      color: 'error' 
    })
    return
  }
  
  loading.value = true

  try {
    // Upload avatar jika ada file baru
    if (selectedFile.value) {
      uploadLoading.value = true
      const fileExt = selectedFile.value.name.split('.').pop()
      const fileName = `${user.value.id}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile.value, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Hapus avatar lama jika ada
      if (profile.value.avatar_url) {
        await supabase.storage
          .from('avatars')
          .remove([profile.value.avatar_url])
      }

      profile.value.avatar_url = fileName
      uploadLoading.value = false
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.value.full_name.trim(),
        avatar_url: profile.value.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.value.id)

    if (error) throw error

    // Update initial state setelah berhasil save
    initialProfile.value = {
      full_name: profile.value.full_name,
      avatar_url: profile.value.avatar_url
    }
    selectedFile.value = null

    toast.add({
      title: 'Berhasil',
      description: 'Profil berhasil diperbarui',
      color: 'success',
      icon: 'i-lucide-check'
    })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    toast.add({ 
      title: 'Gagal memperbarui profil', 
      description: error.message || 'Terjadi kesalahan',
      color: 'error' 
    })
  } finally {
    loading.value = false
    uploadLoading.value = false
  }
}

const handleReset = () => {
  profile.value.full_name = initialProfile.value.full_name
  selectedFile.value = null
  
  if (initialProfile.value.avatar_url) {
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(initialProfile.value.avatar_url)
    avatarPreview.value = urlData.publicUrl
  } else {
    avatarPreview.value = null
  }
}
</script>

<template>
  <div v-if="isLoggedIn">
    
    <!-- Profile Card -->
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        @click="navigateTo('/profile')"
          />
          <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-user-cog" class="w-6 h-6" />
          Pengaturan Profil
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola informasi profil Anda
        </p>
          </div>
        </div>
      </div>
      <UCard>
        <template #header>
          <div class="flex items-center justify-center gap-3">
            <UIcon name="i-lucide-user" class="w-5 h-5 text-primary" />
            <div class="text-center">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Informasi Profil
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Perbarui foto dan nama Anda
              </p>
            </div>
          </div>
        </template>

        <UForm @submit.prevent="handleSave" class="space-y-6">
          <!-- Avatar Section -->
          <div class="flex flex-col items-center gap-4 py-6">
            <div class="relative">
              <UAvatar
                :src="avatarPreview || undefined"
                :alt="profile.full_name || 'User Avatar'"
                size="3xl"
                class="w-32 h-32 ring-4 ring-gray-100 dark:ring-gray-800"
              />
              <div class="absolute bottom-0 right-0 bg-primary rounded-full p-2 shadow-lg">
                <UIcon name="i-lucide-camera" class="w-4 h-4 text-white" />
              </div>
            </div>

            <div class="w-full">
              <UFormField 
                label="Foto Profil" 
                help="Format: JPG, PNG, GIF. Maksimal 2MB"
              >
                <UInput
                  type="file"
                  accept="image/*"
                  @change="handleAvatarChange"
                  :disabled="loading || uploadLoading"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div v-if="uploadLoading" class="flex items-center gap-2 text-sm text-gray-500">
              <UIcon name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              <span>Mengunggah foto...</span>
            </div>
          </div>

          <UDivider />

          <!-- Personal Information -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <UIcon name="i-lucide-user" class="w-4 h-4" />
              Informasi Personal
            </h3>

            <UFormField 
              label="Nama Lengkap" 
              name="full_name" 
              required
              help="Nama yang akan ditampilkan di profil Anda"
            >
              <UInput 
                v-model="profile.full_name" 
                placeholder="Masukkan nama lengkap Anda" 
                :disabled="loading"
                icon="i-lucide-user"
                class="w-full"
              />
            </UFormField>

            <UFormField 
              label="Email" 
              name="email"
              help="Email tidak dapat diubah"
            >
              <UInput 
                :model-value="user?.email" 
                disabled
                icon="i-lucide-mail"
                class="w-full opacity-75"
              />
            </UFormField>
          </div>

          <UDivider />

          <!-- Action Buttons -->
          <div class="flex justify-center gap-3">
            <UButton
              type="button"
              variant="outline"
              @click="handleReset"
              :disabled="loading || !hasChanges"
            >
              <UIcon name="i-lucide-rotate-ccw" class="mr-2" />
              Reset
            </UButton>
            <UButton 
              type="submit" 
              :loading="loading"
              :disabled="!hasChanges"
              color="primary"
            >
              <UIcon name="i-lucide-save" class="mr-2" />
              Simpan Perubahan
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>

    <!-- Info Cards -->
    <div class="max-w-2xl mx-auto mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Security Info -->
        <UCard>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                Keamanan Akun
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Data Anda dilindungi dengan enkripsi end-to-end
              </p>
            </div>
          </div>
        </UCard>

        <!-- Privacy Info -->
        <UCard>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-lock" class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                Privasi Terjaga
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Informasi pribadi Anda tidak akan dibagikan
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>