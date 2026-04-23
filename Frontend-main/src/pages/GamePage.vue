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
  total_question_count: number
}

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
    console.error('진행도 데이터를 불러오지 못했습니다.', error)
  }
}

const handleStageSelect = async (stage: Stage) => {
  selectedStage.value = stage
  selectedProblemId.value = null

  try {
    const response = await problemAPI.getProblemsByStage(stage.number)
    if (response.results.length > 0) {
      selectedProblemId.value = response.results[0].uuid
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
    total: progress.total_question_count,
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
  <div v-if="selectedProblemId" class="flex min-h-screen flex-col bg-gray-900 font-sans">
    <PageHeader :title="`EduQuest - ${selectedStage?.title ?? ''}`" back-label="스테이지로 돌아가기" @back="selectedProblemId = null">
      <template #rightAction>
        <button type="button" class="font-bold text-gray-300 hover:text-white" @click="router.push('/')">홈으로</button>
      </template>
    </PageHeader>

    <main class="flex flex-1 items-center justify-center p-4">
      <div class="w-full max-w-5xl">
        <CodeProblem :problem-id="selectedProblemId" />
      </div>
    </main>
  </div>

  <div v-else class="flex min-h-screen flex-col bg-gray-900 font-sans">
    <PageHeader title="EduQuest 스테이지 선택" back-link="/" />

    <main class="flex-1 p-8">
      <div class="mx-auto max-w-6xl">
        <h1 class="mb-8 text-center text-3xl font-bold text-white">프로그래밍 모험을 시작하세요</h1>

        <div v-if="isLoading" class="text-center text-white">
          <div class="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-400" />
          <p>스테이지를 불러오는 중...</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="stage in stages"
            :key="stage.uuid"
            type="button"
            class="rounded-2xl border-2 border-gray-600 bg-gray-800 p-6 text-left transition-all hover:scale-105 hover:border-blue-400"
            @click="handleStageSelect(stage)"
          >
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-xl font-bold text-white">{{ stage.title }}</h3>
              <span v-if="getStageProgress(stage.number).completed === getStageProgress(stage.number).total && getStageProgress(stage.number).total > 0" class="text-2xl text-green-400">✓</span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-blue-400">
                진행률 {{ getStageProgress(stage.number).completed }} / {{ getStageProgress(stage.number).total }}
              </span>
              <span class="text-gray-400">보상: {{ stage.reward ?? 0 }} 포인트</span>
            </div>

            <div v-if="getStageProgress(stage.number).total > 0" class="mt-4 h-2 rounded-full bg-gray-700">
              <div
                class="h-2 rounded-full bg-blue-500 transition-all"
                :style="{ width: `${(getStageProgress(stage.number).completed / getStageProgress(stage.number).total) * 100}%` }"
              />
            </div>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
