import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/Signup.vue'
import GamePage from '../pages/GamePage.vue'
import ProgressPage from '../pages/Progress.vue'
import CommunityPage from '../pages/CommunityPage.vue'
import MyPage from '../pages/MyPage.vue'
import ReviewPage from '../pages/ReviewPage.vue'
import NoticePage from '../pages/NoticePage.vue'
import IncorrectNotePage from '../pages/IncorrectNotePage.vue'
import BookmarkPage from '../pages/BookmarkPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/signup', component: SignupPage },
    { path: '/game', component: GamePage },
    { path: '/progress', component: ProgressPage },
    { path: '/community', component: CommunityPage },
    { path: '/mypage', component: MyPage },
    { path: '/review', component: ReviewPage },
    { path: '/notice', component: NoticePage },
    { path: '/incorrect-note', component: IncorrectNotePage },
    { path: '/bookmark', component: BookmarkPage },
    {
      path: '/admin',
      component: AdminPage,
      meta: { requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restoreAuth(to.path)

  if (to.meta.requiresAdmin) {
    if (!auth.state.isLoggedIn) {
      return '/login'
    }

    const role = auth.state.user?.role
    if (role !== 'admin' && role !== 'admine') {
      return '/'
    }
  }

  return true
})

export default router
