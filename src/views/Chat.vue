<template>
  <div v-if="user" class="flex h-screen bg-gray-50 dark:bg-gray-900">
    
    <!-- Sidebar -->
    <div class="w-64 bg-gray-900 text-white flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Chat Log</h2>
          <div class="flex items-center gap-2">
            <button @click="toggleTheme" 
                    class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    :title="isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'">
              {{ isDark ? '☀️' : '🌙' }}
            </button>
            
            <!-- User Menu -->
            <div class="relative">
              <button @click="showUserMenu = !showUserMenu" 
                      class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <img :src="user.avatar" :alt="user.name" class="w-6 h-6 rounded-full">
              </button>
              
              <!-- Dropdown Menu -->
              <div v-if="showUserMenu" 
                   class="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div class="p-3 border-b border-gray-700">
                  <p class="text-sm font-medium text-white">{{ user.name }}</p>
                  <p class="text-xs text-gray-400">@{{ user.username }}</p>
                </div>
                <div class="py-2">
                  <button @click="handleLogout"
                          class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- New Chat Button -->
      <div class="p-4">
        <button @click="newChat" 
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Cuộc trò chuyện mới
        </button>
      </div>
      
      <!-- Chat History -->
      <div class="flex-1 overflow-y-auto px-4 pb-4">
        <div class="space-y-2">
          <div v-for="(chat, index) in chatHistory" :key="index"
               @click="loadChat(index)"
               :class="['p-3 rounded-lg cursor-pointer transition-colors', 
                        currentChatIndex === index ? 'bg-gray-700' : 'hover:bg-gray-800']">
            <p class="text-sm truncate">{{ chat.title }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatDate(chat.date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col" :class="isDark ? 'bg-gray-800' : 'bg-white'">
      
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
      <div class="flex-1 overflow-y-auto" ref="messagesContainer">
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
          <div v-else class="space-y-0">
            <div v-for="(message, index) in messages" :key="index"
                 class="group border-b transition-colors"
                 :class="[
                   message.role === 'user' 
                     ? (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')
                     : (isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')
                 ]">
              <div class="max-w-4xl mx-auto px-6 py-8 flex gap-6">
                
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div v-if="message.role === 'user'" class="w-8 h-8 rounded-sm overflow-hidden">
                    <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover">
                  </div>
                  <div v-else 
                       class="w-8 h-8 bg-green-500 rounded-sm flex items-center justify-center text-white text-sm font-medium">
                    AI
                  </div>
                </div>

                <!-- Message Content -->
                <div class="flex-1 min-w-0">
                  <div class="prose max-w-none" :class="isDark ? 'prose-invert' : ''">
                    <p class="text-base leading-7 whitespace-pre-wrap" 
                       :class="isDark ? 'text-gray-100' : 'text-gray-900'">{{ message.content }}</p>
                  </div>
                  
                  <!-- Message Actions (visible on hover) -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity mt-3 flex gap-2">
                    <button @click="copyMessage(message.content)"
                            class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            :class="isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
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
      </div>

      <!-- Input Area -->
      <div class="border-t p-4" :class="isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'">
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

    <!-- Click outside to close user menu -->
    <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>
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

export default {
  setup() {
    const router = useRouter()
    const { state: authState, logout, checkAuth } = useAuthStore()
    
    const input = ref('')
    const messages = ref([])
    const loading = ref(false)
    const isDark = ref(true)
    const showUserMenu = ref(false)
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    
    const chatHistory = ref([
      {
        title: 'Cuộc trò chuyện về AI',
        date: new Date(),
        messages: [
          { role: 'user', content: 'AI là gì?' },
          { role: 'assistant', content: 'AI (Artificial Intelligence) là trí tuệ nhân tạo...' }
        ]
      }
    ])
    const currentChatIndex = ref(null)
    
    const user = computed(() => authState.user)
    
    // Redirect to login if user not found
    onMounted(() => {
      // Ensure auth state is checked
      checkAuth()
      
      // Double check after a short delay to allow auth to process
      setTimeout(() => {
        if (!authState.user) {
          router.push('/login')
          return
        }
      }, 100)
      
      // Áp dụng theme từ localStorage
      const savedTheme = localStorage.getItem('chatgpt-theme')
      if (savedTheme !== null) {
        isDark.value = savedTheme === 'dark'
      }
      
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
    
    const newChat = () => {
      messages.value = []
      currentChatIndex.value = null
      input.value = ''
    }
    
    const loadChat = (index) => {
      currentChatIndex.value = index
      messages.value = [...chatHistory.value[index].messages]
      scrollToBottom()
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
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return 'Hôm nay'
      if (days === 1) return 'Hôm qua'
      if (days < 7) return `${days} ngày trước`
      return date.toLocaleDateString('vi-VN')
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
      try {
        await logout()
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
      isDark,
      showUserMenu,
      messagesContainer,
      messageInput,
      chatHistory,
      currentChatIndex,
      user,
      sendMessage,
      scrollToBottom,
      adjustTextareaHeight,
      insertNewLine,
      toggleTheme,
      newChat,
      loadChat,
      formatDate,
      copyMessage,
      handleLogout
    }
  }
}
</script>
