<script setup lang="ts">
import { reactive, computed, ref, resolveComponent } from 'vue'

const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UTextarea = resolveComponent('UTextarea')
const UButton = resolveComponent('UButton')

const props = defineProps<{
  mode: 'add' | 'edit'
  santri?: any
}>()

const emit = defineEmits<{
  saved: []
  close: []
}>()

const toast = useToast()
const loading = ref(false)

// --- Form state ---
const formState = reactive({
  nis: '',
  full_name: '',
  gender: 'male',
  address: '',
  birth_place_date: '',
  phone_number: '',
  nik: '',
  no_kk: '',
  nisn: '',
  no_kip: '',
  no_pkh: '',
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
  file: null as File | null,
  previewUrl: null as string | null
})

// --- Prefill kalau edit ---
if (props.mode === 'edit' && props.santri) {
  Object.assign(formState, {
    nis: props.santri.nis || '',
    full_name: props.santri.full_name || '',
    gender: props.santri.gender || 'male',
    address: props.santri.address || '',
    birth_place_date: props.santri.birth_place_date || '',
    phone_number: props.santri.phone_number || '',
    nik: props.santri.nik || '',
    no_kk: props.santri.no_kk || '',
    nisn: props.santri.nisn || '',
    no_kip: props.santri.no_kip || '',
    no_pkh: props.santri.no_pkh || '',
    no_kks: props.santri.no_kks || '',
    rt_rw: props.santri.rt_rw || '',
    kecamatan: props.santri.kecamatan || '',
    kabupaten: props.santri.kabupaten || '',
    provinsi: props.santri.provinsi || '',
    kode_pos: props.santri.kode_pos || '',
    pendidikan_sd: props.santri.pendidikan_sd || '',
    pendidikan_smp: props.santri.pendidikan_smp || '',
    pendidikan_sma: props.santri.pendidikan_sma || '',
    pendidikan_non_formal: props.santri.pendidikan_non_formal || '',
    hafal_quran: props.santri.hafal_quran || '',
    previewUrl: props.santri.image_url || null
  })
}

const genderOptions = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' }
]

const pendidikanSdOptions = [
  { label: 'Belum Sekolah', value: 'belum_sekolah' },
  { label: 'Sedang Sekolah', value: 'sedang_sekolah' },
  { label: 'Lulus', value: 'lulus' }
]

const hafalQuranOptions = [
  { label: 'Tidak', value: 'tidak' },
  { label: 'Ya', value: 'ya' }
]

const isFormValid = computed(() => {
  return !!(formState.nis && formState.full_name && formState.gender && formState.address)
})

// --- File handler ---
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formState.file = target.files[0]
    formState.previewUrl = URL.createObjectURL(target.files[0])
  }
}

function clearImage() {
  formState.file = null
  formState.previewUrl = null
}

