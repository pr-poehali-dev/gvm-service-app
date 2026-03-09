// Redirects to Home — main app is in App.tsx
import Home from "./Home";
export default Home;

 
import { useState as _useState, useEffect as _useEffect } from "react";
import Icon from "@/components/ui/icon";

type Screen = "home" | "finance" | "trips" | "parts" | "intervals" | "stats" | "owners" | "settings";

const NAV_ITEMS: { id: Screen; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "finance", label: "Финансы", icon: "Wallet" },
  { id: "trips", label: "Поездки", icon: "MapPin" },
  { id: "parts", label: "Запчасти", icon: "Wrench" },
  { id: "intervals", label: "Интервалы", icon: "RefreshCw" },
  { id: "stats", label: "Статистика", icon: "BarChart3" },
  { id: "owners", label: "Владельцы", icon: "Users" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

function ProgressBar({ value, max, color = "green" }: { value: number; max: number; color?: "green" | "amber" | "red" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const fillColor =
    color === "red" ? "#d94040" :
    color === "amber" ? "#e8a020" :
    pct > 80 ? "#d94040" :
    pct > 60 ? "#e8a020" :
    "#6b9c2a";
  return (
    <div className="gvm-progress w-full">
      <div
        className="gvm-progress-fill"
        style={{ width: `${pct}%`, background: fillColor }}
      />
    </div>
  );
}

function StatusBadge({ label, variant }: { label: string; variant: "ok" | "warn" | "danger" }) {
  const colors = {
    ok: "bg-[#1e3a12] text-[#8bc34a] border-[#4a6328]",
    warn: "bg-[#3a2a08] text-[#e8a020] border-[#8a6010]",
    danger: "bg-[#3a1010] text-[#d94040] border-[#8a1818]",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-display font-medium tracking-wide ${colors[variant]}`}>
      {label}
    </span>
  );
}

// ===== HOME SCREEN =====
function HomeScreen() {
  const [mileage, setMileage] = useState(87340);
  const [editMileage, setEditMileage] = useState(false);
  const [mileageInput, setMileageInput] = useState("87340");

  const intervals = [
    { name: "Масло двигателя", current: 87340, last: 82000, interval: 10000, unit: "км" },
    { name: "Масляный фильтр", current: 87340, last: 82000, interval: 10000, unit: "км" },
    { name: "Воздушный фильтр", current: 87340, last: 73000, interval: 20000, unit: "км" },
    { name: "Тормозная жидкость", current: 87340, last: 75000, interval: 40000, unit: "км" },
  ];

  const docs = [
    { name: "ОСАГО", days: 24, variant: "danger" as const },
    { name: "Тех. осмотр", days: 67, variant: "warn" as const },
    { name: "Водит. права", days: 312, variant: "ok" as const },
  ];

  const expenses = [
    { label: "Топливо", amount: 8420, pct: 52 },
    { label: "ТО", amount: 3200, pct: 20 },
    { label: "Запчасти", amount: 2800, pct: 17 },
    { label: "Прочее", amount: 1800, pct: 11 },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header banner */}
      <div className="gvm-card-elevated p-5 relative overflow-hidden animate-fade-in stagger-1">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #8bc34a, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              Мой автомобиль
            </p>
            <h2 className="font-display text-2xl font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
              Toyota Land Cruiser
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>200 · 2018 · V8 4.5T · АКПП</p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #2d3d1a, #4a6328)" }}>
            <Icon name="Car" size={22} style={{ color: "var(--green-glow)" }} />
          </div>
        </div>

        {/* Mileage */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest font-display mb-1" style={{ color: "var(--text-secondary)" }}>
              Пробег
            </p>
            {editMileage ? (
              <div className="flex items-center gap-2">
                <input
                  className="bg-transparent border-b-2 text-2xl font-display font-bold w-32 outline-none"
                  style={{ borderColor: "var(--green-glow)", color: "var(--text-primary)" }}
                  value={mileageInput}
                  onChange={e => setMileageInput(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => { setMileage(Number(mileageInput)); setEditMileage(false); }}
                  autoFocus
                />
                <span className="font-display text-sm" style={{ color: "var(--text-secondary)" }}>км</span>
              </div>
            ) : (
              <button onClick={() => setEditMileage(true)} className="flex items-center gap-2 group">
                <span className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {mileage.toLocaleString('ru-RU')}
                </span>
                <span className="font-display text-sm" style={{ color: "var(--text-secondary)" }}>км</span>
                <Icon name="Pencil" size={13} className="opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--green-glow)" }} />
              </button>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest font-display" style={{ color: "var(--text-secondary)" }}>
              Гос. номер
            </p>
            <p className="font-display text-lg font-semibold mt-0.5" style={{ color: "var(--sand)" }}>А777МА77</p>
          </div>
        </div>

        {/* Specs row */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4"
          style={{ borderTop: "1px solid rgba(107, 156, 42, 0.12)" }}>
          {[
            { label: "Топливо", value: "ДТ" },
            { label: "Привод", value: "4WD" },
            { label: "Мощность", value: "249 л.с." },
            { label: "АКБ", value: "12.4V" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
              <p className="font-display text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Intervals quick view */}
      <div className="animate-fade-in stagger-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
            Состояние ТО
          </h3>
          <span className="text-xs" style={{ color: "var(--green-glow)" }}>Подробнее →</span>
        </div>
        <div className="space-y-3">
          {intervals.map((item) => {
            const used = item.current - item.last;
            const pct = Math.round((used / item.interval) * 100);
            const remaining = item.interval - used;
            return (
              <div key={item.name} className="gvm-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm" style={{ color: "var(--text-primary)" }}>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs" style={{ color: pct > 80 ? "#d94040" : pct > 60 ? "#e8a020" : "var(--green-glow)" }}>
                      {remaining.toLocaleString('ru-RU')} км
                    </span>
                    <StatusBadge
                      label={pct > 80 ? "Срочно" : pct > 60 ? "Скоро" : "OK"}
                      variant={pct > 80 ? "danger" : pct > 60 ? "warn" : "ok"}
                    />
                  </div>
                </div>
                <ProgressBar value={used} max={item.interval} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {pct}% использовано
                  </span>
                  <button className="text-xs font-display font-medium" style={{ color: "var(--green-glow)" }}>
                    Я заменил ✓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Docs expiry */}
      <div className="animate-fade-in stagger-3">
        <h3 className="font-display text-sm uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
          Документы
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {docs.map(doc => (
            <div key={doc.name} className="gvm-card p-3 text-center">
              <p className="text-xs font-body mb-1" style={{ color: "var(--text-secondary)" }}>{doc.name}</p>
              <p className="font-display text-xl font-bold"
                style={{ color: doc.variant === "danger" ? "#d94040" : doc.variant === "warn" ? "#e8a020" : "#8bc34a" }}>
                {doc.days}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>дней</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses summary */}
      <div className="animate-fade-in stagger-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
            Расходы за март
          </h3>
          <span className="font-display text-sm font-semibold" style={{ color: "var(--sand)" }}>
            ₽16 220
          </span>
        </div>
        <div className="gvm-card p-4 space-y-2">
          {expenses.map(e => (
            <div key={e.label} className="flex items-center gap-3">
              <span className="text-sm w-24" style={{ color: "var(--text-secondary)" }}>{e.label}</span>
              <div className="flex-1 gvm-progress">
                <div className="gvm-progress-fill" style={{ width: `${e.pct}%`, background: "var(--green-vivid)" }} />
              </div>
              <span className="font-display text-sm font-medium w-16 text-right" style={{ color: "var(--text-primary)" }}>
                ₽{e.amount.toLocaleString('ru-RU')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== FINANCE SCREEN =====
function FinanceScreen() {
  const categories = [
    { name: "Топливо", amount: 28400, color: "#6b9c2a", pct: 48 },
    { name: "ТО и ремонт", amount: 14200, color: "#8bc34a", pct: 24 },
    { name: "Запчасти", amount: 9800, color: "#c8b87a", pct: 16 },
    { name: "Страховки", amount: 4500, color: "#4a6328", pct: 7.5 },
    { name: "Прочее", amount: 2600, color: "#2d3d1a", pct: 4.5 },
  ];

  const transactions = [
    { date: "07 мар", category: "Топливо", amount: -2400, place: "ЛукОйл Каширское" },
    { date: "05 мар", category: "ТО", amount: -8500, place: "Официальный дилер" },
    { date: "03 мар", category: "Мойка", amount: -900, place: "Авто-спа Митино" },
    { date: "01 мар", category: "Топливо", amount: -3100, place: "Газпром нефть" },
    { date: "28 фев", category: "Запчасти", amount: -4200, place: "Exist.ru" },
    { date: "25 фев", category: "Страховка", amount: -1200, place: "Альфастрахование" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="gvm-card-elevated p-5 animate-fade-in stagger-1">
        <p className="font-display text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
          Расходы за 2025 год
        </p>
        <p className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>₽59 500</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          ≈ <span style={{ color: "var(--sand)" }}>₽6.84/км</span> · план ₽80 000
        </p>
        <ProgressBar value={59500} max={80000} />
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>74% от годового бюджета</p>
      </div>

      {/* Donut chart placeholder */}
      <div className="gvm-card p-4 animate-fade-in stagger-2">
        <h3 className="font-display text-sm uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
          Структура расходов
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              {categories.reduce((acc, cat, i) => {
                const prev = categories.slice(0, i).reduce((s, c) => s + c.pct, 0);
                const r = 15.9;
                const circ = 2 * Math.PI * r;
                const dash = (cat.pct / 100) * circ;
                const offset = circ - ((prev / 100) * circ);
                return [...acc, (
                  <circle key={cat.name} cx="18" cy="18" r={r}
                    fill="none" stroke={cat.color}
                    strokeWidth="3.5"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={offset}
                  />
                )];
              }, [] as React.ReactNode[])}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xs font-bold" style={{ color: "var(--text-primary)" }}>100%</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {categories.map(cat => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>{cat.name}</span>
                <span className="font-display text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {cat.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="animate-fade-in stagger-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
            Последние операции
          </h3>
          <button className="flex items-center gap-1.5 gvm-btn-primary px-3 py-1.5 text-xs">
            <Icon name="Plus" size={12} />
            Добавить
          </button>
        </div>
        <div className="space-y-2">
          {transactions.map((t, i) => (
            <div key={i} className="gvm-card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(107, 156, 42, 0.12)" }}>
                <Icon name={t.category === "Топливо" ? "Fuel" : t.category === "ТО" ? "Wrench" : t.category === "Мойка" ? "Droplets" : t.category === "Запчасти" ? "Package" : "Shield"} size={14}
                  style={{ color: "var(--green-glow)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{t.category}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{t.place}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display text-sm font-semibold" style={{ color: "#d94040" }}>
                  {t.amount.toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== TRIPS SCREEN =====
function TripsScreen() {
  const trips = [
    { date: "08 мар", from: "Дом", to: "Офис", km: 34, time: "47 мин", fuel: 4.2, purpose: "Работа" },
    { date: "07 мар", from: "Офис", to: "ТЦ Мега", km: 18, time: "31 мин", fuel: 2.3, purpose: "Личное" },
    { date: "06 мар", from: "Дом", to: "Дача", km: 112, time: "1ч 48м", fuel: 14.8, purpose: "Отдых" },
    { date: "05 мар", from: "Дача", to: "Дом", km: 115, time: "1ч 52м", fuel: 15.1, purpose: "Дом" },
    { date: "04 мар", from: "Дом", to: "СТО", km: 22, time: "38 мин", fuel: 2.9, purpose: "ТО" },
  ];

  const stats = [
    { label: "За месяц", value: "1 842 км", icon: "Route" },
    { label: "Поездок", value: "28", icon: "Navigation" },
    { label: "Ср. расход", value: "13.2 л/100", icon: "Fuel" },
    { label: "Простой", value: "3 дня", icon: "Clock" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3 animate-fade-in stagger-1">
        {stats.map(s => (
          <div key={s.label} className="gvm-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(107, 156, 42, 0.15)" }}>
              <Icon name={s.icon} size={16} style={{ color: "var(--green-glow)" }} />
            </div>
            <div>
              <p className="font-display text-base font-semibold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-fade-in stagger-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
            Журнал поездок
          </h3>
          <button className="flex items-center gap-1.5 gvm-btn-primary px-3 py-1.5 text-xs">
            <Icon name="Plus" size={12} />
            Поездка
          </button>
        </div>
        <div className="space-y-2">
          {trips.map((t, i) => (
            <div key={i} className="gvm-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {t.from}
                    </span>
                    <Icon name="ArrowRight" size={12} style={{ color: "var(--text-muted)" }} />
                    <span className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {t.to}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.date} · {t.time}</p>
                </div>
                <StatusBadge
                  label={t.purpose}
                  variant={t.purpose === "ТО" ? "warn" : "ok"}
                />
              </div>
              <div className="flex gap-4">
                <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  <Icon name="Route" size={11} /> {t.km} км
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                  <Icon name="Fuel" size={11} /> {t.fuel} л
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== PARTS SCREEN =====
function PartsScreen() {
  const categories = [
    { name: "Двигатель", icon: "Cpu", count: 8, lastService: "5 340 км назад" },
    { name: "Трансмиссия", icon: "Settings2", count: 4, lastService: "12 100 км назад" },
    { name: "Подвеска", icon: "Car", count: 6, lastService: "8 700 км назад" },
    { name: "Тормоза", icon: "Disc3", count: 3, lastService: "15 200 км назад" },
    { name: "Электрика", icon: "Zap", count: 5, lastService: "3 100 км назад" },
  ];

  const recent = [
    { name: "Масляный фильтр Mann W712", date: "12 фев 2025", mileage: "82 000 км", cost: 890, warranty: "10 000 км" },
    { name: "Масло Mobil 1 0W-40 4л", date: "12 фев 2025", mileage: "82 000 км", cost: 3200, warranty: "10 000 км" },
    { name: "Тормозные колодки Brembo F", date: "10 янв 2025", mileage: "79 500 км", cost: 5600, warranty: "30 000 км" },
    { name: "Воздушный фильтр Toyota OE", date: "15 ноя 2024", mileage: "73 000 км", cost: 1200, warranty: "20 000 км" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="gvm-card-elevated p-4 animate-fade-in stagger-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Всего замен
            </p>
            <p className="font-display text-3xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>26</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Сумма
            </p>
            <p className="font-display text-xl font-semibold mt-1" style={{ color: "var(--sand)" }}>₽48 200</p>
          </div>
          <button className="flex items-center gap-1.5 gvm-btn-primary px-4 py-2 text-sm">
            <Icon name="Plus" size={14} />
            Замена
          </button>
        </div>
      </div>

      <div className="animate-fade-in stagger-2">
        <h3 className="font-display text-sm uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
          Категории
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <div key={cat.name} className="gvm-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(107, 156, 42, 0.12)" }}>
                <Icon name={cat.icon} size={16} style={{ color: "var(--green-glow)" }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{cat.count} позиций</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in stagger-3">
        <h3 className="font-display text-sm uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
          Последние замены
        </h3>
        <div className="space-y-2">
          {recent.map((item, i) => (
            <div key={i} className="gvm-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {item.date} · {item.mileage}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    Ресурс: {item.warranty}
                  </p>
                </div>
                <span className="font-display text-sm font-semibold flex-shrink-0" style={{ color: "var(--sand)" }}>
                  ₽{item.cost.toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== INTERVALS SCREEN =====
function IntervalsScreen() {
  const mileage = 87340;

  const items = [
    { name: "Масло двигателя", last: 82000, interval: 10000, icon: "Droplets", category: "Двигатель" },
    { name: "Масляный фильтр", last: 82000, interval: 10000, icon: "Filter", category: "Двигатель" },
    { name: "Воздушный фильтр", last: 73000, interval: 20000, icon: "Wind", category: "Двигатель" },
    { name: "Салонный фильтр", last: 78000, interval: 15000, icon: "CloudSnow", category: "Климат" },
    { name: "Топливный фильтр", last: 67000, interval: 40000, icon: "Fuel", category: "Двигатель" },
    { name: "Масло АКПП", last: 62000, interval: 60000, icon: "Settings2", category: "Трансмиссия" },
    { name: "Масло редукторов", last: 62000, interval: 60000, icon: "Cog", category: "Трансмиссия" },
    { name: "Тормозная жидкость", last: 75000, interval: 40000, icon: "Disc3", category: "Тормоза" },
    { name: "Антифриз", last: 55000, interval: 60000, icon: "Thermometer", category: "Двигатель" },
    { name: "Свечи зажигания", last: 72000, interval: 30000, icon: "Zap", category: "Двигатель" },
    { name: "Ремень ГРМ", last: 52000, interval: 90000, icon: "RefreshCw", category: "Двигатель" },
    { name: "Тормозные колодки", last: 79500, interval: 30000, icon: "StopCircle", category: "Тормоза" },
    { name: "Амортизаторы", last: 50000, interval: 80000, icon: "Car", category: "Подвеска" },
    { name: "Балансировка", last: 84000, interval: 10000, icon: "Target", category: "Шины" },
    { name: "Сход-развал", last: 72000, interval: 20000, icon: "Crosshair", category: "Подвеска" },
  ];

  const sortedItems = [...items].map(item => {
    const used = mileage - item.last;
    const pct = Math.round((used / item.interval) * 100);
    const remaining = item.interval - used;
    return { ...item, used, pct, remaining };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in stagger-1">
        <div>
          <p className="font-display text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
            Пробег сейчас
          </p>
          <p className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {mileage.toLocaleString('ru-RU')} км
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge label="2 срочно" variant="danger" />
          <StatusBadge label="3 скоро" variant="warn" />
        </div>
      </div>

      <div className="space-y-2 animate-fade-in stagger-2">
        {sortedItems.map((item, i) => (
          <div key={item.name} className="gvm-card p-3"
            style={{ animationDelay: `${0.05 * i}s` }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(107, 156, 42, 0.1)" }}>
                <Icon name={item.icon} size={14} style={{ color: "var(--green-glow)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                  <StatusBadge
                    label={item.pct >= 100 ? "Просрочено" : item.pct > 80 ? "Срочно" : item.pct > 60 ? "Скоро" : "OK"}
                    variant={item.pct >= 100 ? "danger" : item.pct > 80 ? "danger" : item.pct > 60 ? "warn" : "ok"}
                  />
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {item.category} · ч/з {item.remaining > 0 ? `${item.remaining.toLocaleString('ru-RU')} км` : "просрочено"}
                </p>
              </div>
            </div>
            <ProgressBar value={item.used} max={item.interval} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {Math.min(100, item.pct)}% · посл. {item.last.toLocaleString('ru-RU')} км
              </span>
              <button className="text-xs font-display font-medium" style={{ color: "var(--green-glow)" }}>
                Заменил ✓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== STATS SCREEN =====
function StatsScreen() {
  const aggIndex = 34;
  const healthIndex = 82;

  const monthlyKm = [
    { m: "Окт", km: 1820 },
    { m: "Ноя", km: 2340 },
    { m: "Дек", km: 1560 },
    { m: "Янв", km: 2890 },
    { m: "Фев", km: 2100 },
    { m: "Мар", km: 1420 },
  ];
  const maxKm = Math.max(...monthlyKm.map(m => m.km));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Health index */}
      <div className="gvm-card-elevated p-5 animate-fade-in stagger-1">
        <p className="font-display text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
          Индекс здоровья авто
        </p>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(107,156,42,0.12)" strokeWidth="3.5" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={healthIndex > 70 ? "#6b9c2a" : healthIndex > 40 ? "#e8a020" : "#d94040"}
                strokeWidth="3.5"
                strokeDasharray={`${(healthIndex / 100) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {healthIndex}
              </span>
            </div>
          </div>
          <div>
            <p className="font-display text-2xl font-bold" style={{ color: "#8bc34a" }}>Хорошее</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>состояние автомобиля</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Следите за заменой масла</p>
          </div>
        </div>
      </div>

      {/* Aggression index */}
      <div className="gvm-card p-4 animate-fade-in stagger-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-display text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
              Стиль вождения
            </p>
            <p className="font-display text-2xl font-bold mt-1" style={{
              color: aggIndex < 30 ? "#6b9c2a" : aggIndex < 60 ? "#e8a020" : "#d94040"
            }}>
              {aggIndex}%
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Умеренный</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Регион МСК</p>
            <p className="font-display text-lg font-semibold mt-1" style={{ color: "var(--text-secondary)" }}>48%</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>средний</p>
          </div>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(107,156,42,0.1)" }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${aggIndex}%`, background: "linear-gradient(90deg, #6b9c2a, #e8a020)" }} />
          <div className="absolute top-0 h-full w-0.5 bg-white opacity-50"
            style={{ left: "48%" }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Спокойный</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Агрессивный</span>
        </div>
      </div>

      {/* Monthly mileage chart */}
      <div className="gvm-card p-4 animate-fade-in stagger-3">
        <p className="font-display text-xs uppercase tracking-widest mb-4" style={{ color: "var(--text-secondary)" }}>
          Пробег по месяцам
        </p>
        <div className="flex items-end gap-2 h-28">
          {monthlyKm.map((m, i) => (
            <div key={m.m} className="flex-1 flex flex-col items-center gap-1">
              <span className="font-display text-xs" style={{ color: "var(--text-muted)" }}>
                {m.km >= 1000 ? `${(m.km / 1000).toFixed(1)}k` : m.km}
              </span>
              <div className="w-full rounded-t-md transition-all duration-700"
                style={{
                  height: `${(m.km / maxKm) * 80}px`,
                  background: i === monthlyKm.length - 1
                    ? "linear-gradient(180deg, #8bc34a, #6b9c2a)"
                    : "rgba(107, 156, 42, 0.3)",
                  animationDelay: `${i * 0.1}s`
                }} />
              <span className="font-display text-xs" style={{ color: "var(--text-muted)" }}>{m.m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Downtime */}
      <div className="gvm-card p-4 animate-fade-in stagger-4">
        <p className="font-display text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
          Анализ простоев
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Максим. простой", value: "8 дней", icon: "Moon", variant: "warn" },
            { label: "Ср. простой", value: "2.3 дня", icon: "Pause", variant: "ok" },
            { label: "В этом месяце", value: "3 дня", icon: "Clock", variant: "ok" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <Icon name={s.icon} size={18} className="mx-auto mb-1"
                style={{ color: s.variant === "warn" ? "#e8a020" : "var(--green-glow)" }} />
              <p className="font-display text-sm font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== OWNERS SCREEN =====
function OwnersScreen() {
  const owners = [
    {
      name: "Михаил Громов",
      period: "2022 — н.в.",
      mileageFrom: 62000,
      mileageTo: 87340,
      days: 840,
      trips: 284,
      rating: 91,
      status: "current",
      positives: ["Регулярное ТО", "Оригинальные запчасти", "Своевременные замены"],
      negatives: ["2 случая агрессивного вождения"],
    },
    {
      name: "Сергей Калинин",
      period: "2020 — 2022",
      mileageFrom: 34000,
      mileageTo: 62000,
      days: 648,
      trips: 198,
      rating: 74,
      status: "prev",
      positives: ["Регулярные мойки", "Без ДТП"],
      negatives: ["Пропуск ТО дважды", "Долгий простой (14 дней)"],
    },
    {
      name: "Toyota Dealer",
      period: "2018 — 2020",
      mileageFrom: 0,
      mileageTo: 34000,
      days: 512,
      trips: 112,
      rating: 88,
      status: "prev",
      positives: ["Все ТО в срок", "Дилерское обслуживание"],
      negatives: [],
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in stagger-1">
        <h2 className="font-display text-sm uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          История владения
        </h2>
        <button className="flex items-center gap-1.5 gvm-btn-primary px-3 py-1.5 text-xs">
          <Icon name="Plus" size={12} />
          Период
        </button>
      </div>

      <div className="space-y-3">
        {owners.map((owner, i) => (
          <div key={owner.name} className={`gvm-card p-4 animate-fade-in stagger-${i + 1}`}
            style={owner.status === "current" ? { border: "1px solid rgba(107, 156, 42, 0.35)" } : {}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #2d3d1a, #6b9c2a)", color: "var(--text-primary)" }}>
                    {owner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {owner.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{owner.period}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Icon name="Star" size={12} style={{ color: "#e8a020" }} />
                  <span className="font-display text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {owner.rating}
                  </span>
                </div>
                {owner.status === "current" && (
                  <StatusBadge label="Текущий" variant="ok" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 py-3"
              style={{ borderTop: "1px solid rgba(107, 156, 42, 0.08)", borderBottom: "1px solid rgba(107, 156, 42, 0.08)" }}>
              <div className="text-center">
                <p className="font-display text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {(owner.mileageTo - owner.mileageFrom).toLocaleString('ru-RU')}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>км пробега</p>
              </div>
              <div className="text-center">
                <p className="font-display text-sm font-bold" style={{ color: "var(--text-primary)" }}>{owner.days}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>дней</p>
              </div>
              <div className="text-center">
                <p className="font-display text-sm font-bold" style={{ color: "var(--text-primary)" }}>{owner.trips}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>поездок</p>
              </div>
            </div>

            <div className="space-y-1">
              {owner.positives.map((p, j) => (
                <div key={j} className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#6b9c2a" }} />
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{p}</p>
                </div>
              ))}
              {owner.negatives.map((n, j) => (
                <div key={j} className="flex items-start gap-2">
                  <Icon name="AlertCircle" size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#e8a020" }} />
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{n}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== SETTINGS SCREEN =====
function SettingsScreen() {
  const [tgToken, setTgToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [notifications, setNotifications] = useState({
    oil: true,
    docs: true,
    trips: false,
    idle: true,
    summary: true,
  });

  const notifItems = [
    { key: "oil" as const, label: "Замена масла", icon: "Droplets" },
    { key: "docs" as const, label: "Истечение документов", icon: "FileText" },
    { key: "trips" as const, label: "Журнал поездок", icon: "MapPin" },
    { key: "idle" as const, label: "Простой более 5 дней", icon: "Moon" },
    { key: "summary" as const, label: "Еженедельная сводка", icon: "BarChart3" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Telegram */}
      <div className="gvm-card-elevated p-4 animate-fade-in stagger-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a6fa8, #2d9de8)" }}>
            <Icon name="Send" size={14} style={{ color: "white" }} />
          </div>
          <h3 className="font-display text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Telegram-уведомления
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="font-display text-xs uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Bot Token
            </label>
            <input
              value={tgToken}
              onChange={e => setTgToken(e.target.value)}
              placeholder="123456789:AAF..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-body"
              style={{
                background: "rgba(107, 156, 42, 0.06)",
                border: "1px solid rgba(107, 156, 42, 0.18)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="font-display text-xs uppercase tracking-wide mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Chat ID
            </label>
            <input
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              placeholder="-100123456789"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-body"
              style={{
                background: "rgba(107, 156, 42, 0.06)",
                border: "1px solid rgba(107, 156, 42, 0.18)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button className="flex-1 gvm-btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
              <Icon name="Save" size={14} />
              Сохранить
            </button>
            <button className="px-4 py-2.5 rounded-xl text-sm font-display font-medium"
              style={{
                background: "rgba(107, 156, 42, 0.1)",
                border: "1px solid rgba(107, 156, 42, 0.2)",
                color: "var(--green-glow)",
              }}>
              Тест
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="gvm-card p-4 animate-fade-in stagger-2">
        <h3 className="font-display text-sm uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
          Типы уведомлений
        </h3>
        <div className="space-y-3">
          {notifItems.map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size={15} style={{ color: "var(--text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item.label}</span>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                style={{
                  background: notifications[item.key]
                    ? "linear-gradient(135deg, #6b9c2a, #8bc34a)"
                    : "rgba(107, 156, 42, 0.15)",
                }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                  style={{ left: notifications[item.key] ? "calc(100% - 18px)" : "2px" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="gvm-card p-4 animate-fade-in stagger-3">
        <h3 className="font-display text-sm uppercase tracking-widest mb-3" style={{ color: "var(--text-secondary)" }}>
          Аккаунт
        </h3>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
            style={{ background: "rgba(107, 156, 42, 0.06)" }}>
            <Icon name="KeyRound" size={15} style={{ color: "var(--text-secondary)" }} />
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>Сменить пароль</span>
            <Icon name="ChevronRight" size={14} className="ml-auto" style={{ color: "var(--text-muted)" }} />
          </button>
          <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
            style={{ background: "rgba(107, 156, 42, 0.06)" }}>
            <Icon name="History" size={15} style={{ color: "var(--text-secondary)" }} />
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>История входов</span>
            <Icon name="ChevronRight" size={14} className="ml-auto" style={{ color: "var(--text-muted)" }} />
          </button>
          <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
            style={{ background: "rgba(209, 64, 64, 0.06)" }}>
            <Icon name="LogOut" size={15} style={{ color: "#d94040" }} />
            <span className="text-sm" style={{ color: "#d94040" }}>Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN APP =====
export default function Index() {
  const [screen, setScreen] = useState<Screen>("home");
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [animKey, setAnimKey] = useState(0);

  const navigate = (s: Screen) => {
    if (s === screen) return;
    setPrevScreen(screen);
    setScreen(s);
    setAnimKey(k => k + 1);
  };

  const screenTitles: Record<Screen, string> = {
    home: "GVM Performance",
    finance: "Финансы",
    trips: "Поездки",
    parts: "Запчасти",
    intervals: "Интервалы ТО",
    stats: "Статистика",
    owners: "Владельцы",
    settings: "Настройки",
  };

  const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen />;
      case "finance": return <FinanceScreen />;
      case "trips": return <TripsScreen />;
      case "parts": return <PartsScreen />;
      case "intervals": return <IntervalsScreen />;
      case "stats": return <StatsScreen />;
      case "owners": return <OwnersScreen />;
      case "settings": return <SettingsScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--surface)", maxWidth: "480px", margin: "0 auto" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 px-4 pt-safe"
        style={{
          background: "rgba(20, 28, 13, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(107, 156, 42, 0.1)",
          paddingTop: "env(safe-area-inset-top, 12px)",
        }}>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            {screen !== "home" && (
              <button onClick={() => navigate("home")} className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: "rgba(107, 156, 42, 0.1)" }}>
                <Icon name="ChevronLeft" size={18} style={{ color: "var(--green-glow)" }} />
              </button>
            )}
            <div>
              {screen === "home" && (
                <p className="font-display text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                  Toyota LC 200
                </p>
              )}
              <h1 className="font-display text-lg font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                {screenTitles[screen]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ background: "rgba(107, 156, 42, 0.1)" }}>
              <Icon name="Search" size={15} style={{ color: "var(--text-secondary)" }} />
            </button>
            <div className="relative">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: "rgba(107, 156, 42, 0.1)" }}>
                <Icon name="Bell" size={15} style={{ color: "var(--text-secondary)" }} />
              </button>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full pulse-green"
                style={{ background: "#d94040" }} />
            </div>
          </div>
        </div>
      </header>

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-safe" key={animKey}>
        {renderScreen()}
      </main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 z-40 px-2 pb-safe"
        style={{
          background: "rgba(14, 20, 8, 0.96)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(107, 156, 42, 0.12)",
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))",
        }}>
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map(item => {
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200"
                style={{
                  background: active ? "rgba(107, 156, 42, 0.12)" : "transparent",
                  minWidth: "48px",
                }}>
                <Icon
                  name={item.icon}
                  size={active ? 20 : 18}
                  style={{
                    color: active ? "var(--green-glow)" : "var(--text-muted)",
                    transition: "all 0.2s ease",
                  }}
                />
                <span
                  className="font-display text-center leading-tight"
                  style={{
                    fontSize: "8px",
                    letterSpacing: "0.02em",
                    color: active ? "var(--green-glow)" : "var(--text-muted)",
                    transition: "color 0.2s ease",
                  }}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 rounded-full" style={{ background: "var(--green-glow)" }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}