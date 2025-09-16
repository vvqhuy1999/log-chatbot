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
      <div class="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar scrollbar-dark">
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
               :class="['group p-3 rounded-lg transition-all duration-200', 
                        currentChatIndex === index 
                          ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30' 
                          : 'hover:bg-gray-800/50 border border-transparent']"
               :title="sidebarCollapsed ? chat.title : ''">
            
            <div v-if="!sidebarCollapsed" class="space-y-1">
              <div class="flex items-start gap-3">
                <div @click="loadChat(index)" class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <div @click="loadChat(index)" class="flex-1 min-w-0 cursor-pointer">
                  <p class="text-sm font-medium text-white truncate leading-tight">{{ chat.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(chat.date) }}</p>
                </div>
                <!-- Delete button -->
                <button @click.stop="deleteSession(chat.sessionId, index)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-red-600/20 text-red-400 hover:text-red-300"
                        :title="'Xóa cuộc trò chuyện'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Icon for collapsed state -->
            <div v-if="sidebarCollapsed" class="flex justify-center">
              <div @click="loadChat(index)" class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer">
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
      <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar" :class="isDark ? 'scrollbar-dark' : 'scrollbar-light'" ref="messagesContainer">
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
                <div class="w-3/4">
                  <div class="bg-green-500 text-white rounded-lg px-4 py-2 shadow-sm">
                    <p class="text-base font-medium whitespace-pre-wrap">{{ message.content }}</p>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 text-right">
                    {{ formatMessageTime(message.timestamp) }}
                  </div>
                </div>
              </div>

              <!-- AI Messages (Left Side) -->
              <div v-else 
                   class="flex justify-start mb-4">
                <div class="flex gap-3 w-full">
                  <!-- AI Avatar -->
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  
                  <!-- AI Message Content -->
                  <div class="flex-1">
                    <div class="rounded-lg px-4 py-3 shadow-sm border"
                         :class="isDark 
                           ? 'bg-gray-700 border-gray-600' 
                           : 'bg-white border-gray-200'">
                      <div class="text-sm leading-relaxed markdown-content" 
                           :class="isDark ? 'text-gray-100' : 'text-gray-900'"
                           v-html="renderMarkdown(message.content)"></div>
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
                  <span class="text-sm text-gray-500">
                    {{ retrying ? 'Đang thử lại kết nối...' : 'AI đang soạn phản hồi...' }}
                  </span>
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
                @input="adjustTextareaHeight"
                ref="messageInput"
                placeholder="Nhập tin nhắn..."
                rows="1"
                :disabled="loading"
                class="w-full resize-none rounded-xl border px-4 py-3 pr-12 text-base outline-none transition-all focus:ring-2 focus:ring-green-500 overflow-y-auto custom-scrollbar"
                :class="[
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 scrollbar-dark' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500 scrollbar-light'
                ]"
                style="min-height: 48px; max-height: 300px; line-height: 1.5;"
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
import { marked } from 'marked'

