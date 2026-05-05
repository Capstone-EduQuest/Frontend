<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'

const reviewStages = [
  { id: 1, title: '변수와 자료형', date: '2026.05.01' },
  { id: 2, title: 'for 반복문', date: '2026.05.02' },
  { id: 3, title: '리스트와 슬라이싱', date: '2026.05.03' },
]
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF] font-sans">
    <PageHeader
      title="복습하기"
      subtitle="지난 학습 내용을 다시 확인하고 주요 개념을 빠르게 복습해 보세요."
      @back="$router.back()"
    />

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="flex flex-col space-y-4">
        <div
          v-for="stage in reviewStages"
          :key="stage.id"
          class="flex flex-col gap-4 rounded-[24px] border-4 border-[#1A2A4F] bg-white p-5 shadow-[6px_6px_0_0_rgba(26,42,79,1)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0">
            <h2 class="text-xl font-black text-[#1A2A4F] sm:text-2xl">{{ stage.title }}</h2>
            <p class="mt-2 text-sm font-bold text-slate-500">{{ stage.date }}</p>
          </div>

          <button class="shrink-0 rounded-full border-2 border-[#1A2A4F] bg-[#F7A5A5] px-5 py-3 text-sm font-black text-[#1A2A4F] shadow-[4px_4px_0_0_rgba(26,42,79,1)] transition-transform hover:-translate-y-1">
            도전하기
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
