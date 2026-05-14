// screens-extra.jsx — Money, Settings, Add-Bayad sheet, Desktop

// ─── Money / inventory ───
function MoneyScreen({ t }) {
  const totalAssets = CAPITAL.puhunan + CAPITAL.thanAccrued; // base
  const segs = [
    { v: CAPITAL.lentOut, color: 'var(--accent)' },
    { v: CAPITAL.cashOnHand, color: 'var(--success)' },
  ];
  const items = [
    { k: 'puhunan',  l: t.totalPuhunan, v: CAPITAL.puhunan, sub: t.startingCapital, tone: 'text' },
    { k: 'lent',     l: t.lentOut,      v: CAPITAL.lentOut, sub: `${CAPITAL.borrowerCount} ${t.borrowersLower}`, tone: 'accent' },
    { k: 'thn',      l: t.thanCollected,v: CAPITAL.collected, sub: t.nakulha, tone: 'success' },
    { k: 'owed',     l: t.unrealized,   v: CAPITAL.owed, sub: t.uncollected, tone: 'warning' },
    { k: 'cash',     l: t.cashOnHand,   v: CAPITAL.cashOnHand, sub: t.idle, tone: 'text' },
  ];
  return (
    <MobileShell tab="money" t={t}>
      <div style={{ padding: '8px 20px 16px' }}>
        <div className="h1" style={{ marginBottom: 4 }}>{t.money}</div>
        <div className="small">{t.asOf} Thu, May 14 · {t.asOfTime}</div>
      </div>

      {/* hero */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>{t.capitalAtWork}</div>
          <div className="money-hero accent" style={{ marginBottom: 18 }}>{fmt(CAPITAL.lentOut)}</div>
          <DeploymentBar segments={segs} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--accent)' }} />
              <span className="small">{t.lent}</span>
              <span className="money-sm">{fmt(CAPITAL.lentOut)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--success)' }} />
              <span className="small">{t.cash}</span>
              <span className="money-sm">{fmt(CAPITAL.cashOnHand)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* breakdown */}
      <div style={{ padding: '0 20px 8px' }} className="eyebrow">{t.breakdown}</div>
      <div style={{ padding: '0 20px 24px' }}>
        <div className="card">
          {items.map((it, i) => (
            <div key={it.k} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12,
              borderBottom: i === items.length - 1 ? 0 : '1px solid var(--border)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{it.l}</div>
                <div className="small">{it.sub}</div>
              </div>
              <div className="money" style={{ fontSize: 15, color: `var(--${it.tone})` }}>{fmt(it.v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* equations / reconcile */}
      <div style={{ padding: '0 20px 8px' }} className="eyebrow">{t.reconcile}</div>
      <div style={{ padding: '0 20px 32px' }}>
        <div className="card" style={{ padding: 16, gap: 10, display: 'flex', flexDirection: 'column' }}>
          <Recline label={t.puhunan} value={CAPITAL.puhunan} sign="" />
          <Recline label={'− ' + t.lent} value={-CAPITAL.lentOut} />
          <Recline label={'+ ' + t.thanCollected} value={CAPITAL.collected} sign="+" />
          <div className="divider" />
          <Recline label={t.cashAvailable} value={CAPITAL.puhunan - CAPITAL.lentOut + CAPITAL.collected} bold />
        </div>
      </div>

      {/* multa */}
      <div style={{ padding: '0 20px 32px' }}>
        <div className="card" style={{
          padding: 14, display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--warning-soft)', borderColor: 'transparent',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: 'var(--warning)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.warn(18)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning)' }}>{t.multaPending}</div>
            <div className="small" style={{ color: 'var(--warning)', opacity: 0.85 }}>{t.notYetPosted}</div>
          </div>
          <div className="money" style={{ fontSize: 16, color: 'var(--warning)' }}>+{fmt(CAPITAL.multaPending)}</div>
        </div>
      </div>
    </MobileShell>
  );
}

function Recline({ label, value, sign, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: bold ? 'var(--text)' : 'var(--text-2)', fontWeight: bold ? 600 : 500 }}>{label}</span>
      <span className="money" style={{
        fontSize: bold ? 18 : 14,
        color: value < 0 ? 'var(--danger)' : (sign === '+' ? 'var(--success)' : 'var(--text)'),
      }}>{sign === '+' && value > 0 ? '+' : ''}{fmt(value)}</span>
    </div>
  );
}

// ─── Settings ───
function SettingsScreen({ t, settings, setS }) {
  return (
    <MobileShell tab="settings" t={t}>
      <div style={{ padding: '8px 20px 20px' }}>
        <div className="h1">{t.settings}</div>
      </div>

      {/* THAN rate */}
      <div style={{ padding: '0 20px 8px' }} className="eyebrow">{t.thanRate}</div>
      <div style={{ padding: '0 20px 20px' }}>
        <div className="card" style={{ padding: 16 }}>
          <SettingRow label={t.dailyRate} value="0.5000%" />
          <div className="divider" style={{ margin: '10px 0' }} />
          <SettingRow label={t.totalPuhunan} value="₱500,000.00" />
          <div className="divider" style={{ margin: '10px 0' }} />
          <SettingRow label={t.cashOnHand} value="₱0.00" />
          <div className="divider" style={{ margin: '12px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <RatePeek label={t.daily}   value="0.50%" />
            <RatePeek label={t.weekly}  value="3.50%" />
            <RatePeek label={t.monthly} value="15.0%" />
          </div>
        </div>
      </div>

      {/* preferences */}
      <div style={{ padding: '0 20px 8px' }} className="eyebrow">{t.preferences}</div>
      <div style={{ padding: '0 20px 20px' }}>
        <div className="card">
          <PrefRow label={t.language} value={settings.lang === 'mix' ? 'Bisaya + English' : settings.lang === 'en' ? 'English' : 'Bisaya'} />
          <PrefRow label={t.theme}    value={settings.theme === 'dark' ? t.dark : t.light} />
          <PrefRow label={t.currency} value="₱ Philippine peso" />
          <PrefRow label={t.help}     value={t.gettingStarted} last />
        </div>
      </div>

      {/* danger */}
      <div style={{ padding: '0 20px 32px' }}>
        <button className="btn btn-ghost" style={{ width: '100%', color: 'var(--danger)' }}>{t.signOut}</button>
      </div>
    </MobileShell>
  );
}

function SettingRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{label}</span>
      <span className="money" style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}

function RatePeek({ label, value }) {
  return (
    <div style={{
      background: 'var(--surface-sunk)', borderRadius: 10,
      padding: '10px 12px',
    }}>
      <div className="small" style={{ marginBottom: 2 }}>{label}</div>
      <div className="money accent" style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}

function PrefRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 8,
      borderBottom: last ? 0 : '1px solid var(--border)',
    }}>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{value}</span>
      <span style={{ color: 'var(--text-4)' }}>{Icon.chevron()}</span>
    </div>
  );
}

