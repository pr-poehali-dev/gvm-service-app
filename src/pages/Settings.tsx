import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const [tgToken, setTgToken] = useState(user?.telegram_bot_token || '');
  const [tgChat, setTgChat] = useState(user?.telegram_chat_id || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  async function saveSettings() {
    setSaving(true);
    try {
      await api.updateSettings({
        telegram_bot_token: tgToken,
        telegram_chat_id: tgChat,
        notify_oil: user?.notify_oil,
        notify_docs: user?.notify_docs,
        notify_filters: user?.notify_filters,
        notify_idle: user?.notify_idle,
        notify_summary: user?.notify_summary,
      });
      await refreshUser();
      toast.success('Настройки сохранены');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSaving(false);
    }
  }

  async function testNotify() {
    setTesting(true);
    try {
      await api.testNotify(tgToken || undefined, tgChat || undefined);
      toast.success('Тестовое сообщение отправлено!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка отправки');
    } finally {
      setTesting(false);
    }
  }

  async function changePassword() {
    if (!oldPass || !newPass) { toast.error('Заполните оба поля'); return; }
    try {
      await api.changePassword(oldPass, newPass);
      setOldPass('');
      setNewPass('');
      toast.success('Пароль изменён');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  async function sendSummary() {
    try {
      await api.sendSummary();
      toast.success('Сводка отправлена в Telegram');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  return (
    <div className="p-4 animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Настройки</h2>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{user?.username}</div>
      </div>

      {/* Telegram */}
      <div className="gvm-card-elevated p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Send" size={16} style={{ color: 'var(--green-glow)' }} />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Telegram уведомления
          </h3>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Создайте бота через @BotFather, получите токен. Chat ID узнайте через @userinfobot
        </p>
        <div>
          <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Bot Token
          </label>
          <input
            value={tgToken}
            onChange={e => setTgToken(e.target.value)}
            placeholder="1234567890:ABCdef..."
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono"
            style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Chat ID
          </label>
          <input
            value={tgChat}
            onChange={e => setTgChat(e.target.value)}
            placeholder="-1001234567890"
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono"
            style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-3">
          <button onClick={saveSettings} disabled={saving}
            className="flex-1 py-2.5 gvm-btn-primary font-display tracking-wider text-sm disabled:opacity-50">
            {saving ? <Icon name="Loader2" size={14} className="animate-spin mx-auto" /> : 'Сохранить'}
          </button>
          <button onClick={testNotify} disabled={testing}
            className="px-4 py-2.5 rounded-xl text-sm font-display transition-all"
            style={{ background: 'rgba(107,156,42,0.12)', color: 'var(--green-glow)', border: '1px solid rgba(107,156,42,0.25)' }}>
            {testing ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Тест'}
          </button>
        </div>
        <button onClick={sendSummary}
          className="w-full py-2.5 rounded-xl text-sm font-display"
          style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid rgba(107,156,42,0.15)' }}>
          Отправить сводку
        </button>
      </div>

      {/* Notifications */}
      <div className="gvm-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Bell" size={16} style={{ color: 'var(--green-glow)' }} />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Уведомления
          </h3>
        </div>
        {[
          { key: 'notify_oil', label: 'Замена масла двигателя', desc: 'За 500 км или 14 дней' },
          { key: 'notify_docs', label: 'Истекают документы', desc: 'За 30 дней до окончания' },
          { key: 'notify_filters', label: 'Фильтры и расходники', desc: 'По интервалам' },
          { key: 'notify_idle', label: 'Долгий простой', desc: 'При простое более 5 дней' },
          { key: 'notify_summary', label: 'Ежемесячная сводка', desc: 'Итоги за прошлый месяц' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
            <div className="relative">
              <div
                className="w-10 h-6 rounded-full cursor-pointer transition-all duration-200 flex items-center"
                style={{
                  background: user?.[item.key as keyof typeof user] ? 'var(--green-glow)' : 'rgba(107,156,42,0.15)',
                  padding: '2px',
                }}>
                <div className="w-5 h-5 rounded-full transition-all duration-200"
                  style={{
                    background: 'white',
                    transform: user?.[item.key as keyof typeof user] ? 'translateX(16px)' : 'translateX(0)',
                  }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Change password */}
      <div className="gvm-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Lock" size={16} style={{ color: 'var(--green-glow)' }} />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Смена пароля
          </h3>
        </div>
        <div>
          <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Текущий пароль
          </label>
          <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Новый пароль
          </label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
        </div>
        <button onClick={changePassword}
          className="w-full py-2.5 rounded-xl text-sm font-display"
          style={{ background: 'rgba(107,156,42,0.12)', color: 'var(--green-glow)', border: '1px solid rgba(107,156,42,0.25)' }}>
          Сменить пароль
        </button>
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full py-3 rounded-xl text-sm font-display font-medium tracking-wider transition-all"
        style={{ background: 'rgba(217,64,64,0.1)', color: 'var(--warn-red)', border: '1px solid rgba(217,64,64,0.25)' }}>
        <span className="flex items-center justify-center gap-2">
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </span>
      </button>

      <p className="text-center text-xs pb-4" style={{ color: 'var(--text-muted)' }}>
        GVM Performance v1.0 · poehali.dev
      </p>
    </div>
  );
}
