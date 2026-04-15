// src/pages/CommunityPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import type { RootState } from '../store';
import PageHeader from '../components/PageHeader';

interface Question {
  uuid: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  answer_count: number;
  is_answered: boolean;
}

interface Answer {
  uuid: string;
  content: string;
  author: string;
  created_at: string;
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // 질문 목록 불러오기
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!accessToken) return;

      try {
        // API 명세서: GET /api/v1/questions
        const response = await axios.get('/api/v1/questions', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.status === 200) {
          setQuestions(response.data.results);
        }
      } catch (error) {
        console.error('질문 목록을 불러오지 못했습니다:', error);
      }
    };

    fetchQuestions();
  }, [accessToken]);

  // 질문 상세 조회
  const handleQuestionClick = async (question: Question) => {
    setSelectedQuestion(question);
    setNewAnswerContent('');

    try {
      // API 명세서: GET /api/v1/questions/{question_id}
      const response = await axios.get(`/api/v1/questions/${question.uuid}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status === 200) {
        setAnswers(response.data.answers || []);
      }
    } catch (error) {
      console.error('질문 상세를 불러오지 못했습니다:', error);
      alert('질문을 불러오는데 실패했습니다.');
    }
  };

  // 새 질문 작성
  const handleCreateQuestion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // API 명세서: POST /api/v1/questions
      const response = await axios.post('/api/v1/questions', {
        title: newQuestionTitle,
        content: newQuestionContent
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status === 201) {
        alert('질문이 등록되었습니다!');
        setNewQuestionTitle('');
        setNewQuestionContent('');
        setShowQuestionForm(false);
        // 질문 목록 새로고침
        const questionsResponse = await axios.get('/api/v1/questions', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setQuestions(questionsResponse.data.results);
      }
    } catch (error) {
      console.error('질문 작성 실패:', error);
      alert('질문 작성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 답변 작성
  const handleCreateAnswer = async () => {
    if (!newAnswerContent.trim() || !selectedQuestion) return;

    setIsLoading(true);
    try {
      // API 명세서: POST /api/v1/questions/{question_id}/answers
      const response = await axios.post(`/api/v1/questions/${selectedQuestion.uuid}/answers`, {
        content: newAnswerContent
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status === 201) {
        alert('답변이 등록되었습니다!');
        setNewAnswerContent('');
        // 답변 목록 새로고침
        const questionResponse = await axios.get(`/api/v1/questions/${selectedQuestion.uuid}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setAnswers(questionResponse.data.answers || []);
      }
    } catch (error) {
      console.error('답변 작성 실패:', error);
      alert('답변 작성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <PageHeader
          title="EduQuest 커뮤니티"
          backAction={() => setSelectedQuestion(null)}
          backLabel="질문 목록으로 돌아가기"
          rightAction={
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-blue-500 font-bold"
            >
              홈으로
            </button>
          }
        />

        <main className="max-w-4xl mx-auto p-8">
          {/* 질문 상세 */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{selectedQuestion.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>작성자: {selectedQuestion.author}</span>
              <span>{formatDate(selectedQuestion.created_at)}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{selectedQuestion.content}</p>
          </div>

          {/* 답변 목록 */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-gray-800">답변 {answers.length}개</h2>
            {answers.map((answer) => (
              <div key={answer.uuid} className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>작성자: {answer.author}</span>
                  <span>{formatDate(answer.created_at)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{answer.content}</p>
              </div>
            ))}
          </div>

          {/* 답변 작성 */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">답변 작성</h3>
            <textarea
              value={newAnswerContent}
              onChange={(e) => setNewAnswerContent(e.target.value)}
              placeholder="답변을 작성해주세요..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#e8472a]"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreateAnswer}
                disabled={isLoading || !newAnswerContent.trim()}
                className="bg-[#e8472a] hover:bg-[#d13d1f] disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-bold transition-colors"
              >
                {isLoading ? '등록 중...' : '답변 등록'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <PageHeader
        title="EduQuest 커뮤니티"
        backLink="/"
        rightAction={
          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="bg-[#e8472a] hover:bg-[#d13d1f] text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            질문 작성
          </button>
        }
      />

      <main className="max-w-4xl mx-auto p-8">
        {/* 질문 작성 폼 */}
        {showQuestionForm && (
          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">새 질문 작성</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newQuestionTitle}
                onChange={(e) => setNewQuestionTitle(e.target.value)}
                placeholder="질문 제목을 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8472a]"
              />
              <textarea
                value={newQuestionContent}
                onChange={(e) => setNewQuestionContent(e.target.value)}
                placeholder="질문 내용을 자세히 작성해주세요..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#e8472a]"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowQuestionForm(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-bold"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateQuestion}
                  disabled={isLoading}
                  className="bg-[#e8472a] hover:bg-[#d13d1f] disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  {isLoading ? '등록 중...' : '질문 등록'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 질문 목록 */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">질문 목록</h1>
          {questions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <p className="text-gray-500">아직 등록된 질문이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">첫 번째 질문을 작성해보세요!</p>
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question.uuid}
                onClick={() => handleQuestionClick(question)}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
                    {question.title}
                  </h3>
                  {question.is_answered && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                      답변완료
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{question.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex gap-4">
                    <span>작성자: {question.author}</span>
                    <span>{formatDate(question.created_at)}</span>
                  </div>
                  <span>답변 {question.answer_count}개</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}