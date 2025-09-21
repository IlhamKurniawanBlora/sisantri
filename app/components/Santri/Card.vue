<script setup lang="ts">
interface Student {
  id: string
  nis: string
  full_name: string
  address: string
  gender: 'male' | 'female'
  image_url: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const props = defineProps<{
  student: Student
  showStats?: boolean
}>()

// format tanggal join
const formattedDate = computed(() => {
  return new Date(props.student.created_at).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})

const statusColor = computed(() =>
  props.student.deleted_at ? 'red' : 'green'
)

const statusText = computed(() =>
  props.student.deleted_at ? 'Inactive' : 'Active'
)

// Gender display
const genderIcon = computed(() => 
  props.student.gender === 'male' ? 'i-heroicons-user' : 'i-heroicons-user'
)

const genderText = computed(() => 
  props.student.gender === 'male' ? 'Laki-laki' : 'Perempuan'
)
</script>

<template>
  <UCard
    :ui="{
      base: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
      body: { padding: 'p-6' },
    }"
    class="w-full max-w-sm mx-auto"
  >
    <!-- Header with Avatar -->
    <div class="flex flex-col items-center space-y-4">
      <!-- Avatar -->
      <div class="relative">
        <UUser size="lg">
            <template #avatar>
                <UAvatar
                size="3xl"
                :src="student.image_url"
                :alt="student.full_name"
                class="ring-2 ring-primary"
                />
            </template>
         </UUser>
        <div 
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          :class="statusColor === 'green' ? 'bg-green-500' : 'bg-red-500'"
        />
      </div>

      <!-- Name and NIS -->
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ student.full_name }}
        </h3>
        <UBadge 
          :label="student.nis" 
          size="sm" 
          color="neutral" 
          variant="soft"
          class="mt-1"
        />
      </div>
    </div>

    <!-- Address -->
    <div class="mt-4">
      <div class="flex items-start space-x-2">
        <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {{ student.address }}
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="showStats" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-3 gap-4">
        <!-- Joined Date -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-1">
            <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 text-blue-500" />
          </div>
          <div class="text-xs font-medium text-gray-900 dark:text-white">
            {{ formattedDate }}
          </div>
          <div class="text-xs text-gray-500">Bergabung</div>
        </div>

        <!-- Gender -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-1">
            <UIcon :name="genderIcon" class="w-4 h-4 text-purple-500" />
          </div>
          <div class="text-xs font-medium text-gray-900 dark:text-white">
            {{ genderText }}
          </div>
          <div class="text-xs text-gray-500">Kelamin</div>
        </div>

        <!-- Status -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-1">
            <UIcon 
              :name="statusText === 'Active' ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
              :class="statusColor === 'green' ? 'text-green-500' : 'text-red-500'"
              class="w-4 h-4" 
            />
          </div>
          <div class="text-xs font-medium" :class="statusColor === 'green' ? 'text-green-600' : 'text-red-600'">
            {{ statusText }}
          </div>
          <div class="text-xs text-gray-500">Status</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>