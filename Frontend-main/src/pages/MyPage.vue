<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import PageHeader from '../components/PageHeader.vue'
import { userAPI, type UserProfile } from '../api/auth'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const profile = ref<UserProfile | null>(null)
const isLoading = ref(true)
const error = ref('')

const profileImageUrl = computed(
  () =>
    profile.value?.profile_image_url ??
    profile.value?.profile_url ??
    profile.value?.profile_image ??
    profile.value?.avatar_url ??
    profile.value?.profile
)

onMounted(async () => {
  await auth.restoreAuth(route.path)
  if (!auth.state.accessToken || !auth.state.user) {
    await router.push('/login')
    return
  }

  try {
    profile.value = await userAPI.getProfile(auth.state.user.uuid)
  } catch {
    error.value = '프로필 정보를 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#FFF2EF] py-10">
    <Navbar />
    <PageHeader title="나의 학습 기록" subtitle="학습 진행 상황과 추천 콘텐츠를 확인해 보세요." @back="router.back()" />

    <div class="mx-auto mt-6 max-w-5xl rounded-[36px] bg-white p-8 shadow-xl shadow-[#1A2A4F]/10">
      <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-[#1A2A4F]">마이페이지</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">내 학습 현황</h2>
      </div>

      <div v-if="error" class="mb-6 rounded-3xl border border-[#F7A5A5] bg-[#FFF2EF] p-5 text-sm text-[#1A2A4F]">{{ error }}</div>
      <div v-if="isLoading" class="rounded-3xl border border-[#FFDBB6] bg-[#FFF2EF] p-10 text-center text-slate-500">프로필 정보를 불러오는 중입니다...</div>

      <div v-else class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-[28px] border border-[#FFDBB6] bg-[#FFF2EF] p-6">
          <h2 class="text-xl font-semibold text-[#1A2A4F]">오늘의 요약</h2>
          <div class="mt-6 flex flex-col gap-4">
            <div class="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
              <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#FFDBB6] text-2xl text-[#1A2A4F]">
                <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필 이미지" class="h-full w-full object-cover">
                <span v-else>{{ profile?.nickname?.[0] ?? 'U' }}</span>
              </div>
              <div>
                <p class="text-sm text-slate-500">환영합니다.</p>
                <p class="text-xl font-bold text-slate-900">{{ profile?.nickname ?? '학습자' }}님</p>
              </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-3xl bg-white p-4 shadow-sm"><div class="text-sm text-slate-500">포인트</div><div class="mt-2 text-2xl font-bold text-[#1A2A4F]">{{ profile?.wallet?.balance ?? profile?.point ?? 0 }}</div></div>
              <div class="rounded-3xl bg-white p-4 shadow-sm"><div class="text-sm text-slate-500">회원 등급</div><div class="mt-2 text-2xl font-bold text-[#1A2A4F]">{{ profile?.role ?? '-' }}</div></div>
              <div class="rounded-3xl bg-white p-4 shadow-sm"><div class="text-sm text-slate-500">닉네임</div><div class="mt-2 text-2xl font-bold text-[#1A2A4F]">{{ profile?.nickname ?? '-' }}</div></div>
              <div class="rounded-3xl bg-white p-4 shadow-sm"><div class="text-sm text-slate-500">생년월일</div><div class="mt-2 text-2xl font-bold text-[#1A2A4F]">{{ profile?.birth ? new Date(profile.birth).toLocaleDateString() : '-' }}</div></div>
            </div>
          </div>
        </div>

        <div class="rounded-[28px] border border-[#F7A5A5] bg-white p-6">
          <h2 class="text-xl font-semibold text-[#1A2A4F]">맞춤 학습 추천</h2>
          <div class="mt-6 space-y-4">
            <div class="rounded-3xl border border-[#FFDBB6] bg-[#FFF2EF] p-5 shadow-sm">
              <p class="text-sm font-semibold text-[#1A2A4F]">추천 학습 1</p>
              <p class="mt-2 text-base text-slate-600">기본 문법 복습과 알고리즘 문제 풀이부터 시작해 보세요.</p>
            </div>
            <div class="rounded-3xl border border-[#F7A5A5] bg-[#FFF2EF] p-5 shadow-sm">
              <p class="text-sm font-semibold text-[#1A2A4F]">추천 학습 2</p>
              <p class="mt-2 text-base text-slate-600">최근 학습 이력을 기반으로 맞춤형 콘텐츠를 제안합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
