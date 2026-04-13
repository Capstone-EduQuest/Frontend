const BookmarkPage = () => {
  const bookmarks = [
    { id: 1, title: '파이썬 리스트 컴프리헨션', category: '개념 정리' },
    { id: 2, title: '재귀 함수 실전 예제', category: '문제 풀이' },
    { id: 3, title: '효율적인 정렬 알고리즘', category: '강의 요약' },
    { id: 4, title: 'Q&A: 함수형 컴포넌트 상태 관리', category: '커뮤니티' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="rounded-3xl border-4 border-gray-900 bg-white p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black text-gray-900">북마크</h1>
          <p className="mt-2 text-gray-600">중요한 개념과 게시물을 한 곳에 모아두고 빠르게 다시 열람하세요.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((item) => (
            <div key={item.id} className="rounded-3xl border-4 border-gray-900 bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">{item.title}</h2>
                <span className="text-sm uppercase tracking-[0.2em] text-gray-500">{item.category}</span>
              </div>
              <p className="mt-4 text-gray-600">이 항목은 북마크된 학습 자료로, 언제든지 다시 확인할 수 있습니다.</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default BookmarkPage;
