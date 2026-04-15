import PageHeader from '../components/PageHeader';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-[#f5f3f0] py-10">
      <PageHeader
        title="나의 학습 기록"
        subtitle="퀘스트 진행 상황과 맞춤 추천을 확인해보세요."
      />
      <div className="mx-auto mt-6 max-w-5xl rounded-[36px] bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#e8472a]">마이페이지</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">내 학습 현황</h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">오늘의 요약</h2>
            <p className="mt-4 text-slate-600">퀘스트 진행 상황, 점수, 연속 학습 일수가 한눈에 보입니다.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: '포인트', value: '1,250' },
                { label: '연속 학습', value: '12일' },
                { label: '레벨', value: '8' },
                { label: '문제 해결', value: '247개' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">맞춤형 학습 추천</h2>
            <p className="mt-4 text-slate-600">현재 학습 상태에 맞춰 다음에 풀어볼 문제를 추천합니다.</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">다음 퀘스트</p>
                <p className="mt-2 text-base text-slate-600">조건문과 반복문 활용 문제</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">추천 활동</p>
                <p className="mt-2 text-base text-slate-600">커뮤니티 질문 2개 답변하기</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
