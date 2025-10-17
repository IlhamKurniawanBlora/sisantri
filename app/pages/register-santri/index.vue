<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Registrasi Santri</h1>
        <p class="text-lg text-gray-600">Silakan lengkapi formulir di bawah untuk mendaftar sebagai santri</p>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <form @submit.prevent="submitForm" class="p-8 space-y-8">
          <!-- Section 1: Informasi Dasar -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-green-500">
              Informasi Dasar
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- NIS -->
              <div>
                <label for="nis" class="block text-sm font-medium text-gray-700 mb-2">
                  NIS <span class="text-red-500">*</span>
                </label>
                <input
                  id="nis"
                  v-model="form.nis"
                  type="text"
                  placeholder="Misal: ST2024001"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Full Name -->
              <div>
                <label for="full_name" class="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input
                  id="full_name"
                  v-model="form.full_name"
                  type="text"
                  placeholder="Misal: Muhammad Abdullah"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- Gender -->
              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin <span class="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  v-model="form.gender"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>

              <!-- Phone Number -->
              <div>
                <label for="phone_number" class="block text-sm font-medium text-gray-700 mb-2">
                  No. Telepon <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="phone_number"
                  v-model="form.phone_number"
                  type="tel"
                  placeholder="Misal: 081234567890"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Address -->
              <div class="md:col-span-2">
                <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                  Alamat <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  v-model="form.address"
                  rows="3"
                  placeholder="Misal: Jl. Masjid Al-Huda No. 15, Jakarta Selatan"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Section 2: Informasi Identitas -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-green-500">
              Informasi Identitas
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Birth Place Date -->
              <div>
                <label for="birth_place_date" class="block text-sm font-medium text-gray-700 mb-2">
                  Tempat, Tanggal Lahir <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="birth_place_date"
                  v-model="form.birth_place_date"
                  type="text"
                  placeholder="Misal: Jakarta, 01-01-2010"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- NIK -->
              <div>
                <label for="nik" class="block text-sm font-medium text-gray-700 mb-2">
                  NIK <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="nik"
                  v-model="form.nik"
                  type="text"
                  placeholder="Misal: 3501234567890123"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- NISN -->
              <div>
                <label for="nisn" class="block text-sm font-medium text-gray-700 mb-2">
                  NISN <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="nisn"
                  v-model="form.nisn"
                  type="text"
                  placeholder="Nomor Induk Siswa Nasional"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- No. KK -->
              <div>
                <label for="no_kk" class="block text-sm font-medium text-gray-700 mb-2">
                  No. Kartu Keluarga <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="no_kk"
                  v-model="form.no_kk"
                  type="text"
                  placeholder="Nomor Kartu Keluarga"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- No. KIP -->
              <div>
                <label for="no_kip" class="block text-sm font-medium text-gray-700 mb-2">
                  No. KIP <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="no_kip"
                  v-model="form.no_kip"
                  type="text"
                  placeholder="Kartu Indonesia Pintar"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- No. KKS -->
              <div>
                <label for="no_kks" class="block text-sm font-medium text-gray-700 mb-2">
                  No. KKS <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="no_kks"
                  v-model="form.no_kks"
                  type="text"
                  placeholder="Kartu Keluarga Sejahtera"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Section 3: Informasi Alamat Lengkap -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-green-500">
              Alamat Lengkap
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- RT/RW -->
              <div>
                <label for="rt_rw" class="block text-sm font-medium text-gray-700 mb-2">
                  RT/RW <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="rt_rw"
                  v-model="form.rt_rw"
                  type="text"
                  placeholder="Misal: 01/03"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Kecamatan -->
              <div>
                <label for="kecamatan" class="block text-sm font-medium text-gray-700 mb-2">
                  Kecamatan <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="kecamatan"
                  v-model="form.kecamatan"
                  type="text"
                  placeholder="Misal: Tebet"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Kabupaten -->
              <div>
                <label for="kabupaten" class="block text-sm font-medium text-gray-700 mb-2">
                  Kabupaten/Kota <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="kabupaten"
                  v-model="form.kabupaten"
                  type="text"
                  placeholder="Misal: Jakarta Selatan"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Provinsi -->
              <div>
                <label for="provinsi" class="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="provinsi"
                  v-model="form.provinsi"
                  type="text"
                  placeholder="Misal: DKI Jakarta"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Kode Pos -->
              <div>
                <label for="kode_pos" class="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="kode_pos"
                  v-model="form.kode_pos"
                  type="text"
                  placeholder="Misal: 12820"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Section 4: Riwayat Pendidikan -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-green-500">
              Riwayat Pendidikan
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Pendidikan SD -->
              <div>
                <label for="pendidikan_sd" class="block text-sm font-medium text-gray-700 mb-2">
                  Pendidikan SD <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="pendidikan_sd"
                  v-model="form.pendidikan_sd"
                  type="text"
                  placeholder="Nama Sekolah"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Pendidikan SMP -->
              <div>
                <label for="pendidikan_smp" class="block text-sm font-medium text-gray-700 mb-2">
                  Pendidikan SMP <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="pendidikan_smp"
                  v-model="form.pendidikan_smp"
                  type="text"
                  placeholder="Nama Sekolah"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Pendidikan SMA -->
              <div>
                <label for="pendidikan_sma" class="block text-sm font-medium text-gray-700 mb-2">
                  Pendidikan SMA <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="pendidikan_sma"
                  v-model="form.pendidikan_sma"
                  type="text"
                  placeholder="Nama Sekolah"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- Pendidikan Non-Formal -->
              <div>
                <label for="pendidikan_non_formal" class="block text-sm font-medium text-gray-700 mb-2">
                  Pendidikan Non-Formal <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="pendidikan_non_formal"
                  v-model="form.pendidikan_non_formal"
                  type="text"
                  placeholder="Nama Lembaga"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Section 5: Kemampuan Al-Qur'an -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-green-500">
              Kemampuan Al-Qur'an
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Hafal Qur'an -->
              <div>
                <label for="hafal_quran" class="block text-sm font-medium text-gray-700 mb-2">
                  Hafal Al-Qur'an (Juz) <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="hafal_quran"
                  v-model="form.hafal_quran"
                  type="text"
                  placeholder="Misal: 10 Juz"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <!-- No. PKH -->
              <div>
                <label for="no_pkh" class="block text-sm font-medium text-gray-700 mb-2">
                  No. PKH <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="no_pkh"
                  v-model="form.no_pkh"
                  type="text"
                  placeholder="Program Keluarga Harapan"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Section 6: Foto -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b-2 border-green-500">
              Foto Profil
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="image_file" class="block text-sm font-medium text-gray-700 mb-2">
                  Upload Foto <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="image_file"
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  @change="onFileSelected"
                />
                <p class="text-xs text-gray-500 mt-2">Format: JPG, PNG. Ukuran maksimal: 5MB</p>
              </div>

              <!-- Preview -->
              <div v-if="imagePreview" class="flex justify-center">
                <img :src="imagePreview" alt="Preview" class="h-32 w-32 object-cover rounded-lg border-2 border-green-500" />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4 pt-8 border-t-2 border-gray-200">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="inline-block animate-spin">⟳</span>
              {{ loading ? 'Memproses...' : 'Daftar Sekarang' }}
            </button>
            <button
              type="reset"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-6 rounded-lg transition duration-200"
              @click="resetForm"
            >
              Bersihkan
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <Transition name="fade">
        <div v-if="successMessage" class="mt-8 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
          <p class="font-semibold">Pendaftaran Berhasil!</p>
          <p>{{ successMessage }}</p>
        </div>
      </Transition>

      <!-- Error Message -->
      <Transition name="fade">
        <div v-if="errorMessage" class="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p class="font-semibold">Terjadi Kesalahan</p>
          <p>{{ errorMessage }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Define page meta
definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

// Form data
const form = ref({
  nis: '',
  full_name: '',
  gender: '',
  phone_number: '',
  address: '',
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

// Form state
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const imagePreview = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

// Handle file selection
const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(selectedFile.value)
  }
}

// Submit form
const submitForm = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Create FormData for multipart upload
    const formData = new FormData()
    formData.append('nis', form.value.nis)
    formData.append('full_name', form.value.full_name)
    formData.append('gender', form.value.gender)
    formData.append('phone_number', form.value.phone_number)
    formData.append('address', form.value.address)
    formData.append('birth_place_date', form.value.birth_place_date)
    formData.append('nik', form.value.nik)
    formData.append('nisn', form.value.nisn)
    formData.append('no_kk', form.value.no_kk)
    formData.append('no_kip', form.value.no_kip)
    formData.append('no_kks', form.value.no_kks)
    formData.append('rt_rw', form.value.rt_rw)
    formData.append('kecamatan', form.value.kecamatan)
    formData.append('kabupaten', form.value.kabupaten)
    formData.append('provinsi', form.value.provinsi)
    formData.append('kode_pos', form.value.kode_pos)
    formData.append('pendidikan_sd', form.value.pendidikan_sd)
    formData.append('pendidikan_smp', form.value.pendidikan_smp)
    formData.append('pendidikan_sma', form.value.pendidikan_sma)
    formData.append('pendidikan_non_formal', form.value.pendidikan_non_formal)
    formData.append('hafal_quran', form.value.hafal_quran)
    formData.append('no_pkh', form.value.no_pkh)

    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
    }

    // Submit to API
    const response = await $fetch('/api/registrant', {
      method: 'POST',
      body: formData
    })

    successMessage.value = response.message || 'Pendaftaran Anda telah diterima. Tim admin akan menghubungi Anda segera.'
    resetForm()

    // Scroll to success message
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  } catch (error: any) {
    errorMessage.value = error.data?.message || error.message || 'Terjadi kesalahan saat mendaftar'
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    nis: '',
    full_name: '',
    gender: '',
    phone_number: '',
    address: '',
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
  }
  selectedFile.value = null
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
