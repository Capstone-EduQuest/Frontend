<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Navbar from '../components/Navbar.vue'
import { dashboardApi } from '../api/mockApi'
import type { Community, Notice } from '../types/database'

const recentNotices = ref<Notice[]>([])
const recentPosts = ref<Community[]>([])
const userProgress = ref<{ level: number; exp: number; expMax: number; clearedStages: number; totalStages: number } | null>(null)

onMounted(async () => {
  const [notices, posts, progress] = await Promise.all([
    dashboardApi.fetchRecentNotices(),
    dashboardApi.fetchRecentPosts(),
    dashboardApi.fetchUserProgress(),
  ])

  recentNotices.value = notices
  recentPosts.value = posts
  userProgress.value = progress
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF]">
    <Navbar />

    <section class="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div class="absolute left-0 top-10 h-40 w-40 rounded-full bg-[#F7A5A5]/40 blur-3xl" />
      <div class="absolute right-10 top-24 h-48 w-48 rounded-full bg-[#FFDBB6]/60 blur-3xl" />

      <div class="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="overflow-hidden rounded-[36px] border-2 border-[#1A2A4F] bg-[#1A2A4F] text-white shadow-[10px_10px_0_0_rgba(26,42,79,0.14)]">
          <div class="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p class="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-[#FFDBB6]">
                초등 4학년부터 중학교 2학년까지
              </p>
              <h1 class="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                재미있게 도전하고
                <br />
                천천히 실력을 키워요
              </h1>
              <p class="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                단계별 스테이지, 오답 노트, 커뮤니티로 혼자서도 배우고 함께 질문할 수 있는 코딩 학습 공간입니다.
              </p>

              <div class="mt-8 flex flex-wrap gap-3">
                <RouterLink
                  to="/game"
                  class="rounded-full border-2 border-white bg-[#F7A5A5] px-6 py-3 text-base font-black text-[#1A2A4F] transition hover:-translate-y-0.5"
                >
                  스테이지 시작하기
                </RouterLink>
                <RouterLink
                  to="/community"
                  class="rounded-full border-2 border-white/50 bg-white/10 px-6 py-3 text-base font-bold text-white transition hover:bg-white/20"
                >
                  질문하러 가기
                </RouterLink>
              </div>
            </div>

            <div class="grid gap-4">
              <div class="rounded-[28px] bg-white p-5 text-[#1A2A4F] shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
                <p class="text-sm font-bold text-slate-500">오늘의 한 줄 목표</p>
                <p class="mt-2 text-xl font-black">하루 한 문제씩 꾸준히!</p>
              </div>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div class="rounded-[28px] bg-[#FFDBB6] p-5 text-[#1A2A4F]">
                  <p class="text-sm font-bold">스테이지 학습</p>
                  <p class="mt-2 text-lg font-black">작은 단계로 차근차근</p>
                </div>
                <div class="rounded-[28px] bg-[#FFF2EF] p-5 text-[#1A2A4F]">
                  <p class="text-sm font-bold">오답 복습</p>
                  <p class="mt-2 text-lg font-black">틀린 문제도 자산으로</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-5">
          <div class="rounded-[32px] border border-[#1A2A4F]/10 bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#1A2A4F]/55">학습 현황</p>
            <div v-if="userProgress" class="mt-4 space-y-4">
              <div class="flex items-end justify-between">
                <div>
                  <p class="text-sm text-slate-500">현재 레벨</p>
                  <p class="text-4xl font-black text-[#1A2A4F]">Lv. {{ userProgress.level }}</p>
                </div>
                <RouterLink to="/progress" class="rounded-full bg-[#1A2A4F] px-4 py-2 text-sm font-bold text-white">
                  자세히 보기
                </RouterLink>
              </div>
              <div class="rounded-[24px] bg-[#FFF2EF] p-4">
                <div class="mb-2 flex justify-between text-sm font-bold text-[#1A2A4F]">
                  <span>경험치</span>
                  <span>{{ userProgress.exp }} / {{ userProgress.expMax }}</span>
                </div>
                <div class="h-3 rounded-full bg-white">
                  <div
                    class="h-3 rounded-full bg-[#F7A5A5]"
                    :style="{ width: `${(userProgress.exp / Math.max(userProgress.expMax, 1)) * 100}%` }"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-[24px] bg-[#FFDBB6] p-4 text-[#1A2A4F]">
                  <p class="text-sm font-bold">클리어 스테이지</p>
                  <p class="mt-2 text-2xl font-black">{{ userProgress.clearedStages }}</p>
                </div>
                <div class="rounded-[24px] bg-[#F7A5A5] p-4 text-[#1A2A4F]">
                  <p class="text-sm font-bold">전체 스테이지</p>
                  <p class="mt-2 text-2xl font-black">{{ userProgress.totalStages }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[32px] border border-[#1A2A4F]/10 bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#1A2A4F]/55">바로 가기</p>
            <div class="mt-4 grid gap-3">
              <RouterLink to="/incorrect-note" class="rounded-[22px] bg-[#FFF2EF] px-5 py-4 font-bold text-[#1A2A4F] transition hover:bg-[#FFDBB6]">
                오답 노트 다시 보기
              </RouterLink>
              <RouterLink to="/community" class="rounded-[22px] bg-[#FFF2EF] px-5 py-4 font-bold text-[#1A2A4F] transition hover:bg-[#F7A5A5]">
                친구들 질문 구경하기
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 pb-14 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        <div class="rounded-[32px] border border-[#1A2A4F]/10 bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#1A2A4F]/55">공지사항</p>
              <h2 class="mt-2 text-2xl font-black text-[#1A2A4F]">새 소식을 확인해요</h2>
            </div>
            <RouterLink to="/notice" class="text-sm font-bold text-[#1A2A4F]">더보기</RouterLink>
          </div>
          <div class="mt-5 space-y-3">
            <div
              v-for="notice in recentNotices"
              :key="notice.uuid"
              class="rounded-[24px] border border-[#FFDBB6] bg-[#FFF2EF] p-4"
            >
              <p class="font-bold text-[#1A2A4F]">{{ notice.title }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ notice.content.slice(0, 70) }}...</p>
            </div>
          </div>
        </div>

        <div class="rounded-[32px] border border-[#1A2A4F]/10 bg-white p-6 shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#1A2A4F]/55">커뮤니티</p>
              <h2 class="mt-2 text-2xl font-black text-[#1A2A4F]">친구들과 함께 질문해요</h2>
            </div>
            <RouterLink to="/community" class="text-sm font-bold text-[#1A2A4F]">더보기</RouterLink>
          </div>
          <div class="mt-5 space-y-3">
            <div
              v-for="post in recentPosts"
              :key="post.uuid"
              class="rounded-[24px] border border-[#F7A5A5] bg-white p-4"
            >
              <p class="font-bold text-[#1A2A4F]">{{ post.title }}</p>
              <p class="mt-2 text-sm text-slate-600">
                {{ post.author }} · 답변 {{ post.answers_count ?? 0 }}개
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
