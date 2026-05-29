// home.jsx — KPI-First dashboard page
// Fetches data from the FastAPI backend (see frontend/src/api.js).
// All visualizations re-render when `brand` or `region` change.

const { useState, useEffect } = React;

function Home() {
  const [brand, setBrand] = useState('Entresto');
  const [region, setRegion] = useState('SoCal');

  const [summary, setSummary] = useState(null);
  const [hcps, setHcps] = useState([]);
  const [cities, setCities] = useState([]);
  const [specMix, setSpecMix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all four endpoints in parallel whenever brand or region changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.territorySummary(brand, region),
      api.topHcps(brand, region, 12),
      api.mapCities(brand),
      api.specialtyMix(brand, region, 7),
    ])
      .then(([s, h, c, m]) => {
        if (cancelled) return;
        setSummary(s); setHcps(h); setCities(c); setSpecMix(m);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [brand, region]);

  const brandObj = BRANDS[brand];
  const subtitle = `${region} · ${brandObj.ta} · As of ${summary?.asOf || '—'}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: DS.surface, fontFamily: DS.font, color: DS.ink }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar active="home"/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar
            brand={brand} region={region}
            onBrandChange={setBrand} onRegionChange={setRegion}
            title="Good morning, Sarah"
            subtitle={subtitle}
          />

          {error && (
            <div style={{ background: DS.negBg, color: DS.negInk, padding: '12px 28px', fontSize: 13, fontFamily: DS.mono }}>
              API error: {error} — is the backend running on :8000?
            </div>
          )}

          <main style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
            <KpiStrip summary={summary} loading={loading}/>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, minHeight: 0 }}>
              <TopHcpsCard hcps={hcps} brand={brand} loading={loading}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
                <MapCard cities={cities} brand={brand} loading={loading}/>
                <SpecialtyMixCard specMix={specMix} brand={brand} loading={loading}/>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
function KpiStrip({ summary, loading }) {
  const kpis = summary ? [
    { label: 'Territory Sales', value: fmtMoney(summary.cost), delta: summary.vsLyCost, sub: 'vs LY' },
    { label: 'Total Rx Claims', value: fmtNum(summary.clms),   delta: summary.vsLyClms, sub: 'vs LY' },
    { label: 'Active HCPs',     value: fmtNum(summary.hcpCount), delta: summary.vsLyHcp, sub: 'vs LY' },
    { label: 'Rising',          value: fmtNum(summary.rising),  sub: '↑ MoM' },
    { label: 'Lapsed',          value: fmtNum(summary.lapsed),  sub: '90+ days' },
    { label: 'Declining',       value: fmtNum(summary.declining), sub: 'requires visit' },
  ] : Array(6).fill({ label: '—', value: '—' });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
      {kpis.map((k, i) => (
        <div key={i} style={{
          background: DS.paper, border: `1px solid ${DS.rule}`, borderRadius: 10,
          opacity: loading ? 0.4 : 1, transition: 'opacity 200ms',
        }}>
          <KPI {...k}/>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
function TopHcpsCard({ hcps, brand, loading }) {
  const brandObj = BRANDS[brand];
  return (
    <Card
      title="Top 12 prescribers"
      subtitle={`By ${brand} sales in your territory · 12 mo.`}
      padding={0}
      action={<span style={{ fontSize: 11, color: DS.ink3, fontFamily: DS.mono, letterSpacing: '0.06em' }}>SORT · SALES ↓</span>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', opacity: loading ? 0.4 : 1, transition: 'opacity 200ms' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1.7fr 1fr 0.7fr 0.7fr 90px 0.8fr', padding: '10px 20px', borderBottom: `1px solid ${DS.rule}`, fontSize: 10, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <span></span><span>HCP</span><span>Specialty / City</span>
          <span style={{textAlign:'right'}}>Sales</span>
          <span style={{textAlign:'right'}}>Claims</span>
          <span style={{textAlign:'center'}}>Trend</span>
          <span style={{textAlign:'right'}}>MoM</span>
        </div>
        {hcps.map((h, i) => (
          <div key={h.npi} style={{
            display: 'grid', gridTemplateColumns: '28px 1.7fr 1fr 0.7fr 0.7fr 90px 0.8fr',
            padding: '10px 20px',
            borderBottom: i === hcps.length - 1 ? 'none' : `1px solid ${DS.ruleSoft}`,
            alignItems: 'center', fontSize: 12.5,
          }}>
            <span style={{ fontFamily: DS.mono, fontSize: 10, color: DS.ink4 }}>{String(i+1).padStart(2,'0')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 13,
                background: brandObj.tintBg, color: brandObj.tintInk,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>
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
        {hcps.length === 0 && !loading && (
          <div style={{ padding: 24, textAlign: 'center', color: DS.ink3, fontSize: 12 }}>No HCPs in this region.</div>
        )}
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
function MapCard({ cities, brand, loading }) {
  const brandObj = BRANDS[brand];
  return (
    <Card title="Territory map" subtitle={`Cities by ${brand} sales · circle area = $`} padding={16} style={{ flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', opacity: loading ? 0.4 : 1, transition: 'opacity 200ms' }}>
        <CAMap
          width={400} height={300}
          cities={cities.slice(0, 120)}
          brand={brand}
          metric={brand}
          minDotR={2.5} maxDotR={16}
          showLabels={false}
        />
      </div>
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: DS.mono, color: DS.ink3, letterSpacing: '0.06em' }}>
        <span>{cities.length} CITIES MAPPED</span>
        <span style={{ display: 'inline-flex', gap: 12 }}>
          <span>● $0–500K</span>
          <span style={{ color: brandObj.color }}>● $500K–2M</span>
          <span style={{ color: brandObj.tintInk }}>● $2M+</span>
        </span>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
function SpecialtyMixCard({ specMix, brand, loading }) {
  const brandObj = BRANDS[brand];
  const max = specMix[0]?.cost || 1;
  return (
    <Card title="Specialty mix" subtitle={`${brand} $ by specialty · territory`} padding={20} style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: loading ? 0.4 : 1, transition: 'opacity 200ms' }}>
        {specMix.slice(0, 6).map((s) => {
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
                  <div style={{ height: '100%', width: (pct*100)+'%', background: brandObj.color, opacity: 0.85 }}></div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: DS.mono, fontWeight: 600, fontSize: 11.5 }}>{fmtMoney(s.cost)}</div>
            </div>
          );
        })}
        {specMix.length === 0 && !loading && (
          <div style={{ padding: 12, textAlign: 'center', color: DS.ink3, fontSize: 12 }}>No data.</div>
        )}
      </div>
    </Card>
  );
}

window.Home = Home;
