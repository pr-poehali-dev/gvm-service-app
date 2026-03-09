import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Car {
  make?: string; model?: string; year?: number; plate?: string;
  mileage?: number; last_oil_change_km?: number; last_oil_change_date?: string;
  tire_season?: string; tire_size?: string;
  battery_voltage_start?: number; battery_voltage_stop?: number;
  engine_volume?: number; power?: number; fuel_type?: string; transmission?: string;
}

interface Interval {
  id: number; name: string; interval_km?: number; last_done_km?: number;
  interval_days?: number; last_done_date?: string;
}

interface Stats {
  month_distance: number; month_spent: number; total_trips: number;
  avg_aggression: number;
}

interface Document {
  doc_type: string; expires_date?: string;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="gvm-progress mt-1.5">
      <div className="gvm-progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function statusColor(pct: number) {
  if (pct >= 80) return 'var(--warn-red)';
  if (pct >= 60) return 'var(--warn-amber)';
  return 'var(--success)';
}

export default function Home() {
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [editCar, setEditCar] = useState(false);
  const [carForm, setCarForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCar().then(setCar).catch(() => {}),
      api.getIntervals().then(setIntervals).catch(() => {}),
      api.getStats().then(setStats).catch(() => {}),
      api.getDocuments().then(setDocs).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  async function saveCar() {
    try {
      const saved = await api.saveCar(carForm as Record<string, unknown>);
      setCar(saved);
      setEditCar(false);
      toast.success('Автомобиль сохранён');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  async function doneInterval(id: number) {
    const today = new Date().toISOString().split('T')[0];
    const updated = await api.updateInterval(id, { last_done_date: today, last_done_km: car?.mileage || 0 });
    setIntervals(updated);
    toast.success('Замена записана!');
  }

  const keyIntervals = intervals.filter(i =>
    ['Масло двигателя', 'Масляный фильтр', 'Воздушный фильтр', 'Салонный фильтр'].includes(i.name)
  ).slice(0, 4);

  const expiringDocs = docs.filter(d => {
    if (!d.expires_date) return false;
    const days = Math.ceil((new Date(d.expires_date).getTime() - Date.now()) / 86400000);
    return days <= 60;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon name="Loader2" size={32} className="animate-spin" style={{ color: 'var(--green-glow)' }} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Привет, {user?.username}
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={() => { setEditCar(true); setCarForm({ make: car?.make || '', model: car?.model || '', year: String(car?.year || ''), plate: car?.plate || '', mileage: String(car?.mileage || ''), engine_volume: String(car?.engine_volume || ''), power: String(car?.power || ''), fuel_type: car?.fuel_type || '', transmission: car?.transmission || '' }); }}
          className="p-2 rounded-xl" style={{ background: 'var(--surface-card)', border: '1px solid rgba(107,156,42,0.15)' }}>
          <Icon name="Edit2" size={16} style={{ color: 'var(--green-glow)' }} />
        </button>
      </div>

      {/* Car Card */}
      <div className="gvm-card-elevated p-4 animate-slide-up stagger-1">
        {car ? (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {car.make} {car.model}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {car.year && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{car.year}</span>}
                  {car.plate && (
                    <span className="text-xs px-2 py-0.5 rounded font-display font-medium tracking-wider"
                      style={{ background: 'var(--surface)', color: 'var(--sand)', border: '1px solid rgba(200,184,122,0.3)' }}>
                      {car.plate}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold" style={{ color: 'var(--green-glow)' }}>
                  {car.mileage?.toLocaleString('ru')}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>км</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {car.engine_volume && (
                <div className="text-center py-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                  <div style={{ color: 'var(--text-primary)' }}>{car.engine_volume}л</div>
                  <div style={{ color: 'var(--text-muted)' }}>Объём</div>
                </div>
              )}
              {car.power && (
                <div className="text-center py-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                  <div style={{ color: 'var(--text-primary)' }}>{car.power} л.с.</div>
                  <div style={{ color: 'var(--text-muted)' }}>Мощность</div>
                </div>
              )}
              {car.fuel_type && (
                <div className="text-center py-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                  <div style={{ color: 'var(--text-primary)' }}>{car.fuel_type}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Топливо</div>
                </div>
              )}
            </div>
            {(car.battery_voltage_start || car.battery_voltage_stop) && (
              <div className="flex gap-3 mt-3 text-xs">
                {car.battery_voltage_start && (
                  <div className="flex items-center gap-1">
                    <Icon name="Zap" size={12} style={{ color: 'var(--green-glow)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Запуск:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{car.battery_voltage_start}В</span>
                  </div>
                )}
                {car.battery_voltage_stop && (
                  <div className="flex items-center gap-1">
                    <Icon name="Zap" size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Стоп:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{car.battery_voltage_stop}В</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <Icon name="Car" size={32} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-2" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Добавьте информацию об автомобиле</p>
            <button onClick={() => { setEditCar(true); setCarForm({}); }}
              className="mt-3 px-4 py-2 text-xs gvm-btn-primary">
              Добавить
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 animate-slide-up stagger-2">
          <div className="gvm-card p-3 text-center">
            <div className="font-display text-lg font-bold" style={{ color: 'var(--green-glow)' }}>
              {stats.month_distance.toLocaleString('ru')}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>км/мес</div>
          </div>
          <div className="gvm-card p-3 text-center">
            <div className="font-display text-lg font-bold" style={{ color: 'var(--sand)' }}>
              {stats.month_spent.toLocaleString('ru', { maximumFractionDigits: 0 })}₽
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>расходы</div>
          </div>
          <div className="gvm-card p-3 text-center">
            <div className="font-display text-lg font-bold" style={{ color: stats.avg_aggression > 70 ? 'var(--warn-red)' : stats.avg_aggression > 40 ? 'var(--warn-amber)' : 'var(--success)' }}>
              {Math.round(stats.avg_aggression)}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>агрессивность</div>
          </div>
        </div>
      )}

      {/* Key intervals */}
      {keyIntervals.length > 0 && (
        <div className="gvm-card p-4 animate-slide-up stagger-3">
          <h3 className="font-display text-sm font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Расходники
          </h3>
          <div className="space-y-4">
            {keyIntervals.map(item => {
              const km = car?.mileage || 0;
              const usedKm = item.last_done_km ? km - item.last_done_km : 0;
              const pct = item.interval_km ? Math.round((usedKm / item.interval_km) * 100) : 0;
              const remain = item.interval_km ? item.interval_km - usedKm : 0;
              const color = statusColor(pct);
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color }}>
                        {remain > 0 ? `ещё ${remain.toLocaleString('ru')} км` : 'ЗАМЕНА!'}
                      </span>
                      <button
                        onClick={() => doneInterval(item.id)}
                        className="text-xs px-2 py-0.5 rounded-lg font-display"
                        style={{ background: 'rgba(107,156,42,0.15)', color: 'var(--green-glow)', border: '1px solid rgba(107,156,42,0.3)' }}
                      >
                        Заменил
                      </button>
                    </div>
                  </div>
                  <ProgressBar value={pct} color={color} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expiring docs */}
      {expiringDocs.length > 0 && (
        <div className="gvm-card p-4 animate-slide-up stagger-4">
          <h3 className="font-display text-sm font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--warn-amber)' }}>
            Истекают документы
          </h3>
          <div className="space-y-2">
            {expiringDocs.map(d => {
              const days = Math.ceil((new Date(d.expires_date!).getTime() - Date.now()) / 86400000);
              return (
                <div key={d.doc_type} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-primary)' }}>{d.doc_type}</span>
                  <span style={{ color: days <= 14 ? 'var(--warn-red)' : 'var(--warn-amber)' }} className="text-xs">
                    {days > 0 ? `через ${days} дн.` : 'просрочен'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit car modal */}
      {editCar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg gvm-card-elevated p-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Данные автомобиля</h3>
              <button onClick={() => setEditCar(false)}>
                <Icon name="X" size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['make', 'Марка', 'Toyota'],
                ['model', 'Модель', 'Land Cruiser'],
                ['year', 'Год', '2020'],
                ['plate', 'Госномер', 'А123БВ77'],
                ['mileage', 'Пробег (км)', '150000'],
                ['engine_volume', 'Объём (л)', '3.5'],
                ['power', 'Мощность (л.с.)', '249'],
                ['fuel_type', 'Топливо', 'Бензин'],
                ['transmission', 'КПП', 'Автомат'],
                ['vin', 'VIN', 'JT...'],
                ['tire_season', 'Сезон шин', 'Лето'],
                ['tire_size', 'Размер шин', '265/65 R17'],
                ['battery_voltage_start', 'АКБ запуск (В)', '12.6'],
                ['battery_voltage_stop', 'АКБ стоп (В)', '13.8'],
              ].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </label>
                  <input
                    value={carForm[key] || ''}
                    onChange={e => setCarForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
            </div>
            <button onClick={saveCar} className="w-full mt-4 py-3 gvm-btn-primary font-display tracking-wider">
              Сохранить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
