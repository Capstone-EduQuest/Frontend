import PageHeader from '../components/PageHeader';

const ReviewPage = () => {
  const reviewStages = [
    { id: 1, title: '변수 할당', progress: '완료 100%', reward: '30 P' },
    { id: 2, title: 'for 반복문', progress: '완료 100%', reward: '45 P' },
    { id: 3, title: '리스트 슬라이싱', progress: '완료 100%', reward: '40 P' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="복습하기"
          subtitle="지난 학습 내용을 다시 확인하고, 주요 개념을 빠르게 복습하세요."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {reviewStages.map((stage) => (
            <div key={stage.id} className="rounded-3xl border-4 border-gray-900 bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black text-gray-900">{stage.title}</h2>
              <p className="mt-3 text-gray-500">진행 상태: <span className="font-bold text-gray-900">{stage.progress}</span></p>
              <p className="mt-2 text-gray-500">보상: <span className="font-bold text-gray-900">{stage.reward}</span></p>
              <button className="mt-6 rounded-full bg-[#e8472a] px-5 py-3 text-sm font-black text-white border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                다시 풀기
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ReviewPage;
