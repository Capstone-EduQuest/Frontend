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