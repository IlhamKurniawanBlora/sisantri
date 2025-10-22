import { ref, computed, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

export interface Class {
  id: string
  name: string
  image_url?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ClassStats {
  total: number
  active: number
  inactive: number
  withSchedule: number
  withoutSchedule: number
}

export interface ConfirmDialogOptions {
  title: string
  description: string
  variant?: 'destructive' | 'default'
  action: () => Promise<void>
}

export const useClassManagement = () => {
  const toast = useToast()

  // Data state
  const data = ref<Class[]>([])
  const loading = ref(false)
  const isSearching = ref(false)
  const page = ref(1)
  const limit = ref(10)
  const search = ref('')
  const sortBy = ref('newest')
  const includeDeleted = ref(false)
  const total = ref(0)

  // Modal states
  const showSlideover = ref(false)
  const mode = ref<'add' | 'edit'>('add')
  const selectedRow = ref<Class | null>(null)
  const showDetailModal = ref(false)

  // Confirm dialog state
  const showConfirmDialog = ref(false)
  const confirmOptions = ref<ConfirmDialogOptions | null>(null)

  // Stats
  const stats = ref<ClassStats>({
    total: 0,
    active: 0,
    inactive: 0,
    withSchedule: 0,
    withoutSchedule: 0,
  })

  // Debounced search
  const debouncedSearch = ref('')
  let searchTimeout: NodeJS.Timeout

  const debounceSearch = (value: string) => {
    isSearching.value = true
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearch.value = value
      isSearching.value = false
    }, 500)
  }

  watch(search, (newValue) => {
    debounceSearch(newValue)
  })

  watch([debouncedSearch, includeDeleted, sortBy], () => {
    page.value = 1
    fetchClasses()
  })

  watch(page, () => {
    fetchClasses()
  })

  /**
   * Fetch classes from API
   */
  async function fetchClasses() {
    try {
      loading.value = true
      const params = new URLSearchParams({
        page: page.value.toString(),
        limit: limit.value.toString(),
        sortBy: sortBy.value,
        includeDeleted: includeDeleted.value.toString(),
      })

      if (debouncedSearch.value) params.append('search', debouncedSearch.value)

      const response = await $fetch(`/api/classes?${params.toString()}`)
      data.value = response.data || []
      total.value = response.pagination?.total || 0

      await fetchStats()
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.add({
        title: 'Error',
        description: 'Gagal memuat data kelas',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch class statistics
   */
  async function fetchStats() {
    try {
      const response = await $fetch('/api/classes/stats')
      stats.value = {
        total: response.total || 0,
        active: response.active || 0,
        inactive: response.inactive || 0,
        withSchedule: response.withSchedule || 0,
        withoutSchedule: response.withoutSchedule || 0,
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  /**
   * Open confirm dialog
   */
  function openConfirmDialog(opts: ConfirmDialogOptions) {
    confirmOptions.value = opts
    showConfirmDialog.value = true
  }

  /**
   * Request delete class (soft delete)
   */
  function requestDeleteClass(classItem: Class) {
    openConfirmDialog({
      title: 'Hapus Kelas',
      description: `Apakah Anda yakin ingin menghapus kelas "${classItem.name}"?`,
      variant: 'destructive',
      action: async () => {
        try {
          await $fetch(`/api/classes/${classItem.id}/delete`, { method: 'DELETE' })
          toast.add({
            title: 'Kelas berhasil dihapus!',
            color: 'success',
            icon: 'i-lucide-trash'
          })
          fetchClasses()
        } catch (error) {
          toast.add({
            title: 'Gagal menghapus kelas',
            color: 'error'
          })
        }
      }
    })
  }

  /**
   * Request permanent delete class
   */
  function requestDeletePermanentClass(classItem: Class) {
    openConfirmDialog({
      title: 'Hapus Permanen Kelas',
      description: `Apakah Anda yakin ingin menghapus permanen kelas "${classItem.name}"?`,
      variant: 'destructive',
      action: async () => {
        try {
          await $fetch(`/api/classes/${classItem.id}/delete-permanent`, { method: 'DELETE' })
          toast.add({
            title: 'Kelas berhasil dihapus permanen!',
            color: 'success',
            icon: 'i-lucide-trash'
          })
          fetchClasses()
        } catch (error) {
          toast.add({
            title: 'Gagal menghapus kelas',
            color: 'error'
          })
        }
      }
    })
  }

  /**
   * Request restore class
   */
  function requestRestoreClass(classItem: Class) {
    openConfirmDialog({
      title: 'Pulihkan Kelas',
      description: `Apakah Anda yakin ingin memulihkan kelas "${classItem.name}"?`,
      variant: 'default',
      action: async () => {
        try {
          await $fetch(`/api/classes/${classItem.id}/restore`, { method: 'POST' })
          toast.add({
            title: 'Kelas berhasil dipulihkan!',
            color: 'success',
            icon: 'i-lucide-undo-2'
          })
          fetchClasses()
        } catch (error) {
          toast.add({
            title: 'Gagal memulihkan kelas',
            color: 'error'
          })
        }
      }
    })
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    search.value = ''
    debouncedSearch.value = ''
    sortBy.value = 'newest'
    page.value = 1
  }

  /**
   * Handle form save
   */
  const handleClassSaved = () => {
    showSlideover.value = false
    fetchClasses()
    const message = mode.value === 'add' ? 'Kelas berhasil ditambahkan!' : 'Kelas berhasil diubah!'
    toast.add({
      title: message,
      color: 'success'
    })
  }

  /**
   * Open add class
   */
  const openAddClass = () => {
    mode.value = 'add'
    selectedRow.value = null
    showSlideover.value = true
  }

  /**
   * Open edit class
   */
  const openEditClass = (classItem: Class) => {
    mode.value = 'edit'
    selectedRow.value = classItem
    showSlideover.value = true
  }

  /**
   * Open detail class
   */
  const openDetailClass = (classItem: Class) => {
    selectedRow.value = classItem
    showDetailModal.value = true
  }

  return {
    // State
    data,
    loading,
    isSearching,
    page,
    limit,
    search,
    sortBy,
    includeDeleted,
    total,
    showSlideover,
    mode,
    selectedRow,
    showDetailModal,
    showConfirmDialog,
    confirmOptions,
    stats,
    debouncedSearch,

    // Methods
    fetchClasses,
    fetchStats,
    openConfirmDialog,
    requestDeleteClass,
    requestDeletePermanentClass,
    requestRestoreClass,
    clearFilters,
    handleClassSaved,
    openAddClass,
    openEditClass,
    openDetailClass,
  }
}
