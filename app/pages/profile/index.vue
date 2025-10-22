<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useNuxtApp, useToast } from '#imports'
import type { SupabaseClient } from '@supabase/supabase-js'

// 🔹 Define interfaces
interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  phone?: string
  classes_id?: string | null
  santri_id?: string | null
  created_at?: string
  updated_at?: string
}

interface Santri {
  id: string
  nis?: string
  full_name?: string
  address?: string
  gender?: 'male' | 'female'
  image_url?: string
  accepted_at?: string
  created_at?: string
  updated_at?: string
  birth_place_date?: string
  phone_number?: string
  nik?: string
  nisn?: string
  no_kk?: string
  no_kip?: string
  no_kks?: string
  no_pkh?: string
  rt_rw?: string
  kecamatan?: string
  kabupaten?: string
  provinsi?: string
  kode_pos?: string
  pendidikan_sd?: string
  pendidikan_smp?: string
  pendidikan_sma?: string
  pendidikan_non_formal?: string
  hafal_quran?: string
  classes_id?: string | null
}

interface AuthUser {
  id: string
  email?: string
  created_at?: string
  last_sign_in_at?: string
}

interface ClassData {
  id: string
  name: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

interface Schedule {
  id: string
  name: string
  description?: string
  start_at: string
  end_at: string
  classes_id: string
  created_at?: string
}

// 🔹 Ambil dari useAuth
const { user, profile, isLoggedIn } = useAuth()
const supabase = useNuxtApp().$supabase as SupabaseClient
const toast = useToast()

// 🔹 Redirect ke login jika belum login
if (!isLoggedIn.value) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Please login to access profile'
  })
}

// 🔹 Local states
const loading = ref(false)
const avatarPreview = ref<string | null>(null)

// 🔹 Santri state
const santri = ref<Santri | null>(null)

// 🔹 Class and Schedule state
const classData = ref<ClassData | null>(null)
const schedules = ref<Schedule[]>([])
const loadingClass = ref(false)

// 🔹 Format date function
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 🔹 Format date-time function
const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 🔹 Format time function
const formatTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 🔹 Fetch class data jika profile memiliki classes_id
const fetchClassData = async (classesId: string) => {
  try {
    loadingClass.value = true
    
    // Fetch class info
    const { data: classInfo, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classesId)
      .single()

    if (classError) throw classError
    classData.value = classInfo

    // Fetch schedules untuk kelas ini
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('schedules')
      .select('*')
      .eq('classes_id', classesId)
      .is('deleted_at', null)
      .order('start_at', { ascending: true })

    if (schedulesError) throw schedulesError
    schedules.value = schedulesData || []

  } catch (err: any) {
    console.error('Error loading class data:', err)
    toast.add({ 
      title: 'Error', 
      description: err.message || 'Gagal memuat data kelas', 
      color: 'error' 
    })
  } finally {
    loadingClass.value = false
  }
}

