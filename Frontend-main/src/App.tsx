// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
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

function App() {
  return (
    <Provider store={store}>
      <Router>
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
    </Provider>
  );
}

export default App;
