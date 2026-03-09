import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Part {
  id: number; category?: string; name: string; article?: string;
  installed_km?: number; installed_date?: string; cost?: number;
  resource_km?: number; notes?: string;
}

const CATEGORIES = ['Двигатель', 'Трансмиссия', 'Подвеска', 'Тормоза', 'Электрика', 'Кузов', 'Расходники', 'Другое'];

export default function Parts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState<Record<string, string>>({
    category: 'Двигатель',
    installed_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    api.getParts().then(setParts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function f(key: string, val: string) {
    setForm(p => ({ ...p, [key]: val }));
  }

  async function addPart() {
    if (!form.name) { toast.error('Укажите название'); return; }
    try {
      const data: Record<string, unknown> = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v) {
          if (['installed_km', 'resource_km'].includes(k)) data[k] = parseInt(v);
          else if (k === 'cost') data[k] = parseFloat(v);
          else data[k] = v;
        }
      });
      const updated = await api.addPart(data);
      setParts(updated);
      setShowForm(false);
      setForm({ category: 'Двигатель', installed_date: new Date().toISOString().split('T')[0] });
      toast.success('Запчасть добавлена');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  const filtered = filter === 'all' ? parts : parts.filter(p => p.category === filter);
  const totalSpent = parts.reduce((s, p) => s + (p.cost || 0), 0);

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Запчасти</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {parts.length} записей · {totalSpent.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="p-2.5 rounded-xl gvm-btn-primary">
          <Icon name="Plus" size={18} />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {['all', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-display transition-all"
            style={{
              background: filter === cat ? 'rgba(107,156,42,0.2)' : 'var(--surface-card)',
              border: `1px solid ${filter === cat ? 'rgba(107,156,42,0.4)' : 'rgba(107,156,42,0.1)'}`,
              color: filter === cat ? 'var(--green-glow)' : 'var(--text-muted)',
            }}>
            {cat === 'all' ? 'Все' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Icon name="Loader2" size={28} className="animate-spin" style={{ color: 'var(--green-glow)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Wrench" size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
          <p style={{ color: 'var(--text-muted)' }}>Запчастей пока нет</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((part, i) => (
            <div key={part.id} className="gvm-card p-4 animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{part.name}</h4>
                    {part.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-display"
                        style={{ background: 'rgba(107,156,42,0.1)', color: 'var(--text-secondary)' }}>
                        {part.category}
                      </span>
                    )}
                  </div>
                  {part.article && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Арт: {part.article}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {part.installed_date && (
                      <span>{new Date(part.installed_date).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                    {part.installed_km && <span>{part.installed_km.toLocaleString('ru')} км</span>}
                    {part.resource_km && (
                      <span style={{ color: 'var(--green-glow)' }}>ресурс {part.resource_km.toLocaleString('ru')} км</span>
                    )}
                  </div>
                  {part.notes && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{part.notes}</p>}
                </div>
                {part.cost && (
                  <div className="font-display font-bold" style={{ color: 'var(--sand)' }}>
                    {Number(part.cost).toLocaleString('ru', { maximumFractionDigits: 0 })} ₽
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg gvm-card-elevated p-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Добавить запчасть</h3>
              <button onClick={() => setShowForm(false)}>
                <Icon name="X" size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1.5 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Категория</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => f('category', cat)}
                      className="px-3 py-1 rounded-lg text-xs font-display transition-all"
                      style={{
                        background: form.category === cat ? 'rgba(107,156,42,0.2)' : 'var(--surface)',
                        border: `1px solid ${form.category === cat ? 'rgba(107,156,42,0.4)' : 'rgba(107,156,42,0.15)'}`,
                        color: form.category === cat ? 'var(--green-glow)' : 'var(--text-muted)',
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {[
                ['name', 'Название', 'Масляный фильтр', false],
                ['article', 'Артикул', 'OC 217', false],
                ['installed_date', 'Дата установки', '', true],
                ['installed_km', 'Пробег установки (км)', '150000', false],
                ['resource_km', 'Ресурс (км)', '10000', false],
                ['cost', 'Стоимость (₽)', '1500', false],
                ['notes', 'Заметки', 'Доп. информация', false],
              ].map(([key, label, placeholder, isDate]) => (
                <div key={key}>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <input
                    type={isDate ? 'date' : key === 'cost' || key === 'installed_km' || key === 'resource_km' ? 'number' : 'text'}
                    value={form[key] || ''}
                    onChange={e => f(key, e.target.value)}
                    placeholder={placeholder as string}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
            </div>
            <button onClick={addPart} className="w-full mt-4 py-3 gvm-btn-primary font-display tracking-wider">
              Добавить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
