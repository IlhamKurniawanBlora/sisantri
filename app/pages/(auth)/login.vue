<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'blank',
  title: 'Login Sisantri'
})

useHead({
  title: 'Login - Sisantri',
  meta: [
    { name: 'description', content: 'Login to your account on Sisantri' }
  ]
})

const toast = useToast()

const { login } = useAuth()

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

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    await login(payload.data.email, payload.data.password)

    toast.add({
      title: 'Login successful',
      description: 'Welcome back!',
      color: 'success'
    })

    navigateTo('/')
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
      title="Welcome back!"
      icon="i-lucide-lock"
      @submit="onSubmit"
    >
      <template #description>
        Don't have an account?
        <ULink to="/register" class="text-primary font-medium">Sign up</ULink>.
      </template>
      <template #footer>
        By signing in, you agree to our
        <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
      </template>
    </UAuthForm>
  </div>
</template>
