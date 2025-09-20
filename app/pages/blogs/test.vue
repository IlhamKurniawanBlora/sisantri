<script setup lang="ts">
const supabase = useNuxtApp().$supabase
const blogs = ref<any[]>([])

onMounted(async () => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')

  if (error) {
    console.error(error)
  } else {
    blogs.value = data
  }
})
</script>

<template>
  <div>
    <h1>Blog</h1>
    <pre>{{ blogs }}</pre>
  </div>
</template>