// 🔹 Load data saat mounted
onMounted(async () => {
  try {
    loading.value = true
    
    if (!user.value) return

    // Fetch profile dengan santri_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, santri_id')
      .eq('id', user.value.id)
      .single()

    if (profileError) throw profileError

    if (profileData) {
      if (profileData.avatar_url) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(profileData.avatar_url)
        avatarPreview.value = urlData.publicUrl
      }

      // Fetch santri data jika santri_id ada di profile
      if (profileData.santri_id) {
        const { data: santriData, error: santriError } = await supabase
          .from('santris')
          .select('*')
          .eq('id', profileData.santri_id)
          .single()
        
        if (santriData) {
          santri.value = santriData
          
          // Fetch class data jika classes_id ada di santri
          if (santriData.classes_id) {
            await fetchClassData(santriData.classes_id)
          }
        }
      }
    }

  } catch (err: any) {
    console.error('Error loading profile:', err)
    toast.add({ 
      title: 'Error', 
      description: err.message || 'Gagal memuat data profil', 
      color: 'error' 
    })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <UIcon name="i-lucide-user" class="w-6 h-6" />
        Profil Saya
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Kelola informasi profil dan lihat data santri Anda
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-user-circle" class="w-5 h-5 text-primary" />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Informasi Profil
                </h2>
              </div>
              <UButton 
                to="/profile/edit"
                variant="outline" 
                size="sm"
                icon="i-lucide-edit"
              >
                Edit
              </UButton>
            </div>
          </template>

          <div class="space-y-6">
            <!-- Avatar & Name -->
            <div class="flex items-center gap-4">
              <UAvatar
                :src="avatarPreview || undefined"
                :alt="profile?.full_name || 'User Avatar'"
                size="lg"
                class="ring-4 ring-gray-100 dark:ring-gray-800"
              />
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ profile?.full_name || 'Belum ada nama' }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ user?.email }}
                </p>
              </div>
            </div>

            <UDivider />

            <!-- Profile Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ profile?.full_name || '-' }}</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ user?.email || '-' }}</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Telepon</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ profile?.phone || '-' }}</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Bergabung Sejak</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ formatDate(user?.created_at) }}</p>
              </div>
            </div>
          </div>
        </UCard>
        <UCard class="mt-6">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-book" class="w-5 h-5 text-primary" />
              <h2 class="text-lg font-semibold">
                Informasi Kelas
              </h2>
            </div>
          </template>

          <div v-if="loadingClass" class="flex justify-center items-center py-8">
            <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-primary" />
          </div>

          <!-- Classes ID Not Set -->
          <div v-else-if="!classData" class="space-y-4">
            <UAlert
              color="warning"
              icon="i-lucide-alert-circle"
              variant="soft"
            >
              <template #title>
                Kelas Belum Ditentukan
              </template>
              <template #description>
                Silahkan hubungi pengurus Pondok Pesantren Dawam untuk menentukan kelas Anda.
              </template>
            </UAlert>

            <div class="flex gap-2">
              <div class="flex-1">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Status</p>
                <UBadge color="warning" variant="subtle" class="mt-2">
                  <UIcon name="i-lucide-alert-circle" class="w-3 h-3 mr-1" />
                  Belum Ditentukan
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Classes Info Available -->
          <div v-else class="space-y-4">
            <!-- Class Header -->
            <div class="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <UAvatar
                v-if="classData.image_url"
                :src="classData.image_url"
                :alt="classData.name"
                size="md"
                class="flex-shrink-0"
              />
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ classData.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID Kelas: <span class="font-mono">{{ classData.id }}</span>
                </p>
              </div>
            </div>

            <!-- Class Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Nama Kelas</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ classData.name }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Dibuat Tanggal</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ formatDate(classData.created_at) }}</p>
              </div>
            </div>

            <!-- Schedules Section -->
            <UDivider class="my-4" />
            
            <div>
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="w-4 h-4" />
                Jadwal Kelas ({{ schedules.length }})
              </h4>

              <div v-if="schedules.length > 0" class="space-y-3">
                <div
                  v-for="schedule in schedules"
                  :key="schedule.id"
                  class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="font-medium text-gray-900 dark:text-white">{{ schedule.name }}</p>
                      <p v-if="schedule.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {{ schedule.description }}
                      </p>
                      <div class="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div class="flex items-center gap-1">
                          <UIcon name="i-lucide-play" class="w-3 h-3" />
                          {{ formatTime(schedule.start_at) }}
                        </div>
                        <div class="flex items-center gap-1">
                          <UIcon name="i-lucide-square" class="w-3 h-3" />
                          {{ formatTime(schedule.end_at) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
                <UIcon name="i-lucide-inbox" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">Belum ada jadwal untuk kelas ini</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Santri Information -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-book-open" class="w-5 h-5 text-primary" />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Data Santri
                </h2>
              </div>
              <UButton 
                v-if="santri"
                :to="`/profile/edit-santri/${santri.id}`"
                variant="outline" 
                size="sm"
                icon="i-lucide-edit"
              >
                Edit
              </UButton>
            </div>
          </template>

          <div v-if="santri" class="space-y-4">
            <!-- Santri Photo -->
            <div class="flex justify-center">
              <UAvatar
                :src="santri.image_url || undefined"
                :alt="santri.full_name || 'Santri Avatar'"
                size="xl"
                class="ring-4 ring-gray-100 dark:ring-gray-800"
              />
            </div>

            <!-- Santri Details -->
            <div class="space-y-3">
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">NIS</p>
                <p class="text-gray-900 dark:text-white font-mono mt-1">{{ santri.nis || '-' }}</p>
              </div>
              
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Nama</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ santri.full_name || '-' }}</p>
              </div>
              
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Jenis Kelamin</p>
                <p class="text-gray-900 dark:text-white capitalize mt-1">
                  {{ santri.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                </p>
              </div>

              <div v-if="santri.phone_number">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">No. Telepon</p>
                <p class="text-gray-900 dark:text-white mt-1">{{ santri.phone_number }}</p>
              </div>
              
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Alamat</p>
                <p class="text-gray-900 dark:text-white text-sm mt-1">{{ santri.address || '-' }}</p>
              </div>

              <div v-if="santri.kabupaten">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Kabupaten/Kota</p>
                <p class="text-gray-900 dark:text-white text-sm mt-1">{{ santri.kabupaten }}</p>
              </div>

              <div v-if="santri.hafal_quran">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Hafal Quran</p>
                <p class="text-gray-900 dark:text-white text-sm mt-1">{{ santri.hafal_quran }}</p>
              </div>
              
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Tanggal Pendaftaran</p>
                <p class="text-gray-900 dark:text-white text-sm mt-1">{{ formatDate(santri.created_at) }}</p>
              </div>
              
              <UDivider v-if="santri.accepted_at" />

              <div v-if="santri.accepted_at">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Diterima Tanggal</p>
                <p class="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                  {{ formatDate(santri.accepted_at) }}
                </p>
              </div>
            </div>

            <!-- Status Badge -->
            <UDivider />
            <UBadge 
              :color="santri.accepted_at ? 'success' : 'warning'"
              variant="subtle"
              class="w-full text-center justify-center"
            >
              <UIcon 
              :name="santri.accepted_at ? 'i-lucide-check-circle' : 'i-lucide-clock'" 
              class="w-4 h-4 mr-1" 
              />
              {{ santri.accepted_at ? 'Diterima' : 'Menunggu Review' }}
            </UBadge>

            <!-- Status Information -->
            <UAlert
              :color="santri.accepted_at ? 'success' : 'warning'"
                :icon="santri.accepted_at ? 'i-lucide-check-circle' : 'i-lucide-info'"
              variant="soft"
              class="mt-4"
            >
              <template #title>
              {{ santri.accepted_at ? 'Selamat!' : 'Konfirmasi Data' }}
              </template>
              <template #description>
              <div class="space-y-2 text-sm">
                <p v-if="santri.accepted_at">
                Anda adalah santri dari Pondok Pesantren Dawam.
                </p>
                <p v-else>
                Silahkan datang ke pondok pesantren dan konfirmasi data Anda.
                </p>
                
                <UDivider class="my-2" />
                
                <div class="space-y-1">
                <div class="flex items-start gap-2">
                  <UIcon name="i-lucide-map-pin" class="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p class="text-xs">
                  Malangan UH VII/512 A, RT 039 RW 013<br>
                  Kel. Giwangan, Kec. Umbulharjo<br>
                  Kota Yogyakarta. 55163
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-phone" class="w-4 h-4 flex-shrink-0" />
                  <p class="text-xs">+62 856-4063-3195</p>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-mail" class="w-4 h-4 flex-shrink-0" />
                  <p class="text-xs">info@SiDawam.id</p>
                </div>
                </div>
              </div>
              </template>
            </UAlert>
          </div>

          <!-- No Santri Data -->
          <div v-else class="text-center py-8">
            <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada data santri</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Anda belum mendaftar sebagai santri.
            </p>
            <UButton
              to="/register-santri"
              color="primary"
              icon="i-lucide-plus"
              block
            >
              Daftar Sebagai Santri
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-zap" class="w-5 h-5 text-primary" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Aksi Cepat</h3>
          </div>
        </template>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UButton
            to="/profile/edit"
            color="primary"
            variant="soft"
            icon="i-lucide-edit"
            block
          >
            Edit Profil
          </UButton>
            <UButton
            v-if="!santri"
            to="/register-santri"
            color="success"
            variant="soft"
            icon="i-lucide-user-plus"
            block
            >
            Daftar Santri
            </UButton>
            <UButton
            v-else
            :to="`/profile/edit-santri/${santri.id}`"
            color="primary"
            variant="soft"
            icon="i-lucide-edit"
            block
            >
            Edit Data Santri
            </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>