// --- Submit handler ---
async function handleSubmit() {
  if (!isFormValid.value) {
    toast.add({
      title: 'Form tidak lengkap',
      description: 'Silakan lengkapi semua field yang wajib diisi (NIS, Nama, Gender, Alamat)',
      color: 'error'
    })
    return
  }

  loading.value = true

  try {
    const formData = new FormData()

    // Tambahkan ID kalau edit
    if (props.mode === 'edit' && props.santri?.id) {
      formData.append('id', props.santri.id)
    }

    // Append all fields
    formData.append('nis', formState.nis)
    formData.append('full_name', formState.full_name)
    formData.append('gender', formState.gender)
    formData.append('address', formState.address)
    formData.append('birth_place_date', formState.birth_place_date)
    formData.append('phone_number', formState.phone_number)
    formData.append('nik', formState.nik)
    formData.append('no_kk', formState.no_kk)
    formData.append('nisn', formState.nisn)
    formData.append('no_kip', formState.no_kip)
    formData.append('no_pkh', formState.no_pkh)
    formData.append('no_kks', formState.no_kks)
    formData.append('rt_rw', formState.rt_rw)
    formData.append('kecamatan', formState.kecamatan)
    formData.append('kabupaten', formState.kabupaten)
    formData.append('provinsi', formState.provinsi)
    formData.append('kode_pos', formState.kode_pos)
    formData.append('pendidikan_sd', formState.pendidikan_sd)
    formData.append('pendidikan_smp', formState.pendidikan_smp)
    formData.append('pendidikan_sma', formState.pendidikan_sma)
    formData.append('pendidikan_non_formal', formState.pendidikan_non_formal)
    formData.append('hafal_quran', formState.hafal_quran)

    if (formState.file) {
      formData.append('file', formState.file)
    }

    await $fetch('/api/santris', {
      method: 'POST',
      body: formData
    })

    toast.add({
      title: props.mode === 'edit'
        ? 'Santri berhasil diperbarui!'
        : 'Santri berhasil ditambahkan!',
      color: 'success'
    })

    emit('saved')

    // Reset kalau tambah baru
    if (props.mode === 'add') {
      Object.assign(formState, {
        nis: '',
        full_name: '',
        gender: 'male',
        address: '',
        birth_place_date: '',
        phone_number: '',
        nik: '',
        no_kk: '',
        nisn: '',
        no_kip: '',
        no_pkh: '',
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
        file: null,
        previewUrl: null
      })
    }
  } catch (error: any) {
    toast.add({
      title: `Gagal ${props.mode === 'edit' ? 'memperbarui' : 'menambahkan'} santri`,
      description: error?.data?.statusMessage || error?.message || 'Terjadi kesalahan',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm @submit.prevent="handleSubmit" class="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
    <!-- Foto -->
    <UFormField label="Foto Santri" name="photo">
      <UInput
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="mb-3 w-full"
      />

      <div v-if="formState.previewUrl" class="mt-3 relative w-fit">
        <img
          :src="formState.previewUrl"
          alt="Preview"
          class="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
        />
        <UButton
          size="xs"
          color="error"
          variant="soft"
          class="absolute top-1 right-1"
          @click="clearImage"
        >
          Hapus
        </UButton>
      </div>
    </UFormField>

    <!-- --- INFORMASI PRIBADI --- -->
    <div class="border-t pt-4 mt-6">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-user" class="w-5 h-5" />
        Informasi Pribadi
      </h3>

      <!-- NIS -->
      <UFormField label="NIS" name="nis" required class="mb-4">
        <UInput
          v-model="formState.nis"
          placeholder="Masukkan NIS"
          :disabled="mode === 'edit'"
          class="w-full"
        />
      </UFormField>

      <!-- Nama -->
      <UFormField label="Nama Lengkap" name="full_name" required class="mb-4">
        <UInput
          v-model="formState.full_name"
          placeholder="Masukkan nama lengkap"
          class="w-full"
        />
      </UFormField>

      <!-- Gender -->
      <UFormField label="Gender" name="gender" required class="mb-4">
        <USelect
          v-model="formState.gender"
          :items="genderOptions"
          placeholder="Pilih gender"
          class="w-full"
        />
      </UFormField>

      <!-- Tempat & Tanggal Lahir -->
      <UFormField label="Tempat & Tanggal Lahir" name="birth_place_date" class="mb-4">
        <UInput
          v-model="formState.birth_place_date"
          placeholder="Contoh: Jakarta, 15-08-2010"
          class="w-full"
        />
      </UFormField>

      <!-- Nomor Telepon -->
      <UFormField label="Nomor Telepon" name="phone_number" class="mb-4">
        <UInput
          v-model="formState.phone_number"
          placeholder="Masukkan nomor telepon"
          type="tel"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- --- IDENTITAS --- -->
    <div class="border-t pt-4">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-id-card" class="w-5 h-5" />
        Identitas
      </h3>

      <!-- NIK -->
      <UFormField label="NIK" name="nik" class="mb-4">
        <UInput
          v-model="formState.nik"
          placeholder="Masukkan NIK"
          class="w-full"
        />
      </UFormField>

      <!-- Nomor KK -->
      <UFormField label="Nomor KK (Kartu Keluarga)" name="no_kk" class="mb-4">
        <UInput
          v-model="formState.no_kk"
          placeholder="Masukkan nomor KK"
          class="w-full"
        />
      </UFormField>

      <!-- NISN -->
      <UFormField label="NISN" name="nisn" class="mb-4">
        <UInput
          v-model="formState.nisn"
          placeholder="Masukkan NISN"
          class="w-full"
        />
      </UFormField>

      <!-- Nomor KIP -->
      <UFormField label="Nomor KIP" name="no_kip" class="mb-4">
        <UInput
          v-model="formState.no_kip"
          placeholder="Masukkan nomor KIP"
          class="w-full"
        />
      </UFormField>

      <!-- Nomor PKH -->
      <UFormField label="Nomor PKH" name="no_pkh" class="mb-4">
        <UInput
          v-model="formState.no_pkh"
          placeholder="Masukkan nomor PKH"
          class="w-full"
        />
      </UFormField>

      <!-- Nomor KKS -->
      <UFormField label="Nomor KKS" name="no_kks" class="mb-4">
        <UInput
          v-model="formState.no_kks"
          placeholder="Masukkan nomor KKS"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- --- ALAMAT --- -->
    <div class="border-t pt-4">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
        Alamat
      </h3>

      <!-- Alamat -->
      <UFormField label="Alamat" name="address" required class="mb-4">
        <UTextarea
          v-model="formState.address"
          placeholder="Masukkan alamat lengkap"
          rows="3"
          class="w-full"
        />
      </UFormField>

      <!-- RT/RW -->
      <UFormField label="RT/RW" name="rt_rw" class="mb-4">
        <UInput
          v-model="formState.rt_rw"
          placeholder="Contoh: 002/003"
          class="w-full"
        />
      </UFormField>

      <!-- Kecamatan -->
      <UFormField label="Kecamatan" name="kecamatan" class="mb-4">
        <UInput
          v-model="formState.kecamatan"
          placeholder="Masukkan kecamatan"
          class="w-full"
        />
      </UFormField>

      <!-- Kabupaten -->
      <UFormField label="Kabupaten/Kota" name="kabupaten" class="mb-4">
        <UInput
          v-model="formState.kabupaten"
          placeholder="Masukkan kabupaten/kota"
          class="w-full"
        />
      </UFormField>

      <!-- Provinsi -->
      <UFormField label="Provinsi" name="provinsi" class="mb-4">
        <UInput
          v-model="formState.provinsi"
          placeholder="Masukkan provinsi"
          class="w-full"
        />
      </UFormField>

      <!-- Kode Pos -->
      <UFormField label="Kode Pos" name="kode_pos" class="mb-4">
        <UInput
          v-model="formState.kode_pos"
          placeholder="Masukkan kode pos"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- --- PENDIDIKAN --- -->
    <div class="border-t pt-4">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-book" class="w-5 h-5" />
        Pendidikan
      </h3>

      <!-- Pendidikan SD -->
      <UFormField label="Pendidikan SD" name="pendidikan_sd" class="mb-4">
        <UInput
          v-model="formState.pendidikan_sd"
          placeholder="Nama SD (optional)"
          class="w-full"
        />
      </UFormField>

      <!-- Pendidikan SMP -->
      <UFormField label="Pendidikan SMP" name="pendidikan_smp" class="mb-4">
        <UInput
          v-model="formState.pendidikan_smp"
          placeholder="Nama SMP (optional)"
          class="w-full"
        />
      </UFormField>

      <!-- Pendidikan SMA/SMK -->
      <UFormField label="Pendidikan SMA/SMK" name="pendidikan_sma" class="mb-4">
        <UInput
          v-model="formState.pendidikan_sma"
          placeholder="Nama SMA/SMK (optional)"
          class="w-full"
        />
      </UFormField>

      <!-- Pendidikan Non Formal -->
      <UFormField label="Pendidikan Non Formal" name="pendidikan_non_formal" class="mb-4">
        <UInput
          v-model="formState.pendidikan_non_formal"
          placeholder="Masukkan pendidikan non formal (optional)"
          class="w-full"
        />
      </UFormField>

      <!-- Hafal Quran -->
      <UFormField label="Hafal Quran" name="hafal_quran" class="mb-4">
        <UInput
          v-model="formState.hafal_quran"
          placeholder="Masukkan jumlah juz (optional)"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Actions -->
    <div class="border-t pt-6 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
      <UButton
        variant="outline"
        @click="emit('close')"
        :disabled="loading"
      >
        Batal
      </UButton>
      <UButton
        type="submit"
        :loading="loading"
        :disabled="!isFormValid"
        color="primary"
      >
        {{ mode === 'add' ? 'Simpan' : 'Update' }}
      </UButton>
    </div>
  </UForm>
</template>
