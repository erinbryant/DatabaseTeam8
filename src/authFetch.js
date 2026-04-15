const envApi = import.meta.env.VITE_API_URL
const API_BASE =
  envApi != null && String(envApi).trim() !== ''
    ? String(envApi).replace(/\/$/, '')
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:5000'

export function authFetch(path, options = {}) {
  const { auth = true, ...fetchOptions } = options
  const token = localStorage.getItem('token')
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

  const headers = new Headers(fetchOptions.headers || {})
  if (auth && token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, { ...fetchOptions, headers })
}