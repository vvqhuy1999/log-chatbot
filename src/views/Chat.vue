<template>
  <div v-if="user" class="flex h-screen bg-gray-50 dark:bg-gray-900">
    
    <!-- Sidebar -->
    <div :class="['bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0', 
                  sidebarCollapsed ? 'w-16' : 'w-64',
                  'lg:relative absolute lg:translate-x-0', 
                  sidebarCollapsed ? 'lg:translate-x-0' : 'translate-x-0',
                  'z-50 lg:z-auto']">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700">
        <div v-if="!sidebarCollapsed" class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Chat Log</h2>
          <button @click="toggleTheme" 
                  class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  :title="isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'">
            <span class="text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
          </button>
        </div>
        
        <div class="flex items-center justify-between">
          <div v-if="!sidebarCollapsed" class="flex items-center gap-3 flex-1">
            <div class="flex items-center gap-3 flex-1">
              <img :src="user.avatar" :alt="user.name" class="w-8 h-8 rounded-full border-2 border-gray-600">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ user.name }}</p>
                <p class="text-xs text-gray-400 truncate">@{{ user.username }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="flex justify-center w-full">
            <img :src="user.avatar" :alt="user.name" class="w-8 h-8 rounded-full border-2 border-gray-600" :title="user.name">
          </div>
          
          <!-- Sidebar Toggle Button -->
          <button @click="toggleSidebar" 
                  class="p-2 rounded-lg hover:bg-gray-700 transition-colors ml-2"
                  :title="sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'">
            <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="sidebarCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </div>
        
      </div>
      
      <!-- New Chat Button -->
      <div :class="['pb-4 relative z-10', sidebarCollapsed ? 'flex justify-center px-4' : 'px-4']">
        <button @click="newChat" 
                :class="[
                  'flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl text-white',
                  sidebarCollapsed 
                    ? 'w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl' 
                    : 'w-full gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl'
                ]"
                :title="sidebarCollapsed ? 'Cuộc trò chuyện mới' : ''">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span v-if="!sidebarCollapsed" class="font-medium">Cuộc trò chuyện mới</span>
        </button>
      </div>
      
      <!-- Chat History -->
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <div v-if="!sidebarCollapsed" class="mb-3">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lịch sử chat</h3>
        </div>
        
        <!-- Loading state -->
        <div v-if="loadingChatHistory" class="flex justify-center py-8">
          <div class="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        
        <!-- Chat sessions list -->
        <div v-if="!loadingChatHistory && chatHistory.length > 0" class="space-y-1">
          
          <div v-for="(chat, index) in chatHistory" :key="chat.sessionId || index"
               @click="loadChat(index)"
               :class="['group p-3 rounded-lg cursor-pointer transition-all duration-200', 
                        currentChatIndex === index 
                          ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30' 
                          : 'hover:bg-gray-800/50 border border-transparent']"
               :title="sidebarCollapsed ? chat.title : ''">
            
            <div v-if="!sidebarCollapsed" class="space-y-1">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white truncate leading-tight">{{ chat.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(chat.date) }}</p>
                </div>
              </div>
            </div>
            
            <!-- Icon for collapsed state -->
            <div v-if="sidebarCollapsed" class="flex justify-center">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="chatHistory.length === 0 && !sidebarCollapsed" class="text-center py-8">
          <svg class="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="text-sm text-gray-500">Chưa có cuộc trò chuyện nào</p>
        </div>
      </div>
      
      <!-- Logout Button (Alternative) -->
      <div :class="['pb-4', sidebarCollapsed ? 'flex justify-center px-4' : 'px-4']">
        <button @click="handleLogout" 
                :class="[
                  'flex items-center justify-center transition-all duration-200 text-white',
                  sidebarCollapsed 
                    ? 'w-12 h-12 bg-red-600 hover:bg-red-700 rounded-lg' 
                    : 'w-full gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm'
                ]"
                :title="sidebarCollapsed ? 'Đăng xuất' : ''">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span v-if="!sidebarCollapsed">Đăng xuất</span>
        </button>
      </div>
    </div>

     <!-- Main Chat Area -->
     <div class="flex-1 flex flex-col" :class="[isDark ? 'bg-gray-800' : 'bg-white']">
      
      <!-- Chat Header -->
      <div class="border-b p-4" :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
              AI
            </div>
            <div>
              <h1 class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-gray-900'">
                ChatLog
              </h1>
              <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                Xin chào, {{ user.name }}! 👋
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto min-h-0" ref="messagesContainer">
        <div class="max-w-4xl mx-auto">
          
          <!-- Welcome Message (when no messages) -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full py-20">
            <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
              AI
            </div>
            <h2 class="text-2xl font-semibold mb-4" :class="isDark ? 'text-white' : 'text-gray-900'">
              Xin chào {{ user.name }}! 👋
            </h2>
            <p class="text-center max-w-md" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
              Tôi là AI Assistant, sẵn sàng giúp đỡ bạn với mọi câu hỏi. Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>

          <!-- Messages -->
          <div v-else class="space-y-4 p-4">
            <div v-for="(message, index) in messages" :key="index">
              <!-- User Messages (Right Side) -->
              <div v-if="message.role === 'user'" 
                   class="flex justify-end mb-4">
                <div class="max-w-xs lg:max-w-md">
                  <div class="bg-green-500 text-white rounded-lg px-4 py-2 shadow-sm">
                    <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 text-right">
                    {{ formatMessageTime(message.timestamp) }}
                  </div>
                </div>
              </div>

              <!-- AI Messages (Left Side) -->
              <div v-else 
                   class="flex justify-start mb-4">
                <div class="flex gap-3 max-w-xs lg:max-w-md">
                  <!-- AI Avatar -->
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  
                  <!-- AI Message Content -->
                  <div class="flex-1">
                    <div class="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-600">
                      <p class="text-sm whitespace-pre-wrap" 
                         :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ message.content }}</p>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ formatMessageTime(message.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Loading Messages Indicator -->
            <div v-if="loadingMessages" class="flex justify-center py-8">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <span class="text-sm text-gray-500 ml-2">Đang tải tin nhắn...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="loading" 
               class="group border-b transition-colors"
               :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
            <div class="max-w-4xl mx-auto px-6 py-8 flex gap-6">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-sm flex items-center justify-center text-white text-sm font-medium">
                  AI
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                  <span class="text-sm text-gray-500">AI đang soạn phản hồi...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="flex-shrink-0 border-t p-4" :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'">
        <div class="max-w-4xl mx-auto">
          <form @submit.prevent="sendMessage" class="relative">
            <div class="relative flex items-center">
              <textarea
                v-model="input"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact="insertNewLine"
                ref="messageInput"
                placeholder="Nhập tin nhắn..."
                rows="1"
                :disabled="loading"
                class="w-full resize-none rounded-xl border px-4 py-3 pr-12 text-base outline-none transition-all focus:ring-2 focus:ring-green-500"
                :class="[
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500',
                  'max-h-36 overflow-y-auto'
                ]"
                style="min-height: 48px; line-height: 1.5;"
              ></textarea>
              
              <!-- Send Button -->
              <button 
                type="submit"
                :disabled="loading || !input.trim()"
                class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                :class="input.trim() && !loading
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'">
                <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <div v-else class="w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
              </button>
            </div>
            
            <!-- Input Footer -->
            <div class="flex items-center justify-between mt-2 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              <span>Enter để gửi, Shift + Enter để xuống dòng</span>
              <span>{{ input.length }}/2000</span>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div v-if="!sidebarCollapsed" @click="sidebarCollapsed = true" 
         class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>
  </div>
  
  <!-- Loading fallback when user is not available -->
  <div v-else class="flex h-screen bg-gray-900 items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-white text-lg">Đang tải...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

