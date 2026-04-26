<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'

const notices = [
  {
    id: 1,
    title: '신규 스테이지 업데이트 안내',
    date: '2026-04-08',
    summary: 'Stage 4 데이터 구조 학습 스테이지가 새롭게 추가되었습니다. 신규 미션과 보상을 확인해 보세요.',
  },
  {
    id: 2,
    title: '서버 점검 안내',
    date: '2026-04-05',
    summary: '4월 12일 오전 2시부터 3시까지 서버 점검이 진행됩니다. 해당 시간에는 일부 기능이 일시 중단됩니다.',
  },
  {
    id: 3,
    title: '출석 이벤트 참여 안내',
    date: '2026-04-02',
    summary: '학습 점수 5,000P 이상 달성 시 보상을 받을 수 있는 이벤트가 열렸습니다. 기간과 미션을 확인해 보세요.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF]">
    <PageHeader
      title="공지사항"
      subtitle="EduQuest의 최신 소식과 업데이트 내용을 빠르게 확인해 보세요."
      back-link="/"
    />

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-[30px] border border-[#1A2A4F]/10 bg-white shadow-[0_18px_44px_rgba(26,42,79,0.08)]">
        <table class="w-full">
          <thead class="border-b border-[#1A2A4F]/10 bg-[#FFF2EF]">
            <tr>
              <th class="px-6 py-4 text-left text-lg font-black text-[#1A2A4F]">제목</th>
              <th class="px-6 py-4 text-left text-lg font-black text-[#1A2A4F]">날짜</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id" class="border-b border-[#1A2A4F]/8 last:border-b-0 hover:bg-[#FFF9F6]">
              <td class="px-6 py-5">
                <div>
                  <h3 class="text-xl font-black text-[#1A2A4F]">{{ notice.title }}</h3>
                  <p class="mt-2 text-sm leading-6 text-slate-600">{{ notice.summary }}</p>
                </div>
              </td>
              <td class="px-6 py-5 font-bold text-slate-500">{{ notice.date }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>
