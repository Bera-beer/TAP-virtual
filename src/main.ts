import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { authService } from './infrastructure/providers/AuthProvider'

const app = createApp(App)

authService.initializeAuth().then(() => {
  app.mount('#app')
})
