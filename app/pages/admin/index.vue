<!-- pages/admin/index.vue -->
<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Welcome back, {{ userProfile?.name || 'Admin' }}!
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Santris</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalSantris }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Blogs</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalBlogs }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <UIcon name="i-heroicons-eye" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalViews }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <UIcon name="i-heroicons-star" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.activeUsers }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Santris</h3>
        </template>
        
        <div class="space-y-3">
          <div v-for="santri in recentSantris" :key="santri.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <UAvatar
                :src="santri.avatar_url"
                :alt="santri.name"
                size="sm"
                class="mr-3"
              />
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ santri.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ santri.email }}</p>
              </div>
            </div>
            <UBadge color="green" variant="soft">New</UBadge>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Blogs</h3>
        </template>
        
        <div class="space-y-3">
          <div v-for="blog in recentBlogs" :key="blog.id" class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ blog.title }}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              By {{ blog.author }} • {{ formatDate(blog.created_at) }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
definePageMeta({
  layout: 'admin',
})
const { user } = useAuth()
const supabase = useNuxtApp().$supabase

// State
const userProfile = ref(null)
const stats = ref({
  totalSantris: 0,
  totalBlogs: 0,
  totalViews: 0,
  activeUsers: 0
})
const recentSantris = ref([])
const recentBlogs = ref([])

// Fetch user profile
const fetchUserProfile = async () => {
  if (!user.value) return
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    
    if (!error && data) {
      userProfile.value = data
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

// Fetch dashboard stats
const fetchStats = async () => {
  try {
    // Fetch total santris
    const { count: santrisCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'santri')

    // Fetch total blogs
    const { count: blogsCount } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })

    stats.value = {
      totalSantris: santrisCount || 0,
      totalBlogs: blogsCount || 0,
      totalViews: 1234, // Placeholder - implement view tracking
      activeUsers: 89   // Placeholder - implement active user tracking
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

// Fetch recent santris
const fetchRecentSantris = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, created_at')
      .eq('role', 'santri')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      recentSantris.value = data
    }
  } catch (error) {
    console.error('Error fetching recent santris:', error)
  }
}

// Fetch recent blogs
const fetchRecentBlogs = async () => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        id, 
        title, 
        created_at,
        profiles!blogs_author_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      recentBlogs.value = data.map(blog => ({
        ...blog,
        author: blog.profiles?.name || 'Unknown'
      }))
    }
  } catch (error) {
    console.error('Error fetching recent blogs:', error)
  }
}

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchUserProfile(),
    fetchStats(),
    fetchRecentSantris(),
    fetchRecentBlogs()
  ])
})
</script>