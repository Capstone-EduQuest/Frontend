// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { authAPI, userAPI } from '../api/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const decodeJwtUuid = (token: string): string | null => {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      const data = JSON.parse(decodedPayload);
      return data.uuid || null;
    } catch {
      return null;
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);

    if (!userId || !password) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해주세요! 😡');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.signIn({ id: userId, password });
      const accessToken = response.accessToken;
      const userUuid = decodeJwtUuid(accessToken);

      if (!userUuid) {
        throw new Error('유효하지 않은 토큰입니다.');
      }

      const profile = await userAPI.getProfile(userUuid);
      const userData = {
        uuid: profile.uuid,
        user_id: profile.user_id,
        nickname: profile.nickname,
        birth: profile.birth,
        role: profile.role,
        is_locked: profile.is_locked,
        balance: profile.wallet?.balance ?? 0
      };

      dispatch(loginSuccess({ user: userData, accessToken }));
      alert('로그인 성공! 대시보드로 이동합니다. 🎮');
      navigate('/');
    } catch (error: any) {
      console.error('로그인 에러:', error);
      if (error.response?.status === 400) {
        setErrorMsg('아이디 또는 비밀번호가 일치하지 않습니다! 😢');
      } else if (error.response?.status === 401) {
        setErrorMsg('계정이 잠겨있습니다. 관리자에게 문의하세요.');
      } else {
        setErrorMsg('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">EduQuest</h1>
          <p className="text-slate-600 text-sm">프로그래밍 학습 플랫폼</p>
        </div>

        {/* 로그인 폼 */}
        <div className="w-full space-y-4 mb-6">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">아이디</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setErrorMsg(''); }}
              placeholder="아이디를 입력하세요"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
          <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              로그인 중...
            </div>
          ) : (
            '로그인'
          )}
        </button>

        {/* 회원가입 링크 */}
        <div className="text-center">
          <span className="text-slate-600 text-sm">계정이 없으신가요? </span>
          <button
            onClick={() => navigate('/signup')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
