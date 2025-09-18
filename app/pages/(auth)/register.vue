<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'

definePageMeta({
    layout: 'blank',
    title: 'Register'
})

const router = useRouter()
const loading = ref(false)

const form = reactive({
    name: '',
    email: '',
    password: ''
})

const errors = reactive<Record<string, string | null>>({
    name: null,
    email: null,
    password: null,
    general: null
})

const hasErrors = computed(() => Object.values(errors).some(Boolean))

function validate() {
    errors.name = form.name.trim() ? null : 'Nama wajib diisi.'
    errors.email = /^\S+@\S+\.\S+$/.test(form.email) ? null : 'Email tidak valid.'
    errors.password = form.password.length >= 6 ? null : 'Minimal 6 karakter.'
    errors.general = null
    return !hasErrors.value
}

async function onSubmit() {
    if (!validate()) return
    loading.value = true
    try {
        // adjust endpoint as needed; using $fetch (Nuxt 4) for server requests
        await $fetch('/api/register', {
            method: 'POST',
            body: { ...form }
        })
        // on success, navigate to login or dashboard
        await router.push('/login')
    } catch (e: any) {
        // handle API errors concisely
        errors.general = e?.data?.message || e?.message || 'Terjadi kesalahan saat mendaftar.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <main class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <section class="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
            <h1 class="text-2xl font-semibold mb-4">Register</h1>

            <form @submit.prevent="onSubmit" novalidate>
                <div class="mb-4">
                    <label for="name" class="block text-sm font-medium mb-1">Nama</label>
                    <input
                        id="name"
                        v-model="form.name"
                        type="text"
                        :aria-invalid="!!errors.name"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        :class="errors.name ? 'border-red-500' : 'border-gray-200'"
                        autocomplete="name"
                    />
                    <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
                </div>

                <div class="mb-4">
                    <label for="email" class="block text-sm font-medium mb-1">Email</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        :aria-invalid="!!errors.email"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        :class="errors.email ? 'border-red-500' : 'border-gray-200'"
                        autocomplete="email"
                    />
                    <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                </div>

                <div class="mb-4">
                    <label for="password" class="block text-sm font-medium mb-1">Password</label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        :aria-invalid="!!errors.password"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        :class="errors.password ? 'border-red-500' : 'border-gray-200'"
                        autocomplete="new-password"
                    />
                    <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                </div>

                <p v-if="errors.general" class="mb-4 text-sm text-red-600">{{ errors.general }}</p>

                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                >
                    <span v-if="!loading">Daftar</span>
                    <span v-else>Memproses...</span>
                </button>
            </form>

            <p class="mt-4 text-sm text-center text-gray-600">
                Sudah punya akun?
                <NuxtLink to="/login" class="text-indigo-600 hover:underline ml-1">Masuk</NuxtLink>
            </p>
        </section>
    </main>
</template>

<style scoped>
/* keep styles minimal; Tailwind covers most needs */
</style>