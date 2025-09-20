<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

const page = ref(1)
const limit = ref(10)

const { data: res, pending, error, refresh } = await useAsyncData(
  'blogs',
  () => $fetch(`/api/blogs/?page=${page.value}&limit=${limit.value}`)
)

const blogs = computed(() => res.value?.data ?? [])
const total = computed(() => res.value?.pagination?.total ?? 0)
watchEffect(() => {
  refresh()
})
</script>

<template>
  <div class="space-y-6">
    <BlogCard
      v-for="(item, idx) in blogs"
      :key="item.id || idx"
      :title="item.title"
      :description="item.description"
      :image="item.image"
      :date="item.created_at"
      :to="`/blogs/${item.slug}`"
      :author-name="item.profiles?.full_name"
      :author-avatar="item.profiles?.avatar_url"
      :blog="item"
    />
  </div>

  <div class="mt-6 flex justify-center">
    <UPagination
      v-model:page="page"
      active-color="primary"
      active-variant="subtle"
      :total="total"
      :page-size="limit"
    />
  </div>
</template>
