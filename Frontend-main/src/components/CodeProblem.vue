<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { hintAPI, problemAPI, submissionAPI, type ProblemDetail } from '../api/learning'

const props = defineProps<{
  problemId?: string | null
}>()

const router = useRouter()
const problem = ref<ProblemDetail | null>(null)
const code = ref('# 여기에 Python 코드를 작성하세요.\nprint("Hello, World!")')
const blockAnswer = ref<number[]>([])
const hintMessage = ref('')
const submissionResult = ref<{ success: boolean; message: string } | null>(null)
const isLoading = ref(false)

const hasBlocks = computed(() => Boolean(problem.value?.blocks?.length))

const fetchProblem = async () => {
  if (!props.problemId) {
    return
  }

  try {
    problem.value = await problemAPI.getProblem(props.problemId)
    blockAnswer.value = []
    hintMessage.value = ''
    submissionResult.value = null
  } catch (error) {
    console.error('문제를 불러오지 못했습니다.', error)
    alert('문제를 불러오는데 실패했습니다.')
  }
}

const handleSubmit = async () => {
  if (!problem.value) {
    return
  }

  const answer = hasBlocks.value && blockAnswer.value.length > 0 ? blockAnswer.value : code.value
  if (typeof answer === 'string' && !answer.trim()) {
    return
  }

  isLoading.value = true
  submissionResult.value = null

  try {
    const response = await submissionAPI.submitProblem(problem.value.uuid, answer)
    submissionResult.value = {
      success: response.result,
      message: response.result ? '정답입니다.' : '오답입니다. 다시 도전해 보세요.',
    }

    if (response.result) {
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (error: any) {
    submissionResult.value = {
      success: false,
      message: error.response?.data?.details ?? error.response?.data?.message ?? '제출에 실패했습니다.',
    }
  } finally {
    isLoading.value = false
  }
}

const handleHint = async (level: number) => {
  if (!problem.value) {
    return
  }

  try {
    const response = await hintAPI.getHint(problem.value.uuid, level)
    hintMessage.value = response.hint
  } catch (error: any) {
    hintMessage.value = error.response?.data?.details ?? '힌트를 불러오지 못했습니다.'
  }
}

const appendBlock = (index: number) => {
  blockAnswer.value = [...blockAnswer.value, index]
}

watch(() => props.problemId, fetchProblem, { immediate: true })
onMounted(fetchProblem)
</script>

<template>
  <div v-if="!problem" class="rounded-2xl border-4 border-dashed border-gray-600 bg-gray-800 p-10 text-center text-white">
    <h2 class="mb-4 text-3xl font-bold">문제 로딩 중...</h2>
    <div class="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-400" />
  </div>

  <div v-else class="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border-4 border-gray-600 bg-gray-800 p-8 text-white">
    <div class="mb-6 shrink-0">
      <h2 class="mb-2 text-2xl font-bold text-blue-400">문제 {{ problem.number }}</h2>
      <p class="mb-4 whitespace-pre-line text-gray-300">{{ problem.summary }}</p>

      <div v-if="problem.example" class="mb-4 rounded-lg bg-gray-700 p-4">
        <h3 class="mb-2 font-bold text-green-400">예제 입력</h3>
        <pre class="text-sm text-gray-200">{{ problem.example }}</pre>
      </div>

      <div v-if="problem.expectedOutput" class="rounded-lg bg-gray-700 p-4">
        <h3 class="mb-2 font-bold text-green-400">예제 출력</h3>
        <pre class="text-sm text-gray-200">{{ problem.expectedOutput }}</pre>
      </div>
    </div>

    <div class="flex min-h-0 flex-1 flex-col">
      <div v-if="hasBlocks" class="mb-4 rounded-xl bg-gray-900 p-4">
        <p class="mb-3 text-sm text-gray-300">블록 문제인 경우 클릭 순서대로 답안을 만들 수 있습니다.</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(block, index) in problem.blocks"
            :key="`${index}-${block.code}`"
            type="button"
            class="rounded-lg bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600"
            @click="appendBlock(index + 1)"
          >
            {{ index + 1 }}. {{ block.code }}
          </button>
        </div>
        <p class="mt-3 text-sm text-blue-300">선택 순서: {{ blockAnswer.join(', ') || '아직 없음' }}</p>
      </div>

      <textarea
        v-model="code"
        class="w-full flex-1 resize-none rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Python 코드를 작성하세요..."
      />

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="level in [1, 2, 3]"
          :key="level"
          type="button"
          class="rounded-lg border border-blue-400 px-3 py-2 text-sm text-blue-300 hover:bg-blue-400 hover:text-white"
          @click="handleHint(level)"
        >
          힌트 {{ level }}
        </button>
      </div>

      <div v-if="hintMessage" class="mt-4 rounded-lg bg-blue-950 p-4 text-sm text-blue-100">
        {{ hintMessage }}
      </div>

      <div
        v-if="submissionResult"
        class="mt-4 rounded-lg p-4"
        :class="submissionResult.success ? 'bg-green-800' : 'bg-red-800'"
      >
        <h3 class="font-bold">{{ submissionResult.success ? '제출 성공' : '제출 실패' }}</h3>
        <p class="mt-2 text-sm">{{ submissionResult.message }}</p>
      </div>

      <div class="mt-4 flex gap-4">
        <button type="button" disabled class="flex-1 cursor-not-allowed rounded-lg bg-blue-400 px-6 py-3 font-bold text-white">
          코드 실행 (백엔드 미지원)
        </button>
        <button
          type="button"
          :disabled="isLoading"
          class="flex-1 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition-colors hover:bg-green-500 disabled:bg-gray-600"
          @click="handleSubmit"
        >
          {{ isLoading ? '제출 중...' : '답안 제출' }}
        </button>
      </div>
    </div>
  </div>
</template>
