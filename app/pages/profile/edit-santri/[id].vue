<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useNuxtApp, useToast, useRouter } from '#imports'
import type { SupabaseClient } from '@supabase/supabase-js'

// 🔹 Define interfaces
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
}

// 🔹 Get auth & dependencies
const { user, isLoggedIn } = useAuth()
const supabase = useNuxtApp().$supabase as SupabaseClient
const toast = useToast()
const router = useRouter()
const route = useRoute()

// 🔹 Redirect ke login jika belum login
if (!isLoggedIn.value) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Please login to access this page'
  })
}

// 🔹 Local states
const loading = ref(false)
const saving = ref(false)
const santri = ref<Santri | null>(null)
const imagePreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

// 🔹 Form data
const form = ref({
  full_name: '',
  address: '',
  gender: 'male' as 'male' | 'female',
  phone_number: '',
  birth_place_date: '',
  nik: '',
  nisn: '',
  no_kk: '',
  no_kip: '',
  no_kks: '',
  rt_rw: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  kode_pos: '',
  pendidikan_sd: '',
  pendidikan_smp: '',
  pendidikan_sma: '',
  pendidikan_non_formal: '',
  hafal_quran: '',
  no_pkh: ''
})

// 🔹 Load santri data saat mounted
onMounted(async () => {
  try {
    loading.value = true
    const santriId = route.params.id as string

    if (!user.value || !santriId) {
      throw new Error('Invalid access')
    }

    // Fetch santri data berdasarkan ID
    const { data, error } = await supabase
      .from('santris')
      .select('*')
      .eq('id', santriId)
      .single()

    if (error) throw new Error('Santri tidak ditemukan')
    if (!data) throw new Error('Santri tidak ditemukan')

    santri.value = data
    form.value = {
      full_name: data.full_name || '',
      address: data.address || '',
      gender: data.gender || 'male',
      phone_number: data.phone_number || '',
      birth_place_date: data.birth_place_date || '',
      nik: data.nik || '',
      nisn: data.nisn || '',
      no_kk: data.no_kk || '',
      no_kip: data.no_kip || '',
      no_kks: data.no_kks || '',
      rt_rw: data.rt_rw || '',
      kecamatan: data.kecamatan || '',
      kabupaten: data.kabupaten || '',
      provinsi: data.provinsi || '',
      kode_pos: data.kode_pos || '',
      pendidikan_sd: data.pendidikan_sd || '',
      pendidikan_smp: data.pendidikan_smp || '',
      pendidikan_sma: data.pendidikan_sma || '',
      pendidikan_non_formal: data.pendidikan_non_formal || '',
      hafal_quran: data.hafal_quran || '',
      no_pkh: data.no_pkh || ''
    }

    // Load image preview jika URL sudah publik
    if (data.image_url) {
      imagePreview.value = data.image_url
    }
  } catch (err: any) {
    console.error('Error loading santri:', err)
    toast.add({
      title: 'Error',
      description: err.message || 'Gagal memuat data santri',
      color: 'error'
    })
    setTimeout(() => router.back(), 2000)
  } finally {
    loading.value = false
  }
})

// 🔹 Handle file selection
const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const file = files[0] as File
    if (file) {
      selectedFile.value = file
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        imagePreview.value = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
}

