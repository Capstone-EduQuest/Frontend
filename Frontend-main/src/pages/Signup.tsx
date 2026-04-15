// src/pages/Signup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
    password_confirm: '',
    birth: '',
    nickname: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileImage(e.target.files?.[0] ?? null);
    setErrorMsg('');
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 유효성 체크
    if (!formData.id || !formData.email || !formData.password || !formData.birth || !formData.nickname) {
      setErrorMsg('모든 정보를 빠짐없이 입력해주세요! 😡');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setErrorMsg('비밀번호가 서로 다릅니다. 다시 확인해주세요! 🥲');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (formData.nickname.length < 3) {
      setErrorMsg('닉네임은 최소 3자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        id: formData.id,
        email: formData.email,
        password: formData.password,
        password_valid: formData.password_confirm,
        birth: formData.birth,
        nickname: formData.nickname
      };

      const payload = new FormData();
      payload.append('profile', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));

      if (profileImage) {
        payload.append('profileImage', profileImage);
      }

      await authAPI.signUp(payload);

      alert('회원가입 성공! 로그인 페이지로 이동합니다. 🎉');
      navigate('/login');
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      if (error.response?.status === 409) {
        setErrorMsg('이미 존재하는 아이디입니다! 다른 아이디를 사용해주세요.');
      } else {
        setErrorMsg('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">회원가입</h1>
          <p className="text-slate-600 text-sm">EduQuest에서 프로그래밍을 배워보세요!</p>
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
          <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="w-full space-y-4 mb-6">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">아이디</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="사용할 아이디를 입력하세요"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">닉네임</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="3자 이상의 닉네임"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">프로필 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">생년월일</label>
            <input
              type="date"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="6자 이상의 비밀번호"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">비밀번호 확인</label>
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                가입 중...
              </div>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className="text-center">
          <span className="text-slate-600 text-sm">이미 계정이 있으신가요? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
