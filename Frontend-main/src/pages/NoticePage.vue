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
    summary: '4월 12일 오전 2시부터 3시까지 서버 점검이 예정되어 있습니다. 해당 시간에는 일부 기능이 일시 중단됩니다.',
  },
  {
    id: 3,
    title: '출석 이벤트 참여 안내',
    date: '2026-04-02',
    summary: '학습 점수 5,000P 이상 달성 시 보상 이벤트를 드립니다. 이벤트 기간 내 미션을 확인해 보세요.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-10 font-sans">
    <div class="mx-auto max-w-6xl space-y-6">
      <PageHeader title="공지사항" subtitle="EduQuest의 최신 소식과 업데이트 내용을 확인해 보세요." back-link="/" />

      <section class="overflow-hidden rounded-xl border-4 border-gray-900 bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <table class="w-full">
          <thead class="border-b-4 border-gray-900 bg-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-lg font-black text-gray-900">제목</th>
              <th class="px-6 py-4 text-left text-lg font-black text-gray-900">날짜</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id" class="border-b border-gray-200 hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ notice.title }}</h3>
                  <p class="mt-1 text-gray-600">{{ notice.summary }}</p>
                </div>
              </td>
              <td class="px-6 py-4 font-semibold text-gray-500">{{ notice.date }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>
