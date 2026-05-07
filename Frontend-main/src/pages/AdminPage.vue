<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import PageHeader from '../components/PageHeader.vue'
import { problemAPI, stageAPI, type Stage } from '../api/learning'
import { useAuthStore } from '../store/auth'

type AdminTab = 'dashboard' | 'users' | 'stages' | 'problems' | 'notices'

interface SummaryCard {
  title: string
  value: string
  accent: string
}

interface AdminUserRow {
  nickname: string
  email: string
  joinedAt: string
  status: string
}

interface HintForm {
  level: number
  point: number
  content: string
}

const router = useRouter()
const auth = useAuthStore()
const activeTab = ref<AdminTab>('dashboard')

const isAdminRole = (role?: string | null) => {
  const normalized = role?.trim().toLowerCase()
  return normalized === 'admin' || normalized === 'admine' || normalized === 'role_admin'
}

const sidebarTabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'users', label: '유저 관리' },
  { id: 'stages', label: '스테이지 관리' },
  { id: 'problems', label: '문제 관리' },
  { id: 'notices', label: '공지사항 관리' },
]

const summaryCards = ref<SummaryCard[]>([
  { title: '총 가입자 수', value: '1,284', accent: 'bg-[#FFDBB6]' },
  { title: '총 누적 학습 횟수', value: '9,672', accent: 'bg-[#F7A5A5]' },
  { title: '활성 유저', value: '348', accent: 'bg-[#FFF2EF]' },
])

const users = ref<AdminUserRow[]>([
  { nickname: '코딩모험가', email: 'quest1@eduquest.com', joinedAt: '2026-04-12', status: '활성' },
  { nickname: '파이썬러너', email: 'runner@eduquest.com', joinedAt: '2026-04-08', status: '활성' },
  { nickname: '디버그요정', email: 'debug@eduquest.com', joinedAt: '2026-03-29', status: '휴면' },
  { nickname: '알고리즘새싹', email: 'sprout@eduquest.com', joinedAt: '2026-03-17', status: '활성' },
])

const noticeTitle = ref('')
const noticeContent = ref('')

const isStageLoading = ref(false)
const isProblemLoading = ref(false)
const stageMessage = ref('')
const problemMessage = ref('')
const stageError = ref('')
const problemError = ref('')
const stages = ref<Stage[]>([])

const stageTitle = ref('')
const stageNumber = ref<number | null>(null)
const stageReward = ref<number | null>(null)

const selectedStageUuid = ref('')
const problemType = ref('code')
const problemNumber = ref<number | null>(null)
const problemSummary = ref('')
const problemExample = ref('')
const problemExpectedOutput = ref('')
const blockAnswerInput = ref('1,2,3')
const blockItemsInput = ref('1: print("Hello")\n2: if x > 0:\n3: return x')
const hintForms = ref<HintForm[]>([
  { level: 1, point: 5, content: '' },
  { level: 2, point: 10, content: '' },
  { level: 3, point: 15, content: '' },
])

const stageOptions = computed(() =>
  stages.value.map((stage) => ({
    label: `Stage ${stage.number} · ${stage.title}`,
    value: stage.uuid,
  }))
)

const loadStages = async () => {
  const response = await stageAPI.getStageList({
    page: 1,
    size: 100,
    sort: 'number',
    is_asc: true,
  })

  stages.value = response.results
  if (!selectedStageUuid.value) {
    selectedStageUuid.value = response.results[0]?.uuid ?? ''
  }
}

const resetStageForm = () => {
  stageTitle.value = ''
  stageNumber.value = null
  stageReward.value = null
}

const resetProblemForm = () => {
  selectedStageUuid.value = stages.value[0]?.uuid ?? ''
  problemType.value = 'code'
  problemNumber.value = null
  problemSummary.value = ''
  problemExample.value = ''
  problemExpectedOutput.value = ''
  blockAnswerInput.value = '1,2,3'
  blockItemsInput.value = '1: print("Hello")\n2: if x > 0:\n3: return x'
  hintForms.value = [
    { level: 1, point: 5, content: '' },
    { level: 2, point: 10, content: '' },
    { level: 3, point: 15, content: '' },
  ]
}

const parseBlockPayload = () => {
  const answer = blockAnswerInput.value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item))

  const blocks = blockItemsInput.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [orderText, ...codeParts] = line.split(':')
      const parsedOrder = Number(orderText.trim())
      const order = Number.isNaN(parsedOrder) ? index + 1 : parsedOrder

      return {
        order,
        code: codeParts.join(':').trim() || line,
      }
    })

  return { answer, blocks }
}

