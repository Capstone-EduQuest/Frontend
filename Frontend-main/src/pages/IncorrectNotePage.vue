<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { wrongNoteAPI, type WrongNote } from '../api/wrong_note'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const auth = useAuthStore()
const incorrectNotes = ref<WrongNote[]>([])
const error = ref('')

onMounted(async () => {
  await auth.restoreAuth(route.path)
  if (!auth.state.user) {
    error.value = '로그인이 필요한 기능입니다.'
    return
  }

  try {
    const response = await wrongNoteAPI.getUserWrongNotes(auth.state.user.uuid, { page: 1, size: 50, sort: 'created_at', is_asc: false })
    incorrectNotes.value = response.results
  } catch (fetchError) {
    console.error(fetchError)
    error.value = '오답노트를 불러오지 못했습니다.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-10 font-sans">
    <div class="mx-auto max-w-6xl space-y-6">
      <PageHeader title="오답노트" subtitle="틀린 문제와 정답, 그리고 왜 틀렸는지를 다시 확인해 보세요." back-link="/" />

      <div v-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>

      <section v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="note in incorrectNotes"
          :key="note.uuid"
          class="rounded-3xl border-4 border-gray-900 bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-2xl font-black text-gray-900">{{ note.problem_uuid ?? '오답 기록' }}</h2>
            <span class="text-sm uppercase tracking-[0.3em] text-gray-500">오답 분석</span>
          </div>
          <div class="mt-4 space-y-4">
            <div class="rounded-3xl bg-gray-900 p-4 font-mono text-sm text-gray-100 whitespace-pre-wrap">{{ note.wrong_answer }}</div>
            <div class="rounded-3xl bg-gray-100 p-4 text-sm text-gray-800">
              <p class="mb-2 font-bold">정답</p>
              <pre class="whitespace-pre-wrap">{{ note.correct_answer ?? '-' }}</pre>
            </div>
            <p class="text-gray-600">해설: {{ note.ai_explanation ?? '해설 없음' }}</p>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>
