import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Chat from '../views/Chat.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to) => {
  console.log('Router guard - navigating to:', to.path)
  
  // Kiểm tra auth state từ cả localStorage và auth store
  const savedUser = localStorage.getItem('chatgpt-user')
  const { state } = useAuthStore()
  
  console.log('Router guard - savedUser:', savedUser)
  console.log('Router guard - auth state:', state)
  
  // Kiểm tra localStorage có dữ liệu hợp lệ không
  let hasValidLocalStorage = false
  if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
    try {
      const parsedUser = JSON.parse(savedUser)
      hasValidLocalStorage = parsedUser && typeof parsedUser === 'object' && (parsedUser.id || parsedUser.username)
      console.log('Router guard - hasValidLocalStorage:', hasValidLocalStorage, 'parsedUser:', parsedUser)
    } catch (error) {
      // Xóa localStorage bị lỗi
      localStorage.removeItem('chatgpt-user')
      hasValidLocalStorage = false
      console.log('Router guard - localStorage parse error, cleaned up')
    }
  }
  
  const isAuthenticated = hasValidLocalStorage || state.isAuthenticated
  console.log('Router guard - isAuthenticated:', isAuthenticated)
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Router guard - redirecting to login (requires auth)')
    return '/login'
  }
  
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log('Router guard - redirecting to chat (requires guest but authenticated)')
    return '/'
  }
  
  console.log('Router guard - allowing navigation')
})

export default router
