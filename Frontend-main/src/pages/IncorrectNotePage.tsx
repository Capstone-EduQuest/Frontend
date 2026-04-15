import PageHeader from '../components/PageHeader';

const IncorrectNotePage = () => {
  const incorrectNotes = [
    {
      id: 1,
      title: '리스트 인덱스 오류',
      code: 'for i in range(len(arr)+1):\n    print(arr[i])',
      fix: 'for i in range(len(arr)):\n    print(arr[i])',
      reason: '반복 범위가 배열 길이보다 1만큼 더 크게 설정되어 마지막 인덱스를 벗어납니다.',
    },
    {
      id: 2,
      title: '조건문 논리 오류',
      code: 'if x > 0 or x < 10:\n    print("True")',
      fix: 'if x > 0 and x < 10:\n    print("True")',
      reason: 'or를 사용하면 x가 0 이하이거나 10 이상인 경우에도 조건이 참이 됩니다.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="오답노트"
          subtitle="틀렸던 문제와 올바른 해법, 그리고 왜 틀렸는지를 한눈에 확인하세요."
        />

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incorrectNotes.map((note) => (
            <article key={note.id} className="rounded-3xl border-4 border-gray-900 bg-white p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-gray-900">{note.title}</h2>
                <span className="text-sm uppercase tracking-[0.3em] text-gray-500">오답 분석</span>
              </div>
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl bg-gray-900 p-4 text-sm text-gray-100 font-mono whitespace-pre-wrap">
                  {note.code}
                </div>
                <div className="rounded-3xl bg-gray-100 p-4 text-sm text-gray-800">
                  <p className="font-bold mb-2">정답 코드</p>
                  <pre className="whitespace-pre-wrap">{note.fix}</pre>
                </div>
                <p className="text-gray-600">이유: {note.reason}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default IncorrectNotePage;
