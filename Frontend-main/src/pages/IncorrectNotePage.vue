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
  if (!note.uuid) {
    return
  }

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
  <div class="min-h-screen bg-[#FFF2EF]">
    <PageHeader
      title="오답노트"
      subtitle="틀린 답안과 AI 피드백을 다시 확인하면서 취약한 부분을 복습해 보세요."
      back-link="/home"
    />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        v-if="error"
        class="luxe-card mb-6 p-6 text-sm font-medium text-[#1A2A4F]"
      >
        {{ error }}
      </div>

      <section v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="note in incorrectNotes"
          :key="note.uuid"
          class="luxe-card flex flex-col p-6 transition duration-300 hover:translate-y-[-2px]"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-2xl font-black text-[#1A2A4F]">
              {{ note.problem_id ? `Problem ${note.problem_id} 오답` : '오답 기록' }}
            </h2>
            <span
              class="luxe-pill px-3 py-1 text-xs font-medium tracking-[0.14em] text-[#1A2A4F]"
            >
              {{ note.is_reviewed ? 'REVIEWED' : 'PENDING' }}
            </span>
          </div>

          <div class="mt-4 flex flex-1 flex-col gap-4">
            <div class="rounded-[24px] bg-[#1A2A4F] p-4 font-mono text-sm text-gray-100">
              {{ note.wrong_answer || '제출한 코드가 없습니다.' }}
            </div>

            <div class="flex flex-1 flex-col rounded-[24px] border border-[#1A2A4F]/10 bg-[#FFF8F4] p-4 text-sm text-[#1A2A4F]">
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-base font-black">AI 튜터</p>

                <button
                  v-if="!note.feedback"
                  :disabled="loadingFeedback[note.uuid]"
                  class="luxe-button-accent cursor-pointer rounded-full px-4 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
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
                class="flex flex-1 items-center justify-center py-4 text-center font-medium text-[#1A2A4F]/60 animate-pulse"
              >
                AI 튜터가 오답을 분석하고 있습니다...
              </div>
              <div v-else class="flex flex-1 items-center justify-center py-4 text-center font-medium text-[#1A2A4F]/40">
                버튼을 눌러 AI 피드백을 받아 보세요.
              </div>
            </div>

            <div class="flex items-end justify-between gap-3">
              <button
                v-if="note.problem_id"
                class="luxe-button-soft cursor-pointer rounded-full px-4 py-2 text-sm font-medium"
                @click="router.push('/game?problem=' + note.problem_id)"
              >
                다시 풀기
              </button>
              <p class="ml-auto text-right text-xs font-medium text-slate-400">
                마지막 시도: {{ note.last_submitted_at ?? note.created_at ?? '-' }}
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>