// Create API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 600000, // Tăng timeout lên 10 phút
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
    
    // Load theme from localStorage on mount
    onMounted(() => {
      const savedTheme = localStorage.getItem('chatgpt-theme')
      if (savedTheme !== null) {
        isDark.value = savedTheme === 'dark'
      }
      // Apply theme to html element
      document.documentElement.classList.toggle('dark', isDark.value)
    })
    const sidebarCollapsed = ref(false)
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    
    const chatHistory = ref([])
    const loadingChatHistory = ref(false)
    const loadingMessages = ref(false)
    const currentChatIndex = ref(null)
    const currentSessionId = ref(null)
    const retrying = ref(false)
    
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
          })).sort((a, b) => b.lastActiveAt - a.lastActiveAt) // Sort by lastActiveAt descending (newest first)
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
      
      // Setup global copy function for code blocks with fallback
      window.copyCodeBlock = async (codeId) => {
        try {
          const codeElement = document.getElementById(codeId)
          if (!codeElement) return
          
          const text = codeElement.textContent
          let copySuccess = false
          
          // Method 1: Modern Clipboard API (requires HTTPS or localhost)
          if (navigator.clipboard && window.isSecureContext) {
            try {
              await navigator.clipboard.writeText(text)
              copySuccess = true
            } catch (e) {
              console.log('Clipboard API failed, trying fallback:', e)
            }
          }
          
          // Method 2: Fallback for HTTP or older browsers
          if (!copySuccess) {
            try {
              // Create temporary textarea
              const textArea = document.createElement('textarea')
              textArea.value = text
              textArea.style.position = 'fixed'
              textArea.style.left = '-999999px'
              textArea.style.top = '-999999px'
              document.body.appendChild(textArea)
              textArea.focus()
              textArea.select()
              
              // Try execCommand
              copySuccess = document.execCommand('copy')
              document.body.removeChild(textArea)
            } catch (e) {
              console.error('Fallback copy method failed:', e)
            }
          }
          
          // Show feedback
          const copyButton = codeElement.closest('.code-block-container').querySelector('.copy-button')
          if (copyButton) {
            const originalText = copyButton.innerHTML
            if (copySuccess) {
              copyButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg>Copied!'
            } else {
              copyButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"></path></svg>Failed!'
            }
            setTimeout(() => {
              copyButton.innerHTML = originalText
            }, 2000)
          }
          
        } catch (error) {
          console.error('Failed to copy code:', error)
          // Show error feedback
          const copyButton = document.querySelector(`#${codeId}`)?.closest('.code-block-container')?.querySelector('.copy-button')
          if (copyButton) {
            const originalText = copyButton.innerHTML
            copyButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"></path></svg>Error!'
            setTimeout(() => {
              copyButton.innerHTML = originalText
            }, 2000)
          }
        }
      }
    })
    
    // Start new chat session
    const startNewSession = async (content) => {
      try {
        console.log('Creating new session with content:', content)
        const response = await api.post('/api/chat-sessions/start', {
          content: content
        })
        
        if (response.data && response.data.sessionId) {
          currentSessionId.value = response.data.sessionId
          console.log('New session created:', response.data)
          
          // Wait a bit for backend to process and generate initial AI response
          console.log('Waiting for initial AI response...')
          
          // Poll for messages in the new session
          let attempts = 0
          const maxAttempts = 10
          
          const pollForInitialResponse = async () => {
            attempts++
            console.log(`Polling for initial response attempt ${attempts}/${maxAttempts}`)
            
            const latestMessages = await getLatestMessages(response.data.sessionId)
            
            // Check if we have any messages (including AI response)
            if (latestMessages.length > 0) {
              console.log('Initial AI response received!')
              
              // Update current messages
              messages.value = latestMessages
              
              // Reload chat sessions to get updated list and set active session
              await loadChatSessions()
              
              // Find and set the active session
              const sessionIndex = chatHistory.value.findIndex(session => session.sessionId === response.data.sessionId)
              if (sessionIndex !== -1) {
                currentChatIndex.value = sessionIndex
                console.log('Set active session index:', sessionIndex)
              }
              
              // Stop loading
              loading.value = false
              
              // Reset textarea height after loading is complete
              nextTick(() => {
                resetTextareaHeight()
              })
              
              return response.data.sessionId
            }
            
            // If max attempts reached, still set up session
            if (attempts >= maxAttempts) {
              console.log('Max polling attempts reached for initial response')
              
              // Reload chat sessions
              await loadChatSessions()
              
              // Find and set the active session
              const sessionIndex = chatHistory.value.findIndex(session => session.sessionId === response.data.sessionId)
              if (sessionIndex !== -1) {
                currentChatIndex.value = sessionIndex
                console.log('Set active session index:', sessionIndex)
              }
              
              // Stop loading
              loading.value = false
              
              // Reset textarea height after loading is complete
              nextTick(() => {
                resetTextareaHeight()
              })
              
              return response.data.sessionId
            }
            
            // Continue polling after 2 seconds
            setTimeout(pollForInitialResponse, 2000)
          }
          
          // Start polling after 1 second
          setTimeout(pollForInitialResponse, 1000)
          
          return response.data.sessionId
        }
      } catch (error) {
        console.error('Error starting new session:', error)
        loading.value = false
      }
      return null
    }

    // Send message to API with retry mechanism
    const sendMessageToAPI = async (sessionId, content, retryCount = 0) => {
      const maxRetries = 1 // Giảm từ 2 xuống 1 để tránh retry quá nhiều
      
      try {
        const response = await api.post(`/api/chat-messages/${sessionId}`, {
          sender: "USER",
          content: content
        })
        
        console.log('Message sent to API:', response.data)
        retrying.value = false
        return response.data
      } catch (error) {
        console.error(`Error sending message to API (attempt ${retryCount + 1}):`, error)
        
        // Retry chỉ với network errors, không retry với timeout
        if (retryCount < maxRetries && error.code === 'NETWORK_ERROR' && error.code !== 'ECONNABORTED') {
          retrying.value = true
          console.log(`Retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          return sendMessageToAPI(sessionId, content, retryCount + 1)
        }
        
        retrying.value = false
        
        // Show user-friendly error message
        if (error.code === 'ECONNABORTED') {
          alert('Kết nối bị timeout. Server có thể đang xử lý, vui lòng đợi hoặc thử lại sau.')
        } else if (error.response?.status === 500) {
          alert('Lỗi server. Vui lòng thử lại sau.')
        } else if (error.response?.status === 404) {
          alert('Session không tồn tại. Vui lòng tạo cuộc trò chuyện mới.')
        } else {
          alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
        }
        
        return null
      }
    }

    // Get latest messages from API with retry mechanism
    const getLatestMessages = async (sessionId, retryCount = 0) => {
      const maxRetries = 1 // Giảm từ 2 xuống 1
      
      try {
        const response = await api.get(`/api/chat-sessions/${sessionId}/messages`)
        
        if (response.data && Array.isArray(response.data)) {
          // Transform API messages to match our format
          const apiMessages = response.data.map(msg => ({
            id: msg.messageId || Date.now() + Math.random(),
            content: msg.content,
            role: msg.sender === 'USER' ? 'user' : 'assistant',
            timestamp: new Date(msg.timestamp)
          }))
          
          console.log(`Retrieved ${apiMessages.length} messages from API`)
          return apiMessages
        }
        return []
      } catch (error) {
        console.error(`Error getting latest messages (attempt ${retryCount + 1}):`, error)
        
        // Retry chỉ với network errors, không retry với timeout
        if (retryCount < maxRetries && error.code === 'NETWORK_ERROR' && error.code !== 'ECONNABORTED') {
          console.log(`Retrying get messages in 1 second... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return getLatestMessages(sessionId, retryCount + 1)
        }
        
        return []
      }
    }

    // Methods tương tự như component cũ
    const sendMessage = async () => {
      if (!input.value.trim() || loading.value) return

      const userInput = input.value.trim()
      
      // If this is the first message and no session exists, start a new session
      if (!currentSessionId.value && messages.value.length === 0) {
        console.log('Starting new session for first message...')
        
        // Don't add user message to UI yet, wait for session creation and AI response
        input.value = ''
        loading.value = true
        
        const sessionId = await startNewSession(userInput)
        if (!sessionId) {
          console.error('Failed to create new session')
          loading.value = false
          return
        }
        
        // Session created successfully, loading will be handled by startNewSession polling
        return
      }

      // Add user message to UI immediately
      messages.value.push({ 
        role: 'user', 
        content: userInput,
        timestamp: new Date()
      })
      
      input.value = ''
      loading.value = true

      // Reset textarea height to default after sending
      nextTick(() => {
        resetTextareaHeight()
        // Double check after a short delay
        setTimeout(() => {
          resetTextareaHeight()
        }, 100)
      })
      scrollToBottom()

      // Send message to API if we have a session ID
      if (currentSessionId.value) {
        console.log(`Sending message to session ${currentSessionId.value}:`, userInput)
        
        // Send user message to API
        const apiResponse = await sendMessageToAPI(currentSessionId.value, userInput)
        
        if (apiResponse) {
          // Wait a bit for backend to process and generate AI response
          console.log('Waiting for AI response...')
          
          // Poll for new messages every 2 seconds, max 30 times (60 seconds total - phù hợp với timeout 1 phút)
          let attempts = 0
          const maxAttempts = 30
          let pollingActive = true
          
          const pollForResponse = async () => {
            if (!pollingActive) {
              console.log('Polling stopped due to error or timeout')
              loading.value = false
              return
            }
            
            attempts++
            console.log(`Polling attempt ${attempts}/${maxAttempts}`)
            
            try {
              const latestMessages = await getLatestMessages(currentSessionId.value)
              
              // Check if we have more messages than before (including AI response)
              if (latestMessages.length > messages.value.length) {
                console.log('AI response received!')
                messages.value = latestMessages
                pollingActive = false
                loading.value = false
                scrollToBottom()
                updateChatHistory()
                return
              }
              
              // If max attempts reached, stop polling
              if (attempts >= maxAttempts) {
                console.log('Max polling attempts reached (timeout), stopping...')
                pollingActive = false
                loading.value = false
                alert('AI mất quá nhiều thời gian để phản hồi. Vui lòng thử lại.')
                return
              }
              
              // Continue polling after 2 seconds if still active
              if (pollingActive) {
                setTimeout(pollForResponse, 2000)
              }
            } catch (error) {
              console.error('Error during polling:', error)
              pollingActive = false
              loading.value = false
              alert('Có lỗi xảy ra khi chờ phản hồi từ AI. Vui lòng thử lại.')
            }
          }
          
          // Start polling after 1 second
          setTimeout(pollForResponse, 1000)
        } else {
          loading.value = false
        }
      } else {
        // Fallback if no session ID
        loading.value = false
      }
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
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto'
        
        // Calculate new height with min and max constraints
        const minHeight = 48 // 48px minimum
        const maxHeight = 300 // 300px maximum
        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
        
        // Set the new height
        textarea.style.height = newHeight + 'px'
        
        // If content exceeds max height, show scrollbar
        if (textarea.scrollHeight > maxHeight) {
          textarea.style.overflowY = 'auto'
        } else {
          textarea.style.overflowY = 'hidden'
        }
      }
    }

    const resetTextareaHeight = () => {
      const textarea = messageInput.value
      if (textarea) {
        // Force reset to default height
        textarea.style.height = '48px'
        textarea.style.overflowY = 'hidden'
        textarea.style.minHeight = '48px'
        textarea.style.maxHeight = '300px'
        
        // Force reflow to ensure the change takes effect
        textarea.offsetHeight
        
        console.log('Textarea height reset to 48px, current height:', textarea.style.height)
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
      // Apply theme to html element
      document.documentElement.classList.toggle('dark', isDark.value)
    }
    
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      localStorage.setItem('chatgpt-sidebar-collapsed', sidebarCollapsed.value.toString())
    }
    
    const newChat = () => {
      console.log('🆕 Creating new chat...')
      messages.value = []
      currentChatIndex.value = null
      currentSessionId.value = null
      input.value = ''
      // Reload chat sessions to get any new ones
      console.log('🔄 Reloading chat sessions after new chat...')
      loadChatSessions()
    }
    
    const loadChat = async (index) => {
      currentChatIndex.value = index
      const chat = chatHistory.value[index]
      
      // Set current session ID when loading an existing chat
      currentSessionId.value = chat.sessionId
      
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
      if (messages.value.length >= 2 && currentChatIndex.value !== null) {
        // Update the existing session in chat history with new messages
        const updatedChat = {
          ...chatHistory.value[currentChatIndex.value],
          messages: [...messages.value],
          lastActiveAt: new Date(),
          date: new Date()
        }
        
        chatHistory.value[currentChatIndex.value] = updatedChat
        console.log('Updated chat history for session:', updatedChat.sessionId)
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
    
    // Delete chat session
    const deleteSession = async (sessionId, index) => {
      if (!confirm('Bạn có chắc chắn muốn xóa cuộc trò chuyện này?')) {
        return
      }
      
      try {
        console.log(`Deleting session ${sessionId}...`)
        await api.delete(`/api/chat-sessions/${sessionId}`)
        
        // Remove from local chat history
        chatHistory.value.splice(index, 1)
        
        // If deleted session was active, clear current chat
        if (currentChatIndex.value === index) {
          messages.value = []
          currentChatIndex.value = null
          currentSessionId.value = null
        } else if (currentChatIndex.value > index) {
          // Adjust current index if deleted session was before current
          currentChatIndex.value--
        }
        
        console.log(`Session ${sessionId} deleted successfully`)
      } catch (error) {
        console.error('Error deleting session:', error)
        alert('Có lỗi xảy ra khi xóa cuộc trò chuyện. Vui lòng thử lại.')
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
    
    // Render markdown to HTML with code block styling
    const renderMarkdown = (text) => {
      try {
        let html = marked(text)
        
        // Replace code blocks with styled containers
        html = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attributes, code) => {
          const codeId = 'code-' + Math.random().toString(36).substr(2, 9)
          const decodedCode = code
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
          
          // Detect language
          let highlightedCode = code
          let language = 'Code'
          
          // Check attributes for language class
          if (attributes && attributes.includes('class=')) {
            const languageMatch = attributes.match(/class="[^"]*language-(\w+)[^"]*"/)
            if (languageMatch) {
              language = languageMatch[1].toLowerCase()
              if (language === 'js') language = 'JavaScript'
              if (language === 'bash' || language === 'sh') language = 'bash'
              if (language === 'json') language = 'JSON'
            }
          }
          
          // Try to detect JSON
          if (language === 'Code') {
            try {
              const parsedJSON = JSON.parse(decodedCode.trim())
              language = 'JSON'
              // Format JSON with proper indentation
              const formattedJSON = JSON.stringify(parsedJSON, null, 2)
              console.log('Original JSON:', decodedCode.trim())
              console.log('Formatted JSON:', formattedJSON)
              // Apply syntax highlighting to the formatted JSON
              highlightedCode = highlightJSON(formattedJSON
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;'))
              console.log('Highlighted JSON:', highlightedCode)
            } catch (e) {
              if (decodedCode.includes('Elasticsearch') || decodedCode.includes('"query"')) {
                language = 'Elasticsearch Query'
                try {
                  // Try to format as JSON first
                  const parsedJSON = JSON.parse(decodedCode.trim())
                  const formattedJSON = JSON.stringify(parsedJSON, null, 2)
                  highlightedCode = highlightJSON(formattedJSON
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;'))
                } catch (formatError) {
                  highlightedCode = highlightJSON(code)
                }
              } else if (decodedCode.includes('git ') || decodedCode.includes('npm ')) {
                language = 'bash'
              }
            }
          }
          
          return `<div class="code-block-container">
            <div class="code-block-header">
              <span class="code-block-language">${language}</span>
              <button class="copy-button" onclick="copyCodeBlock('${codeId}')" title="Copy to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012 2v1"></path>
                </svg>
                Copy
              </button>
            </div>
            <pre><code${attributes} id="${codeId}">${highlightedCode}</code></pre>
          </div>`
        })
        
        return html
      } catch (error) {
        console.error('Error rendering markdown:', error)
        return text
      }
    }
    
    // Simple JSON syntax highlighter - preserves line breaks and spacing
    const highlightJSON = (code) => {
      return code
        .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span style="color: #9cdcfe;">$1</span>:') // Keys - blue
        .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color: #ce9178;">$1</span>') // String values - orange
        .replace(/:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, ': <span style="color: #b5cea8;">$1</span>') // Numbers - green
        .replace(/:\s*(true|false|null)/g, ': <span style="color: #569cd6;">$1</span>') // Booleans/null - blue
        .replace(/([{}[\],])/g, '<span style="color: #d4d4d4;">$1</span>') // Brackets and commas - white
    }
    
    return {
      input,
      messages,
      loading,
      loadingMessages,
      retrying,
      isDark,
      sidebarCollapsed,
      messagesContainer,
      messageInput,
      chatHistory,
      loadingChatHistory,
      currentChatIndex,
      currentSessionId,
      user,
      sendMessage,
      scrollToBottom,
      adjustTextareaHeight,
      resetTextareaHeight,
      insertNewLine,
      toggleTheme,
      toggleSidebar,
      newChat,
      loadChat,
      deleteSession,
      formatDate,
      formatMessageTime,
      copyMessage,
      handleLogout,
      renderMarkdown
    }
  }
}

</script>

<style scoped>
/* Custom scrollbar styles */
.custom-scrollbar {
  scrollbar-width: thin;
}

/* Dark theme scrollbar */
.scrollbar-dark::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-dark::-webkit-scrollbar-track {
  background: #374151; /* gray-700 */
  border-radius: 4px;
}

.scrollbar-dark::-webkit-scrollbar-thumb {
  background: #6b7280; /* gray-500 */
  border-radius: 4px;
}

.scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* gray-400 */
}

/* Light theme scrollbar */
.scrollbar-light::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-light::-webkit-scrollbar-track {
  background: #f3f4f6; /* gray-100 */
  border-radius: 4px;
}

.scrollbar-light::-webkit-scrollbar-thumb {
  background: #d1d5db; /* gray-300 */
  border-radius: 4px;
}

.scrollbar-light::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* gray-400 */
}

