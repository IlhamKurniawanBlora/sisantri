<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'admin',
  // middleware: 'admin'
})
interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: string
}

interface Santri {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
}

interface Blog {
  id: string
  title: string
  author: string
  created_at: string
  published: boolean
  views?: number
}

interface Stats {
  totalSantris: number
  totalBlogs: number
  totalViews: number
  activeUsers: number
}

// Composables
const { user } = useAuth()
const supabase = useNuxtApp().$supabase

// State
const userProfile = ref<UserProfile | null>(null)
const stats = ref<Stats>({
  totalSantris: 0,
  totalBlogs: 0,
})
const loading = ref({
  santris: false,
  blogs: false
})

// Methods
const fetchUserProfile = async () => {
  if (!user.value) return
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, role')
      .eq('id', user.value.id)
      .single()
      
    if (!error && data) {
      userProfile.value = data
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const fetchStats = async () => {
  try {
    const [santrisResult, blogsResult] = await Promise.all([
      supabase
        .from('santris')
        .select('*', { count: 'exact', head: true }),
      
      supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true }),
      
    ])
      
    stats.value = {
      totalSantris: santrisResult.count || 0,
      totalBlogs: blogsResult.count || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchUserProfile(),
    fetchStats(),
  ])
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
    </div>

    <!-- User Session Info -->
    <div class="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center gap-4">
      <UAvatar 
        :src="userProfile?.avatar_url" 
        :alt="userProfile?.name || 'Admin'" 
        size="md" 
      />
      <div>
        <p class="font-semibold text-gray-900 dark:text-white">{{ userProfile?.name || 'Admin' }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ userProfile?.email || user?.email }}</p>
        <UBadge color="primary" variant="soft">{{ userProfile?.role || 'admin' }}</UBadge>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-4 mb-8">
      <NuxtLink to="/admin/blogs">
        <UButton color="primary" icon="i-lucide-newspaper" size="lg">
          Kelola Blogs
        </UButton>
      </NuxtLink>
      <NuxtLink to="/admin/santris">
        <UButton color="primary" icon="i-lucide-users" size="lg">
          Kelola Santris
        </UButton>
      </NuxtLink>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Santris Card -->
      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Santris</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalSantris }}</p>
          </div>
        </div>
      </UCard>

      <!-- Total Blogs Card -->
      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon name="i-lucide-newspaper" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Blogs</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalBlogs }}</p>
          </div>
        </div>
      </UCard>
    </div>   
  </div>
</template>

