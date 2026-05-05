<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Navbar from '../components/Navbar.vue'
import { userAPI, type UserListItem, type UserProfile } from '../api/auth'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const users = ref<UserListItem[]>([])
const roles = ref<{ uuid: string; name: string }[]>([])
const selectedUserId = ref<string | null>(null)
const selectedUserProfile = ref<UserProfile | null>(null)
const selectedRoleUuid = ref('')
const isLoading = ref(false)
const isProfileLoading = ref(false)
const error = ref('')

const selectedUser = computed(() => users.value.find((user) => user.uuid === selectedUserId.value) ?? null)

const fetchSelectedUserProfile = async (uuid: string) => {
  isProfileLoading.value = true
  try {
    selectedUserProfile.value = await userAPI.getProfile(uuid)
  } catch (profileError) {
    console.error(profileError)
    selectedUserProfile.value = null
    error.value = '선택한 사용자 정보를 불러오지 못했습니다.'
  } finally {
    isProfileLoading.value = false
  }
}

const fetchAdminData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const [userListResponse, roleList] = await Promise.all([
      userAPI.getUserList({ page: 1, size: 20, sort: 'created_at', is_asc: false }),
      userAPI.getRoles(),
    ])

    users.value = userListResponse.results
    roles.value = roleList
    selectedUserId.value = userListResponse.results[0]?.uuid ?? null
  } catch (fetchError) {
    console.error(fetchError)
    error.value = '관리자 데이터를 불러오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const refreshUsers = async () => {
  try {
    const result = await userAPI.getUserList({ page: 1, size: 20, sort: 'created_at', is_asc: false })
    users.value = result.results
    if (selectedUserId.value) {
      await fetchSelectedUserProfile(selectedUserId.value)
    }
  } catch (refreshError) {
    console.error(refreshError)
    error.value = '사용자 목록을 갱신하는 중 오류가 발생했습니다.'
  }
}

const handleToggleLock = async (userUuid: string) => {
  try {
    await userAPI.lockUser(userUuid)
    await refreshUsers()
  } catch (lockError) {
    console.error(lockError)
    error.value = '계정 잠금 처리 중 오류가 발생했습니다.'
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
      selectedUserId.value = users.value[0]?.uuid ?? null
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

watch(selectedUserId, async (uuid) => {
  if (!uuid) {
    selectedUserProfile.value = null
    selectedRoleUuid.value = ''
    return
  }

  await fetchSelectedUserProfile(uuid)

  const matchingRole = roles.value.find((role) => role.name === selectedUserProfile.value?.role)
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
            {{
              auth.state.user
                ? `${auth.state.user.nickname}(${auth.state.user.user_id}) 계정으로 접속 중입니다.`
                : '관리자 전용 페이지입니다.'
            }}
          </p>
        </div>

        <div class="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <section class="rounded-3xl border border-gray-200 bg-gray-50 p-6">
            <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-2xl font-black text-gray-900">사용자 목록</h2>
                <p class="text-sm text-gray-600">백엔드에서 내려주는 관리자용 사용자 목록입니다.</p>
              </div>
              <button
                type="button"
                class="rounded-2xl bg-[#e8472a] px-4 py-2 text-sm font-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-[#d13d1f]"
                @click="fetchAdminData"
              >
                새로고침
              </button>
            </div>

            <div
              v-if="error"
              class="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {{ error }}
            </div>

            <div v-if="isLoading" class="py-16 text-center text-gray-500">사용자 목록을 불러오는 중입니다...</div>

            <div v-else class="space-y-3">
              <div
                v-if="users.length === 0"
                class="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500"
              >
                표시할 사용자가 없습니다.
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
                    <p class="font-black text-gray-900">{{ user.nickname || user.id }}</p>
                    <p class="text-xs text-gray-500">{{ user.id }} · {{ user.email }}</p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="mb-5">
              <h2 class="text-2xl font-black text-gray-900">선택한 사용자</h2>
              <p class="text-sm text-gray-600">상세 조회는 별도 프로필 API 결과를 사용합니다.</p>
            </div>

            <div
              v-if="!selectedUser"
              class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500"
            >
              사용자 항목을 선택해 주세요.
            </div>

            <div
              v-else-if="isProfileLoading"
              class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500"
            >
              사용자 상세 정보를 불러오는 중입니다.
            </div>

            <div v-else-if="selectedUserProfile" class="space-y-6">
              <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <p class="text-sm text-gray-500">UUID</p>
                <p class="break-all font-black text-gray-900">{{ selectedUserProfile.uuid }}</p>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <p class="text-sm text-gray-500">닉네임</p>
                  <p class="font-black text-gray-900">{{ selectedUserProfile.nickname }}</p>
                </div>
                <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <p class="text-sm text-gray-500">아이디</p>
                  <p class="font-black text-gray-900">{{ selectedUserProfile.user_id ?? selectedUserProfile.id }}</p>
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <p class="text-sm text-gray-500">역할</p>
                  <p class="font-black text-gray-900">{{ selectedUserProfile.role }}</p>
                </div>
                <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                  <p class="text-sm text-gray-500">잠금 상태</p>
                  <p class="font-black text-gray-900">{{ selectedUserProfile.is_locked ? '잠김' : '활성' }}</p>
                </div>
              </div>

              <div class="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <p class="mb-3 text-sm text-gray-500">역할 변경</p>
                <select
                  v-model="selectedRoleUuid"
                  class="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
                  @change="handleRoleChange(selectedUserProfile.uuid, selectedRoleUuid)"
                >
                  <option value="">역할 선택</option>
                  <option v-for="role in roles" :key="role.uuid" :value="role.uuid">{{ role.name }}</option>
                </select>
              </div>

              <div class="space-y-4">
                <button
                  type="button"
                  class="w-full rounded-3xl bg-[#e8472a] px-5 py-3 text-sm font-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors hover:bg-[#d13d1f]"
                  @click="handleToggleLock(selectedUserProfile.uuid)"
                >
                  계정 잠금 토글
                </button>
                <button
                  type="button"
                  class="w-full rounded-3xl border border-red-500 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition-colors hover:bg-red-100"
                  @click="handleDeleteUser(selectedUserProfile.uuid)"
                >
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
