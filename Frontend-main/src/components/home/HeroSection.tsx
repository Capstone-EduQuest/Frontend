// src/components/home/HeroSection.tsx
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(232,71,42,0.30),_transparent_30%),linear-gradient(135deg,#111827_0%,#1f2937_100%)] opacity-95" />
      <div className="relative mx-auto min-h-[60vh] max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 sm:text-sm">
              초4~중3 전용 코딩 학습
            </span>
            <h1 className="text-5xl font-black leading-tight tracking-[-0.04em] text-white sm:text-6xl">
              코딩이 즐거워지는
              <br />
              나만의 퀘스트
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              EduQuest는 단계별 문제 해결과 보상 시스템을 통해 꾸준히 성장하는 학습 경험을 제공합니다.
              친구와 함께 도전하고 포인트를 모아 보세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center rounded-full bg-[#e8472a] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#e8472a]/25 transition hover:bg-[#d13d1f]"
              >
                지금 시작하기
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-slate-950"
              >
                로그인
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[36px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_36px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">홈</button>
                  <button className="rounded-full px-4 py-2 text-sm text-slate-300 hover:text-white">활동</button>
                  <button className="rounded-full px-4 py-2 text-sm text-slate-300 hover:text-white">랭킹</button>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e8472a]" />
                  실시간
                </div>
              </div>

              <div className="rounded-[28px] bg-white/10 p-5 shadow-inner shadow-black/10">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>오늘의 미션</span>
                  <span>완료 82%</span>
                </div>
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">퀘스트</div>
                  <div className="text-4xl font-black tracking-tight text-white">코딩 챌린지</div>
                  <div className="mt-4 flex items-center justify-between gap-4 text-xs text-slate-300">
                    <span>포인트 1,250</span>
                    <span>문제 47개</span>
                  </div>
                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[82%] rounded-full bg-[#e8472a]" />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { label: '연속 학습', value: '12일' },
                  { label: '현재 단계', value: '11' },
                  { label: '레벨', value: '8' },
                  { label: '커뮤니티', value: '15회' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                    <div className="text-slate-400">{item.label}</div>
                    <div className="mt-2 text-xl font-bold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}