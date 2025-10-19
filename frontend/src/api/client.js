import axios from 'axios'

// Use a relative runtime path to avoid baking absolute backend hostnames
// into the built bundle. This ensures the browser always calls the frontend
// host (nginx) at /api, which nginx will proxy to the backend service.
const API_BASE = '/api'

const client = axios.create({
  baseURL: API_BASE,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // normalize error for UI: attach status and data
    const error = new Error(err.message)
    error.status = err.response?.status
    error.data = err.response?.data
    return Promise.reject(error)
  }
)

export default client
