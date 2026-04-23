<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import { communityAnswerAPI, communityPostAPI, type CommunityAnswer, type CommunityPost } from '../api/community'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const questions = ref<CommunityPost[]>([])
const selectedQuestion = ref<CommunityPost | null>(null)
const answers = ref<CommunityAnswer[]>([])
const newQuestionTitle = ref('')
const newQuestionContent = ref('')
const newAnswerContent = ref('')
const isLoading = ref(false)
const showQuestionForm = ref(false)

const displayUser = (user?: { nickname?: string; user_id?: string }) => user?.nickname ?? user?.user_id ?? '익명'

const fetchQuestions = async () => {
  const response = await communityPostAPI.getPostList({ page: 1, size: 50, sort: 'created_at', is_asc: false })
  questions.value = response.results
}

const handleQuestionClick = async (question: CommunityPost) => {
  selectedQuestion.value = await communityPostAPI.getPost(question.uuid)
  const response = await communityAnswerAPI.getAnswerList(question.uuid, { page: 1, size: 50, is_asc: true })
  answers.value = response.results
}

const handleCreateQuestion = async () => {
  isLoading.value = true
  try {
    await communityPostAPI.createPost({ title: newQuestionTitle.value, content: newQuestionContent.value })
    showQuestionForm.value = false
    newQuestionTitle.value = ''
    newQuestionContent.value = ''
    await fetchQuestions()
  } finally {
    isLoading.value = false
  }
}

const handleCreateAnswer = async () => {
  if (!selectedQuestion.value) return
  isLoading.value = true
  try {
    await communityAnswerAPI.createAnswer(selectedQuestion.value.uuid, { content: newAnswerContent.value })
    newAnswerContent.value = ''
    await handleQuestionClick(selectedQuestion.value)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await auth.restoreAuth(route.path)
  await fetchQuestions()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF]">
    <PageHeader
      title="커뮤니티"
      :subtitle="selectedQuestion ? '답변을 읽고 내가 아는 것도 함께 나눠 보세요.' : '궁금한 것을 편하게 물어보고, 다른 친구들의 질문도 구경해 보세요.'"
      :back-link="selectedQuestion ? undefined : '/'"
      @back="selectedQuestion = null"
    >
      <template #rightAction>
        <button
          v-if="!selectedQuestion"
          type="button"
          class="rounded-full bg-[#F7A5A5] px-4 py-2 text-sm font-black text-[#1A2A4F]"
          @click="showQuestionForm = !showQuestionForm"
        >
          질문 쓰기
        </button>
        <button v-else type="button" class="text-sm font-black text-[#1A2A4F]" @click="router.push('/')">
          홈으로
        </button>
      </template>
    </PageHeader>

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <template v-if="selectedQuestion">
        <div class="rounded-[30px] border border-[#1A2A4F]/10 bg-white p-7 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
          <div class="inline-flex rounded-full bg-[#FFF2EF] px-4 py-2 text-sm font-bold text-[#1A2A4F]">
            작성자 {{ displayUser(selectedQuestion.user ?? selectedQuestion.member) }}
          </div>
          <h1 class="mt-4 text-3xl font-black text-[#1A2A4F]">{{ selectedQuestion.title }}</h1>
          <p class="mt-4 whitespace-pre-line text-base leading-7 text-slate-700">{{ selectedQuestion.content }}</p>
        </div>

        <div class="mt-6 space-y-4">
          <h2 class="text-2xl font-black text-[#1A2A4F]">답변 {{ answers.length }}개</h2>
          <div v-for="answer in answers" :key="answer.uuid" class="rounded-[28px] border border-[#FFDBB6] bg-white p-5 shadow-[0_14px_30px_rgba(26,42,79,0.06)]">
            <p class="text-sm font-bold text-slate-500">작성자 {{ displayUser(answer.user ?? answer.member) }}</p>
            <p class="mt-3 whitespace-pre-line leading-7 text-slate-700">{{ answer.content }}</p>
          </div>
        </div>

        <div class="mt-6 rounded-[30px] border border-[#F7A5A5] bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
          <h3 class="text-xl font-black text-[#1A2A4F]">나도 답변해 보기</h3>
          <textarea
            v-model="newAnswerContent"
            placeholder="친구에게 알려주고 싶은 내용을 편하게 적어 보세요."
            class="mt-4 h-36 w-full resize-none rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] p-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]"
          />
          <div class="mt-4 flex justify-end">
            <button type="button" :disabled="isLoading" class="rounded-full bg-[#1A2A4F] px-6 py-3 font-black text-[#FFF2EF] hover:bg-[#233868]" @click="handleCreateAnswer">
              답변 등록
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="showQuestionForm" class="mb-6 rounded-[30px] border border-[#F7A5A5] bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
          <h2 class="text-2xl font-black text-[#1A2A4F]">새 질문 쓰기</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">제목은 짧고 분명하게, 내용은 천천히 자세히 적어 보세요.</p>
          <div class="mt-5 space-y-4">
            <input
              v-model="newQuestionTitle"
              type="text"
              placeholder="예: for문이 왜 반복되는지 궁금해요"
              class="w-full rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] p-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]"
            >
            <textarea
              v-model="newQuestionContent"
              placeholder="어디가 헷갈렸는지, 어떤 걸 해 봤는지 적어 주세요."
              class="h-40 w-full resize-none rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] p-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]"
            />
            <div class="flex justify-end gap-3">
              <button type="button" class="rounded-full border border-[#1A2A4F] px-5 py-3 font-bold text-[#1A2A4F]" @click="showQuestionForm = false">
                취소
              </button>
              <button type="button" :disabled="isLoading" class="rounded-full bg-[#1A2A4F] px-5 py-3 font-black text-[#FFF2EF]" @click="handleCreateQuestion">
                질문 등록
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-5">
          <div
            v-for="question in questions"
            :key="question.uuid"
            class="cursor-pointer rounded-[30px] border border-[#1A2A4F]/10 bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)] transition hover:-translate-y-1"
            @click="handleQuestionClick(question)"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="inline-flex rounded-full bg-[#FFF2EF] px-3 py-1 text-xs font-bold text-[#1A2A4F]">
                  작성자 {{ displayUser(question.user ?? question.member) }}
                </p>
                <h3 class="mt-3 text-2xl font-black text-[#1A2A4F]">{{ question.title }}</h3>
                <p class="mt-3 line-clamp-3 leading-7 text-slate-600">{{ question.content }}</p>
              </div>
              <div class="rounded-[22px] bg-[#FFDBB6] px-4 py-3 text-center text-sm font-bold text-[#1A2A4F]">
                질문 보기
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
