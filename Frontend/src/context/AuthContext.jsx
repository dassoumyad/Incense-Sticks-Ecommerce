import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as auth from '../services/authService.js'
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const customerToken = localStorage.getItem('incense_token')
    if (customerToken) {
      localStorage.removeItem('incense_admin_token')
      localStorage.removeItem('incense_admin_name')
    }
    return customerToken
  })
  const [email, setEmail] = useState(() => localStorage.getItem('incense_email'))
  const login = useCallback(async (values) => { const result = await auth.loginUser(values); localStorage.removeItem('incense_admin_token'); localStorage.removeItem('incense_admin_name'); localStorage.setItem('incense_token', result.token); localStorage.setItem('incense_email', values.email); setToken(result.token); setEmail(values.email); return result }, [])
  const logout = useCallback(() => { localStorage.removeItem('incense_token'); localStorage.removeItem('incense_email'); setToken(null); setEmail(null) }, [])
  const value = useMemo(() => ({ token, email, isAuthenticated: !!token, login, logout }), [token, email])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
