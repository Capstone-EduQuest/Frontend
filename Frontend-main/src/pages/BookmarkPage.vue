<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { bookmarkAPI, type BookmarkItem } from '../api/bookmark'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const auth = useAuthStore()
const bookmarks = ref<BookmarkItem[]>([])
const error = ref('')

onMounted(async () => {
  await auth.restoreAuth(route.path)
  if (!auth.state.user) {
    error.value = '로그인이 필요한 기능입니다.'
    return
  }

  try {
    const response = await bookmarkAPI.getBookmarkList(auth.state.user.uuid, { page: 1, size: 50, sort: 'created_at', is_asc: false })
    bookmarks.value = response.results
  } catch (fetchError) {
    console.error(fetchError)
    error.value = '북마크를 불러오는데 실패했습니다.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-10 font-sans">
    <div class="mx-auto max-w-6xl space-y-6">
      <PageHeader title="북마크" subtitle="중요한 개념과 게시물을 한 곳에 모아두고 빠르게 다시 열어보세요." back-link="/" />

      <div v-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>

      <section v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in bookmarks"
          :key="item.uuid ?? item.problem?.uuid ?? `${item.stage}-${item.number}`"
          class="rounded-3xl border-4 border-gray-900 bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-black text-gray-900">{{ item.problem?.summary ?? `Stage ${item.stage ?? '-'}` }}</h2>
            <span class="text-sm uppercase tracking-[0.2em] text-gray-500">{{ item.type ?? '문제' }}</span>
          </div>
          <p class="mt-4 text-gray-600">문제 번호: {{ item.problem?.number ?? item.number ?? '-' }}</p>
        </article>
      </section>
    </div>
  </div>
</template>
