<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'

const reviewStages = [
  { id: 1, title: '변수와 할당', progress: '완료 100%', reward: '30 P' },
  { id: 2, title: 'for 반복문', progress: '완료 100%', reward: '45 P' },
  { id: 3, title: '리스트 슬라이싱', progress: '완료 100%', reward: '40 P' },
]
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF] p-10 font-sans">
    <div class="mx-auto max-w-6xl space-y-6">
      <PageHeader title="복습하기" subtitle="지난 학습 내용을 다시 확인하고 주요 개념을 빠르게 복습해 보세요." @back="$router.back()" />

      <section class="grid gap-6 md:grid-cols-2">
        <div v-for="stage in reviewStages" :key="stage.id" class="rounded-3xl border-4 border-[#1A2A4F] bg-white p-6 shadow-[6px_6px_0_0_rgba(26,42,79,1)]">
          <h2 class="text-2xl font-black text-[#1A2A4F]">{{ stage.title }}</h2>
          <p class="mt-3 text-slate-500">진행 상태: <span class="font-bold text-[#1A2A4F]">{{ stage.progress }}</span></p>
          <p class="mt-2 text-slate-500">보상: <span class="font-bold text-[#1A2A4F]">{{ stage.reward }}</span></p>
          <button class="mt-6 rounded-full border-2 border-[#1A2A4F] bg-[#F7A5A5] px-5 py-3 text-sm font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition-transform hover:-translate-y-1">
            다시 풀기
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
