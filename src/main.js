import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

// Clean up invalid localStorage entries on app start
const cleanupLocalStorage = () => {
  const savedUser = localStorage.getItem('chatgpt-user')
  if (savedUser === 'undefined' || savedUser === 'null') {
    localStorage.removeItem('chatgpt-user')
  }
}

const app = createApp(App)

// Cleanup and initialize auth store
cleanupLocalStorage()
const { checkAuth } = useAuthStore()
checkAuth()

app.use(router)
app.mount('#app')
