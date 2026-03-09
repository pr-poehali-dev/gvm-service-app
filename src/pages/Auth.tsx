import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
        toast.success('Аккаунт создан!');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-green"
            style={{ background: 'linear-gradient(135deg, var(--khaki-mid), var(--khaki-light))' }}>
            <Icon name="Car" size={32} style={{ color: 'var(--green-glow)' }} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            GVM Performance
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Учёт обслуживания автомобиля
          </p>
        </div>

        {/* Card */}
        <div className="gvm-card-elevated p-6">
          <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'var(--surface)' }}>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium font-display tracking-wide transition-all duration-200 ${mode === 'login' ? 'gvm-btn-primary' : ''}`}
              style={mode !== 'login' ? { color: 'var(--text-muted)' } : {}}
            >
              Войти
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-medium font-display tracking-wide transition-all duration-200 ${mode === 'register' ? 'gvm-btn-primary' : ''}`}
              style={mode !== 'register' ? { color: 'var(--text-muted)' } : {}}
            >
              Создать аккаунт
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 font-display tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                Логин
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="имя пользователя"
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-1"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid rgba(107,156,42,0.2)',
                  color: 'var(--text-primary)',
                  focusRingColor: 'var(--green-vivid)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 font-display tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="минимум 6 символов"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid rgba(107,156,42,0.2)',
                    color: 'var(--text-primary)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-display font-medium tracking-wider uppercase gvm-btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  {mode === 'login' ? 'Вход...' : 'Создание...'}
                </span>
              ) : (
                mode === 'login' ? 'Войти' : 'Создать аккаунт'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Тест: <span style={{ color: 'var(--text-secondary)' }}>demo</span> / <span style={{ color: 'var(--text-secondary)' }}>demo123</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
