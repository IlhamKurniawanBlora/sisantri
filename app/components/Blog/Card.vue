<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  image?: string
  date?: string | Date
  to?: string
  target?: string
  authorName?: string
  authorAvatar?: string
  blog?: Record<string, any>
}>(), {
  title: '',
  description: '',
  image: '',
  date: '',
  to: '',
  target: '_self',
  authorName: '',
  authorAvatar: '',
  blog: () => ({})
})

const formattedDate = computed(() => {
  if (!props.date) return ''
  const d = typeof props.date === 'string' ? new Date(props.date) : props.date
  if (isNaN(d.getTime())) return String(props.date)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
})
</script>

<template>
  <UBlogPost
    :title="props.title"
    :description="props.description"
    :image="props.image"
    :date="formattedDate"
    :to="props.to"
    :target="props.target"
    :author-name="props.authorName"
    :author-avatar="props.authorAvatar"
    :blog="props.blog"
  />
</template>