// 🔹 Submit form
const submitForm = async () => {
  try {
    saving.value = true
    
    if (!santri.value || !user.value) {
      throw new Error('Data tidak valid')
    }

    // Validate required fields
    if (!form.value.full_name || !form.value.address) {
      toast.add({
        title: 'Validasi',
        description: 'Nama lengkap dan alamat harus diisi',
        color: 'warning'
      })
      return
    }

    // Prepare update data
    const updateData: any = {
      full_name: form.value.full_name,
      address: form.value.address,
      gender: form.value.gender,
      phone_number: form.value.phone_number,
      birth_place_date: form.value.birth_place_date,
      nik: form.value.nik,
      nisn: form.value.nisn,
      no_kk: form.value.no_kk,
      no_kip: form.value.no_kip,
      no_kks: form.value.no_kks,
      rt_rw: form.value.rt_rw,
      kecamatan: form.value.kecamatan,
      kabupaten: form.value.kabupaten,
      provinsi: form.value.provinsi,
      kode_pos: form.value.kode_pos,
      pendidikan_sd: form.value.pendidikan_sd,
      pendidikan_smp: form.value.pendidikan_smp,
      pendidikan_sma: form.value.pendidikan_sma,
      pendidikan_non_formal: form.value.pendidikan_non_formal,
      hafal_quran: form.value.hafal_quran,
      no_pkh: form.value.no_pkh
    }

    // Upload image jika ada file baru
    if (selectedFile.value) {
      const filename = `santri-edit/${santri.value.id}/${Date.now()}_${selectedFile.value.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('santris')
        .upload(filename, selectedFile.value, {
          upsert: true
        })

      if (uploadError) throw uploadError
      
      // Get public URL setelah upload
      const { data: urlData } = supabase.storage
        .from('santris')
        .getPublicUrl(filename)
      
      updateData.image_url = urlData.publicUrl
    }

    // Call API to update santri
    const response = await $fetch(`/api/santris/${santri.value.id}`, {
      method: 'PUT' as any,
      body: updateData
    })

    toast.add({
      title: 'Sukses',
      description: 'Data santri berhasil diperbarui',
      color: 'success'
    })

    // Redirect ke profile
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (err: any) {
    console.error('Error updating santri:', err)
    toast.add({
      title: 'Error',
      description: err.message || 'Gagal memperbarui data santri',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// 🔹 Cancel edit
const cancelEdit = () => {
  router.back()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <UButton
          to="/profile"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          size="sm"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-lucide-edit" class="w-6 h-6" />
            Edit Data Santri
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Perbarui informasi data santri Anda
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2">
        <UCard>
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Section 1: Informasi Dasar -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-primary">
                Informasi Dasar
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- NIS (Read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIS
                  </label>
                  <input
                    type="text"
                    :value="santri?.nis || '-'"
                    disabled
                    class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">NIS tidak dapat diubah</p>
                </div>

                <!-- Full Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.full_name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <!-- Gender -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Kelamin <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.gender"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>

                <!-- Phone Number -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No. Telepon
                  </label>
                  <input
                    v-model="form.phone_number"
                    type="tel"
                    placeholder="081234567890"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="form.address"
                    rows="3"
                    placeholder="Masukkan alamat lengkap"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Section 2: Informasi Identitas -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-primary">
                Informasi Identitas
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Birth Place Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tempat, Tanggal Lahir
                  </label>
                  <input
                    v-model="form.birth_place_date"
                    type="text"
                    placeholder="Jakarta, 01-01-2010"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- NIK -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIK
                  </label>
                  <input
                    v-model="form.nik"
                    type="text"
                    placeholder="3501234567890123"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- NISN -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NISN
                  </label>
                  <input
                    v-model="form.nisn"
                    type="text"
                    placeholder="Nomor Induk Siswa Nasional"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- No. KK -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No. Kartu Keluarga
                  </label>
                  <input
                    v-model="form.no_kk"
                    type="text"
                    placeholder="Nomor Kartu Keluarga"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- No. KIP -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No. KIP
                  </label>
                  <input
                    v-model="form.no_kip"
                    type="text"
                    placeholder="Kartu Indonesia Pintar"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- No. KKS -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No. KKS
                  </label>
                  <input
                    v-model="form.no_kks"
                    type="text"
                    placeholder="Kartu Keluarga Sejahtera"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- No. PKH -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No. PKH
                  </label>
                  <input
                    v-model="form.no_pkh"
                    type="text"
                    placeholder="Program Keluarga Harapan"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Section 3: Alamat Lengkap -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-primary">
                Alamat Lengkap
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- RT/RW -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RT/RW
                  </label>
                  <input
                    v-model="form.rt_rw"
                    type="text"
                    placeholder="01/03"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Kecamatan -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kecamatan
                  </label>
                  <input
                    v-model="form.kecamatan"
                    type="text"
                    placeholder="Tebet"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Kabupaten -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kabupaten/Kota
                  </label>
                  <input
                    v-model="form.kabupaten"
                    type="text"
                    placeholder="Jakarta Selatan"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Provinsi -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provinsi
                  </label>
                  <input
                    v-model="form.provinsi"
                    type="text"
                    placeholder="DKI Jakarta"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Kode Pos -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kode Pos
                  </label>
                  <input
                    v-model="form.kode_pos"
                    type="text"
                    placeholder="12820"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Section 4: Riwayat Pendidikan -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-primary">
                Riwayat Pendidikan
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Pendidikan SD -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pendidikan SD
                  </label>
                  <input
                    v-model="form.pendidikan_sd"
                    type="text"
                    placeholder="Nama Sekolah"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Pendidikan SMP -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pendidikan SMP
                  </label>
                  <input
                    v-model="form.pendidikan_smp"
                    type="text"
                    placeholder="Nama Sekolah"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Pendidikan SMA -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pendidikan SMA
                  </label>
                  <input
                    v-model="form.pendidikan_sma"
                    type="text"
                    placeholder="Nama Sekolah"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <!-- Pendidikan Non-Formal -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pendidikan Non-Formal
                  </label>
                  <input
                    v-model="form.pendidikan_non_formal"
                    type="text"
                    placeholder="Nama Lembaga"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Section 5: Kemampuan Al-Qur'an -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-primary">
                Kemampuan Al-Qur'an
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Hafal Quran -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hafal Al-Qur'an (Juz)
                  </label>
                  <input
                    v-model="form.hafal_quran"
                    type="text"
                    placeholder="10 Juz"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <UButton
                type="submit"
                :loading="saving"
                color="primary"
                icon="i-lucide-save"
                block
              >
                Simpan Perubahan
              </UButton>
              <UButton
                type="button"
                @click="cancelEdit"
                color="neutral"
                variant="outline"
                icon="i-lucide-x"
                block
              >
                Batal
              </UButton>
            </div>
          </form>
        </UCard>
      </div>

      <!-- Photo Section -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-image" class="w-5 h-5 text-primary" />
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Foto Profil
              </h2>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Preview -->
            <div class="flex justify-center">
              <UAvatar
                :src="imagePreview || undefined"
                :alt="santri?.full_name || 'Santri Avatar'"
                size="3xl"
                class="ring-4 ring-gray-100 dark:ring-gray-800"
              />
            </div>

            <!-- Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ganti Foto <span class="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                @change="onFileSelected"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Format: JPG, PNG. Ukuran maksimal: 5MB
              </p>
            </div>

            <!-- Info -->
            <UDivider />
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Tanggal Daftar
                </p>
                <p class="text-gray-900 dark:text-white mt-1">
                  {{ new Date(santri?.created_at || '').toLocaleDateString('id-ID') }}
                </p>
              </div>

              <div>
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  NIS
                </p>
                <p class="text-gray-900 dark:text-white font-mono mt-1">
                  {{ santri?.nis || '-' }}
                </p>
              </div>

              <div v-if="santri?.phone_number">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  No. Telepon
                </p>
                <p class="text-gray-900 dark:text-white mt-1">
                  {{ santri.phone_number }}
                </p>
              </div>

              <div v-if="santri?.kabupaten">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Kabupaten/Kota
                </p>
                <p class="text-gray-900 dark:text-white mt-1">
                  {{ santri.kabupaten }}
                </p>
              </div>

              <div v-if="santri?.hafal_quran">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Hafal Quran
                </p>
                <p class="text-gray-900 dark:text-white mt-1">
                  {{ santri.hafal_quran }}
                </p>
              </div>

              <UDivider v-if="santri?.accepted_at" />

              <div v-if="santri?.accepted_at">
                <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </p>
                <UBadge color="success" variant="subtle" class="mt-1">
                  <UIcon name="i-lucide-check-circle" class="w-4 h-4 mr-1" />
                  Diterima
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
