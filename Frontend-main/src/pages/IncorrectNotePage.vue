<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { wrongNoteAPI, type WrongNote } from '../api/wrong_note'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const incorrectNotes = ref<WrongNote[]>([])
const error = ref('')
const loadingFeedback = ref<Record<string, boolean>>({})

const loadWrongNotes = async () => {
  if (!auth.state.user) {
    error.value = '로그인이 필요한 기능입니다.'
    return
  }

  const response = await wrongNoteAPI.getUserWrongNotes(auth.state.user.uuid, {
    page: 0,
    size: 50,
    sort: 'created_at',
    is_asc: false,
  })

  incorrectNotes.value = response.results
}

onMounted(async () => {
  await auth.restoreAuth(route.path)

  try {
    await loadWrongNotes()
  } catch (fetchError) {
    console.error(fetchError)
    error.value = '오답노트를 불러오지 못했습니다.'
  }
})

const requestAIFeedback = async (note: WrongNote) => {
  if (!note.uuid) return

  loadingFeedback.value[note.uuid] = true

  try {
    await wrongNoteAPI.requestAiFeedback(note.uuid)
    const refreshed = await wrongNoteAPI.getWrongNote(note.uuid)
    note.feedback = refreshed.feedback
    note.is_reviewed = refreshed.is_reviewed
  } catch (requestError) {
    console.error('AI 피드백 요청 실패:', requestError)
    alert('AI 피드백을 불러오는데 실패했습니다.')
  } finally {
    loadingFeedback.value[note.uuid] = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF] font-sans">
    <PageHeader
      title="오답노트"
      subtitle="틀린 답안과 AI 피드백을 다시 확인하면서 취약한 부분을 복습해 보세요."
      back-link="/"
    />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        v-if="error"
        class="rounded-[28px] border-4 border-[#F7A5A5] bg-white p-6 font-bold text-[#1A2A4F] shadow-[8px_8px_0_0_rgba(26,42,79,0.1)]"
      >
        {{ error }}
      </div>

      <section v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="note in incorrectNotes"
          :key="note.uuid"
          class="flex flex-col rounded-[32px] border-4 border-[#1A2A4F] bg-white p-6 shadow-[8px_8px_0_0_rgba(26,42,79,0.14)] transition-transform hover:-translate-y-1"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-2xl font-black text-[#1A2A4F]">
              {{ note.problem_id ? `Problem ${note.problem_id} 오답` : '오답 기록' }}
            </h2>
            <span
              class="rounded-full border-2 border-[#1A2A4F] bg-[#FFF2EF] px-3 py-1 text-xs font-black tracking-widest text-[#1A2A4F]"
            >
              {{ note.is_reviewed ? 'REVIEWED' : 'PENDING' }}
            </span>
          </div>

          <div class="mt-4 flex flex-1 flex-col space-y-4">
            <div class="whitespace-pre-wrap rounded-[24px] border-4 border-[#1A2A4F] bg-[#1A2A4F] p-4 font-mono text-sm text-gray-100">
              {{ note.wrong_answer || '제출한 코드가 없습니다.' }}
            </div>

            <div class="flex flex-1 flex-col rounded-[24px] border-4 border-[#1A2A4F] bg-[#FFF2EF] p-4 text-sm text-[#1A2A4F]">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-base font-black">AI 튜터</p>

                <button
                  v-if="!note.feedback"
                  :disabled="loadingFeedback[note.uuid]"
                  class="rounded-full border-2 border-[#1A2A4F] bg-[#FFDBB6] px-4 py-1.5 text-xs font-black text-[#1A2A4F] transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  @click="requestAIFeedback(note)"
                >
                  <span v-if="loadingFeedback[note.uuid]" class="flex items-center gap-2">
                    <span class="h-3 w-3 animate-spin rounded-full border-2 border-[#1A2A4F] border-t-transparent"></span>
                    분석 중...
                  </span>
                  <span v-else>피드백 받기</span>
                </button>
              </div>

              <div v-if="note.feedback" class="flex-1">
                <pre class="whitespace-pre-wrap font-sans font-medium leading-relaxed">{{ note.feedback }}</pre>
              </div>

              <div
                v-else-if="loadingFeedback[note.uuid]"
                class="flex flex-1 items-center justify-center py-4 text-center font-bold text-[#1A2A4F]/60 animate-pulse"
              >
                AI 튜터가 오답을 분석하고 있습니다...
              </div>
              <div v-else class="flex flex-1 items-center justify-center py-4 text-center font-bold text-[#1A2A4F]/40">
                버튼을 눌러 AI 피드백을 받아 보세요.
              </div>
            </div>

            <div class="flex items-end justify-between gap-3">
              <button
                v-if="note.problem_id"
                class="shrink-0 rounded-[14px] border-2 border-[#1A2A4F] bg-[#F7A5A5] px-4 py-2 text-sm font-black text-[#1A2A4F] transition hover:-translate-y-0.5 active:translate-y-0"
                @click="router.push('/game?problem=' + note.problem_id)"
              >
                🔄 다시 풀기
              </button>
              <p class="ml-auto text-right text-xs font-bold text-slate-400">
                마지막 시도: {{ note.last_submitted_at ?? note.created_at ?? '-' }}
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>