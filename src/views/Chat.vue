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
            <div v-for="(block, index) in messageBlocks" :key="index">
              <!-- User block -->
              <div v-if="block.type === 'user'" class="flex justify-end mb-4">
                <div class="w-3/4">
                  <div class="bg-green-500 text-white rounded-lg px-4 py-2 shadow-sm">
                    <p class="text-base font-medium whitespace-pre-wrap">{{ block.message.content }}</p>
                  </div>
                  <div class="text-xs text-gray-500 mt-1 text-right">
                    {{ formatMessageTime(block.message.timestamp) }}
                  </div>
                </div>
              </div>

              <!-- Single AI block -->
              <div v-else-if="block.type === 'assistant-single'" class="flex justify-start mb-4">
                <div class="flex gap-3 w-full">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="relative rounded-lg px-4 py-3 shadow-sm border" :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'">
                      <button @click="copyQuery(block.message.content)" class="absolute top-2 right-2 text-xs px-2 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-600" :class="isDark ? 'border-gray-500 text-gray-200' : 'border-gray-300 text-gray-600'" title="Copy query">
                        <span class="inline-flex items-center gap-1">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2v-2M8 16v2a2 2 0 002 2h2"/></svg>
                          Copy
                        </span>
                      </button>
                      <div class="text-sm leading-relaxed" :class="isDark ? 'text-gray-100' : 'text-gray-900'" v-html="renderMarkdown(block.message.content)"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">{{ formatMessageTime(block.message.timestamp) }}</div>
                  </div>
                </div>
              </div>

              <!-- Dual AI comparison block -->
              <div v-else-if="block.type === 'assistant-dual'" class="flex justify-start mb-4">
                <div class="flex gap-3 w-full">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Left AI -->
                    <div class="relative rounded-lg px-4 py-3 shadow-sm border" :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded-full" :class="getAiBadge(block.left.content).color === 'blue' ? 'bg-blue-100 text-blue-800' : (getAiBadge(block.left.content).color === 'green' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800')">
                          {{ getAiBadge(block.left.content).label }}
                        </span>
                        <span class="text-xs text-gray-500">{{ formatMessageTime(block.left.timestamp) }}</span>
                        </div>
                        <button @click="copyQuery(block.left.content)" class="absolute top-2 right-2 text-xs px-2 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-600" :class="isDark ? 'border-gray-500 text-gray-200' : 'border-gray-300 text-gray-600'" title="Copy query">
                          <span class="inline-flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2v-2M8 16v2a2 2 0 002 2h2"/></svg>
                            Copy
                          </span>
                        </button>
                      </div>
                      <div class="text-sm leading-relaxed" :class="isDark ? 'text-gray-100' : 'text-gray-900'" v-html="renderMarkdown(block.left.content)"></div>
                    </div>
                    <!-- Right AI -->
                    <div class="relative rounded-lg px-4 py-3 shadow-sm border" :class="isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded-full" :class="getAiBadge(block.right.content).color === 'blue' ? 'bg-blue-100 text-blue-800' : (getAiBadge(block.right.content).color === 'green' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800')">
                          {{ getAiBadge(block.right.content).label }}
                        </span>
                        <span class="text-xs text-gray-500">{{ formatMessageTime(block.right.timestamp) }}</span>
                        </div>
                        <button @click="copyQuery(block.right.content)" class="absolute top-2 right-2 text-xs px-2 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-600" :class="isDark ? 'border-gray-500 text-gray-200' : 'border-gray-300 text-gray-600'" title="Copy query">
                          <span class="inline-flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2v-2M8 16v2a2 2 0 002 2h2"/></svg>
                            Copy
                          </span>
                        </button>
                      </div>
                      <div class="text-sm leading-relaxed" :class="isDark ? 'text-gray-100' : 'text-gray-900'" v-html="renderMarkdown(block.right.content)"></div>
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

          <!-- Comparison Results -->
          <div v-if="comparisonData && comparisonData.response_generation_comparison" class="p-4">
            <div class="max-w-4xl mx-auto">
              <div class="mb-4">
                <h3 class="text-lg font-semibold mb-2" :class="isDark ? 'text-white' : 'text-gray-900'">
                  🆚 Kết quả so sánh AI Models
                </h3>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  Câu hỏi: {{ comparisonData.user_question }}
                </p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- OpenAI Result -->
                <div class="border rounded-lg p-4" :class="isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-bold">O</span>
                    </div>
                    <h4 class="font-semibold" :class="isDark ? 'text-white' : 'text-gray-900'">
                      OpenAI GPT-4o-mini
                    </h4>
                    <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {{ comparisonData.response_generation_comparison.openai.response_time_ms }}ms
                    </span>
                  </div>
                  <div class="text-sm leading-relaxed whitespace-pre-wrap" 
                       :class="isDark ? 'text-gray-100' : 'text-gray-700'">
                    {{ comparisonData.response_generation_comparison.openai.response }}
                  </div>
                </div>

                <!-- OpenRouter Result -->
                <div class="border rounded-lg p-4" :class="isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-bold">G</span>
                    </div>
                    <h4 class="font-semibold" :class="isDark ? 'text-white' : 'text-gray-900'">
                      OpenRouter Grok-4
                    </h4>
                    <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {{ comparisonData.response_generation_comparison.openrouter.response_time_ms }}ms
                    </span>
                  </div>
                  <div class="text-sm leading-relaxed whitespace-pre-wrap" 
                       :class="isDark ? 'text-gray-100' : 'text-gray-700'">
                    {{ comparisonData.response_generation_comparison.openrouter.response }}
                  </div>
                </div>
                  </div>
                  
              <!-- Performance Comparison -->
              <div class="mt-4 p-3 rounded-lg" :class="isDark ? 'bg-gray-800 border border-gray-600' : 'bg-blue-50 border border-blue-200'">
                <h5 class="font-medium mb-2" :class="isDark ? 'text-white' : 'text-blue-900'">
                  📊 So sánh hiệu suất
                </h5>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">Query Generation:</span>
                    <div class="mt-1">
                      <span class="text-blue-600">OpenAI:</span> {{ comparisonData.query_generation_comparison.openai.response_time_ms }}ms
                    </div>
                    <div>
                      <span class="text-green-600">OpenRouter:</span> {{ comparisonData.query_generation_comparison.openrouter.response_time_ms }}ms
                    </div>
                  </div>
                  <div>
                    <span class="font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">Response Generation:</span>
                    <div class="mt-1">
                      <span class="text-blue-600">OpenAI:</span> {{ comparisonData.response_generation_comparison.openai.response_time_ms }}ms
                    </div>
                    <div>
                      <span class="text-green-600">OpenRouter:</span> {{ comparisonData.response_generation_comparison.openrouter.response_time_ms }}ms
                    </div>
                  </div>
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

// Create API instance
// Use relative URL in development (will use Vite proxy), absolute URL in production
const apiBaseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')
console.log('🔗 API Base URL:', apiBaseUrl, '(DEV mode:', import.meta.env.DEV, ')')

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 600000, // 10 phút
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
    const comparisonData = ref(null)
    
    // Polling configuration: 10 minutes total, 2s interval
    const POLL_INTERVAL_MS = 2000
    const MAX_POLL_DURATION_MS = 10 * 60 * 1000
    
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
          // Sort newest first by lastActiveAt, fallback createdAt
          chatHistory.value.sort((a, b) => {
            const ta = (a.lastActiveAt || a.createdAt || new Date(0)).getTime()
            const tb = (b.lastActiveAt || b.createdAt || new Date(0)).getTime()
            return tb - ta
          })
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
        // Enhance code blocks after mount
        setTimeout(() => enhanceRenderedMarkdown(), 0)
      })
    })
    
    // Removed legacy startNewSession that called /api/chat-sessions/start/compare (not available)

    // Start comparison by sending the first message directly
    const startComparisonDirect = async (content) => {
      try {
        console.log('Starting comparison via /api/chat-messages/start-comparison with content:', content)
        const response = await api.post('/api/chat-messages/start-comparison', { message: content })
        console.log('start-comparison response status:', response.status, 'data:', response.data)
        const newSessionId = response?.data?.sessionId || response?.data?.data?.sessionId || response?.data?.session?.id
        if (newSessionId) {
          currentSessionId.value = newSessionId
          console.log('Comparison started, sessionId:', newSessionId)

          // Poll for messages (same logic as startNewSession)
          let attempts = 0
          const maxAttempts = Math.ceil(MAX_POLL_DURATION_MS / POLL_INTERVAL_MS)
          const pollStartTime = Date.now()
          const pollForInitialResponse = async () => {
            attempts++
            console.log(`Polling for initial response attempt ${attempts}/${maxAttempts}`)
            const latestMessages = await getLatestMessages(newSessionId)
            if (latestMessages.length > 0) {
              messages.value = latestMessages
              await loadChatSessions()
              const sessionIndex = chatHistory.value.findIndex(s => s.sessionId === newSessionId)
              if (sessionIndex !== -1) currentChatIndex.value = sessionIndex
              loading.value = false
              nextTick(() => { resetTextareaHeight() })
              return newSessionId
            }
            if (Date.now() - pollStartTime >= MAX_POLL_DURATION_MS) {
              await loadChatSessions()
              const sessionIndex = chatHistory.value.findIndex(s => s.sessionId === newSessionId)
              if (sessionIndex !== -1) currentChatIndex.value = sessionIndex
              loading.value = false
              nextTick(() => { resetTextareaHeight() })
              return newSessionId
            }
            setTimeout(pollForInitialResponse, POLL_INTERVAL_MS)
          }
          setTimeout(pollForInitialResponse, 1000)
          return newSessionId
        }

        // If backend doesn't return sessionId, infer by reloading sessions and taking the most recent
        console.log('No sessionId in start-comparison response; inferring from sessions list...')
        await loadChatSessions()
        if (chatHistory.value.length > 0) {
          // Pick the session with latest lastActiveAt/createdAt
          const idx = chatHistory.value.reduce((bestIdx, sess, i, arr) => {
            const best = arr[bestIdx]
            const bestTime = (best.lastActiveAt || best.createdAt || new Date(0)).getTime()
            const curTime = (sess.lastActiveAt || sess.createdAt || new Date(0)).getTime()
            return curTime > bestTime ? i : bestIdx
          }, 0)
          const inferred = chatHistory.value[idx]
          if (inferred && inferred.sessionId) {
            currentSessionId.value = inferred.sessionId
            currentChatIndex.value = idx
            console.log('Inferred sessionId:', inferred.sessionId, 'at index', idx)
            // Start polling messages for inferred session
            let attempts = 0
            const maxAttempts = Math.ceil(MAX_POLL_DURATION_MS / POLL_INTERVAL_MS)
            const pollStartTime = Date.now()
            const pollForInitialResponse = async () => {
              attempts++
              const latestMessages = await getLatestMessages(inferred.sessionId)
              if (latestMessages.length > 0) {
                messages.value = latestMessages
                loading.value = false
                nextTick(() => { resetTextareaHeight() })
                return inferred.sessionId
              }
              if (Date.now() - pollStartTime >= MAX_POLL_DURATION_MS) {
                loading.value = false
                nextTick(() => { resetTextareaHeight() })
                return inferred.sessionId
              }
              setTimeout(pollForInitialResponse, POLL_INTERVAL_MS)
            }
            setTimeout(pollForInitialResponse, 1000)
            return inferred.sessionId
          }
        }
      } catch (error) {
        console.error('Error starting comparison via message:', error?.response?.status, error?.response?.data || error?.message)
        if (error?.response?.status === 404) {
          alert('Endpoint /api/chat-messages/start-comparison không tồn tại (404). Kiểm tra backend hoặc cấu hình proxy.')
        } else if (error?.response?.status === 500) {
          alert('Server lỗi khi start comparison (500). Vui lòng thử lại.')
        }
        loading.value = false
      }
      return null
    }

    // Send message to API with retry mechanism
    const sendMessageToAPI = async (sessionId, content, retryCount = 0) => {
      const maxRetries = 2
      
      try {
        const response = await api.post(`/api/chat-messages/compare/${sessionId}`, {
          message: content
        })
        
        console.log('Comparison message sent to API:', response.data)
        
        // Store comparison data for display
        if (response.data && response.data.mode === 'comparison') {
          comparisonData.value = response.data
          console.log('Comparison data stored:', response.data)
        }
        
        retrying.value = false
        return response.data
      } catch (error) {
        console.error(`Error sending message to API (attempt ${retryCount + 1}):`, error)
        
        // Retry on timeout or network errors
        if (retryCount < maxRetries && (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR')) {
          retrying.value = true
          console.log(`Retrying in 2 seconds... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          return sendMessageToAPI(sessionId, content, retryCount + 1)
        }
        
        retrying.value = false
        
        // Show user-friendly error message
        if (error.code === 'ECONNABORTED') {
          alert('Kết nối bị timeout. Vui lòng kiểm tra kết nối mạng và thử lại.')
        } else if (error.response?.status === 500) {
          alert('Lỗi server. Vui lòng thử lại sau.')
        } else if (error.response?.status === 404) {
          alert('Session không tồn tại. Vui lòng tạo cuộc trò chuyện mới.')
        } else {
          alert('Có lỗi xảy ra khi gửi tin nhắn comparison. Vui lòng thử lại.')
        }
        
        return null
      }
    }

    // Get latest messages from API with retry mechanism
    const getLatestMessages = async (sessionId, retryCount = 0) => {
      const maxRetries = 2
      
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
        
        // Retry on timeout or network errors
        if (retryCount < maxRetries && (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR')) {
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
        
        // Use direct comparison start endpoint only
        const sessionId = await startComparisonDirect(userInput)
        if (!sessionId) {
          console.error('Failed to create new comparison session')
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
        setTimeout(() => enhanceRenderedMarkdown(), 0)
      })
      scrollToBottom()

      // Send message to API if we have a session ID
      if (currentSessionId.value) {
        console.log(`Sending comparison message to session ${currentSessionId.value}:`, userInput)
        
        // Send user message to API
        const apiResponse = await sendMessageToAPI(currentSessionId.value, userInput)
        
        if (apiResponse) {
          // Wait a bit for backend to process and generate AI response
          console.log('Waiting for AI response...')
          
          // Poll for new messages every 2 seconds, up to 10 minutes total
          let attempts = 0
          const maxAttempts = Math.ceil(MAX_POLL_DURATION_MS / POLL_INTERVAL_MS)
          const pollStartTime = Date.now()
          
          const pollForResponse = async () => {
            attempts++
            console.log(`Polling attempt ${attempts}/${maxAttempts}`)
            
            const latestMessages = await getLatestMessages(currentSessionId.value)
            
            // Check if we have more messages than before (including AI response)
            if (latestMessages.length > messages.value.length) {
              console.log('AI response received!')
              messages.value = latestMessages
              
              // Try to get comparison data from the latest message if available
              const latestMessage = latestMessages[latestMessages.length - 1]
              if (latestMessage.comparisonData) {
                comparisonData.value = latestMessage.comparisonData
              }
        
        loading.value = false
        scrollToBottom()
        updateChatHistory()
              return
            }
            
            // If max polling duration reached, stop polling
            if (Date.now() - pollStartTime >= MAX_POLL_DURATION_MS) {
              console.log('Max polling duration reached (timeout), stopping...')
              loading.value = false
              return
            }
            
            // Continue polling after interval
            setTimeout(pollForResponse, POLL_INTERVAL_MS)
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
      comparisonData.value = null
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
      
      // Clear comparison data when loading different chat
      comparisonData.value = null
      
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
      setTimeout(() => enhanceRenderedMarkdown(), 0)
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
        // Move the updated session to the top and keep list sorted by recency
        const moved = chatHistory.value.splice(currentChatIndex.value, 1)[0]
        chatHistory.value.unshift(moved)
        currentChatIndex.value = 0
        chatHistory.value.sort((a, b) => {
          const ta = (a.lastActiveAt || a.createdAt || new Date(0)).getTime()
          const tb = (b.lastActiveAt || b.createdAt || new Date(0)).getTime()
          return tb - ta
        })
        console.log('Updated chat history for session:', updatedChat.sessionId)
      }
    }

    // Group consecutive AI responses after a user message into a dual block
    const messageBlocks = computed(() => {
      const blocks = []
      const list = messages.value || []
      let i = 0
      while (i < list.length) {
        const msg = list[i]
        if (msg.role === 'user') {
          blocks.push({ type: 'user', message: msg })
          // Peek next one or two for assistant replies
          const next = list[i + 1]
          const next2 = list[i + 2]
          if (next && next.role === 'assistant' && next2 && next2.role === 'assistant') {
            blocks.push({ type: 'assistant-dual', left: next, right: next2 })
            i += 3
            continue
          } else if (next && next.role === 'assistant') {
            blocks.push({ type: 'assistant-single', message: next })
            i += 2
            continue
          }
          i += 1
          continue
        }
        // If assistant without preceding user (fallback), render as single
        if (msg.role === 'assistant') {
          // If next is also assistant and previous wasn't a user, keep them separate
          blocks.push({ type: 'assistant-single', message: msg })
          i += 1
          continue
        }
        // Any other roles just push as-is
        blocks.push({ type: 'other', message: msg })
        i += 1
      }
      return blocks
    })

    // Infer AI source for badge based on content prefix markers
    const getAiBadge = (content) => {
      const text = (content || '').toString()
      if (/OpenAI Response/i.test(text) || /\bOpenAI\b/i.test(text)) {
        return { label: 'OpenAI', color: 'blue' }
      }
      if (/OpenRouter Response/i.test(text) || /\bOpenRouter\b|\bGrok\b/i.test(text)) {
        return { label: 'OpenRouter', color: 'green' }
      }
      return { label: 'AI', color: 'purple' }
    }

    // Basic markdown renderer for bold, italics, inline/code blocks, lists and fenced code
    const renderMarkdown = (raw) => {
      if (!raw) return ''
      let html = raw
      // Escape HTML first
      html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      // Fenced code blocks ```lang\n...```
      html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_m, lang, inner) => {
        const language = (lang || '').trim()
        return '<pre class="code-block rounded-md p-3 overflow-auto bg-gray-900 text-gray-100" data-lang="' + language + '"><code>' + inner + '</code></pre>'
      })
      // Bold **text**
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic *text*
      html = html.replace(/(^|\s)\*(?!\s)([^*]+?)\*(?=\s|[.,!?:;)]|$)/g, '$1<em>$2</em>')
      // Inline code `code`
      html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">$1</code>')
      // Headings (convert to strong)
      html = html.replace(/^#{1,6}\s*(.+)$/gm, '<strong>$1</strong>')
      // Unordered lists
      html = html.replace(/(^|\n)-\s+(.+)(?=\n|$)/g, (m, p1, item) => `${p1}<li>${item}</li>`)
      html = html.replace(/(<li>[^]+?<\/li>)/g, '<ul class="list-disc ml-5">$1</ul>')
      // New lines → <br>
      html = html.replace(/\n/g, '<br>')
      return html
    }

    const enhanceRenderedMarkdown = () => {
      const container = messagesContainer.value
      if (!container) return
      const blocks = container.querySelectorAll('pre.code-block')
      blocks.forEach((pre) => {
        if (pre.dataset.enhanced === '1') return
        pre.dataset.enhanced = '1'
        pre.classList.add('relative', 'pt-8')
        const lang = (pre.getAttribute('data-lang') || '').toUpperCase()
        // Language pill
        const pill = document.createElement('span')
        pill.textContent = lang || 'CODE'
        pill.className = 'absolute top-2 left-2 text-2xs px-2 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700'
        // Copy button
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.title = 'Copy code'
        btn.className = 'absolute top-2 right-2 text-2xs px-2 py-0.5 rounded border border-gray-600 text-gray-200 hover:bg-gray-700'
        btn.innerText = 'Copy'
        btn.addEventListener('click', async () => {
          try {
            const codeEl = pre.querySelector('code')
            const text = codeEl ? codeEl.textContent || '' : ''
            await navigator.clipboard.writeText(text)
            const old = btn.innerText
            btn.innerText = 'Copied'
            setTimeout(() => (btn.innerText = old), 1200)
          } catch (e) {
            console.error('Copy failed:', e)
          }
        })
        pre.appendChild(pill)
        pre.appendChild(btn)
      })
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

    const extractFirstCodeBlock = (raw) => {
      if (!raw) return ''
      const match = raw.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/) || raw.match(/`([^`]+)`/)
      if (!match) return ''
      return (match[1] || '').trim()
    }

    const copyQuery = async (raw) => {
      const code = extractFirstCodeBlock(raw) || raw || ''
      try {
        await navigator.clipboard.writeText(code)
      } catch (error) {
        console.error('Failed to copy query:', error)
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
          comparisonData.value = null
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
    
    return {
      input,
      messages,
      loading,
      loadingMessages,
      retrying,
      comparisonData,
      isDark,
      sidebarCollapsed,
      messagesContainer,
      messageInput,
      messageBlocks,
      getAiBadge,
      renderMarkdown,
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
      copyQuery,
      handleLogout
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
</style>
