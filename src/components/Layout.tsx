import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const NAV_ITEMS = [
  { path: '/', icon: 'Home', label: 'Главная' },
  { path: '/trips', icon: 'Route', label: 'Поездки' },
  { path: '/finances', icon: 'Wallet', label: 'Финансы' },
  { path: '/parts', icon: 'Wrench', label: 'Запчасти' },
  { path: '/intervals', icon: 'RefreshCw', label: 'Интервалы' },
  { path: '/stats', icon: 'BarChart2', label: 'Статистика' },
  { path: '/owners', icon: 'Users', label: 'Владельцы' },
  { path: '/settings', icon: 'Settings', label: 'Настройки' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--surface)', borderBottom: '1px solid rgba(107,156,42,0.1)' }}>
        <span className="font-display text-lg font-semibold tracking-wider" style={{ color: 'var(--green-glow)' }}>
          GVM
        </span>
        <span className="font-display text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Performance
        </span>
        <button onClick={() => navigate('/settings')}>
          <Icon name="Settings" size={20} style={{ color: 'var(--text-muted)' }} />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-safe">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(20,28,13,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(107,156,42,0.12)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
        <div className="grid grid-cols-8 gap-0">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-2 transition-all duration-200 active:scale-90"
                style={{ color: active ? 'var(--green-glow)' : 'var(--text-muted)' }}
              >
                <Icon name={item.icon} size={18} />
                <span className="text-[9px] font-display tracking-wide leading-tight text-center"
                  style={{ fontSize: '8px' }}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 rounded-full" style={{ background: 'var(--green-glow)' }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
