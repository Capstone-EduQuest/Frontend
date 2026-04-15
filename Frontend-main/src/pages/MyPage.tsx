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
  const authAccessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(authAccessToken));
  const [error, setError] = useState('');
  const profileImageUrl = profile?.profile_image_url ?? profile?.profile_url ?? profile?.profile_image ?? profile?.avatar_url;

  const handleGoBack = () => navigate(-1);

  useEffect(() => {
    if (!authAccessToken) {
      navigate('/login');
      return;
    }

    if (!authUser) {
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
  }, [authAccessToken, authUser, navigate]);

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
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-2xl text-slate-600">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt="프로필 이미지" className="h-full w-full object-cover" />
                    ) : (
                      profile?.nickname?.[0] ?? 'U'
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">환영합니다</p>
                    <p className="text-xl font-bold text-slate-900">{profile?.nickname ?? '학습자'}님</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="text-sm text-slate-500">생년월일</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{profile ? new Date(profile.birth).toLocaleDateString() : '로딩 중'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">맞춤형 학습 추천</h2>
              <p className="mt-4 text-slate-600">회원님의 프로필 정보를 바탕으로 추천 학습 콘텐츠를 안내합니다.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">추천 학습 1</p>
                  <p className="mt-2 text-base text-slate-600">기본 문법 복습과 알고리즘 문제 풀이를 시작해보세요.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">추천 학습 2</p>
                  <p className="mt-2 text-base text-slate-600">최근 학습 이력을 기반으로 맞춤형 콘텐츠를 제안합니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