// ─── Desktop layout ───
function DesktopApp({ t, activeTab = 'today', focus = 'overview' }) {
  return (
    <div className="kfx" style={{
      width: 1280, height: 800,
      display: 'flex', background: 'var(--bg)',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 22px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--text)', color: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, letterSpacing: -0.02,
          }}>K</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>KFX</span>
          <span className="small" style={{ marginLeft: 'auto' }}>v2</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SideItem icon={Icon.home} label={t.today} active={activeTab === 'today'} badge="7" />
          <SideItem icon={Icon.people} label={t.borrowers} active={activeTab === 'borrowers'} badge="6" />
          <SideItem icon={Icon.wallet} label={t.money} active={activeTab === 'money'} />
          <SideItem icon={Icon.gear} label={t.settings} active={activeTab === 'settings'} />
        </div>

        <div className="eyebrow" style={{ padding: '24px 12px 8px' }}>{t.quickActions}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="btn btn-success" style={{ justifyContent: 'flex-start', height: 36 }}>{Icon.in()} + {t.bayad}</button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', height: 36 }}>{Icon.out()} + {t.palod}</button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', height: 36 }}>{Icon.warn()} + {t.multa}</button>
        </div>

        <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ width: 32, height: 32, background: 'var(--accent)', fontSize: 12 }}>K</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Owner</div>
              <div className="small">Thu, May 14, 2026</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        {/* Header strip */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="small" style={{ marginBottom: 4 }}>{t.todayHello}</div>
            <div className="h1" style={{ fontSize: 32 }}>{t.collectionRound}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm">{Icon.filter()} {t.filter}</button>
            <button className="btn btn-primary btn-sm">{Icon.plus(16)} {t.addBorrower}</button>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <KPI label={t.toCollectToday} value={fmt(15731)} tone="accent" delta={`${BORROWERS.filter(b => b.dueToday).length} ${t.borrowersLower}`} />
          <KPI label={t.collectedSoFar} value={fmt(12450)} tone="success" delta="79% of goal" />
          <KPI label={t.multaPending}    value={fmt(CAPITAL.multaPending)} tone="warning" delta={t.notYetPosted} />
          <KPI label={t.cashAvailable}   value={fmt(CAPITAL.puhunan - CAPITAL.lentOut + CAPITAL.collected)} tone={(CAPITAL.puhunan - CAPITAL.lentOut + CAPITAL.collected) < 0 ? 'danger' : 'text'} delta={t.afterDeploy} />
        </div>

        {/* Two-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          {/* Borrower-action table */}
          <div className="card">
            <div style={{
              padding: '14px 18px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
            }}>
              <div className="eyebrow">{t.todaysList}</div>
              <span className="small">{BORROWERS.filter(b => b.overdue || b.dueToday).length} {t.toVisit}</span>
            </div>
            {BORROWERS.filter(b => b.overdue || b.dueToday).map((b, i, arr) => (
              <DeskCollectRow key={b.id} b={b} t={t} last={i === arr.length - 1} />
            ))}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{t.capitalAtWork}</div>
              <div className="money-hero accent" style={{ fontSize: 32, marginBottom: 14 }}>{fmt(CAPITAL.lentOut)}</div>
              <DeploymentBar segments={[
                { v: CAPITAL.lentOut, color: 'var(--accent)' },
                { v: CAPITAL.cashOnHand, color: 'var(--success)' },
              ]} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <span className="small">{t.lent}</span>
                <span className="money-sm">{fmt(CAPITAL.lentOut)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span className="small">{t.cash}</span>
                <span className="money-sm">{fmt(CAPITAL.cashOnHand)}</span>
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{t.thanPerBorrower}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {BORROWERS.slice(0, 4).map(b => {
                  const max = 7000;
                  return (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar b={b} size={24} />
                      <span style={{ fontSize: 13, fontWeight: 500, flex: '0 0 92px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-sunk)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${(b.than / max) * 100}%`, height: '100%', background: b.avatar, borderRadius: 999 }} />
                      </div>
                      <span className="money-sm" style={{ flex: '0 0 60px', textAlign: 'right' }}>{fmt(b.than)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SideItem({ icon, label, active, badge }) {
  return (
    <div className={`sidebar-item ${active ? 'active' : ''}`}>
      {icon(18)}
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span className="pill pill-muted" style={{ height: 18, fontSize: 10 }}>{badge}</span>}
    </div>
  );
}

function KPI({ label, value, tone, delta }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="small" style={{ marginBottom: 6 }}>{label}</div>
      <div className="money-lg" style={{
        fontSize: 26,
        color: tone === 'accent' ? 'var(--accent)'
          : tone === 'success' ? 'var(--success)'
          : tone === 'warning' ? 'var(--warning)'
          : tone === 'danger' ? 'var(--danger)' : 'var(--text)',
        marginBottom: 4,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{delta}</div>
    </div>
  );
}

function DeskCollectRow({ b, t, last }) {
  const due = (b.than || 0) + b.multa;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '36px 1.4fr 1fr 1fr 1fr auto',
      alignItems: 'center', gap: 12,
      padding: '12px 18px',
      borderBottom: last ? 0 : '1px solid var(--border)',
    }}>
      <Avatar b={b} size={32} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {b.overdue > 0 && <Pill tone="danger">{b.overdue} {t.overdue}</Pill>}
          {b.dueToday > 0 && <Pill tone="warning">{b.dueToday} {t.dueToday}</Pill>}
        </div>
      </div>
      <div>
        <div className="small">{t.balance}</div>
        <span className="money" style={{ fontSize: 14 }}>{fmt(b.balance)}</span>
      </div>
      <div>
        <div className="small">{t.thanPerDay}</div>
        <span className="money accent" style={{ fontSize: 14 }}>{fmt(b.than)}</span>
      </div>
      <div>
        <div className="small">{t.dueNow}</div>
        <span className="money" style={{ fontSize: 14 }}>{fmt(due)}</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-success-soft btn-sm" style={{ padding: '0 14px' }}>+ {t.bayad}</button>
        <button className="btn btn-ghost btn-sm">···</button>
      </div>
    </div>
  );
}

// ─── Add-bayad bottom sheet ───
function AddBayadSheet({ t }) {
  const b = BORROWERS[0]; // Helen
  return (
    <div className="kfx" style={{
      width: 390, height: 844, position: 'relative',
      overflow: 'hidden',
      background: 'rgba(20,25,40,0.5)',
    }}>
      {/* dim ghost screen behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--bg)', opacity: 0.85,
        filter: 'blur(1px)',
      }} />
      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--surface)',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 0 32px',
        boxShadow: '0 -20px 50px rgba(0,0,0,.15)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--border-strong)', margin: '0 auto 16px' }} />

        <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar b={b} size={40} />
          <div style={{ flex: 1 }}>
            <div className="h3">{b.name}</div>
            <div className="small">{t.balance}: {fmt(b.balance)} · {fmt(b.than)}/{t.day}</div>
          </div>
        </div>
        <div className="divider" />

        <div style={{ padding: '20px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>+ {t.bayad}</div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 6,
            padding: '14px 16px', background: 'var(--surface-sunk)',
            borderRadius: 14, marginBottom: 12,
          }}>
            <span className="money-hero" style={{ fontSize: 36 }}>₱</span>
            <span className="money-hero" style={{ fontSize: 36, flex: 1 }}>4,181</span>
            <span className="small">{t.suggested}</span>
          </div>

          {/* preset chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {['₱1,000', '₱2,000', '₱4,181 (than)', '₱5,000', t.full].map((p, i) => (
              <div key={i} style={{
                height: 32, padding: '0 12px', borderRadius: 999,
                background: i === 2 ? 'var(--accent-soft)' : 'var(--surface)',
                color: i === 2 ? 'var(--accent)' : 'var(--text-2)',
                border: '1px solid ' + (i === 2 ? 'transparent' : 'var(--border)'),
                display: 'flex', alignItems: 'center',
                fontSize: 13, fontWeight: 600,
              }}>{p}</div>
            ))}
          </div>

          {/* breakdown */}
          <div className="card-flat" style={{ padding: 14, background: 'var(--surface-sunk)', marginBottom: 16 }}>
            <Recline label={t.thanCharged} value={b.than} />
            <div style={{ height: 8 }} />
            <Recline label={'+ ' + t.multa} value={0} sign="+" />
            <div style={{ height: 8 }} />
            <Recline label={'− ' + t.bayad} value={-4181} />
            <div className="divider" style={{ margin: '10px 0' }} />
            <Recline label={t.newBalance} value={b.balance} bold />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }}>{t.cancel}</button>
            <button className="btn btn-success" style={{ flex: 2 }}>{t.recordBayad}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MoneyScreen, SettingsScreen, DesktopApp, AddBayadSheet });
