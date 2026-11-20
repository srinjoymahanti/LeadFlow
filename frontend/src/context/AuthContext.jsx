import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const token = localStorage.getItem('leadflow_token'); if (!token) { setLoading(false); return; } api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('leadflow_token')).finally(() => setLoading(false)); }, []);
  const authenticate = async (path, payload) => { const { data } = await api.post(`/auth/${path}`, payload); localStorage.setItem('leadflow_token', data.token); setUser(data.user); return data.user; };
  const logout = () => { localStorage.removeItem('leadflow_token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login: p => authenticate('login', p), signup: p => authenticate('signup', p), logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
