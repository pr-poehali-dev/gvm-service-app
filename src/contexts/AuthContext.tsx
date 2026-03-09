import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  user_id: number;
  username: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  notify_oil: boolean;
  notify_docs: boolean;
  notify_filters: boolean;
  notify_idle: boolean;
  notify_summary: boolean;
  oil_warn_km: number;
  oil_warn_days: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = localStorage.getItem('gvm_token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await api.me();
      setUser(data);
    } catch {
      localStorage.removeItem('gvm_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshUser(); }, []);

  async function login(username: string, password: string) {
    const data = await api.login(username, password);
    localStorage.setItem('gvm_token', data.token);
    setUser({ ...data, notify_oil: true, notify_docs: true, notify_filters: true, notify_idle: true, notify_summary: true, oil_warn_km: 500, oil_warn_days: 14 });
    await refreshUser();
  }

  async function register(username: string, password: string) {
    const data = await api.register(username, password);
    localStorage.setItem('gvm_token', data.token);
    await refreshUser();
  }

  async function logout() {
    try { await api.logout(); } catch (_e) { /* ignore */ }
    localStorage.removeItem('gvm_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}