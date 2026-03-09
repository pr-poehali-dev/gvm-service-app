import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Trip {
  id: number; trip_date: string; origin?: string; destination?: string;
  distance?: number; purpose?: string; notes?: string;
  started_at?: string; ended_at?: string;
  battery_start?: number; battery_end?: number;
  fuel_consumption?: number; aggression_index?: number;
}

const PURPOSES = ['Работа', 'Личное', 'Поездка', 'Сервис', 'Покупки', 'Другое'];

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    trip_date: new Date().toISOString().split('T')[0],
    purpose: 'Личное',
  });

  useEffect(() => {
    api.getTrips().then(setTrips).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function f(key: string, val: string) {
    setForm(p => ({ ...p, [key]: val }));
  }

  async function addTrip() {
    try {
      const data: Record<string, unknown> = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v) {
          if (['distance', 'aggression_index'].includes(k)) data[k] = parseInt(v);
          else if (['battery_start', 'battery_end', 'fuel_consumption'].includes(k)) data[k] = parseFloat(v);
          else data[k] = v;
        }
      });
      const newTrip = await api.addTrip(data);
      setTrips(p => [newTrip, ...p]);
      setShowForm(false);
      setForm({ trip_date: new Date().toISOString().split('T')[0], purpose: 'Личное' });
      toast.success('Поездка добавлена');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  const totalKm = trips.reduce((s, t) => s + (t.distance || 0), 0);
  const monthTrips = trips.filter(t => {
    const m = new Date().toISOString().slice(0, 7);
    return t.trip_date?.startsWith(m);
  });
  const monthKm = monthTrips.reduce((s, t) => s + (t.distance || 0), 0);

  return (
    <div className="p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Поездки</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {trips.length} записей · {totalKm.toLocaleString('ru')} км всего
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="p-2.5 rounded-xl gvm-btn-primary">
          <Icon name="Plus" size={18} />
        </button>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="gvm-card p-3 text-center">
          <div className="font-display text-xl font-bold" style={{ color: 'var(--green-glow)' }}>
            {monthKm.toLocaleString('ru')}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>км за месяц</div>
        </div>
        <div className="gvm-card p-3 text-center">
          <div className="font-display text-xl font-bold" style={{ color: 'var(--sand)' }}>
            {monthTrips.length}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>поездок за месяц</div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Icon name="Loader2" size={28} className="animate-spin" style={{ color: 'var(--green-glow)' }} />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Route" size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
          <p style={{ color: 'var(--text-muted)' }}>Поездок пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((t, i) => (
            <div key={t.id} className={`gvm-card p-4 animate-slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-display px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(107,156,42,0.12)', color: 'var(--green-glow)' }}>
                      {t.purpose || 'Поездка'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(t.trip_date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {(t.origin || t.destination) && (
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {t.origin || '—'} → {t.destination || '—'}
                    </p>
                  )}
                  {t.notes && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t.notes}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.started_at && <span>{t.started_at.slice(0, 5)} — {t.ended_at?.slice(0, 5) || '?'}</span>}
                    {t.fuel_consumption && <span>{t.fuel_consumption} л/100</span>}
                    {t.battery_start && <span><Icon name="Zap" size={10} className="inline" /> {t.battery_start}В</span>}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="font-display text-lg font-bold" style={{ color: 'var(--green-glow)' }}>
                    {t.distance?.toLocaleString('ru') || '—'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>км</div>
                  {t.aggression_index !== undefined && t.aggression_index > 0 && (
                    <div className="text-xs mt-1"
                      style={{ color: t.aggression_index > 70 ? 'var(--warn-red)' : t.aggression_index > 40 ? 'var(--warn-amber)' : 'var(--success)' }}>
                      {t.aggression_index}% агр.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg gvm-card-elevated p-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Новая поездка</h3>
              <button onClick={() => setShowForm(false)}>
                <Icon name="X" size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Дата</label>
                <input type="date" value={form.trip_date} onChange={e => f('trip_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Откуда</label>
                  <input value={form.origin || ''} onChange={e => f('origin', e.target.value)} placeholder="Москва"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Куда</label>
                  <input value={form.destination || ''} onChange={e => f('destination', e.target.value)} placeholder="Питер"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Пробег (км)</label>
                  <input type="number" value={form.distance || ''} onChange={e => f('distance', e.target.value)} placeholder="250"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Расход (л/100км)</label>
                  <input type="number" step="0.1" value={form.fuel_consumption || ''} onChange={e => f('fuel_consumption', e.target.value)} placeholder="9.5"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Время начала</label>
                  <input type="time" value={form.started_at || ''} onChange={e => f('started_at', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Время конца</label>
                  <input type="time" value={form.ended_at || ''} onChange={e => f('ended_at', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>АКБ старт (В)</label>
                  <input type="number" step="0.01" value={form.battery_start || ''} onChange={e => f('battery_start', e.target.value)} placeholder="12.6"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Агрессивность (%)</label>
                  <input type="number" min="0" max="100" value={form.aggression_index || ''} onChange={e => f('aggression_index', e.target.value)} placeholder="30"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Цель поездки</label>
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map(p => (
                    <button key={p} onClick={() => f('purpose', p)}
                      className="px-3 py-1 rounded-lg text-xs font-display transition-all"
                      style={{
                        background: form.purpose === p ? 'rgba(107,156,42,0.25)' : 'var(--surface)',
                        border: `1px solid ${form.purpose === p ? 'rgba(107,156,42,0.5)' : 'rgba(107,156,42,0.15)'}`,
                        color: form.purpose === p ? 'var(--green-glow)' : 'var(--text-muted)',
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Заметки</label>
                <textarea value={form.notes || ''} onChange={e => f('notes', e.target.value)} rows={2} placeholder="Дополнительная информация..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <button onClick={addTrip} className="w-full mt-4 py-3 gvm-btn-primary font-display tracking-wider">
              Добавить поездку
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
