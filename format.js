// ═══════════════════════════════════════════════════════════════
// FORMAT UTILS — alle getal/valuta/percentage opmaak
// ═══════════════════════════════════════════════════════════════

export function fmtEur(val, decimals = 0) {
  if (val == null || isNaN(val)) return '—'
  return '€\u00a0' + Math.round(val).toLocaleString('nl-NL', { maximumFractionDigits: decimals })
}

export function fmtEurK(val) {
  if (val == null || isNaN(val)) return '—'
  if (Math.abs(val) >= 1_000_000) return '€\u00a0' + (val / 1_000_000).toFixed(2).replace('.', ',') + 'M'
  if (Math.abs(val) >= 1_000)     return '€\u00a0' + (val / 1_000).toFixed(1).replace('.', ',') + 'K'
  return fmtEur(val)
}

export function fmtPct(val, decimals = 1) {
  if (val == null || isNaN(val)) return '—'
  const pct = val > 1 ? val : val * 100
  return pct.toFixed(decimals).replace('.', ',') + '%'
}

export function fmtNum(val, decimals = 0) {
  if (val == null || isNaN(val)) return '—'
  return Math.round(val).toLocaleString('nl-NL')
}

export function fmtEur2(val) {
  if (val == null || isNaN(val)) return '—'
  return '€\u00a0' + val.toFixed(2).replace('.', ',')
}

export function fmtDelta(val, fmt = 'pct') {
  if (val == null || isNaN(val)) return { label: '—', sign: 0 }
  const sign = val > 0.001 ? 1 : val < -0.001 ? -1 : 0
  const prefix = sign > 0 ? '+' : ''
  let label = ''
  if (fmt === 'pct')   label = prefix + (val * 100).toFixed(1).replace('.', ',') + '%'
  if (fmt === 'eur')   label = prefix + fmtEur(val)
  if (fmt === 'pp')    label = prefix + (val * 100).toFixed(1).replace('.', ',') + 'pp'
  if (fmt === 'raw')   label = prefix + val.toFixed(1).replace('.', ',')
  return { label, sign }
}

export function calcDelta(actual, reference) {
  if (!reference || reference === 0) return null
  return (actual - reference) / Math.abs(reference)
}
