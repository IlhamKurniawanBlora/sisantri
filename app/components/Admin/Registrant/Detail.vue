<script setup lang="ts">
import { computed } from 'vue'

type Registrant = {
  id: string
  nis: string
  full_name: string
  gender: 'male' | 'female'
  birth_place_date?: string
  image_url?: string | null
  address: string
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
  created_at: string
  updated_at: string
  accepted_at?: string | null
}

interface Props {
  registrant: Registrant
}

const props = defineProps<Props>()

const genderLabel = computed(() => {
  return props.registrant.gender === 'male' ? 'Laki-laki' : 'Perempuan'
})

const createdDate = computed(() => {
  return new Date(props.registrant.created_at).toLocaleDateString('id-ID', {
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
      { label: 'Nama Lengkap', value: props.registrant.full_name },
      { label: 'NIS', value: props.registrant.nis },
      { label: 'Gender', value: genderLabel.value },
      { label: 'Tempat & Tanggal Lahir', value: props.registrant.birth_place_date || '-' },
      { label: 'Nomor Telepon', value: props.registrant.phone_number || '-' }
    ]
  },
  {
    title: 'Identitas',
    icon: 'i-lucide-id-card',
    items: [
      { label: 'NIK', value: props.registrant.nik || '-' },
      { label: 'Nomor KK', value: props.registrant.no_kk || '-' },
      { label: 'NISN', value: props.registrant.nisn || '-' },
      { label: 'Nomor KIP', value: props.registrant.no_kip || '-' },
      { label: 'Nomor PKH', value: props.registrant.no_pkh || '-' },
      { label: 'Nomor KKS', value: props.registrant.no_kks || '-' }
    ]
  },
  {
    title: 'Alamat',
    icon: 'i-lucide-map-pin',
    items: [
      { label: 'Alamat', value: props.registrant.address },
      { label: 'RT/RW', value: props.registrant.rt_rw || '-' },
      { label: 'Kecamatan', value: props.registrant.kecamatan || '-' },
      { label: 'Kabupaten', value: props.registrant.kabupaten || '-' },
      { label: 'Provinsi', value: props.registrant.provinsi || '-' },
      { label: 'Kode Pos', value: props.registrant.kode_pos || '-' }
    ]
  },
  {
    title: 'Pendidikan',
    icon: 'i-lucide-book',
    items: [
      { label: 'Pendidikan SD', value: props.registrant.pendidikan_sd || '-' },
      { label: 'Pendidikan SMP', value: props.registrant.pendidikan_smp || '-' },
      { label: 'Pendidikan SMA/SMK', value: props.registrant.pendidikan_sma || '-' },
      { label: 'Pendidikan Non Formal', value: props.registrant.pendidikan_non_formal || '-' },
      { label: 'Hafal Quran', value: props.registrant.hafal_quran || '-' }
    ]
  },
  {
    title: 'Metadata Sistem',
    icon: 'i-lucide-database',
    items: [
      { label: 'ID', value: props.registrant.id, isMono: true },
      { label: 'Terdaftar Pada', value: createdDate.value },
      { label: 'Terakhir Diupdate', value: new Date(props.registrant.updated_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]
  }
])
</script>

<template>
  <div class="space-y-6">
    <!-- Profile Header -->
    <div class="flex items-center gap-6">
      <img
        v-if="registrant.image_url"
        :src="registrant.image_url"
        :alt="registrant.full_name"
        class="w-24 h-24 rounded-lg object-cover shadow-md"
      />
      <div v-else class="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <UIcon name="i-lucide-user" class="w-12 h-12 text-gray-400" />
      </div>
      
      <div class="flex-1">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ registrant.full_name }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          NIS: {{ registrant.nis }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <UBadge variant="subtle" color="primary">
            <UIcon name="i-lucide-inbox" class="w-3 h-3 mr-1" />
            {{ genderLabel }}
          </UBadge>
          <UBadge variant="subtle" color="warning">
            <UIcon name="i-lucide-clock" class="w-3 h-3 mr-1" />
            Menunggu Persetujuan
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
