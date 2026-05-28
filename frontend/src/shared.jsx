// Shared chrome + design tokens for the 3 home option variants.
// Modern SaaS look. White bg + subtle borders + brand accents.
//
// Tokens
// ------
const DS = {
  font: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  ink: '#0c0c10',
  ink2: '#4a4d57',
  ink3: '#7c8089',
  ink4: '#b1b5be',
  rule: '#ececef',
  ruleSoft: '#f3f3f5',
  paper: '#ffffff',
  surface: '#fafafb',
  surface2: '#f6f6f8',
  hi: '#fcf9ed',
  posBg: '#eaf6ed',
  posInk: '#1c7a3a',
  negBg: '#fceceb',
  negInk: '#b53b32',
  warnBg: '#fdf3e1',
  warnInk: '#a55c00',
};

const BRANDS = {
  Entresto: { id: 'Entresto', label: 'Entresto', ta: 'Heart Failure', color: '#3257d4', tintBg: '#eef2fb', tintInk: '#2244ad' },
  Cosentyx: { id: 'Cosentyx', label: 'Cosentyx', ta: 'Immunology',   color: '#6a3acc', tintBg: '#f1ecfb', tintInk: '#4f2aa0' },
  Lucentis: { id: 'Lucentis', label: 'Lucentis', ta: 'Retina',       color: '#b8862a', tintBg: '#f7f0df', tintInk: '#7e5a14' },
};

// ----- formatting -----
const fmtMoney = (n) => {
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n/1e3).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
};
const fmtNum = (n) => n >= 1000 ? n.toLocaleString() : String(n);
const fmtPct = (n) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
const fmtMom = (n) => (n >= 0 ? '+' : '') + n + '%';

// ----- tag chip -----
function Chip({ tone = 'default', children, mono = true }) {
  const tones = {
    default: { bg: DS.surface2, ink: DS.ink2 },
    rising:  { bg: DS.posBg, ink: DS.posInk },
    lapsed:  { bg: DS.warnBg, ink: DS.warnInk },
    declining: { bg: DS.negBg, ink: DS.negInk },
    whitespace: { bg: '#e8eff6', ink: '#26527c' },
    brand: { bg: '#eef2fb', ink: '#2244ad' },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10, padding: '3px 8px', borderRadius: 100,
      background: t.bg, color: t.ink, fontFamily: mono ? DS.mono : DS.font,
      letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
    }}>{children}</span>
  );
}

// ----- delta arrow -----
function Delta({ value, suffix = '%' }) {
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? DS.posInk : DS.negInk, fontFamily: DS.mono, fontSize: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
      {pos ? '▲' : '▼'} {Math.abs(value)}{suffix}
    </span>
  );
}

// ----- mini sparkline -----
function Spark({ values, color = DS.ink, width = 80, height = 24 }) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// Deterministic-ish 12-month synthetic sparkline shaped by mom
function sparkFromMom(mom, seed = 0) {
  const base = 50;
  const trend = mom / 100;
  const arr = [];
  let v = base * (1 - trend);
  for (let i = 0; i < 12; i++) {
    const noise = ((Math.sin(seed + i * 1.4) + Math.cos(seed*0.7 + i*0.9)) * 4);
    v += (base * trend / 12) + noise;
    arr.push(Math.max(20, v));
  }
  return arr;
}

