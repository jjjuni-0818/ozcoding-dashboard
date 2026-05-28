// HOME · Option 2 — TASK-FIRST
// "Today's recommended visits" queue is the hero. Right column = context.

function HomeTaskFirst() {
  const d = window.DASH;
  const t = d.territory;
  const brand = BRANDS.Entresto;

  // Why-this-HCP explanations by tag
  const reasonFor = (h) => {
    if (h.tag === 'rising') return `Rx 매출 ${h.mom}% ↑ over past 30d · 디테일링 직후`;
    if (h.tag === 'lapsed') return `${h.daysSinceVisit}일 방문 없음 · 처방 정체`;
    if (h.tag === 'declining') return `Rx 매출 ${Math.abs(h.mom)}% ↓ · 경쟁사 디테일링 가능`;
    if (h.tag === 'whitespace') return `유사 specialty 평균 대비 underperforming · 잠재 ${h.potential}점`;
    return '';
  };

  // Mini KPI for header strip
  const miniKpis = [
    { label: 'Today', value: '5', sub: '추천 방문' },
    { label: 'Pending', value: '12', sub: 'plan 완료' },
    { label: 'Lapsed', value: fmtNum(t.lapsed), sub: '90d+' },
    { label: 'Rising', value: fmtNum(t.rising), sub: 'MoM ↑' },
  ];

  // Activity feed (synthetic, derived from data)
  const activity = [
    { t: '08:22', kind: 'lapsed', text: `Dr. Nassir Azimi · 145일 미방문`, city: 'La Mesa' },
    { t: 'Yesterday', kind: 'rising', text: `Dr. Don Lee · Rx +32% MoM`, city: 'Glendale' },
    { t: 'Yesterday', kind: 'new', text: `Dr. Mina Park · 첫 Entresto 처방`, city: 'Irvine' },
    { t: '2d ago', kind: 'declining', text: `Dr. Mayer Rashtian · Rx −33%`, city: 'Pasadena' },
    { t: '2d ago', kind: 'sample', text: `Sample request · Dr. Tariq`, city: 'El Centro' },
    { t: '3d ago', kind: 'rising', text: `Dr. Mesrobian · Rx +36%`, city: 'Glendale' },
  ];

  const kindMap = {
    lapsed: { color: DS.warnInk, bg: DS.warnBg, label: 'LAPSED' },
    rising: { color: DS.posInk, bg: DS.posBg, label: 'RISING' },
    declining: { color: DS.negInk, bg: DS.negBg, label: 'DECLINING' },
    new: { color: brand.tintInk, bg: brand.tintBg, label: 'NEW Rx' },
    sample: { color: '#5c5c66', bg: DS.surface2, label: 'SAMPLE' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: DS.surface, fontFamily: DS.font, color: DS.ink }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar active="home"/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar brand="Entresto" title="Today's plan" subtitle="Wednesday · Dec 31, 2025 · 5 visits queued"/>
          <main style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>

            {/* Header strip — mini metrics with action */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {miniKpis.map(k => (
                  <div key={k.label} style={{ background: DS.paper, border: `1px solid ${DS.rule}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: DS.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{k.value}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: DS.ink }}>{k.label}</div>
                      <div style={{ fontSize: 10, color: DS.ink3, fontFamily: DS.mono, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{k.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: brand.color, color: '#fff', borderRadius: 10, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8, fontFamily: DS.mono, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Start your day</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Open route planner →</div>
                </div>
              </div>
            </div>

            {/* Main split: queue + context */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, minHeight: 0 }}>

              {/* Visit queue */}
              <Card title="Recommended visits · today" subtitle="우선순위 기반 5명 · 클릭 시 360° 프로필 진입"
                action={<span style={{ fontSize: 11, color: brand.color, fontWeight: 600, fontFamily: DS.font }}>View all 18 →</span>}
                padding={0} style={{ minHeight: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {d.suggestedTargets.map((h, i) => {
                    const initials = h.name.replace('Dr. ','').split(' ').map(w=>w[0]).slice(0,2).join('');
                    return (
                      <div key={h.npi} style={{ padding: '16px 20px', borderBottom: i === d.suggestedTargets.length - 1 ? 'none' : `1px solid ${DS.ruleSoft}`, display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 14, alignItems: 'start' }}>
                        {/* avatar */}
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: brand.tintBg, color: brand.tintInk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{initials}</div>
                        {/* main */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{h.name}</span>
                            <span style={{ fontSize: 11, color: DS.ink3 }}>· {h.specialty} · {h.city}</span>
                            <span style={{ marginLeft: 'auto' }}><TargetTag tag={h.tag}/></span>
                          </div>
                          <div style={{ fontSize: 12, color: DS.ink2, marginBottom: 8 }}>{reasonFor(h)}</div>
                          {/* mini stat row */}
                          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>SALES 12MO</div>
                              <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: DS.mono }}>{fmtMoney(h.cost)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>CLAIMS</div>
                              <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: DS.mono }}>{h.clms}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>LAST VISIT</div>
                              <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: DS.mono, color: h.daysSinceVisit > 100 ? DS.warnInk : DS.ink }}>{h.daysSinceVisit}d</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <Spark values={sparkFromMom(h.mom, i*7)} color={h.mom >= 0 ? DS.posInk : DS.negInk} width={120} height={28}/>
                            </div>
                          </div>
                        </div>
                        {/* actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <button style={{ background: DS.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 11, fontWeight: 600, fontFamily: DS.font, cursor: 'pointer' }}>Plan visit</button>
                          <button style={{ background: DS.paper, color: DS.ink2, border: `1px solid ${DS.rule}`, borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 500, fontFamily: DS.font, cursor: 'pointer' }}>Skip</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Right column: activity feed + mini map */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>

                <Card title="Activity feed" subtitle="최근 7일 territory 이벤트" padding={0} style={{ flex: 1, minHeight: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {activity.map((a, i) => {
                      const k = kindMap[a.kind];
                      return (
                        <div key={i} style={{ padding: '11px 18px', borderBottom: i === activity.length - 1 ? 'none' : `1px solid ${DS.ruleSoft}`, display: 'grid', gridTemplateColumns: '70px 1fr', gap: 12, alignItems: 'center', fontSize: 12 }}>
                          <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.ink3 }}>{a.t}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 100, background: k.bg, color: k.color, fontFamily: DS.mono, letterSpacing: '0.06em', fontWeight: 600 }}>{k.label}</span>
                              <span style={{ fontSize: 10, color: DS.ink3 }}>· {a.city}</span>
                            </div>
                            <div style={{ color: DS.ink, fontSize: 12 }}>{a.text}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card title="Territory snapshot" padding={16} style={{ flexShrink: 0 }}>
                  <CAMap width={420} height={170} cities={d.socalCityRanked.slice(0,20).map(c => ({ city:c.city, region:'SoCal', coords:d.fullMap.find(m=>m.city===c.city)?.coords || [34,-118], entresto: c.cost }))} brand="Entresto" minDotR={3} maxDotR={14} showRegions={false} showLabels={false}/>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: DS.ink3 }}>
                    <span>{d.socalCityRanked.length} cities · SoCal</span>
                    <span style={{ color: brand.color, fontWeight: 600 }}>Explore map →</span>
                  </div>
                </Card>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

window.HomeTaskFirst = HomeTaskFirst;
