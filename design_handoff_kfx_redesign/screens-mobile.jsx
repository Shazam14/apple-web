// screens-mobile.jsx — mobile screen content (no device frame)

// ─── Mobile shell ───
function MobileShell({ tab, children, t, header, fab, hideNav }) {
  return (
    <div className="kfx" style={{
      width: 390, height: 844, position: 'relative',
      background: 'var(--bg)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* status spacing */}
      <div style={{ height: 54, flexShrink: 0 }} />
      {header}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: hideNav ? 32 : 96 }}>
        {children}
      </div>
      {fab}
      {!hideNav && <BotNav active={tab} t={t} />}
    </div>
  );
}

// ─── Today screen ───
function TodayScreen({ t }) {
  const dueToday = BORROWERS.filter(b => b.dueToday > 0 || b.overdue > 0);
  const collectedToday = 12450;
  const expectedToday = dueToday.reduce((s, b) => s + b.than, 0);

  return (
    <MobileShell tab="today" t={t}>
      {/* Header */}
      <div style={{ padding: '8px 20px 16px' }}>
        <div className="small" style={{ marginBottom: 2 }}>Thu, May 14</div>
        <div className="h1">{t.todayHello}</div>
      </div>

      {/* Hero: today's number */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{t.toCollectToday}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <span className="money-hero accent">{fmt(expectedToday)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <Pill tone="warning"><span style={{ fontWeight: 700 }}>7</span>&nbsp;{t.dueToday}</Pill>
            <Pill tone="danger"><span style={{ fontWeight: 700 }}>11</span>&nbsp;{t.overdue}</Pill>
            <Pill tone="muted"><span style={{ fontWeight: 700 }}>3</span>&nbsp;{t.multa}</Pill>
          </div>
          {/* progress vs goal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span className="small">{t.collectedSoFar}</span>
            <span className="money-sm pos">{fmt(collectedToday)}</span>
          </div>
          <div className="bar">
            <span style={{ width: `${(collectedToday / expectedToday) * 100}%`, background: 'var(--success)' }} />
          </div>
        </div>
      </div>

      {/* Quick action row */}
      <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <QuickTile icon={Icon.in} label={t.bayad} tone="success" />
        <QuickTile icon={Icon.out} label={t.palod} tone="accent" />
        <QuickTile icon={Icon.warn} label={t.multa} tone="warning" />
      </div>

      {/* Collection round */}
      <div style={{ padding: '0 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="eyebrow">{t.collectionRound}</div>
        <span className="small">{dueToday.length} {t.toVisit}</span>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {dueToday.map((b, i) => <CollectRow key={b.id} b={b} t={t} last={i === dueToday.length - 1} />)}
        </div>
      </div>

      {/* Today's profit */}
      <div style={{ padding: '0 20px 8px' }} className="eyebrow">{t.snapshot}</div>
      <div style={{ padding: '0 20px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MiniStat label={t.cashOnHand} value={fmt(CAPITAL.cashOnHand)} sub={t.idle} subTone="text-3" />
        <MiniStat label={t.thanToday} value={fmt(2210)} sub="+₱310 vs avg" subTone="success" />
        <MiniStat label={t.collected} value={fmt(CAPITAL.collected)} sub={t.thisCycle} />
        <MiniStat label={t.deployed} value={fmt(CAPITAL.lentOut)} sub={`${CAPITAL.borrowerCount} ${t.borrowersLower}`} />
      </div>
    </MobileShell>
  );
}

function QuickTile({ icon, label, tone }) {
  return (
    <div className="card" style={{
      padding: '14px 10px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 6, cursor: 'pointer',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `var(--${tone}-soft)`, color: `var(--${tone})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon(18)}</div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function MiniStat({ label, value, sub, subTone = 'text-3' }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="small" style={{ marginBottom: 4 }}>{label}</div>
      <div className="money-lg" style={{ marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: `var(--${subTone})`, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

function CollectRow({ b, t, last }) {
  const expected = b.than + (b.multa > 0 ? b.multa : 0);
  const tag = b.dueToday > 0
    ? { label: `${b.dueToday} ${t.dueToday}`, tone: 'warning' }
    : { label: `${b.overdue} ${t.overdue}`, tone: 'danger' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 0 : '1px solid var(--border)',
    }}>
      <Avatar b={b} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Pill tone={tag.tone}>{tag.label}</Pill>
          {b.multa > 0 && <span className="money-sm warn">+{fmt(b.multa)}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span className="money-sm" style={{ fontSize: 13, fontWeight: 600 }}>{fmt(expected)}</span>
        <button className="btn btn-primary btn-xs" style={{ padding: '0 12px', height: 28 }}>+ {t.bayad}</button>
      </div>
    </div>
  );
}

// ─── Borrowers screen ───
function BorrowersScreen({ t, onOpen }) {
  return (
    <MobileShell tab="borrowers" t={t}
      fab={<div className="fab">{Icon.plus(24)}</div>}>
      <div style={{ padding: '8px 20px 12px' }}>
        <div className="h1" style={{ marginBottom: 4 }}>{t.borrowers}</div>
        <div className="small">6 active · ₱1.17M deployed</div>
      </div>
      {/* search */}
      <div style={{ padding: '4px 20px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 40, padding: '0 12px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, color: 'var(--text-3)',
        }}>
          {Icon.search(16)}
          <span style={{ fontSize: 14 }}>{t.searchBorrowers}</span>
        </div>
      </div>
      {/* filter chips */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, overflow: 'auto' }}>
        {[
          { l: t.all,      n: 6,  active: true },
          { l: t.overdue,  n: 11, tone: 'danger' },
          { l: t.dueToday, n: 7,  tone: 'warning' },
          { l: t.multa,    n: 3,  tone: 'muted' },
          { l: t.paid,     n: 1,  tone: 'success' },
        ].map((c, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 12px', borderRadius: 999,
            background: c.active ? 'var(--text)' : 'var(--surface)',
            color: c.active ? 'var(--surface)' : 'var(--text-2)',
            border: '1px solid ' + (c.active ? 'var(--text)' : 'var(--border)'),
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            {c.l} <span style={{ opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>{c.n}</span>
          </div>
        ))}
      </div>
      {/* list */}
      <div style={{ padding: '0 20px' }}>
        <div className="card">
          {BORROWERS.map((b, i) => <BorrowerRow key={b.id} b={b} t={t} last={i === BORROWERS.length - 1} onClick={onOpen} />)}
        </div>
      </div>
    </MobileShell>
  );
}

function BorrowerRow({ b, t, last, onClick }) {
  const badge = b.overdue > 0
    ? { l: `${b.overdue} ${t.overdue}`, tone: 'danger' }
    : b.dueToday > 0
      ? { l: `${b.dueToday} ${t.dueToday}`, tone: 'warning' }
      : b.status === 'paid'
        ? { l: t.paid, tone: 'success' }
        : b.status === 'idle'
          ? { l: t.idle, tone: 'muted' }
          : { l: t.active, tone: 'accent' };
  return (
    <div onClick={() => onClick?.(b)} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 14px',
      borderBottom: last ? 0 : '1px solid var(--border)',
      cursor: 'pointer',
    }}>
      <Avatar b={b} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{b.name}</span>
          {b.txCount > 1 && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>×{b.txCount}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Pill tone={badge.tone}>{badge.l}</Pill>
          {b.multa > 0 && <Pill tone="warning">+{fmt(b.multa)} {t.multa}</Pill>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <span className="money" style={{ fontSize: 15 }}>{fmt(b.balance)}</span>
        <span className="small">{fmt(b.than)}/{t.day}</span>
      </div>
    </div>
  );
}

// ─── Borrower detail ───
function BorrowerDetail({ t, b = BORROWERS[0] }) {
  return (
    <MobileShell tab="borrowers" t={t} hideNav>
      {/* nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 12px 8px',
      }}>
        <button className="btn btn-ghost" style={{ height: 36, padding: '0 8px', gap: 6 }}>
          {Icon.back()} <span>{t.borrowers}</span>
        </button>
        <button className="btn btn-ghost btn-sm" style={{ padding: '0 10px' }}>···</button>
      </div>

      {/* header card */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar b={b} size={56} />
          <div>
            <div className="h2" style={{ marginBottom: 4 }}>{b.name}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Pill tone="danger">{b.overdue} {t.overdue}</Pill>
              <Pill tone="warning">{b.dueToday} {t.dueToday}</Pill>
            </div>
          </div>
        </div>
        {/* big balance */}
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{t.balance}</div>
          <div className="money-hero" style={{ marginBottom: 14 }}>{fmt(b.balance)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <div className="small" style={{ marginBottom: 2 }}>{t.released}</div>
              <div className="money" style={{ fontSize: 15 }}>{fmt(b.principal)}</div>
            </div>
            <div>
              <div className="small" style={{ marginBottom: 2 }}>{t.thanPerDay}</div>
              <div className="money accent" style={{ fontSize: 15 }}>{fmt(b.than)}</div>
            </div>
            <div>
              <div className="small" style={{ marginBottom: 2 }}>{t.collected}</div>
              <div className="money pos" style={{ fontSize: 15 }}>{fmt(b.collected)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button className="btn btn-success" style={{ height: 48 }}>{Icon.in()} + {t.bayad}</button>
        <button className="btn btn-primary" style={{ height: 48 }}>{Icon.out()} + {t.palod}</button>
        <button className="btn btn-secondary" style={{ height: 44 }}>+ {t.latepay}</button>
        <button className="btn btn-secondary" style={{ height: 44 }}>+ {t.multa}</button>
      </div>

      {/* ledger */}
      <div style={{ padding: '0 20px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="eyebrow">{t.ledger}</div>
        <span className="small">{b.txCount} {t.entries}</span>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <div className="card">
          {HELEN_TX.slice(0, 8).map((tx, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px',
              borderBottom: i === 7 ? 0 : '1px solid var(--border)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: tx.status === 'overdue' ? 'var(--danger-soft)'
                  : tx.status === 'due' ? 'var(--warning-soft)' : 'var(--surface-sunk)',
                color: tx.status === 'overdue' ? 'var(--danger)'
                  : tx.status === 'due' ? 'var(--warning)' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{Icon.out(14)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{tx.who}</span>
                  <span className="money-sm">{fmt(tx.palod)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                  <span className="small">{tx.d} · palod #{HELEN_TX.length + 13 - i}</span>
                  {tx.tag && <span style={{ fontSize: 11, fontWeight: 600,
                    color: tx.status === 'overdue' ? 'var(--danger)' : tx.status === 'due' ? 'var(--warning)' : 'var(--text-3)' }}>{tx.tag}</span>}
                </div>
              </div>
            </div>
          ))}
          <div style={{ padding: '10px 14px', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{t.viewAll} ({b.txCount}) →</span>
          </div>
        </div>
      </div>

      {/* destructive */}
      <div style={{ padding: '0 20px 32px', display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}>{t.close}</button>
        <button className="btn btn-ghost" style={{ flex: 1 }}>{t.archive}</button>
      </div>
    </MobileShell>
  );
}

Object.assign(window, { MobileShell, TodayScreen, BorrowersScreen, BorrowerDetail });
