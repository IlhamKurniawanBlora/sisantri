<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'admin',
})

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: string
}

interface Stats {
  totalSantris: number
  santrisActive: number
  santrisInactive: number
  totalBlogs: number
  blogsActive: number
  blogsInactive: number
  totalViews: number
  activeUsers: number
}

const { user } = useAuth()
const supabase = useNuxtApp().$supabase

const userProfile = ref<UserProfile | null>(null)
const stats = ref<Stats>({
  totalSantris: 0,
  santrisActive: 0,
  santrisInactive: 0,
  totalBlogs: 0,
  blogsActive: 0,
  blogsInactive: 0,
  totalViews: 0,
  activeUsers: 0,
})

const fetchUserProfile = async () => {
  if (!user.value) return
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, role')
      .eq('id', user.value.id)
      .single()
    if (data && !error) userProfile.value = data
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const fetchStats = async () => {
  try {
    const [santriStats, blogStats] = await Promise.all([
      $fetch('/api/santris/stats'),
      $fetch('/api/blogs/stats'),
    ])
    stats.value = {
      totalSantris: santriStats.total || 0,
      santrisActive: santriStats.active || 0,
      santrisInactive: santriStats.inactive || 0,
      totalBlogs: blogStats.total || 0,
      blogsActive: blogStats.active || 0,
      blogsInactive: blogStats.inactive || 0,
      totalViews: 0,
      activeUsers: santriStats.active || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(async () => {
  await Promise.all([fetchUserProfile(), fetchStats()])
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
    </div>

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

    <div class="flex flex-wrap gap-4 mb-8">
      <NuxtLink to="/admin/blogs">
        <UButton color="primary" icon="i-lucide-newspaper" size="lg">
          Kelola Berita
        </UButton>
      </NuxtLink>
      <NuxtLink to="/admin/santris">
        <UButton color="primary" icon="i-lucide-users" size="lg">
          Kelola Santri
        </UButton>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex flex-col gap-2">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Santri</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalSantris }}</p>
            </div>
          </div>
          <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>Aktif: <b class="text-green-600 dark:text-green-400">{{ stats.santrisActive }}</b></span>
            <span>Tidak aktif: <b class="text-red-600 dark:text-red-400">{{ stats.santrisInactive }}</b></span>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex flex-col gap-2">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UIcon name="i-lucide-newspaper" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Berita</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalBlogs }}</p>
            </div>
          </div>
          <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>Aktif: <b class="text-green-600 dark:text-green-400">{{ stats.blogsActive }}</b></span>
            <span>Tidak aktif: <b class="text-red-600 dark:text-red-400">{{ stats.blogsInactive }}</b></span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
