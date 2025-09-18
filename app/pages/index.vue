<template>
  <div class="container">
    <header>
      <h1>SiSantri</h1>
      <p>Manajemen sederhana daftar santri</p>
    </header>

    <section class="controls">
      <input v-model="query" placeholder="Cari santri atau pesantren..." />
      <button @click="openForm()">Tambah Santri</button>
    </section>

    <main>
      <div v-if="filtered.length" class="grid">
        <div v-for="s in filtered" :key="s.id" class="card">
          <h3>{{ s.name }}</h3>
          <p>Usia: {{ s.age }}</p>
          <p>Pesantren: {{ s.pesantren }}</p>
          <div class="actions">
            <button @click="startEdit(s)">Edit</button>
            <button @click="remove(s.id)" class="danger">Hapus</button>
          </div>
        </div>
      </div>

      <p v-else class="empty">Belum ada data santri.</p>
    </main>

    <div v-if="showForm" class="modal" @keydown.esc="closeForm">
      <form class="modal-card" @submit.prevent="save">
        <h3>{{ editing ? 'Edit Santri' : 'Tambah Santri' }}</h3>

        <input v-model="form.name" placeholder="Nama" required />
        <input v-model.number="form.age" type="number" placeholder="Usia" min="1" />
        <input v-model="form.pesantren" placeholder="Pesantren" />

        <div class="modal-actions">
          <button type="submit">Simpan</button>
          <button type="button" @click="closeForm" class="muted">Batal</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({ title: 'SiSantri - Beranda' })

const query = ref('')
const showForm = ref(false)
const editing = ref(false)
const form = ref({ id: null, name: '', age: null, pesantren: '' })

const santris = ref([
  { id: 1, name: 'Ahmad', age: 17, pesantren: 'Al-Falah' },
  { id: 2, name: 'Siti', age: 16, pesantren: 'Al-Hikmah' },
  { id: 3, name: 'Budi', age: 18, pesantren: 'Nurul Iman' }
])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return santris.value
  return santris.value.filter(s =>
    s.name.toLowerCase().includes(q) || s.pesantren.toLowerCase().includes(q)
  )
})

function openForm() {
  editing.value = false
  form.value = { id: null, name: '', age: null, pesantren: '' }
  showForm.value = true
}

function startEdit(s) {
  editing.value = true
  form.value = { ...s }
  showForm.value = true
}

function remove(id) {
  if (!confirm('Hapus santri ini?')) return
  santris.value = santris.value.filter(s => s.id !== id)
}

function save() {
  if (!form.value.name) return
  if (editing.value) {
    const idx = santris.value.findIndex(s => s.id === form.value.id)
    if (idx !== -1) santris.value[idx] = { ...form.value }
  } else {
    const id = santris.value.length ? Math.max(...santris.value.map(s => s.id)) + 1 : 1
    santris.value.push({ ...form.value, id })
  }
  closeForm()
}

function closeForm() {
  showForm.value = false
  editing.value = false
  form.value = { id: null, name: '', age: null, pesantren: '' }
}
</script>

<style scoped>
.container { max-width: 900px; margin: 2rem auto; padding: 1rem; font-family: system-ui, sans-serif; }
header h1 { margin: 0 0 .25rem 0; }
.controls { display:flex; gap:.5rem; margin: 1rem 0; }
.controls input { flex:1; padding:.5rem; border:1px solid #d1d5db; border-radius:6px; }
button { padding:.45rem .75rem; border:0; border-radius:6px; background:#2563eb; color:#fff; cursor:pointer; }
button.muted { background:#9ca3af; }
button.danger { background:#dc2626; }
.grid { display:grid; gap:1rem; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); }
.card { padding:1rem; border:1px solid #e5e7eb; border-radius:8px; background:#fff; box-shadow:0 1px 2px rgba(0,0,0,0.03); }
.actions { margin-top:.5rem; display:flex; gap:.5rem; }
.empty { color:#6b7280; }

.modal { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; padding:1rem; }
.modal-card { background:#fff; padding:1rem; border-radius:8px; width:100%; max-width:360px; display:flex; flex-direction:column; gap:.5rem; }
.modal-card input { padding:.5rem; border:1px solid #e5e7eb; border-radius:6px; }
.modal-actions { display:flex; gap:.5rem; justify-content:flex-end; margin-top:.5rem; }
</style>