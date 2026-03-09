import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Icon from '@/components/ui/icon';

interface Stats {
  total_distance: number; total_spent: number; total_trips: number;
  month_distance: number; month_spent: number; avg_aggression: number;
  by_category: { category: string; total: number }[];
  by_month: { month: string; total: number }[];
}

const COLORS = ['#6b9c2a', '#8bc34a', '#a5c96e', '#c8b87a', '#e8a020', '#d94040', '#4a9c8a', '#7a6b9c', '#5a6e42'];

function AggressionMeter({ value }: { value: number }) {
  const color = value > 70 ? 'var(--warn-red)' : value > 40 ? 'var(--warn-amber)' : 'var(--success)';
  const label = value > 70 ? 'Агрессивный' : value > 40 ? 'Умеренный' : 'Спокойный';
  return (
    <div className="gvm-card p-4">
      <h3 className="font-display text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
        Индекс агрессивности
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" strokeWidth="8" stroke="rgba(107,156,42,0.12)" />
            <circle cx="40" cy="40" r="32" fill="none" strokeWidth="8"
              stroke={color}
              strokeDasharray={`${(value / 100) * 201} 201`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-lg font-bold" style={{ color }}>{Math.round(value)}%</span>
          </div>
        </div>
        <div>
          <div className="font-display text-base font-semibold" style={{ color }}>{label}</div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {value > 70 ? 'Высокая нагрузка на двигатель и трансмиссию' :
             value > 40 ? 'Умеренная нагрузка, допустимо' :
             'Бережная езда, минимальный износ'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Icon name="Loader2" size={32} className="animate-spin" style={{ color: 'var(--green-glow)' }} />
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p style={{ color: 'var(--text-muted)' }}>Нет данных</p>
    </div>
  );

  const monthLabels: Record<string, string> = {
    '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр', '05': 'Май', '06': 'Июн',
    '07': 'Июл', '08': 'Авг', '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек'
  };

  const chartData = [...stats.by_month].reverse().map(m => ({
    month: monthLabels[m.month.split('-')[1]] || m.month,
    total: m.total,
  }));

  return (
    <div className="p-4 animate-fade-in space-y-4">
      <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Статистика</h2>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Всего км', value: stats.total_distance.toLocaleString('ru'), color: 'var(--green-glow)', icon: 'Route' },
          { label: 'Поездок', value: stats.total_trips.toLocaleString('ru'), color: 'var(--sand)', icon: 'MapPin' },
          { label: 'Расходы всего', value: `${stats.total_spent.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽`, color: 'var(--sand)', icon: 'Wallet' },
          { label: 'За этот месяц', value: `${stats.month_distance.toLocaleString('ru')} км`, color: 'var(--green-glow)', icon: 'TrendingUp' },
        ].map((kpi, i) => (
          <div key={i} className={`gvm-card p-4 animate-scale-in stagger-${i + 1}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon name={kpi.icon} size={14} style={{ color: kpi.color }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{kpi.label}</span>
            </div>
            <div className="font-display text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Aggression meter */}
      <AggressionMeter value={stats.avg_aggression} />

      {/* Monthly chart */}
      {chartData.length > 0 && (
        <div className="gvm-card p-4">
          <h3 className="font-display text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Расходы по месяцам
          </h3>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}к`} />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽`]}
                  contentStyle={{ background: 'var(--surface-card)', border: '1px solid rgba(107,156,42,0.2)', borderRadius: 8, color: 'var(--text-primary)' }}
                />
                <Bar dataKey="total" fill="var(--green-vivid)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* By category */}
      {stats.by_category.length > 0 && (
        <div className="gvm-card p-4">
          <h3 className="font-display text-sm uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            По категориям
          </h3>
          <div className="space-y-2">
            {stats.by_category.map((cat, i) => {
              const maxVal = stats.by_category[0]?.total || 1;
              const pct = (cat.total / maxVal) * 100;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{cat.total.toLocaleString('ru', { maximumFractionDigits: 0 })} ₽</span>
                  </div>
                  <div className="gvm-progress">
                    <div className="gvm-progress-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}