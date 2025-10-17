<script setup lang="ts">

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
const { login, user, initSession } = useAuth()

definePageMeta({
  layout: 'blank',
  title: 'Login SiDawam',
  middleware: 'guest', 
})

useHead({
  title: 'Login SIDawam',
  meta: [
    { name: 'description', content: 'Login to your account on SiDawam' }
  ]
})

const toast = useToast()
const { $supabase } = useNuxtApp()
const supabase = $supabase as any

const fields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password'
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox' as const
  }
]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

onMounted(() => {
  initSession()
})

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await login(payload.data.email, payload.data.password)
    // Fetch user profile for role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.value?.id)
      .single()
    if (error) throw new Error(error.message)
    if (profile?.role === 'admin') {
      navigateTo('/admin')
    } else {
      navigateTo('/')
    }
    toast.add({
      title: 'Login successful',
      description: 'Welcome back!',
      color: 'success'
    })
  } catch (err: any) {
    toast.add({
      title: 'Login failed',
      description: err.message,
      color: 'error'
    })
  }
}
</script>


<template>
  <div class="px-4 flex flex-col items-center justify-center">
    <UAuthForm
      :schema="schema"
      :fields="fields"
      title="Selamat datang di SIDAWAM"
      icon="i-lucide-lock"
      @submit="onSubmit"
    >
      <template #description>
        Belum punya akun?
        <ULink to="/register" class="text-primary font-medium">Daftar disini</ULink>.
      </template>
      <template #footer>
        Kembali ke
        <ULink to="/" class="text-primary font-medium">Beranda</ULink>.
      </template>
    </UAuthForm>
  </div>
</template>
