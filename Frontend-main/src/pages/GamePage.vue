<<<<<<< HEAD
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CodeProblem from '../components/CodeProblem.vue'
import PageHeader from '../components/PageHeader.vue'
import { problemAPI, stageAPI, type Stage } from '../api/learning'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const stages = ref<Stage[]>([])
const selectedStage = ref<Stage | null>(null)
const selectedProblemId = ref<string | null>(null)
const isLoading = ref(true)
const pageError = ref('')

const stageQuery = computed(() => Number(route.query.stage ?? 0))

const loadStages = async () => {
  const response = await stageAPI.getStageList({ page: 1, size: 100, sort: 'number', is_asc: true })
  stages.value = response.results
}

const loadGameData = async () => {
  const targetStageNumber = stageQuery.value || 1
  const matchedStage = stages.value.find((stage) => stage.number === targetStageNumber)

  if (!matchedStage) {
    throw new Error(`stage ${targetStageNumber} not found`)
  }

  selectedStage.value = matchedStage

  const problems = await problemAPI.getProblemsByStage(targetStageNumber)
  if (!problems.length) {
    throw new Error(`no problems for stage ${targetStageNumber}`)
  }

  selectedProblemId.value = problems[0].uuid
}

onMounted(async () => {
  isLoading.value = true
  pageError.value = ''

  try {
    await auth.restoreAuth(route.path)
    await loadStages()
    await loadGameData()
  } catch (error) {
    console.error('failed to load game page:', error)
    pageError.value = '게임 문제를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF]">
    <PageHeader
      :title="selectedStage?.title ?? '게임 플레이'"
      subtitle="문제를 풀고 바로 다음 학습 흐름으로 이어가 보세요."
      back-link="/"
    >
      <template #rightAction>
        <button type="button" class="text-sm font-black text-[#1A2A4F]" @click="router.push('/')">홈으로</button>
      </template>
    </PageHeader>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        v-if="isLoading"
        class="rounded-[30px] border-4 border-[#1A2A4F] bg-white p-10 text-center shadow-[8px_8px_0_0_rgba(26,42,79,0.14)]"
      >
        <div class="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#FFDBB6] border-b-[#1A2A4F]" />
        <p class="font-bold text-[#1A2A4F]">게임 문제를 불러오는 중입니다.</p>
      </div>

      <div
        v-else-if="pageError"
        class="rounded-[30px] border-4 border-[#1A2A4F] bg-white p-8 text-center shadow-[8px_8px_0_0_rgba(26,42,79,0.14)]"
      >
        <p class="font-bold text-[#1A2A4F]">{{ pageError }}</p>
      </div>

      <div
        v-else-if="selectedProblemId"
        class="rounded-[30px] border-4 border-[#1A2A4F] bg-white p-4 shadow-[8px_8px_0_0_rgba(26,42,79,0.14)] sm:p-6"
      >
        <CodeProblem :problem-id="selectedProblemId" />
      </div>
    </main>
  </div>
</template>
=======
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CodeProblem from '../components/CodeProblem.vue'
import PageHeader from '../components/PageHeader.vue'
import { progressAPI, problemAPI, stageAPI, type Stage } from '../api/learning'
import { useAuthStore } from '../store/auth'

interface StageProgress {
  stage: string | number
  clear: number[]
  total_question_count?: number
  totalQuestionCount?: number
}

const getProgressTotalCount = (progress: StageProgress) =>
  progress.totalQuestionCount ?? progress.total_question_count ?? 0

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const stages = ref<Stage[]>([])
const selectedStage = ref<Stage | null>(null)
const selectedProblemId = ref<string | null>(null)
const stageProgress = ref<Record<number, StageProgress>>({})
const isLoading = ref(true)

const loadStages = async () => {
  try {
    const response = await stageAPI.getStageList({ page: 1, size: 100, sort: 'number', is_asc: true })
    stages.value = response.results
  } catch (error) {
    console.error('스테이지 목록을 불러오지 못했습니다.', error)
  } finally {
    isLoading.value = false
  }
}

const loadProgress = async () => {
  if (!auth.state.user) {
    return
  }

  try {
    const response = await progressAPI.getProgress(auth.state.user.uuid)
    const progressMap: Record<number, StageProgress> = {}
    response.results.forEach((progress) => {
      const stageNumber = Number(progress.stage)
      progressMap[stageNumber] = progress
    })
    stageProgress.value = progressMap
  } catch (error) {
    console.error('진행 데이터을 불러오지 못했습니다.', error)
  }
}

const handleStageSelect = async (stage: Stage) => {
  selectedStage.value = stage
  selectedProblemId.value = null

  try {
    const response = await problemAPI.getProblemsByStage(stage.number)
    if (response.length > 0) {
      selectedProblemId.value = response[0].uuid
    }
  } catch (error) {
    console.error('문제 목록을 불러오지 못했습니다.', error)
    alert('해당 스테이지의 문제를 불러오는데 실패했습니다.')
  }
}

const stageQuery = computed(() => Number(route.query.stage ?? 0))

const getStageProgress = (stageNumber: number) => {
  const progress = stageProgress.value[stageNumber]
  if (!progress) {
    return { completed: 0, total: 0 }
  }

  return {
    completed: progress.clear.length,
    total: getProgressTotalCount(progress),
  }
}

onMounted(async () => {
  await auth.restoreAuth(route.path)
  await loadStages()
  await loadProgress()

  if (stageQuery.value) {
    const matched = stages.value.find((stage) => stage.number === stageQuery.value)
    if (matched) {
      await handleStageSelect(matched)
    }
  }
})
</script>

<template>
  <div v-if="selectedProblemId" class="min-h-screen bg-[#FFF2EF]">
    <PageHeader
      :title="selectedStage?.title ?? '스테이지'"
      subtitle="문제를 풀면서 다음 단계로 나아가 보세요."
      back-label="스테이지로 돌아가기"
      @back="selectedProblemId = null"
    >
      <template #rightAction>
        <button type="button" class="text-sm font-black text-[#1A2A4F]" @click="router.push('/')">홈으로</button>
      </template>
    </PageHeader>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-[30px] border border-[#1A2A4F]/10 bg-white p-4 shadow-[0_18px_44px_rgba(26,42,79,0.08)] sm:p-6">
        <CodeProblem :problem-id="selectedProblemId" />
      </div>
    </main>
  </div>

  <div v-else class="min-h-screen bg-[#FFF2EF]">
    <PageHeader
      title="스테이지"
      subtitle="현재 진행도를 확인하고 원하는 스테이지로 바로 도전해 보세요."
      back-link="/"
    />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="rounded-[30px] border border-[#1A2A4F]/10 bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
        <h2 class="text-2xl font-black text-[#1A2A4F]">단계별 학습 코스</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">현재까지 푼 문제 수와 진행률을 보면서 다음 스테이지를 선택해 보세요.</p>
      </div>

      <div v-if="isLoading" class="mt-6 rounded-[30px] border border-[#1A2A4F]/10 bg-white p-10 text-center shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
        <div class="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#FFDBB6] border-b-[#1A2A4F]" />
        <p class="font-bold text-[#1A2A4F]">스테이지를 불러오는 중입니다.</p>
      </div>

      <div v-else class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="stage in stages"
          :key="stage.uuid"
          type="button"
          class="rounded-[30px] border border-[#1A2A4F]/10 bg-white p-6 text-left shadow-[0_18px_44px_rgba(26,42,79,0.08)] transition hover:-translate-y-1"
          @click="handleStageSelect(stage)"
        >
          <div class="mb-4 flex items-center justify-between gap-4">
            <h3 class="text-2xl font-black text-[#1A2A4F]">{{ stage.title }}</h3>
            <span
              v-if="getStageProgress(stage.number).completed === getStageProgress(stage.number).total && getStageProgress(stage.number).total > 0"
              class="rounded-full bg-[#FFDBB6] px-3 py-1 text-xs font-black text-[#1A2A4F]"
            >
              완료
            </span>
          </div>

          <div class="flex items-center justify-between text-sm font-bold">
            <span class="text-[#1A2A4F]">
              진행률 {{ getStageProgress(stage.number).completed }} / {{ getStageProgress(stage.number).total }}
            </span>
            <span class="text-slate-500">보상: {{ stage.reward ?? 0 }} 코인</span>
          </div>

          <div v-if="getStageProgress(stage.number).total > 0" class="mt-4 h-3 rounded-full bg-[#FFF2EF]">
            <div
              class="h-3 rounded-full bg-[#F7A5A5] transition-all"
              :style="{ width: `${(getStageProgress(stage.number).completed / getStageProgress(stage.number).total) * 100}%` }"
            />
          </div>
        </button>
      </div>
    </main>
  </div>
</template>
>>>>>>> dc9be1146627a970017b0a2e1d363a30eb4fe06b
