<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api/auth'

const router = useRouter()
const isLoading = ref(false)
const errorMsg = ref('')
const profileImage = ref<File | null>(null)
const formData = ref({
  id: '',
  email: '',
  password: '',
  password_confirm: '',
  birth: '',
  nickname: '',
})

const handleFileChange = (event: Event) => {
  profileImage.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

const handleSignup = async () => {
  isLoading.value = true
  errorMsg.value = ''

  try {
    const payload = new FormData()
    payload.append(
      'profile',
      new Blob(
        [
          JSON.stringify({
            id: formData.value.id,
            email: formData.value.email,
            password: formData.value.password,
            password_valid: formData.value.password_confirm,
            birth: formData.value.birth,
            nickname: formData.value.nickname,
          }),
        ],
        { type: 'application/json' }
      )
    )
    if (profileImage.value) {
      payload.append('profileImage', profileImage.value)
    }
    await authAPI.signUp(payload)
    await router.push('/login')
  } catch (error: any) {
    errorMsg.value = error.response?.data?.details ?? error.response?.data?.message ?? '회원가입에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#fff8f5_0%,#fff2ef_100%)] px-4 py-10">
    <div class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section class="rounded-[36px] border-2 border-[#1A2A4F] bg-white p-8 shadow-[10px_10px_0_0_rgba(26,42,79,0.12)] sm:p-10">
        <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#1A2A4F]/55">회원가입 안내</p>
        <h1 class="mt-3 text-4xl font-black text-[#1A2A4F]">처음 와도 괜찮아요</h1>
        <p class="mt-4 text-base leading-7 text-slate-600">
          계정을 만들면 학습 현황, 오답 노트, 질문 기록을 저장하면서 차근차근 실력을 키울 수 있어요.
        </p>

        <div class="mt-8 grid gap-4">
          <div class="rounded-[28px] bg-[#FFF2EF] p-5">
            <p class="text-sm font-bold text-[#1A2A4F]">이런 점이 좋아요</p>
            <p class="mt-2 text-lg font-black text-[#1A2A4F]">작은 단계로 배우고, 틀린 문제는 다시 복습!</p>
          </div>
          <div class="rounded-[28px] bg-[#FFDBB6] p-5">
            <p class="text-sm font-bold text-[#1A2A4F]">추천 대상</p>
            <p class="mt-2 text-lg font-black text-[#1A2A4F]">초등학교 4학년부터 중학교 2학년까지</p>
          </div>
        </div>
      </section>

      <section class="rounded-[36px] border border-[#1A2A4F]/10 bg-white p-8 shadow-[0_18px_44px_rgba(26,42,79,0.08)] sm:p-10">
        <div class="text-center">
          <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#1A2A4F]/55">Create Account</p>
          <h2 class="mt-3 text-3xl font-black text-[#1A2A4F]">회원가입</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">아래 정보를 입력하고 학습 모험을 시작해 보세요.</p>
        </div>

        <div v-if="errorMsg" class="mt-5 rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-3 text-sm text-[#1A2A4F]">
          {{ errorMsg }}
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="handleSignup">
          <div class="grid gap-4 sm:grid-cols-2">
            <input v-model="formData.id" type="text" placeholder="아이디" class="rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]">
            <input v-model="formData.nickname" type="text" placeholder="닉네임" class="rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]">
          </div>
          <input v-model="formData.email" type="email" placeholder="이메일" class="w-full rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]">
          <div class="grid gap-4 sm:grid-cols-2">
            <input v-model="formData.birth" type="date" class="rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]">
            <input type="file" accept="image/*" class="rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-3 text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-[#FFDBB6] file:px-4 file:py-2 file:font-bold file:text-[#1A2A4F]" @change="handleFileChange">
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <input v-model="formData.password" type="password" placeholder="비밀번호" class="rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]">
            <input v-model="formData.password_confirm" type="password" placeholder="비밀번호 확인" class="rounded-[22px] border border-[#F7A5A5] bg-[#FFF2EF] px-4 py-4 focus:border-[#1A2A4F] focus:outline-none focus:ring-2 focus:ring-[#FFDBB6]">
          </div>

          <button type="submit" :disabled="isLoading" class="mt-4 w-full rounded-full bg-[#1A2A4F] px-6 py-4 text-base font-black text-white transition hover:bg-[#233868] disabled:bg-slate-400">
            {{ isLoading ? '가입 중...' : '회원가입 완료하기' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-600">
          이미 계정이 있나요?
          <button type="button" class="ml-2 font-bold text-[#1A2A4F]" @click="router.push('/login')">로그인</button>
        </div>
      </section>
    </div>
  </div>
</template>