/* Firefox scrollbar */
.custom-scrollbar {
  scrollbar-color: #6b7280 #374151; /* thumb track for dark */
}

.scrollbar-light {
  scrollbar-color: #d1d5db #f3f4f6; /* thumb track for light */
}

/* Markdown content styling */
.markdown-content {
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-weight: 600;
  margin: 1em 0 0.5em 0;
}

.markdown-content p {
  margin: 0.75em 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.75em 0;
  padding-left: 1.5em;
}

.markdown-content li {
  margin: 0.25em 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

.markdown-content blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
  color: #6b7280;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #e5e7eb;
  padding: 0.5em;
  text-align: left;
}

.markdown-content th {
  background-color: rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.markdown-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #2563eb;
}

/* Code block container styling */
.code-block-container {
  position: relative !important;
  margin: 1em 0 !important;
  border-radius: 0.75rem !important;
  overflow: hidden !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #e5e7eb !important;
}

.code-block-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  padding: 0.75rem 1rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  color: white !important;
}

.code-block-language {
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.copy-button {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  padding: 0.375rem 0.75rem !important;
  border-radius: 0.375rem !important;
  cursor: pointer !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.375rem !important;
  transition: all 0.2s ease !important;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.code-block-container pre {
  margin: 0 !important;
  padding: 1rem !important;
  background: #f8f9fa !important;
  overflow-x: auto !important;
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
}

.code-block-container pre code {
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-family: inherit !important;
  font-size: inherit !important;
  color: #212529 !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
}

/* Dark theme support for code blocks */
.dark .code-block-container {
  border-color: #374151 !important;
}

.dark .code-block-container pre {
  background: #1f2937 !important;
}

.dark .code-block-container pre code {
  color: #e5e7eb !important;
}

.dark .markdown-content code {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark .markdown-content blockquote {
  border-left-color: #374151;
  color: #9ca3af;
}

.dark .markdown-content th,
.dark .markdown-content td {
  border-color: #374151;
}

.dark .markdown-content th {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
