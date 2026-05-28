// HOME · Option 1 — KPI-FIRST
// Big numbers grid up top, HCP table + mini map + top movers below.

function HomeKpiFirst() {
  const d = window.DASH;
  const t = d.territory;
  const brand = BRANDS.Entresto;

  // 6 KPIs derived from territory
  const kpis = [
    { label: 'Territory Sales', value: fmtMoney(t.cost), delta: t.vsLyCost, sub: 'vs LY' },
    { label: 'Total Rx Claims', value: fmtNum(t.clms), delta: t.vsLyClms, sub: 'vs LY' },
    { label: 'Active HCPs', value: fmtNum(t.hcpCount), delta: t.vsLyHcp, sub: 'vs LY' },
    { label: 'Rising', value: fmtNum(t.rising), sub: '↑ MoM', tone: 'rising' },
    { label: 'Lapsed', value: fmtNum(t.lapsed), sub: '90+ days', tone: 'lapsed' },
    { label: 'Declining', value: fmtNum(t.declining), sub: 'requires visit', tone: 'declining' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: DS.surface, fontFamily: DS.font, color: DS.ink }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar active="home"/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar brand="Entresto" title="Good morning, Sarah" subtitle="SoCal Cardiovascular · As of Dec 31, 2025"/>
          <main style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
              {kpis.map(k => (
                <div key={k.label} style={{ background: DS.paper, border: `1px solid ${DS.rule}`, borderRadius: 10 }}>
                  <KPI {...k}/>
                </div>
              ))}
            </div>

            {/* Main row */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, minHeight: 0 }}>

              {/* Top HCPs table */}
              <Card title="Top 12 prescribers" subtitle="By Entresto sales in your territory · 12 mo." padding={0}
                action={<span style={{ fontSize: 11, color: DS.ink3, fontFamily: DS.mono, letterSpacing: '0.06em' }}>SORT · SALES ↓</span>}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Table head */}
                  <div style={{ display: 'grid', gridTemplateColumns: '28px 1.7fr 1fr 0.7fr 0.7fr 90px 0.8fr', padding: '10px 20px', borderBottom: `1px solid ${DS.rule}`, fontSize: 10, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    <span></span><span>HCP</span><span>Specialty / City</span><span style={{textAlign:'right'}}>Sales</span><span style={{textAlign:'right'}}>Claims</span><span style={{textAlign:'center'}}>Trend</span><span style={{textAlign:'right'}}>MoM</span>
                  </div>
                  {/* Rows */}
                  {d.top20.slice(0, 12).map((h, i) => (
                    <div key={h.npi} style={{ display: 'grid', gridTemplateColumns: '28px 1.7fr 1fr 0.7fr 0.7fr 90px 0.8fr', padding: '10px 20px', borderBottom: i === 11 ? 'none' : `1px solid ${DS.ruleSoft}`, alignItems: 'center', fontSize: 12.5 }}>
                      <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.ink4 }}>{String(i+1).padStart(2,'0')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 13, background: brand.tintBg, color: brand.tintInk, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                          {h.name.replace('Dr. ','').split(' ').map(w=>w[0]).slice(0,2).join('')}
                        </span>
                        <span style={{ fontWeight: 600, color: DS.ink }}>{h.name}</span>
                      </span>
                      <span style={{ color: DS.ink2 }}>
                        <div style={{ fontSize: 12 }}>{h.specialty.length > 22 ? h.specialty.slice(0,20)+'…' : h.specialty}</div>
                        <div style={{ fontSize: 10.5, color: DS.ink3 }}>{h.city}</div>
                      </span>
                      <span style={{ textAlign:'right', fontVariantNumeric: 'tabular-nums', fontFamily: DS.mono, fontWeight: 600 }}>{fmtMoney(h.cost)}</span>
                      <span style={{ textAlign:'right', fontVariantNumeric: 'tabular-nums', fontFamily: DS.mono, color: DS.ink2 }}>{h.clms}</span>
                      <span style={{ textAlign:'center', display: 'flex', justifyContent: 'center' }}>
                        <Spark values={sparkFromMom(h.mom, i*3)} color={h.mom >= 0 ? DS.posInk : DS.negInk} width={70} height={20}/>
                      </span>
                      <span style={{ textAlign:'right' }}><Delta value={h.mom} suffix="%"/></span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Right column: mini map + specialty mix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>

                <Card title="Territory map" subtitle="Cities by Entresto sales · circle area = $" padding={16} style={{ flex: 1, minHeight: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CAMap width={400} height={300} cities={d.fullMap} brand="Entresto" metric="entresto" minDotR={2.5} maxDotR={16} showLabels={false}/>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.06em' }}>
                    <span>120 CITIES MAPPED</span>
                    <span style={{ display: 'inline-flex', gap: 12 }}>
                      <span>● $0–500K</span><span style={{color: brand.color}}>● $500K–2M</span><span style={{color: brand.tintInk}}>● $2M+</span>
                    </span>
                  </div>
                </Card>

                <Card title="Specialty mix" subtitle="Entresto $ by specialty · territory" padding={20} style={{ flexShrink: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {d.specMix.slice(0,6).map((s, i) => {
                      const max = d.specMix[0].cost;
                      const pct = s.cost / max;
                      return (
                        <div key={s.specialty} style={{ display: 'grid', gridTemplateColumns: '1fr 70px', alignItems: 'center', gap: 10, fontSize: 11.5 }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: DS.ink, fontWeight: 500 }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.specialty.length > 30 ? s.specialty.slice(0,28)+'…' : s.specialty}
                              </span>
                              <span style={{ color: DS.ink3, fontFamily: DS.mono, fontSize: 10.5 }}>{s.hcps} HCPs</span>
                            </div>
                            <div style={{ height: 5, background: DS.surface2, borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: (pct*100)+'%', background: brand.color, opacity: 0.85 }}></div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontFamily: DS.mono, fontWeight: 600, fontSize: 11.5 }}>{fmtMoney(s.cost)}</div>
                        </div>
                      );
                    })}
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

window.HomeKpiFirst = HomeKpiFirst;