const handleCreateStage = async () => {
  if (!stageTitle.value.trim() || stageNumber.value == null || stageReward.value == null) {
    stageError.value = '스테이지 제목, 번호, 보상 코인을 모두 입력해 주세요.'
    stageMessage.value = ''
    return
  }

  isStageLoading.value = true
  stageError.value = ''
  stageMessage.value = ''

  try {
    await stageAPI.createStage({
      title: stageTitle.value.trim(),
      number: stageNumber.value,
      reward: stageReward.value,
    })
    stageMessage.value = '스테이지가 생성되었습니다.'
    resetStageForm()
    await loadStages()
  } catch (error) {
    console.error(error)
    stageError.value = '스테이지 생성에 실패했습니다.'
  } finally {
    isStageLoading.value = false
  }
}

const handleCreateProblem = async () => {
  if (!selectedStageUuid.value || problemNumber.value == null || !problemSummary.value.trim()) {
    problemError.value = '스테이지, 문제 번호, 문제 요약은 필수입니다.'
    problemMessage.value = ''
    return
  }

  isProblemLoading.value = true
  problemError.value = ''
  problemMessage.value = ''

  try {
    const filteredHints = hintForms.value.filter((hint) => hint.content.trim())
    await problemAPI.createProblem({
      stage_uuid: selectedStageUuid.value,
      type: problemType.value.trim(),
      number: problemNumber.value,
      summary: problemSummary.value.trim(),
      example: problemExample.value.trim(),
      expectedOutput: problemExpectedOutput.value.trim(),
      block: parseBlockPayload(),
      hints: filteredHints.map((hint) => ({
        level: hint.level,
        point: hint.point,
        content: hint.content.trim(),
      })),
    })

    problemMessage.value = '문제가 생성되었습니다.'
    resetProblemForm()
  } catch (error) {
    console.error(error)
    problemError.value = '문제 생성에 실패했습니다. 블록 형식과 힌트 내용을 확인해 주세요.'
  } finally {
    isProblemLoading.value = false
  }
}

