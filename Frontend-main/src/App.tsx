// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { loginSuccess, logout } from './store/authSlice';
import { authAPI, userAPI } from './api/auth';
import { decodeJwtUuid } from './utils/jwt';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Signup from './pages/Signup';
import GamePage from './pages/GamePage';
import Progress from './pages/Progress';
import CommunityPage from './pages/CommunityPage';
import MyPage from './pages/MyPage';
import ReviewPage from './pages/ReviewPage';
import NoticePage from './pages/NoticePage';
import IncorrectNotePage from './pages/IncorrectNotePage';
import BookmarkPage from './pages/BookmarkPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import FloatingNote from './components/FloatingNote';

function AuthLoader() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const restoreLogin = async () => {
      let token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const refreshAccessToken = async () => {
        if (!refreshToken) {
          return false;
        }

        try {
          const refreshResponse = await authAPI.refresh();
          token = refreshResponse.accessToken;
          localStorage.setItem('accessToken', token);
          if (refreshResponse.refreshToken) {
            localStorage.setItem('refreshToken', refreshResponse.refreshToken);
          }
          return true;
        } catch (refreshError) {
          console.error('refresh 토큰으로 로그인 복원 실패:', refreshError);
          return false;
        }
      };

      if (!token) {
        if (!refreshToken || location.pathname === '/login') {
          dispatch(logout());
          return;
        }

        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          dispatch(logout());
          return;
        }
      }

      let uuid = decodeJwtUuid(token ?? '');
      if (!uuid) {
        if (!refreshToken || location.pathname === '/login') {
          dispatch(logout());
          return;
        }

        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          dispatch(logout());
          return;
        }

        uuid = decodeJwtUuid(token ?? '');
        if (!uuid) {
          dispatch(logout());
          return;
        }
      }

      try {
        const profile = await userAPI.getProfile(uuid);
        dispatch(
          loginSuccess({
            user: {
              uuid: profile.uuid,
              user_id: profile.user_id,
              nickname: profile.nickname,
              birth: profile.birth,
              role: profile.role,
              is_locked: profile.is_locked,
              balance: profile.wallet?.balance ?? 0,
            },
            accessToken: token ?? '',
          })
        );
      } catch (error) {
        console.error('자동 로그인 복원 실패:', error);
        dispatch(logout());
      }
    };

    restoreLogin();
  }, [dispatch, location.pathname]);

  return null;
}

function AppInner() {
  return (
    <Router>
      <AuthLoader />
      <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/notice" element={<NoticePage />} />
            <Route path="/incorrect-note" element={<IncorrectNotePage />} />
            <Route path="/bookmark" element={<BookmarkPage />} />
          </Routes>
          <FloatingNote />
        </div>
      </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}

export default App;
