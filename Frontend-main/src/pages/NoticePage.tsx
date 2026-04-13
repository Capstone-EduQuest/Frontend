const NoticePage = () => {
  const notices = [
    {
      id: 1,
      title: '신규 스테이지 업데이트 안내',
      date: '2026-04-08',
      summary: 'Stage 4 “데이터 구조 탐험” 스테이지가 새롭게 추가되었습니다. 신규 퀘스트와 보상을 확인하세요.',
    },
    {
      id: 2,
      title: '서버 점검 안내',
      date: '2026-04-05',
      summary: '4월 12일 오전 2시부터 3시까지 서비스 점검이 예정되어 있습니다. 이 시간에는 일부 기능이 일시 중단됩니다.',
    },
    {
      id: 3,
      title: '봄맞이 이벤트 참여 안내',
      date: '2026-04-02',
      summary: '학습 스코어 5,000P 이상 달성 시 특별 보상을 드립니다. 이벤트 기간 내 미션을 완수해보세요.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="rounded-3xl border-4 border-gray-900 bg-white p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black text-gray-900">공지사항</h1>
          <p className="mt-2 text-gray-600">EduQuest의 최신 소식과 업데이트 내용을 확인하세요.</p>
        </header>

        <section className="bg-white border-4 border-gray-900 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-4 border-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-lg font-black text-gray-900">제목</th>
                <th className="px-6 py-4 text-left text-lg font-black text-gray-900">날짜</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice) => (
                <tr key={notice.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{notice.title}</h3>
                      <p className="text-gray-600 mt-1">{notice.summary}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">{notice.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default NoticePage;
