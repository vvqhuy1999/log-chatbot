<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
    <div class="max-w-md w-full mx-4">
      
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          AI
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">ChatGPT Clone</h1>
        <p class="text-gray-400">Đăng nhập để bắt đầu trò chuyện</p>
      </div>

      <!-- Login Form -->
      <div class="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p class="text-red-400 text-sm">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p class="text-green-400 text-sm">{{ successMessage }}</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              v-model="loginForm.username"
              type="text"
              required
              placeholder="Nhập username của bạn"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
            <div v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-gray-500 text-sm">
          © 2025 ChatLog. Powered by Vue.js & Tailwind CSS
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  setup() {
    const router = useRouter()
    const { login, state } = useAuthStore()
    
    // Check if already logged in when component mounts
    onMounted(() => {
      const savedUser = localStorage.getItem('chatgpt-user')
      const hasValidUser = savedUser && savedUser !== 'undefined' && savedUser !== 'null'
      
      if (state.isAuthenticated || hasValidUser) {
        router.replace('/')
      }
    })
    
    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    
    const loginForm = ref({
      username: '',
      password: ''
    })
    
    const clearMessages = () => {
      errorMessage.value = ''
      successMessage.value = ''
    }
    
    const handleLogin = async () => {
      clearMessages()
      loading.value = true
      
      try {
        console.log('Attempting login with:', loginForm.value)
        const result = await login(loginForm.value)
        console.log('Login successful, result:', result)
        
        successMessage.value = 'Đăng nhập thành công!'
        
        // Đợi một chút để localStorage được update
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Force redirect to chat page
        console.log('Redirecting to chat...')
        await router.replace('/')
        
      } catch (error) {
        console.error('Login failed:', error)
        errorMessage.value = error.message || 'Có lỗi xảy ra khi đăng nhập'
      } finally {
        loading.value = false
      }
    }
    
    return {
      loading,
      errorMessage,
      successMessage,
      loginForm,
      handleLogin
    }
  }
}
</script>
