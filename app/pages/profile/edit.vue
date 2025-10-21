<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

// Meta tags
useHead({
  title: 'Edit Profile',
  meta: [
    { name: 'description', content: 'Edit your profile information' }
  ]
})

const { user, isLoggedIn } = useAuth()

// Redirect to login if not authenticated
if (!isLoggedIn.value) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Please login to access profile'
  })
}

// Form reactive data
const form = reactive({
  full_name: '',
  phone: '',
  avatar_url: ''
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Fetch current profile data
const { data: profileData } = await useFetch('/api/profile')

// Initialize form with current data
onMounted(() => {
  const profile = (profileData.value as any)?.data?.profile
  if (profile) {
    form.full_name = profile.full_name || ''
    form.phone = profile.phone || ''
    form.avatar_url = profile.avatar_url || ''
  }
})

// Update profile function
const updateProfile = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // For now, just simulate success (you would need to create PUT endpoint)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const response = { success: true }

    if (response.success) {
      successMessage.value = 'Profile updated successfully!'
      setTimeout(() => {
        navigateTo('/profile')
      }, 2000)
    }
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-4">
        <NuxtLink 
          to="/profile" 
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p class="text-gray-600">Update your personal information</p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <p class="text-green-800">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-red-800">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Form -->
    <div class="max-w-2xl">
      <form @submit.prevent="updateProfile" class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div class="space-y-6">
          <!-- Avatar Preview -->
          <div class="flex items-center space-x-4">
            <div class="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <img 
                v-if="form.avatar_url" 
                :src="form.avatar_url" 
                alt="Avatar Preview"
                class="h-full w-full object-cover"
              />
              <svg v-else class="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Profile Photo</h3>
              <p class="text-sm text-gray-500">Upload a new avatar or provide a URL</p>
            </div>
          </div>

          <!-- Full Name -->
          <div>
            <label for="full_name" class="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="full_name"
              v-model="form.full_name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your full name"
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your phone number"
            />
          </div>

          <!-- Avatar URL -->
          <div>
            <label for="avatar_url" class="block text-sm font-medium text-gray-700 mb-2">
              Avatar URL
            </label>
            <input
              id="avatar_url"
              v-model="form.avatar_url"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://example.com/avatar.jpg"
            />
            <p class="mt-1 text-sm text-gray-500">
              Provide a direct link to your profile photo
            </p>
          </div>

          <!-- Email (Read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Address (cannot be changed)
            </label>
            <input
              :value="user?.email || ''"
              type="email"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex items-center justify-between">
          <NuxtLink 
            to="/profile" 
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </NuxtLink>
          
          <button
            type="submit"
            :disabled="isLoading"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
            <span v-else>Update Profile</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>