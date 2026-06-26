import axios from 'axios'

// URL backend (Render)
const API_URL = import.meta.env.VITE_API_URL || 'https://sheetkaizen-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

// Interceptor: aggiunge token a ogni richiesta
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor: se token scaduto o invalido (401), fai logout automatico
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto/invalido — pulisci e redirect a login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Solo se non siamo già sulla pagina login (evita loop)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