onMounted(async () => {
  await auth.restoreAuth('/admin')

  const role = auth.state.user?.role
  if (!isAdminRole(role)) {
    alert('관리자 권한이 없습니다.')
    await router.replace('/')
    return
  }

  try {
    await loadStages()
  } catch (error) {
    console.error(error)
    stageError.value = '스테이지 목록을 불러오지 못했습니다.'
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF]">
    <Navbar />
    <PageHeader
      title="관리자 페이지"
      subtitle="운영 현황을 확인하고 학습 콘텐츠를 직접 등록할 수 있습니다."
      @back="router.back()"
    />

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-5 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
          <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Admin Menu</p>
          <div class="mt-5 flex flex-col gap-3">
            <button
              v-for="tab in sidebarTabs"
              :key="tab.id"
              type="button"
              class="rounded-[20px] border-4 border-[#1A2A4F] px-4 py-4 text-left text-base font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition hover:-translate-y-0.5"
              :class="activeTab === tab.id ? 'bg-[#F7A5A5]' : 'bg-[#FFF2EF]'"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </aside>

        <section class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-6 shadow-[8px_8px_0_0_rgba(26,42,79,1)] sm:p-8">
          <template v-if="activeTab === 'dashboard'">
            <div class="flex flex-col gap-2">
              <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Dashboard</p>
              <h2 class="text-3xl font-black text-[#1A2A4F]">운영 요약</h2>
            </div>

            <div class="mt-8 grid gap-5 xl:grid-cols-3">
              <article
                v-for="card in summaryCards"
                :key="card.title"
                class="rounded-[24px] border-4 border-[#1A2A4F] p-6 shadow-[8px_8px_0_0_rgba(26,42,79,1)]"
                :class="card.accent"
              >
                <p class="text-sm font-black text-[#1A2A4F]/70">{{ card.title }}</p>
                <p class="mt-4 text-5xl font-black text-[#1A2A4F]">{{ card.value }}</p>
              </article>
            </div>
          </template>

          <template v-else-if="activeTab === 'users'">
            <div class="flex flex-col gap-2">
              <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Users</p>
              <h2 class="text-3xl font-black text-[#1A2A4F]">유저 관리</h2>
            </div>

            <div class="mt-8 overflow-hidden rounded-[24px] border-4 border-[#1A2A4F] shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
              <table class="w-full text-left">
                <thead class="bg-[#FFDBB6]">
                  <tr>
                    <th class="px-5 py-4 text-sm font-black text-[#1A2A4F]">닉네임</th>
                    <th class="px-5 py-4 text-sm font-black text-[#1A2A4F]">이메일</th>
                    <th class="px-5 py-4 text-sm font-black text-[#1A2A4F]">가입일</th>
                    <th class="px-5 py-4 text-sm font-black text-[#1A2A4F]">상태</th>
                    <th class="px-5 py-4 text-sm font-black text-[#1A2A4F]">관리</th>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <tr
                    v-for="user in users"
                    :key="`${user.email}-${user.joinedAt}`"
                    class="border-t-4 border-[#1A2A4F]/15"
                  >
                    <td class="px-5 py-4 font-bold text-[#1A2A4F]">{{ user.nickname }}</td>
                    <td class="px-5 py-4 text-[#1A2A4F]">{{ user.email }}</td>
                    <td class="px-5 py-4 text-[#1A2A4F]">{{ user.joinedAt }}</td>
                    <td class="px-5 py-4">
                      <span class="rounded-full border-2 border-[#1A2A4F] bg-[#FFF2EF] px-3 py-1 text-xs font-black text-[#1A2A4F]">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <button
                        type="button"
                        class="rounded-[14px] border-4 border-[#1A2A4F] bg-[#F7A5A5] px-4 py-2 text-sm font-black text-[#7A1D1D] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition hover:-translate-y-0.5"
                      >
                        추방
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <template v-else-if="activeTab === 'stages'">
            <div class="flex flex-col gap-2">
              <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Stage</p>
              <h2 class="text-3xl font-black text-[#1A2A4F]">스테이지 생성</h2>
            </div>

            <div class="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div class="rounded-[24px] border-4 border-[#1A2A4F] bg-[#FFF2EF] p-6 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
                <div class="space-y-5">
                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">스테이지 제목</label>
                    <input
                      v-model="stageTitle"
                      type="text"
                      placeholder="예: 조건문 기초"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    >
                  </div>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label class="mb-2 block text-sm font-black text-[#1A2A4F]">스테이지 번호</label>
                      <input
                        v-model.number="stageNumber"
                        type="number"
                        min="1"
                        class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                      >
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-black text-[#1A2A4F]">보상 코인</label>
                      <input
                        v-model.number="stageReward"
                        type="number"
                        min="0"
                        class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                      >
                    </div>
                  </div>

                  <p v-if="stageMessage" class="rounded-[18px] border-2 border-[#1A2A4F] bg-[#FFDBB6] px-4 py-3 text-sm font-black text-[#1A2A4F]">
                    {{ stageMessage }}
                  </p>
                  <p v-if="stageError" class="rounded-[18px] border-2 border-[#1A2A4F] bg-[#F7A5A5] px-4 py-3 text-sm font-black text-[#1A2A4F]">
                    {{ stageError }}
                  </p>

                  <div class="flex justify-end">
                    <button
                      type="button"
                      :disabled="isStageLoading"
                      class="rounded-[18px] border-4 border-[#1A2A4F] bg-[#F7A5A5] px-6 py-3 font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      @click="handleCreateStage"
                    >
                      {{ isStageLoading ? '생성 중...' : '스테이지 생성하기' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="rounded-[24px] border-4 border-[#1A2A4F] bg-white p-6 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-xl font-black text-[#1A2A4F]">등록된 스테이지</h3>
                  <button
                    type="button"
                    class="rounded-[14px] border-4 border-[#1A2A4F] bg-[#FFDBB6] px-4 py-2 text-sm font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)]"
                    @click="loadStages"
                  >
                    새로고침
                  </button>
                </div>

                <div class="mt-5 space-y-3">
                  <div
                    v-for="stage in stages"
                    :key="stage.uuid"
                    class="rounded-[18px] border-2 border-[#1A2A4F] bg-[#FFF2EF] p-4"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <p class="font-black text-[#1A2A4F]">Stage {{ stage.number }} · {{ stage.title }}</p>
                      <span class="rounded-full border-2 border-[#1A2A4F] bg-[#FFDBB6] px-3 py-1 text-xs font-black text-[#1A2A4F]">
                        {{ stage.reward }} coin
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'problems'">
            <div class="flex flex-col gap-2">
              <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Problem</p>
              <h2 class="text-3xl font-black text-[#1A2A4F]">문제 생성</h2>
            </div>

            <div class="mt-8 rounded-[24px] border-4 border-[#1A2A4F] bg-[#FFF2EF] p-6 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
              <div class="grid gap-5">
                <div class="grid gap-4 lg:grid-cols-3">
                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">연결 스테이지</label>
                    <select
                      v-model="selectedStageUuid"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    >
                      <option value="">스테이지 선택</option>
                      <option v-for="stage in stageOptions" :key="stage.value" :value="stage.value">{{ stage.label }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">문제 타입</label>
                    <input
                      v-model="problemType"
                      type="text"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    >
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">문제 번호</label>
                    <input
                      v-model.number="problemNumber"
                      type="number"
                      min="1"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    >
                  </div>
                </div>

                <div>
                  <label class="mb-2 block text-sm font-black text-[#1A2A4F]">문제 요약</label>
                  <input
                    v-model="problemSummary"
                    type="text"
                    placeholder="예: 두 수를 입력받아 큰 수를 출력하세요"
                    class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                  >
                </div>

                <div class="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">예시 입력</label>
                    <textarea
                      v-model="problemExample"
                      rows="5"
                      placeholder="3 5"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    />
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">예상 출력</label>
                    <textarea
                      v-model="problemExpectedOutput"
                      rows="5"
                      placeholder="5"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    />
                  </div>
                </div>

                <div class="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">블록 정답 순서</label>
                    <input
                      v-model="blockAnswerInput"
                      type="text"
                      placeholder="1,2,3"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    >
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-black text-[#1A2A4F]">블록 코드 목록</label>
                    <textarea
                      v-model="blockItemsInput"
                      rows="5"
                      placeholder="1: print(&quot;Hello&quot;)&#10;2: if x &gt; 0:&#10;3: return x"
                      class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                    />
                  </div>
                </div>

                <div class="rounded-[20px] border-4 border-[#1A2A4F] bg-white p-5">
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="text-lg font-black text-[#1A2A4F]">힌트 설정</h3>
                    <span class="text-xs font-black text-[#1A2A4F]/60">내용이 있는 힌트만 전송됩니다.</span>
                  </div>

                  <div class="mt-4 grid gap-4">
                    <div
                      v-for="hint in hintForms"
                      :key="hint.level"
                      class="rounded-[18px] border-2 border-[#1A2A4F] bg-[#FFF2EF] p-4"
                    >
                      <div class="grid gap-4 lg:grid-cols-[120px_140px_1fr]">
                        <div>
                          <label class="mb-2 block text-sm font-black text-[#1A2A4F]">레벨</label>
                          <input
                            v-model.number="hint.level"
                            type="number"
                            min="1"
                            class="w-full rounded-[14px] border-2 border-[#1A2A4F] bg-white px-3 py-2 text-[#1A2A4F] outline-none"
                          >
                        </div>

                        <div>
                          <label class="mb-2 block text-sm font-black text-[#1A2A4F]">소모 포인트</label>
                          <input
                            v-model.number="hint.point"
                            type="number"
                            min="0"
                            class="w-full rounded-[14px] border-2 border-[#1A2A4F] bg-white px-3 py-2 text-[#1A2A4F] outline-none"
                          >
                        </div>

                        <div>
                          <label class="mb-2 block text-sm font-black text-[#1A2A4F]">힌트 내용</label>
                          <input
                            v-model="hint.content"
                            type="text"
                            placeholder="힌트를 입력해 주세요"
                            class="w-full rounded-[14px] border-2 border-[#1A2A4F] bg-white px-3 py-2 text-[#1A2A4F] outline-none"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p v-if="problemMessage" class="rounded-[18px] border-2 border-[#1A2A4F] bg-[#FFDBB6] px-4 py-3 text-sm font-black text-[#1A2A4F]">
                  {{ problemMessage }}
                </p>
                <p v-if="problemError" class="rounded-[18px] border-2 border-[#1A2A4F] bg-[#F7A5A5] px-4 py-3 text-sm font-black text-[#1A2A4F]">
                  {{ problemError }}
                </p>

                <div class="flex justify-end">
                  <button
                    type="button"
                    :disabled="isProblemLoading"
                    class="rounded-[18px] border-4 border-[#1A2A4F] bg-[#F7A5A5] px-6 py-3 font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    @click="handleCreateProblem"
                  >
                    {{ isProblemLoading ? '등록 중...' : '문제 생성하기' }}
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="flex flex-col gap-2">
              <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Notice</p>
              <h2 class="text-3xl font-black text-[#1A2A4F]">공지사항 관리</h2>
            </div>

            <div class="mt-8 rounded-[24px] border-4 border-[#1A2A4F] bg-[#FFF2EF] p-6 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
              <div class="space-y-5">
                <div>
                  <label class="mb-2 block text-sm font-black text-[#1A2A4F]">공지 제목</label>
                  <input
                    v-model="noticeTitle"
                    type="text"
                    placeholder="공지사항 제목을 입력해 주세요"
                    class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                  >
                </div>

                <div>
                  <label class="mb-2 block text-sm font-black text-[#1A2A4F]">공지 내용</label>
                  <textarea
                    v-model="noticeContent"
                    rows="10"
                    placeholder="공지사항 내용을 작성해 주세요"
                    class="w-full rounded-[18px] border-4 border-[#1A2A4F] bg-white px-4 py-3 text-[#1A2A4F] outline-none"
                  />
                </div>

                <div class="flex justify-end">
                  <button
                    type="button"
                    class="rounded-[18px] border-4 border-[#1A2A4F] bg-[#F7A5A5] px-6 py-3 font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition hover:-translate-y-0.5"
                  >
                    공지 등록하기
                  </button>
                </div>
              </div>
            </div>
          </template>
        </section>
      </div>
    </main>
  </div>
</template>