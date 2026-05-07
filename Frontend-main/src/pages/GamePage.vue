<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CodeProblem from '../components/CodeProblem.vue'
import FloatingNote from '../components/FloatingNote.vue'
import Navbar from '../components/Navbar.vue'
import PageHeader from '../components/PageHeader.vue'
import { problemAPI, stageAPI, type Stage } from '../api/learning'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const stages = ref<Stage[]>([])
const selectedStage = ref<Stage | null>(null)
const selectedProblemId = ref<string | null>(null)
const isLoading = ref(false)
const pageError = ref('')

const unitySrc = computed(() => '/unity/EduQuest/index.html')
const stageQuery = computed(() => Number(route.query.stage ?? 0))
const problemQuery = computed(() => String(route.query.problem ?? '').trim())
const isUnityMode = computed(() => !stageQuery.value && !problemQuery.value)

const loadStages = async () => {
  const response = await stageAPI.getStageList({ page: 1, size: 100, sort: 'number', is_asc: true })
  stages.value = response.results
}

const loadProblemMode = async () => {
  await loadStages()

  if (problemQuery.value) {
    selectedProblemId.value = problemQuery.value
    return
  }

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

const loadPage = async () => {
  isLoading.value = true
  pageError.value = ''
  selectedStage.value = null
  selectedProblemId.value = null

  try {
    await auth.restoreAuth(route.path)

    if (!isUnityMode.value) {
      await loadProblemMode()
    }
  } catch (error) {
    console.error('failed to load game page:', error)
    pageError.value = isUnityMode.value
      ? '게임 화면을 불러오지 못했습니다.'
      : '문제를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.fullPath,
  async () => {
    await loadPage()
  }
)

onMounted(async () => {
  await loadPage()
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF]">
    <template v-if="isUnityMode">
      <Navbar />
      <PageHeader
        title="게임 플레이"
        back-link="/home"
      />

      <main class="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div
          v-if="pageError"
          class="luxe-card mb-6 p-5 text-sm font-medium text-[#1A2A4F]"
        >
          {{ pageError }}
        </div>

        <div v-else class="grid min-h-[78vh] gap-6 xl:grid-cols-[3fr_1fr]">
          <section class="luxe-panel min-h-0 overflow-hidden">
            <iframe
              :src="unitySrc"
              title="EduQuest Unity WebGL"
              class="h-full min-h-[78vh] w-full bg-white"
              allowfullscreen
            />
          </section>

          <aside class="min-h-[78vh]">
            <FloatingNote mode="panel" />
          </aside>
        </div>
      </main>
    </template>

    <template v-else>
      <PageHeader
        :title="selectedStage?.title ?? '게임 플레이'"
        subtitle="문제를 풀고 바로 다음 학습 흐름으로 이어가 보세요."
        back-link="/"
      >
        <template #rightAction>
          <button type="button" class="text-sm font-medium text-[#1A2A4F]" @click="router.push('/')">홈으로</button>
        </template>
      </PageHeader>

      <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          v-if="isLoading"
          class="luxe-panel p-10 text-center"
        >
          <div class="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-2 border-[#FFDBB6] border-b-[#1A2A4F]" />
          <p class="font-medium text-[#1A2A4F]">문제를 불러오는 중입니다.</p>
        </div>

        <div
          v-else-if="pageError"
          class="luxe-panel p-8 text-center"
        >
          <p class="font-medium text-[#1A2A4F]">{{ pageError }}</p>
        </div>

        <div
          v-else-if="selectedProblemId"
          class="luxe-panel p-4 sm:p-6"
        >
          <CodeProblem :problem-id="selectedProblemId" />
        </div>
      </main>
    </template>
  </div>
</template>
