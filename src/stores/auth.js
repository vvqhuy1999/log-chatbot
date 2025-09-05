import { reactive } from 'vue'
import axios from 'axios'

// Cấu hình Axios
const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const state = reactive({
  user: null,
  isAuthenticated: false
})

export const useAuthStore = () => {
  
  const login = async (credentials) => {
    try {
      console.log('Calling API:', api.defaults.baseURL + '/api/auth/login')
      console.log('With credentials:', credentials)
      
      const response = await api.post('/api/auth/login', credentials)
      console.log('API Response:', response)
      
      const data = response.data
      console.log('Response data:', data)
      
      // Xử lý user data từ nhiều format có thể có
      let user = data.user || data
      console.log('Raw user object:', user)

      if (!user) {
        throw new Error('Không nhận được thông tin user từ server')
      }

      // Đảm bảo user object có đủ thông tin cần thiết
      const processedUser = {
        id: user.id || user.userId || Date.now(), // Fallback id nếu không có
        name: user.name || user.fullName || user.username || 'User',
        username: user.username || credentials.username,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || 'User')}&background=059669&color=fff`,
        ...user // Giữ lại tất cả properties khác từ server
      }
      
      console.log('Processed user object:', processedUser)

      state.user = processedUser
      state.isAuthenticated = true
      
      // Lưu vào localStorage
      localStorage.setItem('chatgpt-user', JSON.stringify(processedUser))
      console.log('User saved to localStorage:', processedUser)
      console.log('localStorage check:', localStorage.getItem('chatgpt-user'))
      
      return processedUser
    } catch (error) {
      console.error('Login error:', error)
      
      // Temporary fallback for testing if API is not available
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn('API not available, using demo mode for testing')
        
        const user = {
          id: 1,
          name: 'Demo User',
          username: credentials.username,
          avatar: `https://ui-avatars.com/api/?name=Demo%20User&background=059669&color=fff`
        }
        
        state.user = user
        state.isAuthenticated = true
        
        localStorage.setItem('chatgpt-user', JSON.stringify(user))
        console.log('Demo user saved to localStorage:', user)
        
        return user
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại'
      throw new Error(errorMessage)
    }
  }
  
  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Xóa state và localStorage dù API có lỗi hay không
      state.user = null
      state.isAuthenticated = false
      
      localStorage.removeItem('chatgpt-user')
      localStorage.removeItem('chatgpt-theme')
    }
  }
  
  const checkAuth = () => {
    console.log('checkAuth called')
    const savedUser = localStorage.getItem('chatgpt-user')
    console.log('savedUser from localStorage:', savedUser)
    
    // Kiểm tra nếu savedUser tồn tại và không phải là chuỗi "undefined"
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('parsedUser:', parsedUser)
        
        // Đảm bảo parsedUser là object hợp lệ
        if (parsedUser && typeof parsedUser === 'object' && (parsedUser.id || parsedUser.username)) {
          state.user = parsedUser
          state.isAuthenticated = true
          console.log('Auth restored successfully:', parsedUser)
        } else {
          console.log('Invalid user object, removing from localStorage')
          // Nếu không phải object hợp lệ, xóa localStorage
          localStorage.removeItem('chatgpt-user')
          state.user = null
          state.isAuthenticated = false
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        // Xóa localStorage bị lỗi
        localStorage.removeItem('chatgpt-user')
        state.user = null
        state.isAuthenticated = false
      }
    } else {
      console.log('No valid saved user found')
      // Xóa localStorage nếu có giá trị không hợp lệ
      if (savedUser === 'undefined' || savedUser === 'null') {
        localStorage.removeItem('chatgpt-user')
      }
      state.user = null
      state.isAuthenticated = false
    }
    
    console.log('checkAuth result - isAuthenticated:', state.isAuthenticated, 'user:', state.user)
  }
  
  return {
    state,
    login,
    logout,
    checkAuth
  }
}
