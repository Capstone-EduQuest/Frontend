<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import PageHeader from '../components/PageHeader.vue'
import { userAPI, type UserProfile } from '../api/auth'
import { progressAPI } from '../api/learning'
import { wrongNoteAPI } from '../api/wrong_note'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const profile = ref<UserProfile | null>(null)
const isLoading = ref(true)
const error = ref('')
const solvedCount = ref(0)
const wrongCount = ref(0)
const clearedStageCount = ref(0)
const totalStageCount = ref(0)

const weeklyAttendance = ref([true, true, false, true, false, true, true])
const attendanceLabels = ['일', '월', '화', '수', '목', '금', '토']

const profileImageUrl = computed(
  () =>
    profile.value?.profile_image_url ??
    profile.value?.profile_url ??
    profile.value?.profile_image ??
    profile.value?.avatar_url ??
    profile.value?.profile
)

const displayName = computed(() => profile.value?.nickname ?? auth.state.user?.nickname ?? '학습자')
const displayUserId = computed(() => profile.value?.user_id ?? profile.value?.id ?? auth.state.user?.user_id ?? '-')
const displayBirth = computed(() => {
  const birth = profile.value?.birth?.trim()
  if (!birth) {
    return '미등록'
  }

  const matched = birth.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matched) {
    const [, year, month, day] = matched
    return `${year}.${month}.${day}`
  }

  const parsed = new Date(birth)
  if (Number.isNaN(parsed.getTime())) {
    return birth
  }

  return parsed.toLocaleDateString('ko-KR')
})

const totalPoints = computed(() => profile.value?.wallet?.balance ?? profile.value?.point ?? 0)
const totalAttempts = computed(() => solvedCount.value + wrongCount.value)
const correctRate = computed(() => {
  if (totalAttempts.value === 0) {
    return 0
  }

  return Math.round((solvedCount.value / totalAttempts.value) * 100)
})
const incorrectRate = computed(() => 100 - correctRate.value)
const attendanceCount = computed(() => weeklyAttendance.value.filter(Boolean).length)
const attendanceRate = computed(() => Math.round((attendanceCount.value / weeklyAttendance.value.length) * 100))
const progressRate = computed(() => {
  if (totalStageCount.value === 0) {
    return 0
  }

  return Math.round((clearedStageCount.value / totalStageCount.value) * 100)
})
const correctBarWidth = computed(() => `${correctRate.value}%`)
const wrongBarWidth = computed(() => `${incorrectRate.value}%`)
const progressBarWidth = computed(() => `${progressRate.value}%`)

