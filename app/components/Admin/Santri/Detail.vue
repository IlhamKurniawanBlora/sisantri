<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')
const UCard = resolveComponent('UCard')

type Santri = {
  id: string
  nis: string
  full_name: string
  gender: 'male' | 'female'
  image_url?: string | null
  address: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  birth_place_date?: string
  phone_number?: string
  nik?: string
  no_kk?: string
  nisn?: string
  no_kip?: string
  no_pkh?: string
  no_kks?: string
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
  accepted_at?: string | null
}

interface Props {
  santri: Santri
}

const props = defineProps<Props>()

const genderLabel = computed(() => {
  return props.santri.gender === 'male' ? 'Laki-laki' : 'Perempuan'
})

const statusInfo = computed(() => {
  const deletedAt = props.santri.deleted_at
  
  const statusMap = {
    active: { label: 'Aktif', color: 'success', icon: 'i-lucide-check-circle' },
    inactive: { label: 'Tidak Aktif', color: 'neutral', icon: 'i-lucide-x-circle' }
  }
  
  return deletedAt ? statusMap.inactive : statusMap.active
})

const createdDate = computed(() => {
  return new Date(props.santri.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const detailSections = computed(() => [
  {
    title: 'Informasi Pribadi',
    icon: 'i-lucide-user',
    items: [
      { label: 'Nama Lengkap', value: props.santri.full_name },
      { label: 'NIS', value: props.santri.nis },
      { label: 'Gender', value: genderLabel.value },
      { label: 'Tempat & Tanggal Lahir', value: props.santri.birth_place_date || '-' },
      { label: 'Nomor Telepon', value: props.santri.phone_number || '-' }
    ]
  },
  {
    title: 'Identitas',
    icon: 'i-lucide-id-card',
    items: [
      { label: 'NIK', value: props.santri.nik || '-' },
      { label: 'Nomor KK', value: props.santri.no_kk || '-' },
      { label: 'NISN', value: props.santri.nisn || '-' },
      { label: 'Nomor KIP', value: props.santri.no_kip || '-' },
      { label: 'Nomor PKH', value: props.santri.no_pkh || '-' },
      { label: 'Nomor KKS', value: props.santri.no_kks || '-' }
    ]
  },
  {
    title: 'Alamat',
    icon: 'i-lucide-map-pin',
    items: [
      { label: 'Alamat', value: props.santri.address },
      { label: 'RT/RW', value: props.santri.rt_rw || '-' },
      { label: 'Kecamatan', value: props.santri.kecamatan || '-' },
      { label: 'Kabupaten', value: props.santri.kabupaten || '-' },
      { label: 'Provinsi', value: props.santri.provinsi || '-' },
      { label: 'Kode Pos', value: props.santri.kode_pos || '-' }
    ]
  },
  {
    title: 'Pendidikan',
    icon: 'i-lucide-book',
    items: [
      { label: 'Pendidikan SD', value: props.santri.pendidikan_sd || '-' },
      { label: 'Pendidikan SMP', value: props.santri.pendidikan_smp || '-' },
      { label: 'Pendidikan SMA/SMK', value: props.santri.pendidikan_sma || '-' },
      { label: 'Pendidikan Non Formal', value: props.santri.pendidikan_non_formal || '-' },
      { label: 'Hafal Quran', value: props.santri.hafal_quran || '-' }
    ]
  },
  {
    title: 'Metadata Sistem',
    icon: 'i-lucide-database',
    items: [
      { label: 'ID', value: props.santri.id, isMono: true },
      { label: 'Terdaftar Pada', value: createdDate.value },
      { label: 'Terakhir Diupdate', value: new Date(props.santri.updated_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...(props.santri.deleted_at ? [{ label: 'Tanggal Dihapus', value: new Date(props.santri.deleted_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) }] : [])
    ]
  }
])
</script>

<template>
  <div class="space-y-6">
    <!-- Profile Header -->
    <div class="flex items-center gap-6">
      <img
        v-if="santri.image_url"
        :src="santri.image_url"
        :alt="santri.full_name"
        class="w-24 h-24 rounded-lg object-cover shadow-md"
      />
      <div v-else class="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <UIcon name="i-lucide-user" class="w-12 h-12 text-gray-400" />
      </div>
      
      <div class="flex-1">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ santri.full_name }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          NIS: {{ santri.nis }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <UBadge variant="subtle" color="primary">
            <UIcon name="i-lucide-user" class="w-3 h-3 mr-1" />
            {{ genderLabel }}
          </UBadge>
          <UBadge :variant="'subtle'" :color="statusInfo.color">
            <UIcon :name="statusInfo.icon" class="w-3 h-3 mr-1" />
            {{ statusInfo.label }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Detail Sections -->
    <div class="space-y-6">
      <div
        v-for="section in detailSections"
        :key="section.title"
        class="border-l-4 border-primary-500 pl-4"
      >
        <div class="flex items-center gap-2 mb-3">
          <UIcon :name="section.icon" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h4 class="font-semibold text-gray-900 dark:text-white text-lg">
            {{ section.title }}
          </h4>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(item, idx) in section.items"
            :key="idx"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ item.label }}
            </p>
            <p
              :class="[
                'text-sm font-semibold text-gray-900 dark:text-white break-words',
                item.isMono && 'font-mono text-xs'
              ]"
            >
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>