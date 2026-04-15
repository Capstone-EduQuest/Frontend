import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import { userAPI } from '../api/auth';
import type { RootState } from '../store';
import type { UserProfile } from '../api/auth';

interface UserRow extends UserProfile {
  is_locked: boolean;
}

interface RoleOption {
  uuid: string;
  name: string;
}

export default function AdminPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleUuid, setSelectedRoleUuid] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [userListResponse, roleList] = await Promise.all([
        userAPI.getUserList({ page: 1, size: 20, sort: 'created_at', is_asc: false }),
        userAPI.getRoles(),
      ]);

      setUsers(userListResponse.results);
      setRoles(roleList);
      const firstUuid = userListResponse.results[0]?.uuid ?? null;
      setSelectedUserId(firstUuid);
      setSelectedRoleUuid('');
    } catch (fetchError: any) {
      console.error(fetchError);
      setError('관리자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const selectedUser = users.find((user) => user.uuid === selectedUserId);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedRoleUuid('');
      return;
    }

    const matchingRole = roles.find((role) => role.name === selectedUser.role);
    setSelectedRoleUuid(matchingRole?.uuid ?? '');
  }, [selectedUser, roles]);

  const refreshUsers = async () => {
    try {
      const result = await userAPI.getUserList({ page: 1, size: 20, sort: 'created_at', is_asc: false });
      setUsers(result.results);
    } catch (refreshError) {
      console.error(refreshError);
      setError('사용자 목록을 갱신하는 중 오류가 발생했습니다.');
    }
  };

  const handleToggleLock = async (userUuid: string, currentLocked: boolean) => {
    try {
      await userAPI.lockUser(userUuid, !currentLocked);
      await refreshUsers();
    } catch (lockError) {
      console.error(lockError);
      setError('계정 잠금/해제 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteUser = async (userUuid: string) => {
    if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;

    try {
      await userAPI.deleteUser(userUuid);
      await refreshUsers();
      if (selectedUserId === userUuid) {
        setSelectedUserId(null);
      }
    } catch (deleteError) {
      console.error(deleteError);
      setError('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleRoleChange = async (userUuid: string, roleUuid: string) => {
    try {
      await userAPI.updateRole(userUuid, roleUuid);
      await refreshUsers();
    } catch (roleError) {
      console.error(roleError);
      setError('사용자 역할 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 font-mono">
      <Navbar />
      <main className="max-w-7xl mx-auto p-10">
        <div className="rounded-3xl border-4 border-gray-900 bg-white p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.25)]">
          <div className="mb-6 flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.35em] text-gray-500">관리자 패널</p>
            <h1 className="text-4xl font-black text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600 text-sm">
              {authUser ? `${authUser.nickname}(${authUser.user_id})님은 관리자 권한으로 접속했습니다.` : '관리자 전용 페이지입니다.'}
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">사용자 관리</h2>
                  <p className="text-sm text-gray-600">관리자 API와 실제 통신하는 사용자 리스트입니다.</p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminData}
                  className="rounded-2xl bg-[#e8472a] px-4 py-2 text-sm font-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#d13d1f] transition-colors"
                >
                  새로고침
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="py-16 text-center text-gray-500">사용자 목록을 불러오는 중입니다...</div>
              ) : (
                <div className="space-y-3">
                  {users.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                      관리자 API로부터 사용자를 가져오지 못했습니다.
                    </div>
                  ) : (
                    users.map((user) => (
                      <button
                        key={user.uuid}
                        type="button"
                        onClick={() => setSelectedUserId(user.uuid)}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          user.uuid === selectedUserId
                            ? 'border-[#e8472a] bg-[#fff0ef]'
                            : 'border-gray-200 bg-white hover:border-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-black text-gray-900">{user.nickname || user.user_id}</p>
                            <p className="text-xs text-gray-500">{user.user_id} · {user.role}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.is_locked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user.is_locked ? '잠김' : '활성'}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-gray-900">선택된 사용자</h2>
                <p className="text-sm text-gray-600">목록에서 사용자를 클릭하면 상세 정보를 확인하고 조치할 수 있습니다.</p>
              </div>

              {!selectedUser ? (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                  사용자 항목을 선택해주세요.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">UUID</p>
                    <p className="font-black text-gray-900 break-all">{selectedUser.uuid}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                      <p className="text-sm text-gray-500">이름</p>
                      <p className="font-black text-gray-900">{selectedUser.nickname}</p>
                    </div>
                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                      <p className="text-sm text-gray-500">아이디</p>
                      <p className="font-black text-gray-900">{selectedUser.user_id}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-sm text-gray-500">현재 역할</p>
                    <p className="font-black text-gray-900 mb-3">{selectedUser.role}</p>
                    <label className="block text-sm font-bold text-gray-700 mb-2">역할 변경</label>
                    <select
                      value={selectedRoleUuid}
                      onChange={async (event) => {
                        const roleUuid = event.target.value;
                        setSelectedRoleUuid(roleUuid);
                        await handleRoleChange(selectedUser.uuid, roleUuid);
                      }}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#e8472a] focus:ring-2 focus:ring-orange-200"
                    >
                      <option value="">역할 선택</option>
                      {roles.map((role) => (
                        <option key={role.uuid} value={role.uuid}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-500">변경 후 새로고침하여 반영됩니다.</p>
                  </div>

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => handleToggleLock(selectedUser.uuid, selectedUser.is_locked)}
                      className="w-full rounded-3xl bg-[#e8472a] px-5 py-3 text-sm font-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#d13d1f] transition-colors"
                    >
                      {selectedUser.is_locked ? '계정 잠금 해제' : '계정 잠금'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser.uuid)}
                      className="w-full rounded-3xl border border-red-500 bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100 transition-colors"
                    >
                      사용자 삭제
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
