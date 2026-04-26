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
    const response = await wrongNoteAPI.getUserWrongNotes(auth.state.user.uuid, {
      page: 0,
      size: 50,
      sort: 'created_at',
      is_asc: false,
    })
    incorrectNotes.value = response.results
  } catch (fetchError) {
    console.error(fetchError)
    error.value = '오답노트를 불러오지 못했습니다.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF]">
    <PageHeader
      title="오답노트"
      subtitle="틀린 답안과 AI 피드백을 다시 확인하면서 취약한 부분을 복습해 보세요."
      back-link="/"
    />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        v-if="error"
        class="rounded-[28px] border border-[#F7A5A5] bg-white p-6 text-[#1A2A4F] shadow-[0_18px_44px_rgba(26,42,79,0.08)]"
      >
        {{ error }}
      </div>

      <section v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="note in incorrectNotes"
          :key="note.uuid"
          class="rounded-[30px] border border-[#1A2A4F]/10 bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-2xl font-black text-[#1A2A4F]">
              {{ note.problem_id ? `문제 #${note.problem_id}` : '오답 기록' }}
            </h2>
            <span
              class="rounded-full bg-[#FFF2EF] px-3 py-1 text-xs font-black tracking-[0.18em] text-[#1A2A4F]/70"
            >
              {{ note.is_reviewed ? 'REVIEWED' : 'PENDING' }}
            </span>
          </div>
          <div class="mt-4 space-y-4">
            <div class="rounded-[24px] bg-[#1A2A4F] p-4 font-mono text-sm text-gray-100 whitespace-pre-wrap">
              {{ note.wrong_answer }}
            </div>
            <div class="rounded-[24px] bg-[#FFF2EF] p-4 text-sm text-[#1A2A4F]">
              <p class="mb-2 font-black">AI 피드백</p>
              <pre class="whitespace-pre-wrap font-sans">{{
                note.feedback ?? '아직 피드백이 없습니다.'
              }}</pre>
            </div>
            <p class="text-sm leading-6 text-slate-600">
              마지막 제출: {{ note.last_submitted_at ?? note.created_at ?? '-' }}
            </p>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>
