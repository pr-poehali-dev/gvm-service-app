import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Owner {
  id: number; full_name?: string; city?: string;
  mileage_start?: number; mileage_end?: number;
  owned_from?: string; owned_to?: string; comment?: string;
}

export default function Owners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getOwners().then(setOwners).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function f(key: string, val: string) {
    setForm(p => ({ ...p, [key]: val }));
  }

  async function addOwner() {
    try {
      const data: Record<string, unknown> = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v) {
          if (['mileage_start', 'mileage_end'].includes(k)) data[k] = parseInt(v);
          else data[k] = v;
        }
      });
      const updated = await api.addOwner(data);
      setOwners(updated);
      setShowForm(false);
      setForm({});
      toast.success('Период добавлен');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  function ownerKm(o: Owner) {
    if (o.mileage_start && o.mileage_end) return o.mileage_end - o.mileage_start;
    return null;
  }

  function ownerDays(o: Owner) {
    if (!o.owned_from) return null;
    const end = o.owned_to ? new Date(o.owned_to) : new Date();
    return Math.ceil((end.getTime() - new Date(o.owned_from).getTime()) / 86400000);
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Владельцы</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>История владения автомобилем</p>
        </div>
        <button onClick={() => setShowForm(true)} className="p-2.5 rounded-xl gvm-btn-primary">
          <Icon name="Plus" size={18} />
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Icon name="Loader2" size={28} className="animate-spin" style={{ color: 'var(--green-glow)' }} />
        </div>
      ) : owners.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Users" size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
          <p style={{ color: 'var(--text-muted)' }}>Добавьте периоды владения</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5" style={{ background: 'rgba(107,156,42,0.2)' }} />
          {owners.map((owner, i) => {
            const km = ownerKm(owner);
            const days = ownerDays(owner);
            const isCurrent = !owner.owned_to;
            return (
              <div key={owner.id} className="relative pl-12 pb-4 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                {/* Dot */}
                <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 pulse-green"
                  style={{
                    background: isCurrent ? 'var(--green-glow)' : 'var(--khaki-light)',
                    borderColor: isCurrent ? 'var(--green-glow)' : 'var(--khaki-mid)',
                  }} />
                <div className="gvm-card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {owner.full_name || 'Неизвестный владелец'}
                        </h4>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-display"
                            style={{ background: 'rgba(107,156,42,0.15)', color: 'var(--green-glow)' }}>
                            Текущий
                          </span>
                        )}
                      </div>
                      {owner.city && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Icon name="MapPin" size={10} style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{owner.city}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                      {owner.owned_from && (
                        <div>{new Date(owner.owned_from).toLocaleDateString('ru', { month: 'short', year: 'numeric' })}</div>
                      )}
                      {owner.owned_to && (
                        <div>— {new Date(owner.owned_to).toLocaleDateString('ru', { month: 'short', year: 'numeric' })}</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {km !== null && (
                      <div className="text-center p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                        <div className="font-display font-bold text-sm" style={{ color: 'var(--green-glow)' }}>
                          {km.toLocaleString('ru')}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>км пробег</div>
                      </div>
                    )}
                    {days !== null && (
                      <div className="text-center p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                        <div className="font-display font-bold text-sm" style={{ color: 'var(--sand)' }}>
                          {days}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>дней</div>
                      </div>
                    )}
                    {km !== null && days !== null && days > 0 && (
                      <div className="text-center p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                        <div className="font-display font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {Math.round(km / days)}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>км/день</div>
                      </div>
                    )}
                  </div>

                  {owner.mileage_start && (
                    <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>Начало: {owner.mileage_start.toLocaleString('ru')} км</span>
                      {owner.mileage_end && <span>Конец: {owner.mileage_end.toLocaleString('ru')} км</span>}
                    </div>
                  )}

                  {owner.comment && (
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{owner.comment}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg gvm-card-elevated p-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Новый период</h3>
              <button onClick={() => setShowForm(false)}>
                <Icon name="X" size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                ['full_name', 'ФИО владельца', 'Иванов Иван Иванович', false],
                ['city', 'Город', 'Москва', false],
                ['owned_from', 'Дата начала', '', true],
                ['owned_to', 'Дата окончания', '', true],
                ['mileage_start', 'Пробег на начало', '0', false],
                ['mileage_end', 'Пробег на конец', '', false],
                ['comment', 'Комментарий', 'Дополнительная информация...', false],
              ].map(([key, label, placeholder, isDate]) => (
                <div key={key}>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input
                    type={isDate ? 'date' : ['mileage_start', 'mileage_end'].includes(key) ? 'number' : 'text'}
                    value={form[key] || ''}
                    onChange={e => f(key, e.target.value)}
                    placeholder={placeholder as string}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
            </div>
            <button onClick={addOwner} className="w-full mt-4 py-3 gvm-btn-primary font-display tracking-wider">
              Добавить период
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
