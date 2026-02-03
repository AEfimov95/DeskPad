import { createApp } from 'vue'
import { i18n } from './i18n'
import { createPinia } from 'pinia'
import { router } from './router'
import 'uno.css'
import '@/assets/styles/app.css'
import App from './App.vue'
import { initDb } from './db'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)

await initDb()

app.mount('#app')

// Let’s pretend we’re not a web app
window.addEventListener('keydown', (e) => {
  const ctrl = e.ctrlKey || e.metaKey

  if ((ctrl && e.code === 'KeyF') || (ctrl && e.code === 'KeyR') || e.key === 'F5') {
    e.preventDefault()
    e.stopPropagation()
  }
})
