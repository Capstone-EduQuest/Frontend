// src/components/Navbar.tsx
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { authAPI } from '../api/auth';
import type { RootState } from '../store';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const isLoggedIn = auth.isLoggedIn;
  const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'admine';

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#f5f3f0] border-b-4 border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-mono">
        <div className="h-20 flex items-center justify-between">
          <div>
            <span className="text-4xl font-black tracking-tighter text-[#e8472a] uppercase">EDUQUEST</span>
          </div>

          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="bg-white border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] px-4 py-2 font-bold hover:-translate-y-1 transition-transform"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="bg-yellow-400 border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] px-4 py-2 font-bold hover:-translate-y-1 transition-transform"
                >
                  회원가입
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-yellow-400 border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] px-4 py-2 font-bold hover:-translate-y-1 transition-transform"
                  >
                    관리자
                  </Link>
                )}
                <Link
                  to="/mypage"
                  className="bg-white border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] px-4 py-2 font-bold hover:-translate-y-1 transition-transform"
                >
                  마이페이지
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-gray-300 border-2 border-gray-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] px-4 py-2 font-bold text-gray-800 hover:bg-gray-400 hover:-translate-y-1 transition-transform"
                >
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-900/10 pt-4">
          <div className="flex-1" />

          <div className="flex flex-1 justify-center items-center gap-8 text-gray-900 font-bold text-lg">
            <Link to="/stage" className="whitespace-nowrap hover:-translate-y-1 transition-transform">
              스테이지
            </Link>
            <Link to="/progress" className="whitespace-nowrap hover:-translate-y-1 transition-transform">
              학습현황
            </Link>
            <Link to="/incorrect-note" className="whitespace-nowrap hover:-translate-y-1 transition-transform">
              오답노트
            </Link>
            <Link to="/community" className="whitespace-nowrap hover:-translate-y-1 transition-transform">
              커뮤니티
            </Link>
            <Link to="/notice" className="whitespace-nowrap hover:-translate-y-1 transition-transform">
              공지사항
            </Link>
          </div>

          <div className="flex-1 flex justify-end">
            <Link
              to="/game"
              className="rounded-full bg-[#e8472a] px-6 py-2 text-lg font-black text-white border-2 border-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform"
            >
              게임시작
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