// Create API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  setup() {
    const router = useRouter()
    const { state: authState, logout, checkAuth } = useAuthStore()
    
    const input = ref('')
    const messages = ref([])
    const loading = ref(false)
    const isDark = ref(true)
    const sidebarCollapsed = ref(false)
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    
    const chatHistory = ref([])
    const loadingChatHistory = ref(false)
    const loadingMessages = ref(false)
    const currentChatIndex = ref(null)
    
    const user = computed(() => authState.user)
    
    // Load chat sessions from API
    const loadChatSessions = async () => {
      loadingChatHistory.value = true
      try {
        const response = await api.get('/api/chat-sessions')
        
        if (response.data && Array.isArray(response.data)) {
          // Transform API data to match our format
          chatHistory.value = response.data.map(session => ({
            sessionId: session.sessionId,
            title: session.title,
            date: new Date(session.lastActiveAt),
            createdAt: new Date(session.createdAt),
            lastActiveAt: new Date(session.lastActiveAt),
            messages: [] // Messages will be loaded separately when needed
          }))
        } else {
          chatHistory.value = []
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error)
        chatHistory.value = []
      } finally {
        loadingChatHistory.value = false
      }
    }
    
    
    // Component initialization
    onMounted(async () => {
      await checkAuth()
      
      // Load theme and sidebar state from localStorage
      const savedTheme = localStorage.getItem('chatgpt-theme')
      if (savedTheme !== null) {
        isDark.value = savedTheme === 'dark'
      }
      
      const savedSidebarState = localStorage.getItem('chatgpt-sidebar-collapsed')
      if (savedSidebarState !== null) {
        sidebarCollapsed.value = savedSidebarState === 'true'
      }
      
      // Check if user is authenticated after a short delay
      setTimeout(() => {
        if (!authState.user) {
          router.push('/login')
          return
        }
        
        // Load chat sessions from API after user is confirmed
        loadChatSessions()
      }, 100)
      
      nextTick(() => {
        if (messageInput.value) {
          adjustTextareaHeight()
        }
      })
    })
    
    // Methods tương tự như component cũ
    const sendMessage = async () => {
      if (!input.value.trim() || loading.value) return

      messages.value.push({ 
        role: 'user', 
        content: input.value.trim(),
        timestamp: new Date()
      })
      
      const userInput = input.value.trim()
      input.value = ''
      loading.value = true

      adjustTextareaHeight()
      scrollToBottom()

      setTimeout(() => {
        let response = generateSmartResponse(userInput)
        
        messages.value.push({
          role: 'assistant',
          content: response,
          timestamp: new Date()
        })
        
        loading.value = false
        scrollToBottom()
        updateChatHistory()
      }, 1000 + Math.random() * 2000)
    }
    
    const generateSmartResponse = (input) => {
      const lowerInput = input.toLowerCase()
      
      if (lowerInput.includes('xin chào') || lowerInput.includes('hello') || lowerInput.includes('chào')) {
        return `Xin chào ${user.value.name}! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn hôm nay?`
      }
      
      if (lowerInput.includes('ai') && lowerInput.includes('là gì')) {
        return 'AI (Artificial Intelligence - Trí tuệ nhân tạo) là khả năng của máy tính thực hiện các nhiệm vụ thường đòi hỏi trí thông minh của con người, như nhận dạng hình ảnh, xử lý ngôn ngữ tự nhiên, và ra quyết định.'
      }
      
      return `Tôi hiểu bạn đang quan tâm đến "${input}". Đây là một chủ đề thú vị! Bạn có thể chia sẻ thêm chi tiết hoặc đặt câu hỏi cụ thể để tôi có thể hỗ trợ bạn tốt hơn không?`
    }
    
    const scrollToBottom = () => {
      nextTick(() => {
        const container = messagesContainer.value
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
    
    const adjustTextareaHeight = () => {
      const textarea = messageInput.value
      if (textarea) {
        textarea.style.height = '48px'
        const newHeight = Math.min(textarea.scrollHeight, 144)
        textarea.style.height = newHeight + 'px'
      }
    }
    
    const insertNewLine = () => {
      const textarea = messageInput.value
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        input.value = input.value.substring(0, start) + '\n' + input.value.substring(end)
        
        nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
          adjustTextareaHeight()
        })
      }
    }
    
    const toggleTheme = () => {
      isDark.value = !isDark.value
      localStorage.setItem('chatgpt-theme', isDark.value ? 'dark' : 'light')
    }
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      localStorage.setItem('chatgpt-sidebar-collapsed', sidebarCollapsed.value.toString())
    }
    
    const newChat = () => {
      console.log('🆕 Creating new chat...')
      messages.value = []
      currentChatIndex.value = null
      input.value = ''
      // Reload chat sessions to get any new ones
      console.log('🔄 Reloading chat sessions after new chat...')
      loadChatSessions()
    }
    
    const loadChat = async (index) => {
      currentChatIndex.value = index
      const chat = chatHistory.value[index]
      
      // Show loading state for messages
      loadingMessages.value = true
      
      try {
        // Load messages from API using session ID
        const response = await api.get(`/api/chat-sessions/${chat.sessionId}/messages`)
        
        if (response.data && Array.isArray(response.data)) {
          // Transform API messages to match our format
          const apiMessages = response.data.map(msg => ({
            id: msg.messageId || Date.now() + Math.random(),
            content: msg.content,
            role: msg.sender === 'USER' ? 'user' : 'assistant', // Convert API format to app format
            timestamp: new Date(msg.timestamp)
          }))
          
          // Update chat history with loaded messages
          chatHistory.value[index].messages = apiMessages
          messages.value = apiMessages
          
          console.log(`Loaded ${apiMessages.length} messages for session ${chat.sessionId}`)
        } else {
          // No messages found, set empty array
          chatHistory.value[index].messages = []
          messages.value = []
        }
      } catch (error) {
        console.error('Error loading chat messages:', error)
        // On error, set empty messages
        chatHistory.value[index].messages = []
        messages.value = []
      } finally {
        loadingMessages.value = false
        
        // Scroll to bottom after loading
        nextTick(() => {
          scrollToBottom()
        })
      }
    }
    
    const updateChatHistory = () => {
      if (messages.value.length >= 2) {
        const title = messages.value[0].content.substring(0, 50) + '...'
        const newChat = {
          title,
          date: new Date(),
          messages: [...messages.value]
        }
        
        if (currentChatIndex.value === null) {
          chatHistory.value.unshift(newChat)
          currentChatIndex.value = 0
        } else {
          chatHistory.value[currentChatIndex.value] = newChat
        }
      }
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours < 1) return 'Vừa xong'
        return 'Hôm nay'
      }
      if (days === 1) return 'Hôm qua'
      if (days < 7) return `${days} ngày trước`
      return date.toLocaleDateString('vi-VN')
    }
    
    const formatMessageTime = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const copyMessage = async (content) => {
      try {
        await navigator.clipboard.writeText(content)
        // Show success notification (optional)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
    
    const handleLogout = async () => {
      console.log('Logout button clicked')
      try {
        await logout()
        console.log('Logout successful')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Dù có lỗi, vẫn chuyển hướng về trang login
        router.push('/login')
      }
    }
    
    return {
      input,
      messages,
      loading,
      loadingMessages,
      isDark,
      sidebarCollapsed,
      messagesContainer,
      messageInput,
      chatHistory,
      loadingChatHistory,
      currentChatIndex,
      user,
      sendMessage,
      scrollToBottom,
      adjustTextareaHeight,
      insertNewLine,
      toggleTheme,
      toggleSidebar,
      newChat,
      loadChat,
      formatDate,
      formatMessageTime,
      copyMessage,
      handleLogout
    }
  }
}

</script>
