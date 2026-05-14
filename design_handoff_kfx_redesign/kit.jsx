// kit.jsx — small shared UI primitives

const Icon = {
  home: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V11z"/></svg>,
  people: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="3"/><path d="M21.5 19a4.5 4.5 0 0 0-5-4.5"/></svg>,
  wallet: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18M16 14.5h2"/></svg>,
  gear: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 14a1.7 1.7 0 0 0 .4 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.4 1.7 1.7 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5.6 8a1.7 1.7 0 0 0-.4-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.4H10a1.7 1.7 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.9V8c.3.6.9 1 1.5 1H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  bell: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  plus: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  arrow: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  back: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>,
  search: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  filter: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  check: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>,
  cash: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>,
  out: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>,
  in: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7L7 17M15 17H7V9"/></svg>,
  warn: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>,
  receipt: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h16v18l-3-2-3 2-3-2-3 2-3-2-1 2z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>,
  chevron: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  dot: (s = 6) => <svg width={s} height={s} viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="currentColor"/></svg>,
};

function Avatar({ b, size = 36, ring = false }) {
  return (
    <div className="avatar" style={{
      width: size, height: size,
      background: b.avatar,
      fontSize: Math.round(size * 0.36),
      boxShadow: ring ? '0 0 0 2px var(--surface), 0 0 0 3px ' + b.avatar : undefined,
    }}>{b.initials}</div>
  );
}

function Pill({ tone = 'muted', children, dot }) {
  return (
    <span className={`pill pill-${tone}`}>
      {dot && <span className="pill-dot" style={{ background: 'currentColor' }} />}
      {children}
    </span>
  );
}

function Money({ v, size = 'sm', className = '', sign = false }) {
  const cls = size === 'hero' ? 'money-hero' : size === 'lg' ? 'money-lg' : size === 'md' ? 'money' : 'money-sm';
  const tone = v < 0 ? 'neg' : (sign && v > 0 ? 'pos' : '');
  return <span className={`${cls} ${tone} ${className}`}>{sign && v > 0 ? '+' : ''}{fmt(v)}</span>;
}

function Stat({ label, value, tone = 'text', size = 'lg' }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div className={`money-${size}`} style={{ color: tone === 'text' ? 'var(--text)' : `var(--${tone})` }}>
        {typeof value === 'number' ? fmt(value) : value}
      </div>
    </div>
  );
}

function BotNav({ active, onChange, t }) {
  const items = [
    { k: 'today',     l: t.today,    i: Icon.home() },
    { k: 'borrowers', l: t.borrowers,i: Icon.people() },
    { k: 'money',     l: t.money,    i: Icon.wallet() },
    { k: 'settings',  l: t.settings, i: Icon.gear() },
  ];
  return (
    <div className="botnav" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 32 }}>
      {items.map(it => (
        <div key={it.k} className={`botnav-item ${active === it.k ? 'active' : ''}`} onClick={() => onChange?.(it.k)}>
          {it.i}
          <span>{it.l}</span>
        </div>
      ))}
    </div>
  );
}

// Mini horizontal split-bar (lent vs cash vs owed)
function DeploymentBar({ segments }) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.v), 0);
  return (
    <div className="bar">
      {segments.map((s, i) => (
        <span key={i} style={{ width: `${(Math.max(0, s.v) / total) * 100}%`, background: s.color }} />
      ))}
    </div>
  );
}

Object.assign(window, { Icon, Avatar, Pill, Money, Stat, BotNav, DeploymentBar });
