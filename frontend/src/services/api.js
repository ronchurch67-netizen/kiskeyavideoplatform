const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const API_BASE_URL = `${BACKEND_URL}/api`
export const VIDEO_BASE_URL = `${BACKEND_URL}/media/videos`

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers, ...options })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Yon erè rive.')
  }

  return data
}

export function register(payload) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export function login(payload) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function listProjects() {
  return request('/projects')
}

export function getProject(projectId) {
  return request(`/projects/${projectId}`)
}

export function createProject(payload) {
  return request('/projects', { method: 'POST', body: JSON.stringify(payload) })
}

export function generateScript(projectId) {
  return request(`/projects/${projectId}/script`, { method: 'POST' })
}

export function generateVideo(projectId) {
  return request(`/projects/${projectId}/generate`, { method: 'POST' })
}
