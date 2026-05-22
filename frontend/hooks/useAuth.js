import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null
    if (token) fetchUser()
    else setLoading(false)
  }, [fetchUser])

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('access_token', data.access_token)
    await fetchUser()
    router.push('/dashboard')
  }

  const register = async (name, email, password) => {
    await api.post('/api/auth/register', { name, email, password })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    router.push('/auth/login')
  }

  return { user, loading, login, register, logout }
}
