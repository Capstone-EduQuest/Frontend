<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Navbar from '../components/Navbar.vue'
import { userAPI, type UserProfile } from '../api/auth'
import { useAuthStore } from '../store/auth'

interface UserRow extends UserProfile {
  is_locked: boolean
}

const auth = useAuthStore()
const users = ref<UserRow[]>([])
const roles = ref<{ uuid: string; name: string }[]>([])
const selectedUserId = ref<string | null>(null)
const selectedRoleUuid = ref('')
const isLoading = ref(false)
const error = ref('')

const selectedUser = computed(() => users.value.find((user) => user.uuid === selectedUserId.value) ?? null)

const fetchAdminData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const [userListResponse, roleList] = await Promise.all([
      userAPI.getUserList({ page: 1, size: 20, sort: 'created_at', is_asc: false }),
      userAPI.getRoles(),
    ])

    users.value = userListResponse.results as UserRow[]
    roles.value = roleList
    selectedUserId.value = userListResponse.results[0]?.uuid ?? null
    selectedRoleUuid.value = ''
  } catch (fetchError) {
    console.error(fetchError)
    error.value = '관리자 데이터를 불러오는데 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const refreshUsers = async () => {
  try {
    const result = await userAPI.getUserList({ page: 1, size: 20, sort: 'created_at', is_asc: false })
    users.value = result.results as UserRow[]
  } catch (refreshError) {
    console.error(refreshError)
    error.value = '사용자 목록을 갱신하는 중 오류가 발생했습니다.'
  }
}

const handleToggleLock = async (userUuid: string, currentLocked: boolean) => {
  try {
    await userAPI.lockUser(userUuid, !currentLocked)
    await refreshUsers()
  } catch (lockError) {
    console.error(lockError)
    error.value = '계정 잠금/해제 처리 중 오류가 발생했습니다.'
  }
}

const handleDeleteUser = async (userUuid: string) => {
  if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
    return
  }

  try {
    await userAPI.deleteUser(userUuid)
    await refreshUsers()
    if (selectedUserId.value === userUuid) {
      selectedUserId.value = null
    }
  } catch (deleteError) {
    console.error(deleteError)
    error.value = '사용자 삭제 중 오류가 발생했습니다.'
  }
}

const handleRoleChange = async (userUuid: string, roleUuid: string) => {
  try {
    await userAPI.updateRole(userUuid, roleUuid)
    await refreshUsers()
  } catch (roleError) {
    console.error(roleError)
    error.value = '사용자 역할 변경 중 오류가 발생했습니다.'
  }
}

watch(selectedUser, (user) => {
  if (!user) {
    selectedRoleUuid.value = ''
    return
  }

  const matchingRole = roles.value.find((role) => role.name === user.role)
  selectedRoleUuid.value = matchingRole?.uuid ?? ''
})

onMounted(fetchAdminData)
</script>

<template>
  <div class="min-h-screen w-full bg-gray-100 font-mono">
    <Navbar />
    <main class="mx-auto max-w-7xl p-10">
      <div class="rounded-3xl border-4 border-gray-900 bg-white p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.25)]">
        <div class="mb-6 flex flex-col gap-3">
          <p class="text-sm uppercase tracking-[0.35em] text-gray-500">관리자 전용</p>
          <h1 class="text-4xl font-black text-gray-900">관리자 대시보드</h1>
          <p class="text-sm text-gray-600">
            {{ auth.state.user ? `${auth.state.user.nickname}(${auth.state.user.user_id})님이 관리자 권한으로 접속했습니다.` : '관리자 전용 페이지입니다.' }}
          </p>
        </div>

        <div class="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <section class="rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-2xl font-black text-gray-900">사용자 관리</h2>
                <p class="text-sm text-gray-600">관리자 API와 실제 통신하는 사용자 리스트입니다.</p>
              </div>
              <button type="button" class="rounded-2xl bg-[#e8472a] px-4 py-2 text-sm font-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-[#d13d1f]" @click="fetchAdminData">
                새로고침
              </button>
            </div>

            <div v-if="error" class="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>

            <div v-if="isLoading" class="py-16 text-center text-gray-500">사용자 목록을 불러오는 중입니다...</div>

            <div v-else class="space-y-3">
              <div v-if="users.length === 0" class="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                관리자 API로부터 사용자를 가져오지 못했습니다.
              </div>
              <button
                v-for="user in users"
                :key="user.uuid"
                type="button"
                class="w-full rounded-3xl border px-4 py-4 text-left transition"
                :class="user.uuid === selectedUserId ? 'border-[#e8472a] bg-[#fff0ef]' : 'border-gray-200 bg-white hover:border-gray-900 hover:bg-gray-50'"
                @click="selectedUserId = user.uuid"
              >
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="font-black text-gray-900">{{ user.nickname || user.user_id || user.id }}</p>
                    <p class="text-xs text-gray-500">{{ user.user_id ?? user.id }} · {{ user.role }}</p>
                  </div>
                  <span class="rounded-full px-3 py-1 text-xs font-bold" :class="user.is_locked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
                    {{ user.is_locked ? '잠금' : '활성' }}
                  </span>
                </div>
              </button>
            </div>
          </section>

          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="mb-5">
              <h2 class="text-2xl font-black text-gray-900">선택한 사용자</h2>
              <p class="text-sm text-gray-600">목록에서 사용자를 클릭하면 상세 정보를 확인하고 조치할 수 있습니다.</p>
            </div>

            <div v-if="!selectedUser" class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              사용자 항목을 선택해 주세요.
            </div>

            <div v-else class="space-y-6">
              <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <p class="text-sm text-gray-500">UUID</p>
                <p class="break-all font-black text-gray-900">{{ selectedUser.uuid }}</p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <p class="text-sm text-gray-500">이름</p>
                  <p class="font-black text-gray-900">{{ selectedUser.nickname }}</p>
                </div>
                <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <p class="text-sm text-gray-500">아이디</p>
                  <p class="font-black text-gray-900">{{ selectedUser.user_id ?? selectedUser.id }}</p>
                </div>
              </div>

              <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <p class="mb-3 text-sm text-gray-500">현재 역할</p>
                <p class="mb-3 font-black text-gray-900">{{ selectedUser.role }}</p>
                <label class="mb-2 block text-sm font-bold text-gray-700">역할 변경</label>
                <select
                  v-model="selectedRoleUuid"
                  class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
                  @change="handleRoleChange(selectedUser.uuid, selectedRoleUuid)"
                >
                  <option value="">역할 선택</option>
                  <option v-for="role in roles" :key="role.uuid" :value="role.uuid">{{ role.name }}</option>
                </select>
              </div>

              <div class="space-y-4">
                <button type="button" class="w-full rounded-3xl bg-[#e8472a] px-5 py-3 text-sm font-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-[#d13d1f]" @click="handleToggleLock(selectedUser.uuid, selectedUser.is_locked)">
                  {{ selectedUser.is_locked ? '계정 잠금 해제' : '계정 잠금' }}
                </button>
                <button type="button" class="w-full rounded-3xl border border-red-500 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition-colors hover:bg-red-100" @click="handleDeleteUser(selectedUser.uuid)">
                  사용자 삭제
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
