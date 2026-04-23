<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI, userAPI } from '../api/auth'
import { useAuthStore } from '../store/auth'
import { decodeJwtUuid } from '../utils/jwt'

const router = useRouter()
const auth = useAuthStore()
const userId = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const isLoading = ref(false)

watch(
  () => auth.state.isLoggedIn,
  async (loggedIn) => {
    if (auth.state.isAuthReady && loggedIn) {
      await router.replace('/')
    }
  },
  { immediate: true }
)

const handleLogin = async () => {
  errorMsg.value = ''
  isLoading.value = true

  if (!userId.value || !password.value) {
    errorMsg.value = '아이디와 비밀번호를 모두 입력해 주세요.'
    isLoading.value = false
    return
  }

  try {
    const response = await authAPI.signIn({ id: userId.value, password: password.value })
    const accessToken = response.accessToken
    const userUuid = decodeJwtUuid(accessToken)

    if (!userUuid) {
      localStorage.removeItem('accessToken')
      throw new Error('유효하지 않은 토큰입니다.')
    }

    localStorage.setItem('accessToken', accessToken)
    const profile = await userAPI.getProfile(userUuid)

    auth.loginSuccess({
      user: {
        uuid: profile.uuid,
        user_id: profile.user_id ?? profile.id ?? '',
        nickname: profile.nickname,
        birth: profile.birth,
        role: profile.role,
        is_locked: profile.is_locked,
        balance: profile.wallet?.balance ?? profile.point ?? 0,
      },
      accessToken,
    })

    await router.push('/')
  } catch (error: any) {
    console.error('login error:', error)
    localStorage.removeItem('accessToken')
    errorMsg.value = error.response?.data?.details ?? error.response?.data?.message ?? '로그인에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#fff8f5_0%,#fff2ef_100%)] px-4 py-10">
    <div class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
      <section class="rounded-[36px] border-2 border-[#1A2A4F] bg-[#1A2A4F] p-8 text-white shadow-[10px_10px_0_0_rgba(26,42,79,0.14)] sm:p-10">
        <p class="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-[#FFDBB6]">로그인하고 학습 계속하기</p>
        <h1 class="mt-5 text-4xl font-black leading-tight sm:text-5xl">
          오늘도 한 단계
          <br />
          멋지게 도전해 봐요
        </h1>
        <p class="mt-5 max-w-xl text-base leading-7 text-slate-200">
          스테이지를 풀고, 틀린 문제를 다시 보고, 궁금한 건 커뮤니티에서 질문할 수 있어요.
        </p>
        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <div class="rounded-[28px] bg-white p-5 text-[#1A2A4F]">
            <p class="text-sm font-bold text-slate-500">추천 활동</p>
            <p class="mt-2 text-xl font-black">오늘의 스테이지 풀기</p>
          </div>
          <div class="rounded-[28px] bg-[#FFDBB6] p-5 text-[#1A2A4F]">
            <p class="text-sm font-bold">학습 팁</p>
            <p class="mt-2 text-xl font-black">틀린 문제는 꼭 다시 보기</p>
          </div>
        </div>
      </section>

      <section class="rounded-[36px] border border-[#1A2A4F]/10 bg-white p-8 shadow-[0_18px_44px_rgba(26,42,79,0.08)] sm:p-10">
        <div class="text-center">
          <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#1A2A4F]/55">Welcome Back</p>
          <h2 class="mt-3 text-3xl font-black text-[#1A2A4F]">로그인</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">학습 기록과 진행도를 이어서 확인해 보세요.</p>
        </div>

        <div class="mt-8 space-y-4">
          <div>
            <label class="mb-2 block text-sm font-bold text-[#1A2A4F]">아이디</label>
            <input
              v-model="userId"
              type="text"
              placeholder="아이디를 입력하세요"
              class="w-full rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]"
            >
          </div>
          <div>
            <label class="mb-2 block text-sm font-bold text-[#1A2A4F]">비밀번호</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호를 입력하세요"
                class="w-full rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 pr-16 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]"
              >
              <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#1A2A4F]" @click="showPassword = !showPassword">
                {{ showPassword ? '숨기기' : '보기' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="mt-4 rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-3 text-sm text-[#1A2A4F]">
          {{ errorMsg }}
        </div>

        <button
          type="button"
          :disabled="isLoading"
          class="mt-6 w-full rounded-full bg-[#1A2A4F] px-6 py-4 text-base font-black text-white transition hover:bg-[#233868] disabled:bg-slate-400"
          @click="handleLogin"
        >
          {{ isLoading ? '로그인 중...' : '로그인하기' }}
        </button>

        <div class="mt-6 text-center text-sm text-slate-600">
          아직 계정이 없나요?
          <button type="button" class="ml-2 font-bold text-[#1A2A4F]" @click="router.push('/signup')">회원가입</button>
        </div>
      </section>
    </div>
  </div>
</template>
