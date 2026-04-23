<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import FloatingNote from './components/FloatingNote.vue'
import { useAuthStore } from './store/auth'

const route = useRoute()
const auth = useAuthStore()

watch(
  () => route.path,
  async (path) => {
    await auth.restoreAuth(path)
  },
  { immediate: true }
)
</script>

<template>
  <RouterView />
  <FloatingNote />
</template>
