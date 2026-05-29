// California scatter map — projects lat/lon onto an SVG box.
// Background: subtle horizontal region bands (NorCal / Central / SoCal).
// Dots: sized by cost of the selected brand (`metric` prop).

const CA_BOUNDS = {
  // tight to actual CA extent
  latMin: 32.4, latMax: 42.0,
  lonMin: -124.5, lonMax: -114.0,
};

function projectXY(coords, width, height, pad = 16) {
  const [lat, lon] = coords;
  const x = pad + ((lon - CA_BOUNDS.lonMin) / (CA_BOUNDS.lonMax - CA_BOUNDS.lonMin)) * (width - pad*2);
  const y = pad + (1 - (lat - CA_BOUNDS.latMin) / (CA_BOUNDS.latMax - CA_BOUNDS.latMin)) * (height - pad*2);
  return [x, y];
}

function CAMap({
  width = 520, height = 640,
  cities = [],           // [{ city, region, coords:[lat,lon], entresto, cosentyx, lucentis, prescribers }]
  brand = 'Entresto',
  metric = 'entresto',
  highlightCity = null,
  showLabels = true,
  showRegions = true,
  minDotR = 3, maxDotR = 22,
}) {
  const values = cities.map(c => c[metric] || 0);
  const maxV = Math.max(...values, 1);
  const brandColor = BRANDS[brand]?.color || DS.ink;
  const brandTintBg = BRANDS[brand]?.tintBg || DS.surface2;

  // Region bands (latitude split): NorCal > 38.5, Central 35.5–38.5, SoCal < 35.5
  // Convert lat to y
  const yFor = (lat) => projectXY([lat, CA_BOUNDS.lonMin], width, height)[1];
  const yNorCalSoC = yFor(38.5);
  const yCentralSoC = yFor(35.5);

  return (
    <svg width={width} height={height} style={{ display: 'block', background: DS.surface, borderRadius: 12 }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 L0 0 0 40" fill="none" stroke={DS.rule} strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#grid)"/>

      {showRegions && (
        <g>
          <rect x="0" y="0" width={width} height={yNorCalSoC} fill={brandColor} opacity="0.025"/>
          <rect x="0" y={yNorCalSoC} width={width} height={yCentralSoC - yNorCalSoC} fill={brandColor} opacity="0.015"/>
          <rect x="0" y={yCentralSoC} width={width} height={height - yCentralSoC} fill={brandColor} opacity="0.05"/>
          <line x1="0" y1={yNorCalSoC} x2={width} y2={yNorCalSoC} stroke={DS.rule} strokeWidth="0.5" strokeDasharray="2 4"/>
          <line x1="0" y1={yCentralSoC} x2={width} y2={yCentralSoC} stroke={DS.rule} strokeWidth="0.5" strokeDasharray="2 4"/>

          <text x={width - 12} y={yNorCalSoC/2 + 4} textAnchor="end" fontSize="10" fontFamily={DS.mono} fill={DS.ink3} letterSpacing="0.06em">NORCAL</text>
          <text x={width - 12} y={(yNorCalSoC + yCentralSoC)/2 + 4} textAnchor="end" fontSize="10" fontFamily={DS.mono} fill={DS.ink3} letterSpacing="0.06em">CENTRAL</text>
          <text x={width - 12} y={(yCentralSoC + height)/2 + 4} textAnchor="end" fontSize="10" fontFamily={DS.mono} fill={DS.ink3} letterSpacing="0.06em">SOCAL</text>
        </g>
      )}

      {/* City dots */}
      {cities.map((c, i) => {
        const [x, y] = projectXY(c.coords, width, height);
        const v = c[metric] || 0;
        const r = minDotR + (Math.sqrt(v/maxV)) * (maxDotR - minDotR);
        const isHighlight = c.city === highlightCity;
        return (
          <g key={c.city + i}>
            <circle cx={x} cy={y} r={r} fill={brandColor} fillOpacity={isHighlight ? 0.55 : 0.32} stroke={brandColor} strokeOpacity={isHighlight ? 1 : 0.5} strokeWidth={isHighlight ? 1.5 : 0.8}/>
            {isHighlight && <circle cx={x} cy={y} r={r + 5} fill="none" stroke={brandColor} strokeWidth="1" strokeDasharray="2 3"/>}
          </g>
        );
      })}

      {/* Top city labels */}
      {showLabels && cities.slice(0, 8).map((c, i) => {
        const [x, y] = projectXY(c.coords, width, height);
        return (
          <text key={'l'+c.city+i} x={x + 10} y={y + 3} fontSize="10" fontFamily={DS.font} fill={DS.ink2} fontWeight="600">{c.city}</text>
        );
      })}
    </svg>
  );
}

Object.assign(window, { CAMap, projectXY, CA_BOUNDS });
