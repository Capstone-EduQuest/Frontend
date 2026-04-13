import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dashboardApi } from '../api/mockApi';
import type { Notice, Community } from '../types/database';

interface UserProgress {
  level: number;
  exp: number;
  expMax: number;
  clearedStages: number;
  totalStages: number;
}

export default function HomePage() {
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [recentPosts, setRecentPosts] = useState<Community[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      const [notices, posts, progress] = await Promise.all([
        dashboardApi.fetchRecentNotices(),
        dashboardApi.fetchRecentPosts(),
        dashboardApi.fetchUserProgress(),
      ]);

      setRecentNotices(notices);
      setRecentPosts(posts);
      setUserProgress(progress);
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100 font-mono">
      <Navbar />

      {/* Cinematic Video Section */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="https://www.w3schools.com/html/mov_bbb.mp4"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white space-y-6">
            <h1 className="text-6xl font-black">EduQuest: 파이썬 대모험</h1>
            <p className="text-xl max-w-2xl mx-auto">
              알고리즘 학습의 새로운 모험을 시작하세요. 코드의 세계로 떠나보세요!
            </p>
            <Link
              to="/game"
              className="inline-block bg-[#e8472a] text-white px-12 py-6 text-3xl font-black border-4 border-gray-900 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform"
            >
              게임시작 (Let's Go!)
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 p-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Notices Box */}
          <div className="bg-gray-900 border-4 border-gray-700 rounded-xl p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black text-white mb-4">📢 공지사항</h2>
            <div className="space-y-3">
              {recentNotices.map((notice) => (
                <div key={notice.uuid} className="bg-gray-800 rounded-lg p-3">
                  <h3 className="text-white font-bold text-sm">{notice.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">{notice.content.slice(0, 50)}...</p>
                </div>
              ))}
            </div>
            <Link
              to="/notice"
              className="inline-block mt-4 bg-[#e8472a] text-white px-4 py-2 font-bold border-2 border-gray-700 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"
            >
              더보기 +
            </Link>
          </div>

          {/* Community Box */}
          <div className="bg-gray-900 border-4 border-gray-700 rounded-xl p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black text-white mb-4">💬 커뮤니티</h2>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.uuid} className="bg-gray-800 rounded-lg p-3">
                  <h3 className="text-white font-bold text-sm">{post.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">by {post.author} • {post.answers_count} 답변</p>
                </div>
              ))}
            </div>
            <Link
              to="/community"
              className="inline-block mt-4 bg-[#e8472a] text-white px-4 py-2 font-bold border-2 border-gray-700 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"
            >
              더보기 +
            </Link>
          </div>

          {/* Progress Box */}
          <div className="bg-gray-900 border-4 border-gray-700 rounded-xl p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black text-white mb-4">📊 나의 학습현황</h2>
            {userProgress && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-[#e8472a]">Lv. {userProgress.level}</p>
                  <p className="text-gray-400 text-sm">현재 레벨</p>
                </div>
                <div>
                  <p className="text-white text-sm mb-2">경험치: {userProgress.exp} / {userProgress.expMax}</p>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-[#e8472a] h-3 rounded-full"
                      style={{ width: `${(userProgress.exp / userProgress.expMax) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{userProgress.clearedStages} / {userProgress.totalStages}</p>
                  <p className="text-gray-400 text-sm">클리어한 스테이지</p>
                </div>
              </div>
            )}
            <Link
              to="/progress"
              className="inline-block mt-4 bg-[#e8472a] text-white px-4 py-2 font-bold border-2 border-gray-700 shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"
            >
              나의 학습현황 더보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
