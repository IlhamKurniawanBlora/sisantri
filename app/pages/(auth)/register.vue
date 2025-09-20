<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'blank',
  title: 'Registrasi Sisantri'
})

useHead({
  title: 'Register - Sisantri',
  meta: [
    {
      name: 'description',
      content: 'Register a new account on Sisantri'
    }
  ]
})

const toast = useToast()

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Full Name',
  placeholder: 'Enter your full name',
  required: true
}, {
  name: 'phone',
  type: 'text' as const,
  label: 'Phone Number',
  placeholder: 'Enter your phone number',
  required: true
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'confirmPassword',
  label: 'Confirm Password',
  type: 'password' as const,
  placeholder: 'Confirm your password'
}]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
}
</script>

<template>
  <div class="px-4 flex flex-col items-center justify-center">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="Register your account"
        icon="i-lucide-user"
        @submit="onSubmit"
      >
        <template #description>
          Sudah memiliki akun? <ULink to="/login" class="text-primary font-medium">Sign In</ULink>.
        </template>
      </UAuthForm>
  </div>
</template>

