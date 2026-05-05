<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import Navbar from '../components/Navbar.vue'
import { userAPI } from '../api/auth'
import { bookmarkAPI, type BookmarkItem } from '../api/bookmark'
import { progressAPI } from '../api/learning'
import { useAuthStore } from '../store/auth'
import { wrongNoteAPI } from '../api/wrong_note'

const auth = useAuthStore()
const previewVideo = '/unity_preview.mp4'

interface UserProgress {
  level: number
  exp: number
  expMax: number
  clearedStages: number
  totalStages: number
}

const getStageTotalCount = (stage: { total_question_count?: number; totalQuestionCount?: number }) =>
  stage.totalQuestionCount ?? stage.total_question_count ?? 0

interface BookmarkPreview {
  id: string
  stage: string
  title: string
  note: string
  difficulty: string
}

const userProgress = ref<UserProgress | null>(null)
const scrollY = ref(0)
const animatedCoinRatio = ref(0)
const animatedAccuracy = ref(0)
const revealTargets = ref<HTMLElement[]>([])
const videoAvailable = ref(true)
const pageError = ref('')
const stats = ref({
  correct: 0,
  wrong: 0,
  coinCurrent: 0,
  coinGoal: 100,
})
const bookmarkedProblems = ref<BookmarkPreview[]>([])

let revealObserver: IntersectionObserver | null = null
let metricsAnimated = false

const accuracy = computed(() => {
  const total = stats.value.correct + stats.value.wrong
  return total === 0 ? 0 : Math.round((stats.value.correct / total) * 100)
})

const displayedCoinAmount = computed(() => Math.round(stats.value.coinCurrent * animatedCoinRatio.value))
const displayedAccuracy = computed(() => Math.round(accuracy.value * animatedAccuracy.value))
const donutCircumference = 2 * Math.PI * 52
const donutOffset = computed(() => donutCircumference * (1 - animatedAccuracy.value * (accuracy.value / 100)))
const coinGaugeWidth = computed(() => {
  const ratio = stats.value.coinGoal > 0 ? (stats.value.coinCurrent / stats.value.coinGoal) * 100 : 0
  return `${Math.max(0, Math.min(ratio * animatedCoinRatio.value, 100))}%`
})

const navStyle = computed(() => {
  const intensity = Math.min(scrollY.value / 360, 1)
  const blur = 8 + intensity * 16
  const backgroundOpacity = 0.84 + intensity * 0.12

  return {
    '--nav-blur': `${blur}px`,
    '--nav-bg': `rgba(255, 255, 255, ${backgroundOpacity})`,
    '--nav-border': `rgba(26, 42, 79, ${0.12 + intensity * 0.12})`,
  }
})

const handleScroll = () => {
  scrollY.value = window.scrollY
}

const handleVideoError = () => {
  videoAvailable.value = false
}

const registerReveal = (element: Element | ComponentPublicInstance | null) => {
  if (element instanceof HTMLElement && !revealTargets.value.includes(element)) {
    revealTargets.value.push(element)
  }
}

const animateValue = (setter: (value: number) => void, duration: number) => {
  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(eased)

    if (progress < 1) {
      window.requestAnimationFrame(tick)
    }
  }

  window.requestAnimationFrame(tick)
}

const startMetricAnimations = () => {
  if (metricsAnimated) {
    return
  }

  metricsAnimated = true
  animateValue((value) => {
    animatedCoinRatio.value = value
  }, 1200)
  animateValue((value) => {
    animatedAccuracy.value = value
  }, 1400)
}

const mapBookmarkPreview = (bookmark: BookmarkItem): BookmarkPreview => ({
  id: bookmark.problem_uuid ?? `${bookmark.stage}-${bookmark.number}`,
  stage: bookmark.stage ?? 'Stage',
  title: `문제 ${bookmark.number ?? '-'}`,
  note: `${bookmark.stage ?? '스테이지'}의 북마크 문제를 다시 복습해 보세요.`,
  difficulty: bookmark.type ?? 'basic',
})

const loadHomeData = async () => {
  await auth.restoreAuth('/home')

  if (!auth.state.user) {
    throw new Error('auth required')
  }

  const [profile, progressResponse, bookmarkResponse, wrongNotesResponse] = await Promise.all([
    userAPI.getProfile(auth.state.user.uuid),
    progressAPI.getProgress(auth.state.user.uuid),
    bookmarkAPI.getBookmarkList(auth.state.user.uuid, {
      page: 1,
      size: 3,
      sort: 'created_at',
      is_asc: false,
    }),
    wrongNoteAPI.getUserWrongNotes(auth.state.user.uuid, {
      page: 1,
      size: 100,
      sort: 'created_at',
      is_asc: false,
    }),
  ])

  const totalStages = progressResponse.results.length
  const clearedStages = progressResponse.results.filter(
    (stage) => getStageTotalCount(stage) > 0 && stage.clear.length === getStageTotalCount(stage)
  ).length
  const solvedCount = progressResponse.results.reduce((sum, stage) => sum + stage.clear.length, 0)
  const wrongCount = wrongNotesResponse.results.length

  userProgress.value = {
    level: clearedStages + 1,
    exp: profile.point ?? 0,
    expMax: Math.max((clearedStages + 1) * 100, 100),
    clearedStages,
    totalStages,
  }

  stats.value.coinCurrent = profile.point ?? 0
  stats.value.coinGoal = userProgress.value.expMax
  stats.value.correct = solvedCount
  stats.value.wrong = wrongCount
  bookmarkedProblems.value = bookmarkResponse.results.map(mapBookmarkPreview)
}

