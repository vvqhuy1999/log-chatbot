import { reactive } from 'vue'
import axios from 'axios'

// Cấu hình Axios
const api = axios.create({
  baseURL: '',
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
      // console.log('Calling API:', api.defaults.baseURL + '/api/auth/login')
      // console.log('With credentials:', credentials)
      
      const response = await api.post('/api/auth/login', credentials)
      // console.log('API Response:', response)
      
      const data = response.data
      // console.log('Response data:', data)
      
      // Xử lý response từ backend Spring Boot
      if (!data.success) {
        throw new Error(data.message || 'Đăng nhập thất bại')
      }

      // Lấy user object từ response (nếu có) hoặc tạo từ username
      let userData = data.user || data
      const processedUser = {
        id: userData.id || Date.now(), // Sử dụng ID từ backend hoặc tạo tạm thời
        name: userData.name || data.username || credentials.username,
        username: userData.username || data.username || credentials.username,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || data.username || credentials.username)}&background=059669&color=fff`
      }
      
      // console.log('Processed user object:', processedUser)

      state.user = processedUser
      state.isAuthenticated = true
      
      // Lưu vào localStorage
      localStorage.setItem('chatgpt-user', JSON.stringify(processedUser))
      // console.log('User saved to localStorage:', processedUser)
      // console.log('localStorage check:', localStorage.getItem('chatgpt-user'))
      
      return processedUser
    } catch (error) {
      console.error('Login error:', error)
      
      // Không cho phép demo mode - yêu cầu backend thực sự hoạt động
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.error('Backend không khả dụng. Vui lòng khởi động backend server.')
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend.')
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
  
  const checkAuth = async () => {
    // console.log('checkAuth called')
    const savedUser = localStorage.getItem('chatgpt-user')
    // console.log('savedUser from localStorage:', savedUser)
    
    // Kiểm tra nếu savedUser tồn tại và không phải là chuỗi "undefined"
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser)
        // console.log('parsedUser:', parsedUser)
        
        // Đảm bảo parsedUser là object hợp lệ
        if (parsedUser && typeof parsedUser === 'object' && (parsedUser.id || parsedUser.username)) {
          // Kiểm tra với backend để xác thực session vẫn còn hiệu lực
          try {
            const response = await api.get('/api/auth/check', {
              params: { username: parsedUser.username }
            })
            
            if (response.data.authenticated) {
              state.user = parsedUser
              state.isAuthenticated = true
              // console.log('Auth restored successfully:', parsedUser)
            } else {
              throw new Error('Session expired')
            }
          } catch (error) {
            // console.log('Backend verification failed, clearing auth:', error)
            // Nếu backend không xác thực được, xóa localStorage
            localStorage.removeItem('chatgpt-user')
            state.user = null
            state.isAuthenticated = false
          }
        } else {
          // console.log('Invalid user object, removing from localStorage')
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
      // console.log('No valid saved user found')
      // Xóa localStorage nếu có giá trị không hợp lệ
      if (savedUser === 'undefined' || savedUser === 'null') {
        localStorage.removeItem('chatgpt-user')
      }
      state.user = null
      state.isAuthenticated = false
    }
    
    // console.log('checkAuth result - isAuthenticated:', state.isAuthenticated, 'user:', state.user)
  }
  
  return {
    state,
    login,
    logout,
    checkAuth
  }
}
