import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Interval {
  id: number; name: string; interval_km?: number; interval_days?: number;
  last_done_km?: number; last_done_date?: string; notes?: string;
}

interface Car {
  mileage?: number;
}

function statusColor(pct: number) {
  if (pct >= 90) return 'var(--warn-red)';
  if (pct >= 65) return 'var(--warn-amber)';
  return 'var(--success)';
}

function statusLabel(pct: number) {
  if (pct >= 90) return 'Срочно';
  if (pct >= 65) return 'Скоро';
  return 'ОК';
}

export default function Intervals() {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Record<string, string>>({ name: '' });

  useEffect(() => {
    Promise.all([
      api.getIntervals().then(setIntervals).catch(() => {}),
      api.getCar().then(setCar).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  async function markDone(id: number) {
    const today = new Date().toISOString().split('T')[0];
    const updated = await api.updateInterval(id, {
      last_done_date: today,
      last_done_km: car?.mileage || 0,
    });
    setIntervals(updated);
    toast.success('Замена записана!');
  }

  async function saveEdit(id: number) {
    const data: Record<string, unknown> = {};
    Object.entries(editForm).forEach(([k, v]) => {
      if (v !== '') {
        if (['interval_km', 'last_done_km', 'interval_days'].includes(k)) data[k] = parseInt(v);
        else data[k] = v;
      }
    });
    const updated = await api.updateInterval(id, data);
    setIntervals(updated);
    setEditId(null);
    toast.success('Сохранено');
  }

  async function addInterval() {
    if (!addForm.name) { toast.error('Укажите название'); return; }
    const data: Record<string, unknown> = {};
    Object.entries(addForm).forEach(([k, v]) => {
      if (v) {
        if (['interval_km', 'interval_days'].includes(k)) data[k] = parseInt(v);
        else data[k] = v;
      }
    });
    const updated = await api.addInterval(data);
    setIntervals(updated);
    setShowAdd(false);
    setAddForm({ name: '' });
    toast.success('Интервал добавлен');
  }

  const km = car?.mileage || 0;

  function calcPct(item: Interval) {
    let pctKm = 0, pctDays = 0;
    if (item.interval_km && item.last_done_km) {
      pctKm = Math.round(((km - item.last_done_km) / item.interval_km) * 100);
    }
    if (item.interval_days && item.last_done_date) {
      const daysPassed = Math.ceil((Date.now() - new Date(item.last_done_date).getTime()) / 86400000);
      pctDays = Math.round((daysPassed / item.interval_days) * 100);
    }
    return Math.max(pctKm, pctDays);
  }

  const sorted = [...intervals].sort((a, b) => calcPct(b) - calcPct(a));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Icon name="Loader2" size={32} className="animate-spin" style={{ color: 'var(--green-glow)' }} />
    </div>
  );

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Интервалы</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {car?.mileage ? `Текущий пробег: ${car.mileage.toLocaleString('ru')} км` : 'Добавьте пробег в Главная'}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="p-2.5 rounded-xl gvm-btn-primary">
          <Icon name="Plus" size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((item, i) => {
          const pct = Math.min(100, Math.max(0, calcPct(item)));
          const color = statusColor(pct);
          const usedKm = item.last_done_km ? km - item.last_done_km : 0;
          const remainKm = item.interval_km ? item.interval_km - usedKm : null;
          let daysPassed = 0, remainDays = null;
          if (item.last_done_date) {
            daysPassed = Math.ceil((Date.now() - new Date(item.last_done_date).getTime()) / 86400000);
            if (item.interval_days) remainDays = item.interval_days - daysPassed;
          }
          const isEditing = editId === item.id;

          return (
            <div key={item.id} className="gvm-card p-4 animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
              {isEditing ? (
                <div className="space-y-2">
                  <input value={editForm.name || item.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.3)', color: 'var(--text-primary)' }} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Интервал км</label>
                      <input type="number" value={editForm.interval_km ?? String(item.interval_km || '')} onChange={e => setEditForm(f => ({ ...f, interval_km: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Интервал дней</label>
                      <input type="number" value={editForm.interval_days ?? String(item.interval_days || '')} onChange={e => setEditForm(f => ({ ...f, interval_days: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Последняя замена</label>
                      <input type="date" value={editForm.last_done_date ?? (item.last_done_date || '')} onChange={e => setEditForm(f => ({ ...f, last_done_date: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Пробег замены</label>
                      <input type="number" value={editForm.last_done_km ?? String(item.last_done_km || '')} onChange={e => setEditForm(f => ({ ...f, last_done_km: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(item.id)} className="flex-1 py-2 text-xs gvm-btn-primary font-display">Сохранить</button>
                    <button onClick={() => setEditId(null)} className="px-4 py-2 text-xs font-display rounded-lg"
                      style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid rgba(107,156,42,0.15)' }}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full font-display font-medium"
                          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                          {statusLabel(pct)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.last_done_date && (
                          <span>Замена: {new Date(item.last_done_date).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                        {item.last_done_km && <span>{item.last_done_km.toLocaleString('ru')} км</span>}
                      </div>
                    </div>
                    <button onClick={() => { setEditId(item.id); setEditForm({}); }} className="ml-2 p-1.5 rounded-lg"
                      style={{ color: 'var(--text-muted)' }}>
                      <Icon name="Edit2" size={14} />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="gvm-progress mb-1.5">
                    <div className="gvm-progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      {remainKm !== null && (
                        <span style={{ color: remainKm > 0 ? 'var(--text-secondary)' : 'var(--warn-red)' }}>
                          {remainKm > 0 ? `ещё ${remainKm.toLocaleString('ru')} км` : 'Пора менять'}
                        </span>
                      )}
                      {remainDays !== null && (
                        <span style={{ color: remainDays > 0 ? 'var(--text-muted)' : 'var(--warn-red)' }}>
                          {remainDays > 0 ? `${remainDays} дн.` : 'просрочено'}
                        </span>
                      )}
                    </div>
                    <button onClick={() => markDone(item.id)}
                      className="text-xs px-3 py-1 rounded-lg font-display font-medium"
                      style={{ background: 'rgba(107,156,42,0.12)', color: 'var(--green-glow)', border: '1px solid rgba(107,156,42,0.25)' }}>
                      Заменил
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg gvm-card-elevated p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Новый интервал</h3>
              <button onClick={() => setShowAdd(false)}><Icon name="X" size={20} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="space-y-3">
              {[
                ['name', 'Название', 'Замена ремня ГРМ', false],
                ['interval_km', 'Интервал (км)', '90000', false],
                ['interval_days', 'Интервал (дней)', '1095', false],
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input value={addForm[key] || ''} onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder as string}
                    type={key !== 'name' ? 'number' : 'text'}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
              ))}
            </div>
            <button onClick={addInterval} className="w-full mt-4 py-3 gvm-btn-primary font-display tracking-wider">Добавить</button>
          </div>
        </div>
      )}
    </div>
  );
}
