import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Icon from '@/components/ui/icon';

interface Finance {
  id: number; category: string; subcategory?: string;
  expense_date: string; amount: number; description?: string; location?: string;
}

const CATEGORIES = ['Топливо', 'Запчасти', 'Сервис', 'Шины', 'Страховка', 'Налоги', 'Штрафы', 'Мойка', 'Другое'];
const COLORS = ['#6b9c2a', '#8bc34a', '#a5c96e', '#c8b87a', '#e8a020', '#d94040', '#4a9c8a', '#7a6b9c', '#5a6e42'];

export default function Finances() {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Топливо',
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.getFinances().then(setFinances).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function f(key: string, val: string) {
    setForm(p => ({ ...p, [key]: val }));
  }

  async function addFinance() {
    try {
      const data: Record<string, unknown> = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v) {
          if (k === 'amount') data[k] = parseFloat(v);
          else if (k === 'mileage') data[k] = parseInt(v);
          else data[k] = v;
        }
      });
      const item = await api.addFinance(data);
      setFinances(p => [item, ...p]);
      setShowForm(false);
      setForm({ expense_date: new Date().toISOString().split('T')[0], category: 'Топливо' });
      toast.success('Расход добавлен');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  const total = finances.reduce((s, f) => s + Number(f.amount), 0);

  const byCat = CATEGORIES.map((cat, i) => {
    const sum = finances.filter(f => f.category === cat).reduce((s, f) => s + Number(f.amount), 0);
    return { name: cat, value: sum, color: COLORS[i] };
  }).filter(c => c.value > 0);

  const filtered = filter === 'all' ? finances : finances.filter(f => f.category === filter);

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Финансы</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Итого: {total.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="p-2.5 rounded-xl gvm-btn-primary">
          <Icon name="Plus" size={18} />
        </button>
      </div>

      {/* Pie chart */}
      {byCat.length > 0 && (
        <div className="gvm-card p-4 mb-4">
          <h3 className="font-display text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            По категориям
          </h3>
          <div className="flex items-center gap-4">
            <div style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCat} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={2}>
                    {byCat.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽`]} contentStyle={{ background: 'var(--surface-card)', border: '1px solid rgba(107,156,42,0.2)', borderRadius: 8, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {byCat.slice(0, 5).map(c => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-primary)' }}>{c.value.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {['all', ...CATEGORIES].map(cat => (
          <button key={cat}
            onClick={() => setFilter(cat)}
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
          <Icon name="Wallet" size={40} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-3" />
          <p style={{ color: 'var(--text-muted)' }}>Расходов пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <div key={item.id} className="gvm-card p-3 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${COLORS[CATEGORIES.indexOf(item.category)] || COLORS[0]}22` }}>
                <Icon name="Receipt" size={14} style={{ color: COLORS[CATEGORIES.indexOf(item.category)] || COLORS[0] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.category}</span>
                  {item.subcategory && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.subcategory}</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                )}
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(item.expense_date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                  {item.location && ` · ${item.location}`}
                </p>
              </div>
              <div className="text-right">
                <div className="font-display font-bold" style={{ color: 'var(--sand)' }}>
                  {Number(item.amount).toLocaleString('ru', { maximumFractionDigits: 0 })} ₽
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg gvm-card-elevated p-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>Новый расход</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Дата</label>
                  <input type="date" value={form.expense_date} onChange={e => f('expense_date', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Сумма (₽)</label>
                  <input type="number" value={form.amount || ''} onChange={e => f('amount', e.target.value)} placeholder="5000"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Описание</label>
                <input value={form.description || ''} onChange={e => f('description', e.target.value)} placeholder="Что именно?"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Место</label>
                  <input value={form.location || ''} onChange={e => f('location', e.target.value)} placeholder="АЗС, СТО..."
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-display uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Пробег (км)</label>
                  <input type="number" value={form.mileage || ''} onChange={e => f('mileage', e.target.value)} placeholder="150000"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid rgba(107,156,42,0.2)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            </div>
            <button onClick={addFinance} className="w-full mt-4 py-3 gvm-btn-primary font-display tracking-wider">
              Добавить расход
            </button>
          </div>
        </div>
      )}
    </div>
  );
}