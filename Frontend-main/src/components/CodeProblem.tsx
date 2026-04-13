// src/components/CodeProblem.tsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { RootState } from '../store';

interface Problem {
  uuid: string;
  title?: string;
  summary: string;
  example: string;
  expectedOutput: string;
  stage_uuid?: string;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  output?: string;
}

export default function CodeProblem({ problemId }: { problemId?: string }) {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('# 여기에 Python 코드를 작성하세요\nprint("Hello, World!")');
  const [isLoading, setIsLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // 문제 데이터 불러오기
  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemId || !accessToken) return;

      try {
        // API 명세서: GET /api/v1/problems/{problem_id}
        const response = await axios.get(`/api/v1/problems/${problemId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.status === 200) {
          setProblem(response.data);
        }
      } catch (error) {
        console.error('문제 데이터를 불러오지 못했습니다:', error);
        alert('문제를 불러오는데 실패했습니다.');
      }
    };

    fetchProblem();
  }, [problemId, accessToken]);

  // 코드 실행 (테스트)
  const handleRunCode = () => {
    setSubmissionResult({
      success: false,
      message: '코드 실행 기능은 현재 백엔드에서 지원되지 않습니다.',
    });
  };

  // 답안 제출
  const handleSubmitCode = async () => {
    if (!code.trim() || !problem || !user) return;

    setIsLoading(true);
    setSubmissionResult(null);

    try {
      const response = await axios.post(`/api/v1/problems/${problem.uuid}/submissions`, {
        answer: code
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status === 201) {
        const isCorrect = response.data.result;
        setSubmissionResult({
          success: isCorrect,
          message: isCorrect ? '정답입니다! 🎉' : '틀렸습니다. 다시 도전해보세요.',
        });

        if (isCorrect) {
          setTimeout(() => navigate('/'), 2000);
        }
      }
    } catch (error: any) {
      setSubmissionResult({
        success: false,
        message: error.response?.data?.message || '제출에 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!problem) {
    return (
      <div className="bg-gray-800 p-10 rounded-2xl text-white text-center border-4 border-dashed border-gray-600">
        <h2 className="text-3xl font-bold mb-4">문제 로딩 중...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-8 rounded-2xl text-white border-4 border-gray-600 max-h-[90vh] overflow-hidden flex flex-col">
      {/* 문제 설명 영역 */}
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-2 text-blue-400">{problem.title}</h2>
        <p className="text-gray-300 mb-4 whitespace-pre-line">{problem.summary}</p>

        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-green-400 mb-2">예제 입력:</h3>
          <pre className="text-gray-200 font-mono text-sm">{problem.example}</pre>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-bold text-green-400 mb-2">예제 출력:</h3>
          <pre className="text-gray-200 font-mono text-sm">{problem.expectedOutput}</pre>
        </div>
      </div>

      {/* 코드 작성 영역 */}
      <div className="flex-1 flex flex-col min-h-0">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full flex-1 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Python 코드를 작성하세요..."
        />

        {/* 실행 결과 표시 */}
        {submissionResult && (
          <div className={`mt-4 p-4 rounded-lg ${submissionResult.success ? 'bg-green-800' : 'bg-red-800'}`}>
            <h3 className={`font-bold ${submissionResult.success ? 'text-green-200' : 'text-red-200'}`}>
              {submissionResult.success ? '✅ 성공' : '❌ 실패'}
            </h3>
            <p className="text-sm mt-2 whitespace-pre-line">{submissionResult.message}</p>
            {submissionResult.output && (
              <div className="mt-2">
                <h4 className="font-bold text-gray-200">출력:</h4>
                <pre className="text-xs text-gray-300 font-mono bg-gray-900 p-2 rounded mt-1">{submissionResult.output}</pre>
              </div>
            )}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleRunCode}
            disabled
            className="flex-1 bg-blue-400 text-white py-3 px-6 rounded-lg font-bold cursor-not-allowed"
          >
            코드 실행 (백엔드 미지원)
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            {isLoading ? '제출 중...' : '답안 제출'}
          </button>
        </div>
      </div>
    </div>
  );
}