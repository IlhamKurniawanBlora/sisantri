<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { onMounted } from 'vue'

// 🔹 Define interfaces
interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  phone?: string
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
  user_id?: string
}

interface AuthUser {
  id: string
  email?: string
  created_at?: string
  last_sign_in_at?: string
}

// 🔹 Ambil dari useAuth
const { user, profile, isLoggedIn, initSession, fetchProfile } = useAuth()

// 🔹 Redirect ke login jika belum login
if (!isLoggedIn.value) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Please login to access profile'
  })
}

// 🔹 Local states
const loading = ref(true)
const errorMessage = ref<string | null>(null)

// 🔹 Santri state (kalau nanti ingin fetch data santri)
const santri = ref<Santri | null>(null)

// 🔹 Load data saat mounted
onMounted(async () => {
  try {
    await initSession()
    if (!profile.value && user.value) {
      await fetchProfile()
    }

    // Contoh: kalau nanti mau fetch santri berdasar user_id
    // const { data, error } = await $fetch(`/api/santri?user_id=${user.value.id}`)
    // if (data) santri.value = data

  } catch (err: any) {
    console.error('Error loading profile:', err)
    errorMessage.value = err.message || 'Gagal memuat data profil.'
  } finally {
    loading.value = false
  }
})

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
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p class="text-gray-600">Manage your personal information and view your santri data</p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-red-800">Failed to load profile data. Please try again.</p>
      </div>
      <button 
        @click="refresh()" 
        class="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profile Information -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Profile Information</h2>
            <button class="text-green-600 hover:text-green-800 font-medium">
              Edit Profile
            </button>
          </div>

          <div class="space-y-6">
            <!-- Avatar -->
            <div class="flex items-center space-x-4">
              <div class="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="profile?.avatar_url" 
                  :src="profile.avatar_url" 
                  :alt="profile.full_name || 'User Avatar'"
                  class="h-full w-full object-cover"
                />
                <svg v-else class="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ profile?.full_name || 'No name set' }}
                </h3>
                <p class="text-gray-500">{{ profile?.email || authUser?.email }}</p>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p class="text-gray-900">{{ profile?.full_name || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p class="text-gray-900">{{ profile?.email || authUser?.email || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p class="text-gray-900">{{ profile?.phone || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p class="text-gray-900">{{ formatDate(authUser?.created_at || profile?.created_at) }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <p class="text-gray-900">{{ formatDateTime(authUser?.last_sign_in_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Santri Information -->
      <div class="lg:col-span-1">
        <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Santri Information</h2>
          
          <div v-if="santri" class="space-y-4">
            <!-- Santri Photo -->
            <div class="flex justify-center mb-4">
              <div class="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="santri.image_url" 
                  :src="santri.image_url" 
                  :alt="santri.full_name"
                  class="h-full w-full object-cover"
                />
                <svg v-else class="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Santri Details -->
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                <p class="text-gray-900 font-mono">{{ santri.nis || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p class="text-gray-900">{{ santri.full_name || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p class="text-gray-900 capitalize">{{ santri.gender || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p class="text-gray-900 text-sm">{{ santri.address || '-' }}</p>
              </div>
              
              <div v-if="santri.accepted_at">
                <label class="block text-sm font-medium text-gray-700 mb-1">Accepted Date</label>
                <p class="text-green-600 text-sm">{{ formatDate(santri.accepted_at) }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <p class="text-gray-900 text-sm">{{ formatDate(santri.created_at) }}</p>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="pt-4 border-t border-gray-200">
              <span 
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  santri.accepted_at 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ santri.accepted_at ? 'Accepted' : 'Pending Review' }}
              </span>
            </div>
          </div>

          <!-- No Santri Data -->
          <div v-else class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Santri Data</h3>
            <p class="text-gray-500 text-sm mb-4">
              You haven't registered as a santri yet.
            </p>
            <NuxtLink 
              to="/register-santri" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Register as Santri
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8 bg-gray-50 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NuxtLink 
          to="/profile/edit" 
          class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Edit Profile
        </NuxtLink>
        <NuxtLink 
          v-if="!santri"
          to="/register-santri" 
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Register as Santri
        </NuxtLink>
        <button 
          @click="refresh()" 
          class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Refresh Data
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>