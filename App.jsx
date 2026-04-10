import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { extractSheetId, isValidSheetId } from '../../data/sheetsAdapter.js'

const s = {
  page:       { padding: 24 },
  title:      { fontSize: 20, fontWeight: 600, color: '#F0F4F8', marginBottom: 4 },
  sub:        { fontSize: 13, color: 'rgba(240,244,248,.55)', marginBottom: 28 },
  section:    { marginBottom: 28 },
  sTitle:     { fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                color: 'rgba(240,244,248,.45)', marginBottom: 12 },
  card:       { background: '#162236', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 10, padding: '16px 20px', marginBottom: 12 },
  label:      { fontSize: 12, fontWeight: 600, color: 'rgba(240,244,248,.6)',
                marginBottom: 6, display: 'block', letterSpacing: '.03em' },
  input:      { width: '100%', padding: '9px 12px', background: '#1C2D45',
                border: '1px solid rgba(255,255,255,.12)', borderRadius: 6,
                color: '#F0F4F8', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box' },
  hint:       { fontSize: 11, color: 'rgba(240,244,248,.35)', marginTop: 5 },
  btnRow:     { display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  btnPrim:    { padding: '9px 20px', background: '#0F1E3A', border: '1px solid rgba(59,130,246,.4)',
                borderRadius: 7, color: '#60A5FA', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit' },
  btnSec:     { padding: '9px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 7, color: 'rgba(240,244,248,.55)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger:  { padding: '9px 20px', background: 'transparent', border: '1px solid rgba(239,68,68,.3)',
                borderRadius: 7, color: '#F87171', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  statusRow:  { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                background: '#1C2D45', borderRadius: 7, marginBottom: 8,
                border: '1px solid rgba(255,255,255,.07)' },
  statusTxt:  { fontSize: 13, color: '#F0F4F8', flex: 1 },
  pill:       { padding: '3px 9px', borderRadius: 10, fontSize: 10, fontWeight: 700, letterSpacing: '.04em' },
  dot:        { width: 7, height: 7, borderRadius: '50%' },
  stepNum:    { width: 24, height: 24, borderRadius: '50%', background: '#1C2D45',
                border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#60A5FA',
                flexShrink: 0 },
  stepRow:    { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  stepText:   { fontSize: 13, color: 'rgba(240,244,248,.7)', lineHeight: 1.6, paddingTop: 3 },
  codeBlock:  { background: '#0F1B2D', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6,
                padding: '10px 14px', fontFamily: 'DM Mono, monospace', fontSize: 12,
                color: '#60A5FA', marginTop: 6, wordBreak: 'break-all' },
}

export default function Instellingen() {
  const { sheetUrl, sheetId, status, connect, disconnect, refresh, isConnected, isLoading, error, lastFetch } = useData()
  const [inputUrl, setInputUrl] = useState(sheetUrl || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const previewId = extractSheetId(inputUrl)
  const previewValid = isValidSheetId(previewId)

  const handleConnect = async () => {
    if (!previewValid) return
    setTestResult(null)
    await connect(inputUrl)
  }

  const handleTest = async () => {
    if (!previewValid) return
    setTesting(true)
    setTestResult(null)
    try {
      const url = `https://docs.google.com/spreadsheets/d/${previewId}/gviz/tq?tqx=out:json&sheet=MAANDOVERZICHT&range=A1:A1`
      const res = await fetch(url)
      if (res.ok) {
        const txt = await res.text()
        if (txt.includes('google.visualization')) {
          setTestResult({ ok: true, msg: 'Verbinding geslaagd — MAANDOVERZICHT tab gevonden' })
        } else {
          setTestResult({ ok: false, msg: 'Sheet gevonden maar MAANDOVERZICHT tab niet leesbaar' })
        }
      } else {
        setTestResult({ ok: false, msg: `HTTP ${res.status} — sheet niet bereikbaar of niet publiek` })
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `Netwerkfout: ${e.message}` })
    }
    setTesting(false)
  }

  const statusColor = {
    success:  '#22C55E', fallback: '#E8B84B',
    error:    '#EF4444', loading:  '#60A5FA', idle: '#6B7280',
  }[status] || '#6B7280'

  const statusLabel = {
    success: 'Live — Google Sheets verbonden', fallback: 'Fallback data actief',
    error:   'Verbindingsfout', loading: 'Laden...', idle: 'Niet verbonden',
  }[status] || 'Onbekend'

  return (
    <div style={s.page}>
      <div style={s.title}>Instellingen</div>
      <div style={s.sub}>Databron configureren · Google Sheets koppeling</div>

      {/* Huidige status */}
      <div style={s.section}>
        <div style={s.sTitle}>Verbindingsstatus</div>
        <div style={s.card}>
          <div style={s.statusRow}>
            <div style={{ ...s.dot, background: statusColor,
              boxShadow: status === 'success' ? `0 0 6px ${statusColor}80` : 'none',
              animation: status === 'loading' ? 'pulse 1s infinite' : status === 'success' ? 'pulse 3s infinite' : 'none',
            }} />
            <span style={s.statusTxt}>{statusLabel}</span>
            {isConnected && (
              <span style={{ ...s.pill, background: '#0F1E3A', color: '#60A5FA',
                border: '1px solid rgba(59,130,246,.25)' }}>
                Sheets
              </span>
            )}
            {!isConnected && (
              <span style={{ ...s.pill, background: '#2A2210', color: '#E8B84B',
                border: '1px solid rgba(232,184,75,.25)' }}>
                Fallback
              </span>
            )}
          </div>

          {isConnected && (
            <>
              <div style={{ display: 'flex', gap: 16, fontSize: 12,
                color: 'rgba(240,244,248,.5)', marginBottom: 6 }}>
                <span>Sheet ID: <span style={{ color: '#60A5FA', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                  {sheetId.slice(0, 20)}…
                </span></span>
                {lastFetch && <span>Laatste sync: {lastFetch.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
              </div>
              {error && (
                <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,.08)',
                  border: '1px solid rgba(239,68,68,.2)', borderRadius: 6,
                  fontSize: 12, color: '#F87171', marginTop: 8 }}>
                  ⚠ {error}
                </div>
              )}
              <div style={s.btnRow}>
                <button style={s.btnPrim} onClick={refresh} disabled={isLoading}>
                  {isLoading ? 'Laden...' : '↻ Nu vernieuwen'}
                </button>
                <button style={s.btnDanger} onClick={disconnect}>
                  Ontkoppelen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sheet URL invoer */}
      <div style={s.section}>
        <div style={s.sTitle}>Google Sheets koppelen</div>
        <div style={s.card}>
          <label style={s.label}>Google Sheets URL of Sheet ID</label>
          <input
            style={s.input}
            type="text"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={inputUrl}
            onChange={e => { setInputUrl(e.target.value); setTestResult(null) }}
            spellCheck={false}
          />
          <div style={s.hint}>
            Plak de volledige URL van je Google Sheet, of alleen het Sheet ID.
          </div>

          {inputUrl && !previewValid && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#F87171' }}>
              ✗ Geen geldig Sheet ID herkend in deze URL
            </div>
          )}
          {previewValid && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#4ADE80' }}>
              ✓ Sheet ID herkend: <span style={{ fontFamily: 'DM Mono, monospace', color: '#60A5FA' }}>{previewId}</span>
            </div>
          )}

          {testResult && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6,
              background: testResult.ok ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
              border: `1px solid ${testResult.ok ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
              fontSize: 12, color: testResult.ok ? '#4ADE80' : '#F87171' }}>
              {testResult.ok ? '✓' : '✗'} {testResult.msg}
            </div>
          )}

          <div style={s.btnRow}>
            <button style={{ ...s.btnPrim, opacity: previewValid ? 1 : .4 }}
              onClick={handleTest} disabled={!previewValid || testing}>
              {testing ? 'Testen...' : 'Verbinding testen'}
            </button>
            <button style={{ ...s.btnPrim, background: '#0A2014', borderColor: 'rgba(34,197,94,.4)',
              color: '#4ADE80', opacity: previewValid ? 1 : .4 }}
              onClick={handleConnect} disabled={!previewValid || isLoading}>
              {isLoading ? 'Verbinden...' : 'Verbinden & laden'}
            </button>
            {inputUrl && (
              <button style={s.btnSec} onClick={() => { setInputUrl(''); setTestResult(null) }}>
                Wissen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instructies */}
      <div style={s.section}>
        <div style={s.sTitle}>Hoe de koppeling instellen</div>
        <div style={s.card}>
          {[
            ['1', 'Open je forecasttool in Google Sheets (of upload het Excel-bestand naar Drive)'],
            ['2', 'Klik op Delen → Iedereen met de link → instellen op "Viewer"'],
            ['3', 'Kopieer de URL uit de adresbalk van Google Sheets'],
            ['4', 'Plak de URL hierboven en klik op "Verbinden & laden"'],
            ['5', 'Het dashboard laadt automatisch de MAANDOVERZICHT tab. Data vernieuwt elke 5 minuten.'],
          ].map(([num, text]) => (
            <div key={num} style={s.stepRow}>
              <div style={s.stepNum}>{num}</div>
              <div style={s.stepText}>{text}</div>
            </div>
          ))}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ ...s.label, marginBottom: 8 }}>Vereiste tab in Google Sheets:</div>
            <div style={s.codeBlock}>MAANDOVERZICHT</div>
            <div style={{ ...s.hint, marginTop: 8 }}>
              Het dashboard leest rijen 4–55 en kolommen C–O (JAN t/m DEC + JAAR totaal)
              uit de MAANDOVERZICHT tab van de forecasttool v14+.
            </div>
          </div>
        </div>
      </div>

      {/* Tab-overzicht */}
      <div style={s.section}>
        <div style={s.sTitle}>Verwachte tabbladen in de sheet</div>
        <div style={s.card}>
          {[
            ['MAANDOVERZICHT', 'Primaire databron — alle KPIs per maand', true],
            ['KPI_DASHBOARD', 'Optioneel — KPI samenvattingen', false],
            ['PARK_CONSOLIDATIE', 'Optioneel — outlet uitsplitsing', false],
            ['FC_Brasserie', 'Optioneel — dagforecast outlet', false],
          ].map(([tab, desc, required]) => (
            <div key={tab} style={{ display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#60A5FA',
                minWidth: 160, flexShrink: 0 }}>
                {tab}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(240,244,248,.55)', flex: 1 }}>{desc}</span>
              <span style={{ ...s.pill,
                background: required ? '#0F1E3A' : 'rgba(255,255,255,.04)',
                color: required ? '#60A5FA' : 'rgba(240,244,248,.3)',
                border: `1px solid ${required ? 'rgba(59,130,246,.2)' : 'rgba(255,255,255,.06)'}`,
              }}>
                {required ? 'Vereist' : 'Optioneel'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