onMounted(async () => {
  await auth.restoreAuth(route.path)
  if (!auth.state.accessToken || !auth.state.user) {
    await router.push('/login')
    return
  }

  try {
    const [profileResponse, progressResponse, wrongNotesResponse] = await Promise.all([
      userAPI.getProfile(auth.state.user.uuid),
      progressAPI.getProgress(auth.state.user.uuid),
      wrongNoteAPI.getUserWrongNotes(auth.state.user.uuid, {
        page: 0,
        size: 100,
        sort: 'created_at',
        is_asc: false,
      }),
    ])

    profile.value = profileResponse
    solvedCount.value = progressResponse.results.reduce((sum, stage) => sum + stage.clear.length, 0)
    wrongCount.value = wrongNotesResponse.results.length
    totalStageCount.value = progressResponse.results.length
    clearedStageCount.value = progressResponse.results.filter((stage) => {
      const total = stage.totalQuestionCount ?? stage.total_question_count ?? 0
      return total > 0 && stage.clear.length === total
    }).length
  } catch (loadError) {
    console.error(loadError)
    error.value = '마이페이지 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF] py-10">
    <Navbar />
    <PageHeader
      title="마이페이지"
      subtitle="학습 현황과 계정 정보를 한눈에 확인해 보세요."
      @back="router.back()"
    />

    <main class="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        v-if="error"
        class="luxe-card mb-6 p-5 text-sm font-medium text-[#1A2A4F]"
      >
        {{ error }}
      </div>

      <div
        v-if="isLoading"
        class="luxe-panel p-10 text-center"
      >
        <div class="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-2 border-[#FFDBB6] border-b-[#1A2A4F]" />
        <p class="font-medium text-[#1A2A4F]">마이페이지를 불러오는 중입니다.</p>
      </div>

      <div v-else class="space-y-6">
        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article class="luxe-card p-5">
            <p class="text-sm font-medium text-[#1A2A4F]/55">보유 코인</p>
            <p class="mt-3 text-3xl font-semibold text-[#1A2A4F]">{{ totalPoints }}</p>
          </article>
          <article class="luxe-card p-5">
            <p class="text-sm font-medium text-[#1A2A4F]/55">해결한 문제</p>
            <p class="mt-3 text-3xl font-semibold text-[#1A2A4F]">{{ solvedCount }}</p>
          </article>
          <article class="luxe-card p-5">
            <p class="text-sm font-medium text-[#1A2A4F]/55">오답 노트</p>
            <p class="mt-3 text-3xl font-semibold text-[#1A2A4F]">{{ wrongCount }}</p>
          </article>
          <article class="luxe-card p-5">
            <p class="text-sm font-medium text-[#1A2A4F]/55">스테이지 진행률</p>
            <p class="mt-3 text-3xl font-semibold text-[#1A2A4F]">{{ progressRate }}%</p>
          </article>
        </section>

        <section class="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <article class="luxe-panel p-8">
            <div class="flex flex-col items-center text-center">
              <div class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[#1A2A4F]/10 bg-[#FFF6EC] text-4xl font-semibold text-[#1A2A4F] shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필 이미지" class="h-full w-full object-cover">
                <span v-else>{{ displayName[0] }}</span>
              </div>
              <h2 class="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#1A2A4F]">{{ displayName }}</h2>
              <p class="mt-2 luxe-pill bg-white px-4 py-2 text-sm font-medium text-[#1A2A4F]">
                {{ profile?.role ?? 'user' }}
              </p>
            </div>

            <div class="mt-8 grid gap-3">
              <div class="luxe-card-soft flex items-center justify-between gap-4 p-4">
                <span class="text-sm font-medium text-[#1A2A4F]/55">아이디</span>
                <span class="text-right font-medium text-[#1A2A4F]">{{ displayUserId }}</span>
              </div>
              <div class="luxe-card-soft flex items-center justify-between gap-4 p-4">
                <span class="text-sm font-medium text-[#1A2A4F]/55">생년월일</span>
                <span class="text-right font-medium text-[#1A2A4F]">{{ displayBirth }}</span>
              </div>
            </div>
          </article>

          <div class="grid gap-6">
            <article class="luxe-panel p-8">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p class="text-sm font-medium text-[#1A2A4F]/55">Learning Summary</p>
                  <h3 class="mt-1 text-2xl font-semibold text-[#1A2A4F]">학습 요약</h3>
                </div>
                <p class="luxe-pill bg-[#FFF6EC] px-4 py-2 text-sm font-medium text-[#1A2A4F]">
                  완료 스테이지 {{ clearedStageCount }} / {{ totalStageCount }}
                </p>
              </div>

              <div class="mt-6 grid gap-5 lg:grid-cols-2">
                <div class="luxe-card-soft p-5">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-[#1A2A4F]/55">정답률</p>
                    <p class="text-2xl font-semibold text-[#1A2A4F]">{{ correctRate }}%</p>
                  </div>
                  <div class="mt-4 space-y-4">
                    <div>
                      <div class="mb-2 flex items-center justify-between text-sm font-medium text-[#1A2A4F]">
                        <span>맞힌 문제</span>
                        <span>{{ solvedCount }}</span>
                      </div>
                      <div class="h-3 rounded-full bg-[#F3E7E1]">
                        <div class="h-3 rounded-full bg-[linear-gradient(90deg,#ffcfaa,#f3ab9b)]" :style="{ width: correctBarWidth }" />
                      </div>
                    </div>
                    <div>
                      <div class="mb-2 flex items-center justify-between text-sm font-medium text-[#1A2A4F]">
                        <span>틀린 문제</span>
                        <span>{{ wrongCount }}</span>
                      </div>
                      <div class="h-3 rounded-full bg-[#F3E7E1]">
                        <div class="h-3 rounded-full bg-[linear-gradient(90deg,#f4b6b6,#e59797)]" :style="{ width: wrongBarWidth }" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="luxe-card-soft p-5">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-[#1A2A4F]/55">전체 진행률</p>
                    <p class="text-2xl font-semibold text-[#1A2A4F]">{{ progressRate }}%</p>
                  </div>
                  <div class="mt-4">
                    <div class="mb-2 flex items-center justify-between text-sm font-medium text-[#1A2A4F]">
                      <span>완료한 스테이지</span>
                      <span>{{ clearedStageCount }} / {{ totalStageCount }}</span>
                    </div>
                    <div class="h-3 rounded-full bg-[#F3E7E1]">
                      <div class="h-3 rounded-full bg-[linear-gradient(90deg,#ffd8b2,#f3b98a)]" :style="{ width: progressBarWidth }" />
                    </div>
                    <div class="mt-6 grid grid-cols-2 gap-3">
                      <div class="rounded-[18px] border border-[#1A2A4F]/8 bg-white/70 p-4">
                        <p class="text-xs font-medium uppercase tracking-[0.16em] text-[#1A2A4F]/45">총 시도</p>
                        <p class="mt-2 text-2xl font-semibold text-[#1A2A4F]">{{ totalAttempts }}</p>
                      </div>
                      <div class="rounded-[18px] border border-[#1A2A4F]/8 bg-white/70 p-4">
                        <p class="text-xs font-medium uppercase tracking-[0.16em] text-[#1A2A4F]/45">출석률</p>
                        <p class="mt-2 text-2xl font-semibold text-[#1A2A4F]">{{ attendanceRate }}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article class="luxe-panel p-8">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p class="text-sm font-medium text-[#1A2A4F]/55">Weekly Activity</p>
                  <h3 class="mt-1 text-2xl font-semibold text-[#1A2A4F]">주간 활동</h3>
                </div>
                <p class="text-sm font-medium text-[#1A2A4F]/55">이번 주 출석 {{ attendanceCount }}일</p>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                <div
                  v-for="(attended, index) in weeklyAttendance"
                  :key="attendanceLabels[index]"
                  class="rounded-[22px] border border-[#1A2A4F]/8 p-4 text-center shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                  :class="attended ? 'bg-white' : 'bg-[#FFF8F4]'"
                >
                  <div
                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                    :class="attended ? 'bg-[#FFF1E3] text-[#1A2A4F]' : 'bg-white text-[#1A2A4F]/45'"
                  >
                    {{ attended ? 'ON' : 'OFF' }}
                  </div>
                  <p class="mt-3 text-sm font-medium text-[#1A2A4F]">{{ attendanceLabels[index] }}</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
