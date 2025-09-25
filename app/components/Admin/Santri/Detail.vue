<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')
const UCard = resolveComponent('UCard')

const props = defineProps<{
  santri: {
    id: string
    nis: string
    full_name: string
    gender: 'male' | 'female'
    birth_date?: string
    birth_place?: string
    image_url?: string | null
    address: string
    phone?: string
    parent_name?: string
    parent_phone?: string
    class_level?: string
    status?: 'active' | 'graduated' | 'dropped_out' | 'inactive'
    created_at: string
    updated_at: string
    deleted_at?: string | null
  }
}>()

// Calculate age from birth_date
const calculateAge = (birthDate: string) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Computed properties
const age = computed(() => {
  return props.santri.birth_date ? calculateAge(props.santri.birth_date) : null
})

const genderLabel = computed(() => {
  return props.santri.gender === 'male' ? 'Laki-laki' : 'Perempuan'
})

const statusInfo = computed(() => {
  const deletedAt = props.santri.deleted_at
  const status = deletedAt ? 'inactive' : (props.santri.status || 'active')
  
  const statusMap = {
    active: { label: 'Aktif', color: 'success', icon: 'i-lucide-check-circle' },
    inactive: { label: 'Tidak Aktif', color: 'neutral', icon: 'i-lucide-x-circle' },
    graduated: { label: 'Lulus', color: 'blue', icon: 'i-lucide-graduation-cap' },
    dropped_out: { label: 'Keluar', color: 'orange', icon: 'i-lucide-user-x' }
  }
  
  return statusMap[status as keyof typeof statusMap] || statusMap.active
})

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Profile Section -->
    <UCard>
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Photo -->
        <div class="flex-shrink-0">
          <div class="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img
              :src="santri.image_url || 'https://placehold.co/128x128?text=?'"
              :alt="santri.full_name"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <!-- Basic Info -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ santri.full_name }}
              </h3>
              <p class="text-lg text-gray-600 dark:text-gray-400">
                NIS: {{ santri.nis }}
              </p>
            </div>
            <UBadge 
              :color="statusInfo.color" 
              variant="subtle" 
              size="lg"
              class="flex items-center gap-1"
            >
              <UIcon :name="statusInfo.icon" class="w-4 h-4" />
              {{ statusInfo.label }}
            </UBadge>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt class="font-medium text-gray-500 dark:text-gray-400">Gender</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ genderLabel }}</dd>
            </div>
            <div v-if="santri.class_level">
              <dt class="font-medium text-gray-500 dark:text-gray-400">Kelas</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">Kelas {{ santri.class_level }}</dd>
            </div>
            <div v-if="age">
              <dt class="font-medium text-gray-500 dark:text-gray-400">Usia</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ age }} tahun</dd>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Personal Information -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-user-circle" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Personal</h4>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Lahir</dt>
            <dd class="mt-1 text-gray-900 dark:text-white">
              {{ santri.birth_date ? formatDate(santri.birth_date) : '-' }}
            </dd>
          </div>
          
          <div v-if="santri.birth_place">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tempat Lahir</dt>
            <dd class="mt-1 text-gray-900 dark:text-white">{{ santri.birth_place }}</dd>
          </div>
          
          <div v-if="santri.phone">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">No. Telepon</dt>
            <dd class="mt-1 text-gray-900 dark:text-white">
              <a :href="`tel:${santri.phone}`" class="text-primary hover:underline">
                {{ santri.phone }}
              </a>
            </dd>
          </div>
        </div>
        
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Alamat</dt>
          <dd class="mt-1 text-gray-900 dark:text-white leading-relaxed">
            {{ santri.address }}
          </dd>
        </div>
      </div>
    </UCard>

    <!-- Parent Information -->
    <UCard v-if="santri.parent_name || santri.parent_phone">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Orang Tua/Wali</h4>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-if="santri.parent_name">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Orang Tua/Wali</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">{{ santri.parent_name }}</dd>
        </div>
        
        <div v-if="santri.parent_phone">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">No. Telepon Orang Tua</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            <a :href="`tel:${santri.parent_phone}`" class="text-primary hover:underline">
              {{ santri.parent_phone }}
            </a>
          </dd>
        </div>
      </div>
    </UCard>

    <!-- System Information -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-info" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Sistem</h4>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dibuat</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(santri.created_at) }}
          </dd>
        </div>
        
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Terakhir Diperbarui</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(santri.updated_at) }}
          </dd>
        </div>
        
        <div v-if="santri.deleted_at">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dihapus</dt>
          <dd class="mt-1 text-red-600 dark:text-red-400">
            {{ formatDate(santri.deleted_at) }}
          </dd>
        </div>
      </div>
    </UCard>
  </div>
</template>