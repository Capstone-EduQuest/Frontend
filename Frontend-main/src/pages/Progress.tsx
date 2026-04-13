import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/index';
import { progressApi } from '../api/mockApi';
import type { ProgressStage } from '../api/mockApi';

const Progress = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [stages, setStages] = useState<ProgressStage[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      try {
        const progressStages = await progressApi.fetchProgressStages(user.uuid);
        setStages(progressStages);
      } catch (e) {
        console.error('데이터 로드 실패', e);
      }
    };

    fetchAllData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-10">
        <button onClick={() => navigate('/')} className="bg-white border p-2 px-6 rounded-full font-bold shadow-sm hover:bg-gray-100 transition-all">
          ← 대시보드
        </button>
        <h1 className="text-3xl font-black text-gray-800">📍 파이썬 마스터 퀘스트</h1>
        <div className="w-32"></div>
      </div>

      <div className="w-full max-w-4xl space-y-4">
        {stages.map((stage) => (
          <div key={stage.uuid} className={`flex items-center justify-between p-6 rounded-3xl border-2 bg-white ${stage.isCleared ? 'border-green-200' : 'border-gray-100'}`}>
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${stage.isCleared ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {stage.number}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">{stage.title}</div>
                <div className="text-sm font-bold text-blue-400">보상: {stage.reward} P</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-lg font-black text-gray-700">{stage.clearCount} / {stage.totalCount}</div>
                <div className="text-xs font-bold text-gray-400 text-center">CLEAR</div>
              </div>
              <button 
                onClick={() => navigate(`/game?stage=${stage.number}`)}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-500 shadow-md transition-all"
              >
                {stage.isCleared ? '다시하기' : '도전하기'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;