onMounted(async () => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })

  try {
    await loadHomeData()
  } catch (error) {
    console.error('failed to load home data:', error)
    pageError.value = '홈 화면 데이터를 불러오지 못했습니다.'
    userProgress.value = {
      level: 1,
      exp: 0,
      expMax: 100,
      clearedStages: 0,
      totalStages: 0,
    }
  }

  await nextTick()

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')

          if (entry.target instanceof HTMLElement && entry.target.dataset.animateMetrics === 'true') {
            startMetricAnimations()
          }

          revealObserver?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    },
  )

  revealTargets.value.forEach((element) => revealObserver?.observe(element))
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  revealObserver?.disconnect()
})
</script>

<template>
  <div class="home-shell min-h-screen bg-[#FFF2EF]" :style="navStyle">
    <Navbar />

    <main class="relative px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div class="absolute left-0 top-10 h-40 w-40 rounded-full bg-[#F7A5A5]/20 blur-3xl" />
      <div class="absolute right-10 top-24 h-48 w-48 rounded-full bg-[#FFDBB6]/30 blur-3xl" />

      <div class="relative mx-auto flex max-w-7xl flex-col gap-6">
        <div
          v-if="pageError"
          class="rounded-[28px] border border-[#F7A5A5] bg-white p-5 text-sm font-bold text-[#1A2A4F]"
        >
          {{ pageError }}
        </div>

        <section class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div
            :ref="registerReveal"
            class="fade-up relative isolate flex h-full flex-col overflow-hidden rounded-[36px] border-4 border-[#1A2A4F] bg-[#1A2A4F] p-6 text-white shadow-[10px_10px_0_0_rgba(26,42,79,0.14)] sm:p-8"
          >
            <video
              v-if="videoAvailable"
              autoplay
              muted
              loop
              playsinline
              class="absolute inset-0 h-full w-full object-cover"
              @error="handleVideoError"
            >
              <source :src="previewVideo" type="video/mp4" />
            </video>
            <div class="absolute inset-0 bg-[#1A2A4F]/62" />
            <div
              v-if="!videoAvailable"
              class="absolute inset-0 bg-[linear-gradient(135deg,rgba(26,42,79,0.92),rgba(35,56,104,0.78)),repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_2px,transparent_2px,transparent_24px)]"
            />

            <div class="relative z-10 flex flex-col gap-4">
              <p class="w-fit rounded-full border-2 border-white bg-[#F7A5A5] px-4 py-2 text-sm font-black text-[#1A2A4F]">
                오늘의 학습 상태
              </p>
              <div class="space-y-3">
                <h1 class="text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  다시 시작해 볼까요?
                  <span class="block text-[#FFDBB6]">다음 스테이지로 이어가 보세요.</span>
                </h1>
                <p class="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
                  지금까지 {{ userProgress?.clearedStages ?? 0 }}개의 스테이지를 완료했어요.<br />
                  북마크 문제를 다시 보거나 새로운 문제에 도전해 보세요.
                </p>
              </div>
            </div>

            <div class="relative z-10 mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:flex-wrap">
              <RouterLink
                to="/game"
                class="rounded-[24px] border-4 border-white bg-[#F7A5A5] px-6 py-4 text-center text-base font-black text-[#1A2A4F] transition duration-300 hover:-translate-y-1"
              >
                게임 시작
              </RouterLink>
              <RouterLink
                to="/review"
                class="rounded-[24px] border-4 border-white bg-[#FFDBB6] px-6 py-4 text-center text-base font-black text-[#1A2A4F] transition duration-300 hover:-translate-y-1"
              >
                복습하기
              </RouterLink>
            </div>
          </div>

          <div
            :ref="registerReveal"
            data-animate-metrics="true"
            class="fade-up fade-delay-1 flex h-full flex-col gap-4 rounded-[32px] border-4 border-[#1A2A4F] bg-white p-5 shadow-[10px_10px_0_0_rgba(26,42,79,0.08)] sm:p-6"
          >
            <p class="text-xs font-black uppercase tracking-[0.2em] text-[#1A2A4F]/45">
              Learning Dashboard
            </p>

            <div class="rounded-[28px] border-4 border-[#1A2A4F] bg-[#FFF2EF] p-4">
              <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p class="text-sm font-black text-[#1A2A4F]/60">포인트 현황</p>
                  <h2 class="mt-1 text-2xl font-black text-[#1A2A4F]">
                    {{ displayedCoinAmount }} / {{ stats.coinGoal }}
                  </h2>
                </div>
                <p class="rounded-full border-2 border-[#1A2A4F] bg-[#FFDBB6] px-3 py-1 text-sm font-black text-[#1A2A4F]">
                  레벨 {{ userProgress?.level ?? 1 }}
                </p>
              </div>

              <div class="mt-4 h-5 rounded-full border-4 border-[#1A2A4F] bg-white p-1">
                <div
                  class="h-full rounded-full bg-[#F7A5A5] transition-[width] duration-[1400ms] ease-out"
                  :style="{ width: coinGaugeWidth }"
                />
              </div>
            </div>

            <div class="flex flex-1 flex-col justify-center rounded-[28px] border-4 border-[#1A2A4F] bg-[#1A2A4F] p-5 text-white">
              <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex justify-center">
                  <div class="relative h-[120px] w-[120px]">
                    <svg class="h-full w-full -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.14)"
                        stroke-width="14"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="#FFDBB6"
                        stroke-width="14"
                        stroke-linecap="round"
                        :stroke-dasharray="donutCircumference"
                        :stroke-dashoffset="donutOffset"
                        class="transition-[stroke-dashoffset] duration-[1400ms] ease-out"
                      />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <p class="text-2xl font-black text-[#FFDBB6]">{{ displayedAccuracy }}%</p>
                      <p class="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
                        정답률
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex-1">
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div class="rounded-[20px] border-2 border-white/20 bg-white/10 p-4 text-center">
                      <p class="text-xs font-black uppercase tracking-[0.16em] text-white/50">해결한 문제</p>
                      <p class="mt-1 text-2xl font-black text-[#FFDBB6]">{{ stats.correct }}</p>
                    </div>
                    <div class="rounded-[20px] border-2 border-white/20 bg-white/10 p-4 text-center">
                      <p class="text-xs font-black uppercase tracking-[0.16em] text-white/50">오답 노트</p>
                      <p class="mt-1 text-2xl font-black text-[#F7A5A5]">{{ stats.wrong }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          :ref="registerReveal"
          class="fade-up fade-delay-2 rounded-[32px] border-4 border-[#1A2A4F] bg-white p-6 shadow-[10px_10px_0_0_rgba(26,42,79,0.08)] sm:p-8"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.2em] text-[#1A2A4F]/45">
                Bookmark Review
              </p>
              <h2 class="mt-2 text-2xl font-black text-[#1A2A4F]">최근 북마크한 문제</h2>
              <p class="mt-2 text-sm leading-6 text-[#1A2A4F]/70">
                실제 북마크 목록을 불러와 바로 복습할 수 있게 구성했습니다.
              </p>
            </div>
            <RouterLink
              to="/bookmark"
              class="w-full rounded-[20px] border-4 border-[#1A2A4F] bg-[#FFDBB6] px-5 py-3 text-center text-sm font-black text-[#1A2A4F] transition duration-300 hover:-translate-y-1 sm:w-auto"
            >
              전체 북마크 보기
            </RouterLink>
          </div>

          <div v-if="bookmarkedProblems.length === 0" class="mt-6 rounded-[24px] border-4 border-dashed border-[#1A2A4F]/20 bg-[#FFF2EF] p-6 text-sm font-bold text-[#1A2A4F]/70">
            아직 북마크한 문제가 없습니다.
          </div>

          <div v-else class="mt-6 grid gap-4 lg:grid-cols-3">
            <article
              v-for="problem in bookmarkedProblems"
              :key="problem.id"
              class="flex h-full flex-col rounded-[24px] border-4 border-[#1A2A4F] bg-[#FFF2EF] p-5"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="rounded-full border-2 border-[#1A2A4F] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#1A2A4F]">
                  {{ problem.stage }}
                </p>
                <span class="text-sm font-black text-[#1A2A4F]/55">{{ problem.difficulty }}</span>
              </div>
              <h3 class="mt-4 text-xl font-black leading-snug text-[#1A2A4F]">
                {{ problem.title }}
              </h3>
              <p class="mt-3 flex-1 text-sm leading-6 text-[#1A2A4F]/70">
                {{ problem.note }}
              </p>
              <RouterLink
                to="/bookmark"
                class="mt-5 rounded-[18px] border-4 border-[#1A2A4F] bg-[#F7A5A5] px-4 py-3 text-center text-sm font-black text-[#1A2A4F] transition duration-300 hover:-translate-y-1"
              >
                다시 보기
              </RouterLink>
            </article>
          </div>
        </section>
      </div>
    </main>

    <footer class="px-4 pb-6 text-center text-xs font-medium text-[#1A2A4F]/55 sm:px-6 lg:px-8">
      <p>EduQuest 학습 대시보드</p>
    </footer>
  </div>
</template>

<style scoped>
.home-shell :deep(nav) {
  background: var(--nav-bg);
  border-color: var(--nav-border);
  backdrop-filter: blur(var(--nav-blur));
  -webkit-backdrop-filter: blur(var(--nav-blur));
  transition:
    background 220ms ease,
    border-color 220ms ease,
    backdrop-filter 220ms ease;
}

.fade-up {
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.fade-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.fade-delay-1 {
  transition-delay: 0.12s;
}

.fade-delay-2 {
  transition-delay: 0.22s;
}
</style>