// ===== Sidebar =====
function Sidebar({ active = 'home' }) {
  const items = [
    { id: 'home', label: 'Home', mark: '●' },
    { id: 'hcp', label: 'HCP Explorer', mark: '◐' },
    { id: 'map', label: 'Territory', mark: '◇' },
    { id: 'brand', label: 'Brand', mark: '◧' },
    { id: 'report', label: 'Reports', mark: '◑' },
  ];
  return (
    <aside style={{
      width: 220, borderRight: `1px solid ${DS.rule}`, background: DS.paper,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '22px 22px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: DS.ink, color: DS.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DS.mono, fontSize: 12, fontWeight: 600 }}>R</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', color: DS.ink }}>RxPulse</div>
          <div style={{ fontSize: 10, color: DS.ink3, fontFamily: DS.mono, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Field Insights</div>
        </div>
      </div>
      <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 6, cursor: 'default',
            background: active === it.id ? DS.surface2 : 'transparent',
            color: active === it.id ? DS.ink : DS.ink2,
            fontSize: 13, fontWeight: active === it.id ? 600 : 500,
          }}>
            <span style={{ color: active === it.id ? BRANDS.Entresto.color : DS.ink4, fontSize: 9, width: 12 }}>{it.mark}</span>
            <span>{it.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ flex: 1 }}></div>

      {/* Saved lists */}
      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ padding: '12px 12px 4px', fontSize: 10, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Saved lists</div>
        {['Q1 Visit Plan', 'Top 50 Cardiologists', 'Lapsed — 90d', 'Whitespace · IE'].map(s => (
          <div key={s} style={{ padding: '6px 12px', fontSize: 12, color: DS.ink2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: DS.ink4 }}></span>
            {s}
          </div>
        ))}
      </div>

      {/* User */}
      <div style={{ borderTop: `1px solid ${DS.rule}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: BRANDS.Entresto.tintBg, color: BRANDS.Entresto.tintInk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>SK</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: DS.ink }}>Sarah Kim</div>
          <div style={{ fontSize: 10, color: DS.ink3 }}>SoCal · CV</div>
        </div>
        <span style={{ color: DS.ink4, fontSize: 14 }}>⋯</span>
      </div>
    </aside>
  );
}

// ===== Top bar =====
function TopBar({
  brand = 'Entresto', region = 'SoCal',
  title = 'Home', subtitle = 'Today, Dec 31 2025',
  onBrandChange = () => {}, onRegionChange = () => {},
}) {
  const brands = Object.values(BRANDS);
  const regions = ['SoCal', 'Central', 'NorCal', 'All'];
  return (
    <header style={{
      height: 64, borderBottom: `1px solid ${DS.rule}`, background: DS.paper,
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{subtitle}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: DS.ink, letterSpacing: '-0.01em' }}>{title}</div>
      </div>

      {/* Region selector */}
      <div style={{ display: 'flex', background: DS.surface2, padding: 3, borderRadius: 8, gap: 2 }}>
        {regions.map(r => (
          <div key={r} onClick={() => onRegionChange(r)} style={{
            padding: '7px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6,
            background: region === r ? DS.paper : 'transparent',
            color: region === r ? DS.ink : DS.ink3,
            boxShadow: region === r ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
          }}>{r}</div>
        ))}
      </div>

      {/* Brand switcher */}
      <div style={{ display: 'flex', background: DS.surface2, padding: 3, borderRadius: 8, gap: 2 }}>
        {brands.map(b => (
          <div key={b.id} onClick={() => onBrandChange(b.id)} style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6,
            background: brand === b.id ? DS.paper : 'transparent',
            color: brand === b.id ? b.color : DS.ink3,
            boxShadow: brand === b.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: b.color }}></span>
            {b.label}
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ width: 280, height: 36, background: DS.surface2, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, color: DS.ink3, fontSize: 12 }}>
        <span style={{ fontFamily: DS.mono }}>⌕</span>
        <span>NPI, name, or city…</span>
        <span style={{ marginLeft: 'auto', fontFamily: DS.mono, fontSize: 10, color: DS.ink4, padding: '2px 6px', background: DS.paper, borderRadius: 4, border: `1px solid ${DS.rule}` }}>⌘K</span>
      </div>

      <button style={{
        height: 36, padding: '0 14px', background: DS.ink, color: DS.paper,
        border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
        fontFamily: DS.font, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        Export <span style={{ fontFamily: DS.mono, fontSize: 10, opacity: 0.7 }}>→</span>
      </button>
    </header>
  );
}

// ===== Card primitives =====
function Card({ title, subtitle, action, padding = 20, children, style = {} }) {
  return (
    <div style={{
      background: DS.paper, border: `1px solid ${DS.rule}`, borderRadius: 12,
      display: 'flex', flexDirection: 'column', ...style,
    }}>
      {(title || action) && (
        <div style={{ padding: `16px ${padding}px`, borderBottom: `1px solid ${DS.ruleSoft}`, display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink, letterSpacing: '-0.005em' }}>{title}</div>}
            {subtitle && <div style={{ fontSize: 11, color: DS.ink3, marginTop: 2 }}>{subtitle}</div>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding, flex: 1 }}>{children}</div>
    </div>
  );
}

function KPI({ label, value, delta, sub, big = false }) {
  return (
    <div style={{ padding: big ? '20px 22px' : '14px 16px' }}>
      <div style={{ fontSize: 11, color: DS.ink3, fontFamily: DS.mono, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: big ? 32 : 24, fontWeight: 700, color: DS.ink, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</div>
      {(delta != null || sub) && (
        <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          {delta != null && <Delta value={delta}/>}
          {sub && <span style={{ fontSize: 11, color: DS.ink3 }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ===== Tag pill for HCP target reason =====
function TargetTag({ tag }) {
  const map = {
    rising:    { label: 'Rising',    tone: 'rising' },
    lapsed:    { label: 'Lapsed',    tone: 'lapsed' },
    declining: { label: 'Declining', tone: 'declining' },
    whitespace:{ label: 'Whitespace',tone: 'whitespace' },
  };
  const m = map[tag] || map.rising;
  return <Chip tone={m.tone}>{m.label}</Chip>;
}

Object.assign(window, {
  DS, BRANDS, Chip, Delta, Spark, sparkFromMom,
  fmtMoney, fmtNum, fmtPct, fmtMom,
  Sidebar, TopBar, Card, KPI, TargetTag,
});
