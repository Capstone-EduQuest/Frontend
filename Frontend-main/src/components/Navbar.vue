<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const auth = useAuthStore()
const isLoggedIn = computed(() => auth.state.isLoggedIn)
const isAdmin = computed(() => {
  const role = auth.state.user?.role
  return role === 'admin' || role === 'admine'
})

const handleLogout = async () => {
  try {
    await authAPI.logout()
  } catch (error) {
    console.error('logout failed:', error)
  } finally {
    auth.logout()
    await router.push('/')
  }
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-[#1A2A4F]/10 bg-white/85 backdrop-blur">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center justify-between gap-4">
          <RouterLink to="/" class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#1A2A4F] bg-[#F7A5A5] text-xl font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,0.18)]">
              E
            </div>
            <div>
              <p class="text-2xl font-black tracking-tight text-[#1A2A4F]">EduQuest</p>
              <p class="text-xs font-medium text-slate-500">쉽고 즐겁게 배우는 코딩 모험</p>
            </div>
          </RouterLink>

          <div class="flex items-center gap-2 lg:hidden">
            <RouterLink
              v-if="!isLoggedIn"
              to="/login"
              class="rounded-full border border-[#1A2A4F] px-4 py-2 text-sm font-bold text-[#1A2A4F]"
            >
              로그인
            </RouterLink>
            <button
              v-else
              type="button"
              class="rounded-full border border-[#1A2A4F] px-4 py-2 text-sm font-bold text-[#1A2A4F]"
              @click="handleLogout"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <div class="flex flex-wrap items-center gap-2 rounded-[28px] border border-[#1A2A4F]/10 bg-[#FFF2EF] p-2">
            <RouterLink to="/game" class="rounded-full px-4 py-2 text-sm font-bold text-[#1A2A4F] transition hover:bg-white">
              스테이지
            </RouterLink>
            <RouterLink to="/progress" class="rounded-full px-4 py-2 text-sm font-bold text-[#1A2A4F] transition hover:bg-white">
              학습 현황
            </RouterLink>
            <RouterLink to="/incorrect-note" class="rounded-full px-4 py-2 text-sm font-bold text-[#1A2A4F] transition hover:bg-white">
              오답 노트
            </RouterLink>
            <RouterLink to="/community" class="rounded-full px-4 py-2 text-sm font-bold text-[#1A2A4F] transition hover:bg-white">
              커뮤니티
            </RouterLink>
            <RouterLink to="/notice" class="rounded-full px-4 py-2 text-sm font-bold text-[#1A2A4F] transition hover:bg-white">
              공지사항
            </RouterLink>
          </div>

          <div class="hidden items-center gap-2 lg:flex">
            <template v-if="!isLoggedIn">
              <RouterLink
                to="/login"
                class="rounded-full border border-[#1A2A4F] bg-white px-4 py-2 text-sm font-bold text-[#1A2A4F] transition hover:-translate-y-0.5"
              >
                로그인
              </RouterLink>
              <RouterLink
                to="/signup"
                class="rounded-full border border-[#1A2A4F] bg-[#F7A5A5] px-4 py-2 text-sm font-bold text-[#1A2A4F] transition hover:-translate-y-0.5"
              >
                회원가입
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink
                v-if="isAdmin"
                to="/admin"
                class="rounded-full border border-[#1A2A4F] bg-[#FFDBB6] px-4 py-2 text-sm font-bold text-[#1A2A4F]"
              >
                관리자
              </RouterLink>
              <RouterLink
                to="/mypage"
                class="rounded-full border border-[#1A2A4F] bg-white px-4 py-2 text-sm font-bold text-[#1A2A4F]"
              >
                마이페이지
              </RouterLink>
              <button
                type="button"
                class="rounded-full border border-[#1A2A4F] bg-white px-4 py-2 text-sm font-bold text-[#1A2A4F]"
                @click="handleLogout"
              >
                로그아웃
              </button>
            </template>

            <RouterLink
              to="/game"
              class="rounded-full border-2 border-[#1A2A4F] bg-[#1A2A4F] px-5 py-3 text-sm font-black text-[#FFF2EF] shadow-[6px_6px_0_0_rgba(26,42,79,0.15)] transition hover:-translate-y-0.5"
            >
              오늘의 모험 시작
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
