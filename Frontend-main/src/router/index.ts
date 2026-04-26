import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LandingPage from '../pages/LandingPage.vue'
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
    { path: '/', component: LandingPage, meta: { guestLanding: true } },
    { path: '/home', component: HomePage, meta: { requiresAuth: true } },
    { path: '/login', component: LoginPage, meta: { guestOnly: true } },
    { path: '/signup', component: SignupPage, meta: { guestOnly: true } },
    { path: '/game', component: GamePage, meta: { requiresAuth: true } },
    { path: '/progress', component: ProgressPage, meta: { requiresAuth: true } },
    { path: '/community', component: CommunityPage, meta: { requiresAuth: true } },
    { path: '/mypage', component: MyPage, meta: { requiresAuth: true } },
    { path: '/review', component: ReviewPage, meta: { requiresAuth: true } },
    { path: '/notice', component: NoticePage },
    { path: '/incorrect-note', component: IncorrectNotePage, meta: { requiresAuth: true } },
    { path: '/bookmark', component: BookmarkPage, meta: { requiresAuth: true } },
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

  if (to.meta.guestLanding && auth.state.isLoggedIn) {
    return '/home'
  }

  if (to.meta.guestOnly && auth.state.isLoggedIn) {
    return '/home'
  }

  if (to.meta.requiresAuth && !auth.state.isLoggedIn) {
    return '/login'
  }

  if (to.meta.requiresAdmin) {
    if (!auth.state.isLoggedIn) {
      return '/login'
    }

    const role = auth.state.user?.role
    if (role !== 'admin' && role !== 'admine') {
      return '/home'
    }
  }

  return true
})

export default router
