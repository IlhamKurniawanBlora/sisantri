<script setup lang="ts">

import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
const { register, initSession } = useAuth()

definePageMeta({
  layout: 'blank',
  middleware: 'guest',
})

useHead({
  title: 'Register - SiDawam',
  meta: [
    { name: 'description', content: 'Register a new account on SiDawam' }
  ]
})

const toast = useToast()

const fields = [
  {
    name: 'name',
    type: 'text' as const,
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true
  },
  {
    name: 'phone',
    type: 'text' as const,
    label: 'Phone Number',
    placeholder: 'Enter your phone number',
    required: true
  },
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
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password' as const,
    placeholder: 'Confirm your password'
  }
]

const schema = z.object({
  name: z.string().min(3, 'Name is required'),
  phone: z.string().min(10, 'Phone number is too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Must be at least 8 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

onMounted(() => {
  initSession()
})

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await register(
      payload.data.email,
      payload.data.password,
      payload.data.name,
      payload.data.phone
    )
    toast.add({
      title: 'Registration successful',
      description: 'Please check your email to confirm your account.',
      color: 'success'
    })
    navigateTo('/login')
  } catch (err: any) {
    toast.add({
      title: 'Registration failed',
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
      title="Daftar Akun Baru"
      icon="i-lucide-user-plus"
      @submit="onSubmit"
    >
      <template #description>
        Sudah memiliki akun?
        <ULink to="/login" class="text-primary font-medium">Masuk</ULink>.
      </template>
      <template #footer>
        Kembali ke
        <ULink to="/" class="text-primary font-medium">Beranda</ULink>.
      </template>
    </UAuthForm>
  </div>
</template>

