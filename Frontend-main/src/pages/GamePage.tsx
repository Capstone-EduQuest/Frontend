// src/pages/GamePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import CodeProblem from '../components/CodeProblem';
import BackButton from '../components/BackButton';
import type { RootState } from '../store';

interface Stage {
  uuid: string;
  title: string;
  number: number;
  reward?: number;
  description?: string;
  total_problems?: number;
}

interface StageProgress {
  stage: number;
  clear: number[];
  total_question_count: number;
}

export default function GamePage() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [stageProgress, setStageProgress] = useState<Record<number, StageProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 스테이지 목록 불러오기
  useEffect(() => {
    const fetchStages = async () => {
      if (!accessToken) return;

      try {
        // API 명세서: GET /api/v1/stages
        const response = await axios.get('/api/v1/stages', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.status === 200) {
          setStages(response.data.results);
        }
      } catch (error) {
        console.error('스테이지 목록을 불러오지 못했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStages();
  }, [accessToken]);

  // 각 스테이지의 진도 불러오기
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !accessToken || stages.length === 0) return;

      try {
        // API 명세서: GET /api/v1/users/{uuid}/progress
        const response = await axios.get(`/api/v1/users/${user.uuid}/progress`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.status === 200) {
          const progressMap: Record<number, StageProgress> = {};
          response.data.results.forEach((progress: StageProgress) => {
            progressMap[progress.stage] = progress;
          });
          setStageProgress(progressMap);
        }
      } catch (error) {
        console.error('진도 데이터를 불러오지 못했습니다:', error);
      }
    };

    fetchProgress();
  }, [user, accessToken, stages]);

  const handleStageSelect = async (stage: Stage) => {
    setSelectedStage(stage);
    setSelectedProblemId(null);

    try {
      // 선택된 스테이지의 문제 목록 불러오기
      const response = await axios.get('/api/v1/problems', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { stage_number: stage.number },
      });

      if (response.status === 200 && response.data.results.length > 0) {
        // 첫 번째 문제를 선택
        setSelectedProblemId(response.data.results[0].uuid);
      }
    } catch (error) {
      console.error('문제 목록을 불러오지 못했습니다:', error);
      alert('이 스테이지의 문제를 불러오는데 실패했습니다.');
    }
  };

  const getStageProgress = (stageNumber: number) => {
    const progress = stageProgress[stageNumber];
    if (!progress) return { completed: 0, total: 0 };

    return {
      completed: progress.clear.length,
      total: progress.total_question_count
    };
  };

  if (selectedProblemId) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
        <header className="flex justify-between items-center px-10 py-4 bg-gray-800 shadow-md">
          <div>
            <BackButton onClick={() => setSelectedProblemId(null)} ariaLabel="스테이지로 돌아가기" />
          </div>
          <div className="text-2xl font-black text-blue-400">EduQuest - {selectedStage?.title}</div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white font-bold"
          >
            홈으로
          </button>
        </header>
        <main className="flex-1 flex justify-center items-center p-4">
          <div className="w-full max-w-5xl">
            <CodeProblem problemId={selectedProblemId} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <header className="flex justify-between items-center px-10 py-4 bg-gray-800 shadow-md">
        <div>
          <BackButton to="/" ariaLabel="대시보드로 돌아가기" />
        </div>
        <div className="text-2xl font-black text-blue-400">EduQuest 스테이지 선택</div>
        <div className="w-32"></div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
<h1 className="text-3xl font-bold text-white mb-8 text-center">프로그래밍 모험을 시작하세요!</h1>

          {isLoading ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p>스테이지를 불러오는 중...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stages.map((stage) => {
                const progress = getStageProgress(stage.number);
                const isCompleted = progress.completed === progress.total && progress.total > 0;

                return (
                  <div
                    key={stage.uuid}
                    onClick={() => handleStageSelect(stage)}
                    className="bg-gray-800 p-6 rounded-2xl border-2 border-gray-600 hover:border-blue-400 cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                      {isCompleted && <span className="text-green-400 text-2xl">✅</span>}
                    </div>

                    {stage.description && <p className="text-gray-300 mb-4 text-sm">{stage.description}</p>}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-400">
                        진행률: {progress.completed} / {progress.total}
                      </span>
                      <span className="text-gray-400">
                        보상: {stage.reward ?? 0} 포인트
                      </span>
                    </div>

                    {progress.total > 0 && (
                      <div className="mt-4 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}