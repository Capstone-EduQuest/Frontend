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

const weeklyAttendance = ref([true, true, false, true, false, true, true])
const attendanceLabels = ['월', '화', '수', '목', '금', '토', '일']

const profileImageUrl = computed(
  () =>
    profile.value?.profile_image_url ??
    profile.value?.profile_url ??
    profile.value?.profile_image ??
    profile.value?.avatar_url ??
    profile.value?.profile
)

const displayName = computed(() => profile.value?.nickname ?? auth.state.user?.nickname ?? '학습자')
const displayEmail = computed(() => profile.value?.email ?? '이메일 정보 없음')
const displayUserId = computed(() => profile.value?.user_id ?? profile.value?.id ?? auth.state.user?.user_id ?? '-')
const maskedPassword = computed(() => '●'.repeat(8))
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
const correctBarWidth = computed(() => `${correctRate.value}%`)
const wrongBarWidth = computed(() => `${incorrectRate.value}%`)

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
        page: 1,
        size: 100,
        sort: 'created_at',
        is_asc: false,
      }),
    ])

    profile.value = profileResponse
    solvedCount.value = progressResponse.results.reduce((sum, stage) => sum + stage.clear.length, 0)
    wrongCount.value = wrongNotesResponse.results.length
  } catch (loadError) {
    console.error(loadError)
    error.value = '프로필 정보를 불러오는데 실패했습니다.'
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
      subtitle="내 계정과 학습 기록을 한눈에 확인해 보세요."
      @back="router.back()"
    />

    <main class="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div
        v-if="error"
        class="mb-6 rounded-[28px] border-4 border-[#1A2A4F] bg-white p-5 font-bold text-[#1A2A4F] shadow-[8px_8px_0_0_rgba(26,42,79,1)]"
      >
        {{ error }}
      </div>

      <div
        v-if="isLoading"
        class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-10 text-center font-bold text-[#1A2A4F] shadow-[8px_8px_0_0_rgba(26,42,79,1)]"
      >
        프로필 정보를 불러오는 중입니다...
      </div>

      <div v-else class="space-y-6">
        <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-8 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
            <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Profile</p>
            <div class="mt-6 flex flex-col items-center text-center">
              <div class="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-[#1A2A4F] bg-[#FFDBB6] text-5xl font-black text-[#1A2A4F] shadow-[6px_6px_0_0_rgba(26,42,79,1)]">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필 이미지" class="h-full w-full object-cover">
                <span v-else>{{ displayName[0] }}</span>
              </div>
              <h2 class="mt-6 text-3xl font-black text-[#1A2A4F] sm:text-4xl">{{ displayName }}</h2>
              <p class="mt-3 rounded-full border-2 border-[#1A2A4F] bg-[#F7A5A5] px-4 py-2 text-sm font-black text-[#1A2A4F]">
                {{ profile?.role ?? 'user' }}
              </p>
            </div>
          </article>

          <article class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-8 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
            <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Account Info</p>
            <ul class="mt-6 space-y-4">
              <li class="flex items-center justify-between gap-4 rounded-[20px] border-2 border-[#1A2A4F] bg-[#FFF2EF] p-4">
                <span class="text-sm font-black text-[#1A2A4F]">이름</span>
                <span class="text-right text-base font-bold text-[#1A2A4F]">{{ displayName }}</span>
              </li>
              <li class="flex items-center justify-between gap-4 rounded-[20px] border-2 border-[#1A2A4F] bg-[#FFDBB6] p-4">
                <span class="text-sm font-black text-[#1A2A4F]">이메일</span>
                <span class="break-all text-right text-base font-bold text-[#1A2A4F]">{{ displayEmail }}</span>
              </li>
              <li class="flex items-center justify-between gap-4 rounded-[20px] border-2 border-[#1A2A4F] bg-[#FFF2EF] p-4">
                <span class="text-sm font-black text-[#1A2A4F]">아이디</span>
                <span class="text-right text-base font-bold text-[#1A2A4F]">{{ displayUserId }}</span>
              </li>
              <li class="flex items-center justify-between gap-4 rounded-[20px] border-2 border-[#1A2A4F] bg-[#F7A5A5] p-4">
                <span class="text-sm font-black text-[#1A2A4F]">비밀번호</span>
                <span class="text-right text-base font-black tracking-[0.3em] text-[#1A2A4F]">{{ maskedPassword }}</span>
              </li>
            </ul>
          </article>
        </section>

        <section class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-8 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Attendance</p>
              <h2 class="mt-2 text-3xl font-black text-[#1A2A4F]">나의 출석 스탬프</h2>
            </div>
            <p class="rounded-full border-2 border-[#1A2A4F] bg-[#FFDBB6] px-4 py-2 text-sm font-black text-[#1A2A4F]">
              이번 주 출석률 {{ attendanceRate }}%
            </p>
          </div>

          <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            <div
              v-for="(attended, index) in weeklyAttendance"
              :key="attendanceLabels[index]"
              class="flex flex-col items-center gap-3 rounded-[24px] border-2 border-[#1A2A4F] p-4"
              :class="attended ? 'bg-[#F7A5A5]' : 'bg-[#FFF2EF]'"
            >
              <div
                class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#1A2A4F] text-2xl shadow-[4px_4px_0_0_rgba(26,42,79,1)]"
                :class="attended ? 'bg-[#FFDBB6]' : 'bg-white'"
              >
                {{ attended ? '✅' : '·' }}
              </div>
              <p class="text-sm font-black text-[#1A2A4F]">{{ attendanceLabels[index] }}</p>
            </div>
          </div>
        </section>

        <section class="grid gap-6 lg:grid-cols-2">
          <article class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-8 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
            <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Accuracy</p>
            <h2 class="mt-2 text-3xl font-black text-[#1A2A4F]">정답률 차트</h2>

            <div class="mt-8 flex flex-col gap-8">
              <div class="mx-auto flex h-48 w-48 items-center justify-center rounded-full border-[18px] border-[#1A2A4F] bg-[conic-gradient(#FFDBB6_0deg,var(--correct-end),#F7A5A5_var(--correct-end),360deg)] shadow-[6px_6px_0_0_rgba(26,42,79,1)]" :style="{ '--correct-end': `${correctRate * 3.6}deg` }">
                <div class="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-[#1A2A4F] bg-white">
                  <span class="text-3xl font-black text-[#1A2A4F]">{{ correctRate }}%</span>
                  <span class="mt-1 text-xs font-black uppercase tracking-[0.2em] text-[#1A2A4F]/55">Correct</span>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <div class="mb-2 flex items-center justify-between text-sm font-black text-[#1A2A4F]">
                    <span>맞은 문제</span>
                    <span>{{ solvedCount }}</span>
                  </div>
                  <div class="h-5 rounded-full border-4 border-[#1A2A4F] bg-[#FFF2EF] p-[2px]">
                    <div class="h-full rounded-full bg-[#FFDBB6]" :style="{ width: correctBarWidth }" />
                  </div>
                </div>

                <div>
                  <div class="mb-2 flex items-center justify-between text-sm font-black text-[#1A2A4F]">
                    <span>틀린 문제</span>
                    <span>{{ wrongCount }}</span>
                  </div>
                  <div class="h-5 rounded-full border-4 border-[#1A2A4F] bg-[#FFF2EF] p-[2px]">
                    <div class="h-full rounded-full bg-[#F7A5A5]" :style="{ width: wrongBarWidth }" />
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="rounded-[28px] border-4 border-[#1A2A4F] bg-white p-8 shadow-[8px_8px_0_0_rgba(26,42,79,1)]">
            <p class="text-sm font-black uppercase tracking-[0.24em] text-[#1A2A4F]/55">Activity</p>
            <h2 class="mt-2 text-3xl font-black text-[#1A2A4F]">활동 요약</h2>

            <div class="mt-8 grid gap-5">
              <div class="rounded-[24px] border-4 border-[#1A2A4F] bg-[#FFDBB6] p-6 shadow-[6px_6px_0_0_rgba(26,42,79,1)]">
                <p class="text-sm font-black text-[#1A2A4F]/70">총 문제 풀이 개수</p>
                <p class="mt-3 text-5xl font-black text-[#1A2A4F] sm:text-6xl">{{ totalAttempts }}</p>
              </div>

              <div class="rounded-[24px] border-4 border-[#1A2A4F] bg-[#F7A5A5] p-6 shadow-[6px_6px_0_0_rgba(26,42,79,1)]">
                <p class="text-sm font-black text-[#1A2A4F]/70">획득한 총 포인트</p>
                <p class="mt-3 text-5xl font-black text-[#1A2A4F] sm:text-6xl">{{ totalPoints }}</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  </div>
</template>
