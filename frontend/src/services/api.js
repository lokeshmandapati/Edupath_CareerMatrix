import axios from 'axios'

/**
 * Axios client for CareerMatrix API. Set VITE_API_URL in .env for production.
 */
const baseURL = import.meta.env.VITE_API_URL || 'https://edupath-careermatrix.onrender.com'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careermatrix_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
