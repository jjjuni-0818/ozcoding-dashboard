// HOME · Option 3 — MAP-FIRST
// Large CA city heatmap dominates. Right panel = drill-in details.

function HomeMapFirst() {
  const d = window.DASH;
  const t = d.territory;
  const brand = BRANDS.Entresto;
  const focusCity = 'Los Angeles'; // mocked "selected" city
  const focus = d.fullMap.find(c => c.city === focusCity);

  // HCPs in focus city
  const focusHcps = d.top20.filter(h => h.city === focusCity).slice(0, 5);

  // Region toggle pills (mock)
  const regions = ['All', 'SoCal', 'Central', 'NorCal'];
  const activeRegion = 'SoCal';

  const headerKpis = [
    { label: 'Sales', value: fmtMoney(t.cost), delta: t.vsLyCost },
    { label: 'Claims', value: fmtNum(t.clms), delta: t.vsLyClms },
    { label: 'HCPs', value: fmtNum(t.hcpCount), delta: t.vsLyHcp },
    { label: 'Cities', value: '120', delta: null },
  ];

  // Filter map cities by region selection (mock — show all)
  const mapCities = d.fullMap.slice(0, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: DS.surface, fontFamily: DS.font, color: DS.ink }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar active="home"/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar brand="Entresto" title="Territory map" subtitle="SoCal · Cardiovascular · Dec 31, 2025"/>
          <main style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>

            {/* Header KPI strip — slim */}
            <div style={{ display: 'flex', gap: 12 }}>
              {headerKpis.map(k => (
                <div key={k.label} style={{ flex: 1, background: DS.paper, border: `1px solid ${DS.rule}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <div style={{ fontSize: 11, color: DS.ink3, fontFamily: DS.mono, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: DS.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', marginLeft: 'auto' }}>{k.value}</div>
                  {k.delta != null && <Delta value={k.delta}/>}
                </div>
              ))}
              {/* Toggle: metric */}
              <div style={{ display: 'flex', background: DS.paper, border: `1px solid ${DS.rule}`, borderRadius: 10, padding: 3, gap: 2 }}>
                {['Sales','Claims','HCPs'].map((m,i) => (
                  <div key={m} style={{
                    padding: '7px 14px', fontSize: 11, fontWeight: 600, borderRadius: 7,
                    background: i === 0 ? brand.tintBg : 'transparent',
                    color: i === 0 ? brand.tintInk : DS.ink3,
                  }}>{m}</div>
                ))}
              </div>
            </div>

            {/* Main row */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, minHeight: 0 }}>

              {/* Big map */}
              <Card padding={0} style={{ overflow: 'hidden' }}>
                {/* Map toolbar */}
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${DS.rule}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DS.ink }}>California prescriber map</div>
                    <div style={{ fontSize: 11, color: DS.ink3 }}>circle area = Entresto sales · click city to drill in</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', background: DS.surface2, padding: 3, borderRadius: 7 }}>
                    {regions.map(r => (
                      <div key={r} style={{
                        padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 5,
                        background: r === activeRegion ? DS.paper : 'transparent',
                        color: r === activeRegion ? DS.ink : DS.ink3,
                        boxShadow: r === activeRegion ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      }}>{r}</div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 18, display: 'flex', justifyContent: 'center', flex: 1, minHeight: 0 }}>
                  <CAMap width={620} height={580} cities={mapCities} brand="Entresto" metric="entresto" highlightCity={focusCity} minDotR={3.5} maxDotR={28} showLabels={true}/>
                </div>
              </Card>

              {/* Right detail stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>

                {/* Focus city card */}
                <Card padding={20} style={{ borderColor: brand.color, borderWidth: 1, boxShadow: `inset 4px 0 0 ${brand.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: DS.mono, color: brand.color, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>SELECTED</span>
                    <Chip tone="brand">SoCal</Chip>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: DS.ink }}>{focus.city}</h3>
                    <span style={{ fontSize: 11, color: DS.ink3 }}>· #1 city by Entresto sales</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Entresto $</div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: DS.mono, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(focus.entresto)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Claims</div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: DS.mono, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(focus.clms)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>HCPs</div>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: DS.mono, fontVariantNumeric: 'tabular-nums' }}>{focus.prescribers}</div>
                    </div>
                  </div>

                  {/* Brand mix bar */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 10, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Portfolio mix · this city</div>
                    <div style={{ height: 12, display: 'flex', borderRadius: 6, overflow: 'hidden', background: DS.surface2 }}>
                      <div style={{ flex: focus.entresto, background: BRANDS.Entresto.color }}></div>
                      <div style={{ flex: focus.cosentyx, background: BRANDS.Cosentyx.color }}></div>
                      <div style={{ flex: focus.lucentis || 0.0001, background: BRANDS.Lucentis.color }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: DS.ink2, fontFamily: DS.mono }}>
                      <span><span style={{ color: BRANDS.Entresto.color }}>●</span> Entresto {Math.round(focus.entresto/(focus.entresto+focus.cosentyx+focus.lucentis)*100)}%</span>
                      <span><span style={{ color: BRANDS.Cosentyx.color }}>●</span> Cosentyx {Math.round(focus.cosentyx/(focus.entresto+focus.cosentyx+focus.lucentis)*100)}%</span>
                      <span><span style={{ color: BRANDS.Lucentis.color }}>●</span> Lucentis 0%</span>
                    </div>
                  </div>
                </Card>

                {/* Top HCPs in selected city */}
                <Card title={`Top HCPs in ${focusCity}`} subtitle="Entresto · 12mo" padding={0} style={{ flex: 1, minHeight: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {focusHcps.map((h, i) => (
                      <div key={h.npi} style={{ padding: '10px 18px', borderBottom: i === focusHcps.length - 1 ? 'none' : `1px solid ${DS.ruleSoft}`, display: 'grid', gridTemplateColumns: '24px 1fr auto auto', gap: 12, alignItems: 'center', fontSize: 12 }}>
                        <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.ink4 }}>{String(i+1).padStart(2,'0')}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: DS.ink }}>{h.name}</div>
                          <div style={{ fontSize: 10.5, color: DS.ink3 }}>{h.specialty}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, fontFamily: DS.mono, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(h.cost)}</div>
                          <Delta value={h.mom} suffix="%"/>
                        </div>
                        <button style={{ background: 'transparent', border: `1px solid ${DS.rule}`, borderRadius: 6, padding: '5px 10px', fontSize: 10.5, fontWeight: 600, color: DS.ink, cursor: 'pointer', fontFamily: DS.font }}>Profile</button>
                      </div>
                    ))}
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

window.HomeMapFirst = HomeMapFirst;
