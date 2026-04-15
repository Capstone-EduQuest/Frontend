import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Navbar from '../components/Navbar';
import { userAPI } from '../api/auth';
import type { RootState } from '../store';
import type { UserProfile } from '../api/auth';

export default function MyPage() {
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoBack = () => navigate(-1);

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await userAPI.getProfile(authUser.uuid);
        setProfile(response);
      } catch (fetchError) {
        console.error(fetchError);
        setError('프로필 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authUser, navigate]);

  return (
    <div className="min-h-screen bg-[#f5f3f0] py-10">
      <Navbar />
      <PageHeader
        title="나의 학습 기록"
        subtitle="퀘스트 진행 상황과 맞춤 추천을 확인해보세요."
        backAction={handleGoBack}
      />

      <div className="mx-auto mt-6 max-w-5xl rounded-[36px] bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#e8472a]">마이페이지</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">내 학습 현황</h2>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            프로필 정보를 불러오는 중입니다...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">오늘의 요약</h2>
              <p className="mt-4 text-slate-600">백엔드에서 가져온 내 계정 정보를 기반으로 보여줍니다.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-500">포인트</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{profile?.wallet?.balance ?? '로딩 중'}</div>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-500">회원 등급</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{profile?.role ?? '로딩 중'}</div>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-500">닉네임</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{profile?.nickname ?? '로딩 중'}</div>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-500">가입일</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{profile ? new Date(profile.created_at).toLocaleDateString() : '로딩 중'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">맞춤형 학습 추천</h2>
              <p className="mt-4 text-slate-600">현재 서버에서 불러온 프로필 정보를 기준으로 추천을 유지합니다.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">내 아이디</p>
                  <p className="mt-2 text-base text-slate-600">{profile?.user_id ?? '로딩 중'}</p>
                </div>
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">계정 상태</p>
                  <p className="mt-2 text-base text-slate-600">{profile?.is_locked ? '잠김' : '활성'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
