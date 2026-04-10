// ═══════════════════════════════════════════════════════════════
// GOOGLE SHEETS ADAPTER
// Leest de MAANDOVERZICHT tab uit de forecasttool via Sheets API v4
//
// Hoe het werkt:
// 1. Sheets wordt gepubliceerd als "Anyone with link can view"
// 2. De Sheet ID wordt opgeslagen in localStorage
// 3. Via de gviz JSON API (geen API-key nodig) halen we ranges op
// 4. We parsen de raw values naar het interne datamodel
//
// MAANDOVERZICHT kolomstructuur (na 3-col NL/DE/BE insert in v14+):
//   Col C (3)  = JAN … Col N (14) = DEC   → maandwaarden
//   Col O (15) = JAAR totaal
//
// Rijen (uit MAANDOVERZICHT analyse):
//   R4  = Omzet Budget
//   R5  = Omzet Forecast
//   R6  = Omzet Actueel
//   R7  = FC-Bud €
//   R8  = AC-Bud %
//   R11 = GN Budget
//   R12 = GN Forecast
//   R13 = GN Actueel
//   R16 = GNB Budget
//   R17 = GNB Forecast
//   R18 = GNB Actueel
//   R21 = Uren Budget
//   R22 = Uren Forecast
//   R23 = Uren Actueel
//   R26 = Payroll€ Budget
//   R27 = Payroll€ Forecast
//   R28 = Payroll€ Actueel
//   R29 = Payroll% Budget
//   R30 = Payroll% Forecast
//   R31 = Payroll% Actueel
//   R34 = COS€ Budget
//   R35 = COS€ Forecast
//   R36 = COS€ Actueel
//   R37 = COS% norm
//   R40 = OPEX€ Budget
//   R41 = OPEX€ Forecast
//   R42 = OPEX€ Actueel
//   R45 = DI€ Budget
//   R46 = DI€ Forecast
//   R47 = DI€ Actueel
//   R48 = DI% Budget (norm)
//   R49 = DI% Forecast
//   R50 = DI% Actueel
//   R53 = PPU Budget
//   R54 = PPU Forecast
//   R55 = PPU Actueel
// ═══════════════════════════════════════════════════════════════

import { buildFallbackData } from './fallbackData.js'

const SHEET_NAME_MO   = 'MAANDOVERZICHT'
const SHEET_NAME_KPI  = 'KPI_DASHBOARD'
const SHEET_NAME_PC   = 'PARK_CONSOLIDATIE'

// Rij-naar-KPI mapping (1-indexed Excel rows)
const MO_ROWS = {
  omzetBud:     4,  omzetFC:     5,  omzetAC:     6,
  fcBudEur:     7,  acBudPct:    8,
  gnBud:       11,  gnFC:       12,  gnAC:       13,
  gnbBud:      16,  gnbFC:      17,  gnbAC:      18,
  urenBud:     21,  urenFC:     22,  urenAC:     23,
  payEurBud:   26,  payEurFC:   27,  payEurAC:   28,
  payPctBud:   29,  payPctFC:   30,  payPctAC:   31,
  cosEurBud:   34,  cosEurFC:   35,  cosEurAC:   36,
  cosPctNorm:  37,
  opexEurBud:  40,  opexEurFC:  41,  opexEurAC:  42,
  diEurBud:    45,  diEurFC:    46,  diEurAC:    47,
  diPctBud:    48,  diPctFC:    49,  diPctAC:    50,
  ppuBud:      53,  ppuFC:      54,  ppuAC:      55,
}

// Kolommen C..O = maand JAN..DEC + JAAR
const COL_START = 3   // kolom C
const COL_END   = 15  // kolom O (JAAR)
const N_MONTHS  = 12

// Bouw de gviz URL voor een specifieke range in een sheet
function gvizUrl(sheetId, sheetName, range) {
  const encodedSheet = encodeURIComponent(sheetName)
  const encodedRange = encodeURIComponent(range)
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodedSheet}&range=${encodedRange}`
}

// Alternatief: export als CSV (eenvoudiger te parsen, geen gviz wrapping)
function csvUrl(sheetId, sheetName) {
  const encodedSheet = encodeURIComponent(sheetName)
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`
}

// Parse Google gviz JSON response (heeft een JS-wrapper die we strippen)
function parseGvizJson(raw) {
  // gviz response is: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  return JSON.parse(raw.slice(start, end + 1))
}

// Haal één sheet op als 2D array van waarden
async function fetchSheetAsGrid(sheetId, sheetName, range) {
  const url = gvizUrl(sheetId, sheetName, range)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status} bij ophalen ${sheetName}!${range}`)

  const raw = await res.text()
  const json = parseGvizJson(raw)

  if (!json.table || !json.table.rows) throw new Error('Leeg antwoord van Google Sheets')

  // Converteer naar 2D array van raw values
  return json.table.rows.map(row =>
    (row.c || []).map(cell => {
      if (!cell || cell.v === null || cell.v === undefined) return null
      return cell.v
    })
  )
}

// Extract een specifieke rij (1-indexed) uit de grid
// grid[0] = rij 1, grid[1] = rij 2, etc.
function extractRow(grid, excelRow, startCol = COL_START, nCols = N_MONTHS + 1) {
  const rowIdx = excelRow - 1
  const row = grid[rowIdx]
  if (!row) return Array(nCols).fill(null)
  // startCol is 1-indexed Excel column (C=3), grid is 0-indexed
  // We fetch from A1 so offset = startCol - 1
  return Array.from({ length: nCols }, (_, i) => {
    const val = row[startCol - 1 + i]
    if (val === null || val === undefined || val === '') return null
    const n = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'))
    return isNaN(n) ? null : n
  })
}

// Verwerk de ruwe MAANDOVERZICHT grid naar het interne datamodel
function transformMOGrid(grid) {
  const get = (row) => extractRow(grid, row).slice(0, N_MONTHS) // alleen maanden, geen JAAR

  const jaar = (row) => {
    const vals = extractRow(grid, row)
    return vals[N_MONTHS] ?? vals.filter(Boolean).reduce((a, b) => a + b, 0)
  }

  const monthly = Array.from({ length: N_MONTHS }, (_, i) => ({
    maand: ['JAN','FEB','MAA','APR','MEI','JUN','JUL','AUG','SEP','OKT','NOV','DEC'][i],
    index: i,
    budget: {
      omzet:       get(MO_ROWS.omzetBud)[i],
      gastnachten: get(MO_ROWS.gnBud)[i],
      gnb:         get(MO_ROWS.gnbBud)[i],
      uren:        get(MO_ROWS.urenBud)[i],
      payrollEur:  get(MO_ROWS.payEurBud)[i],
      payrollPct:  get(MO_ROWS.payPctBud)[i],
      cosEur:      get(MO_ROWS.cosEurBud)[i],
      cosPct:      get(MO_ROWS.cosPctNorm)[i],
      opexEur:     get(MO_ROWS.opexEurBud)[i],
      diEur:       get(MO_ROWS.diEurBud)[i],
      diPct:       get(MO_ROWS.diPctBud)[i],
      ppu:         get(MO_ROWS.ppuBud)[i],
    },
    forecast: {
      omzet:       get(MO_ROWS.omzetFC)[i],
      gastnachten: get(MO_ROWS.gnFC)[i],
      gnb:         get(MO_ROWS.gnbFC)[i],
      uren:        get(MO_ROWS.urenFC)[i],
      payrollEur:  get(MO_ROWS.payEurFC)[i],
      payrollPct:  get(MO_ROWS.payPctFC)[i],
      cosEur:      get(MO_ROWS.cosEurFC)[i],
      cosPct:      get(MO_ROWS.cosPctNorm)[i],
      opexEur:     get(MO_ROWS.opexEurFC)[i],
      diEur:       get(MO_ROWS.diEurFC)[i],
      diPct:       get(MO_ROWS.diPctFC)[i],
      ppu:         get(MO_ROWS.ppuFC)[i],
    },
    actueel: {
      omzet:       get(MO_ROWS.omzetAC)[i],
      gastnachten: get(MO_ROWS.gnAC)[i],
      gnb:         get(MO_ROWS.gnbAC)[i],
      uren:        get(MO_ROWS.urenAC)[i],
      payrollEur:  get(MO_ROWS.payEurAC)[i],
      payrollPct:  get(MO_ROWS.payPctAC)[i],
      cosEur:      get(MO_ROWS.cosEurAC)[i],
      cosPct:      get(MO_ROWS.cosPctNorm)[i],
      opexEur:     get(MO_ROWS.opexEurAC)[i],
      diEur:       get(MO_ROWS.diEurAC)[i],
      diPct:       get(MO_ROWS.diPctAC)[i],
      ppu:         get(MO_ROWS.ppuAC)[i],
    },
  }))

  const sumValid = (arr) => arr.filter(v => v != null).reduce((a, b) => a + b, 0)
  const avgValid = (arr) => { const v = arr.filter(x => x != null); return v.length ? sumValid(v)/v.length : null }

  const buildJaar = (prefix) => ({
    omzet:       sumValid(get(MO_ROWS[`omzet${prefix}`])),
    gastnachten: sumValid(get(MO_ROWS[`gn${prefix}`])),
    gnb:         (() => {
      const o = sumValid(get(MO_ROWS[`omzet${prefix}`]))
      const g = sumValid(get(MO_ROWS[`gn${prefix}`]))
      return g ? o / g : null
    })(),
    payrollPct:  avgValid(get(MO_ROWS[`payPct${prefix}`])),
    diPct:       avgValid(get(MO_ROWS[`diPct${prefix}`])),
    ppu:         avgValid(get(MO_ROWS[`ppu${prefix}`])),
  })

  // Detecteer hoeveel actueel-maanden beschikbaar zijn
  const acRow = get(MO_ROWS.omzetAC)
  const actueelMonths = acRow.filter(v => v != null && v > 0).length

  return {
    monthly,
    jaar: {
      budget:   buildJaar('Bud'),
      forecast: buildJaar('FC'),
      actueel:  buildJaar('AC'),
    },
    actueelMonths,
    meta: {
      source: 'google-sheets',
      lastUpdated: new Date().toISOString(),
    }
  }
}

// Hoofd-fetch functie — probeert Sheets, valt terug op fallback
export async function fetchDashboardData(sheetId) {
  if (!sheetId || !sheetId.trim()) {
    console.warn('[Sheets] Geen Sheet ID — fallback actief')
    return { ...buildFallbackData(), meta: { source: 'fallback', lastUpdated: new Date().toISOString() } }
  }

  try {
    // Fetch MAANDOVERZICHT — rijen 1 t/m 60, kolommen A t/m O
    const range = 'A1:O60'
    const grid = await fetchSheetAsGrid(sheetId.trim(), SHEET_NAME_MO, range)
    const data = transformMOGrid(grid)

    console.info('[Sheets] Data succesvol geladen:', data.meta.lastUpdated)
    return data

  } catch (err) {
    console.error('[Sheets] Fout bij ophalen — fallback actief:', err.message)
    return {
      ...buildFallbackData(),
      meta: {
        source: 'fallback',
        lastUpdated: new Date().toISOString(),
        error: err.message,
      }
    }
  }
}

// Extraheer sheet ID uit een volledige Google Sheets URL
export function extractSheetId(input) {
  if (!input) return ''
  // Formaat: https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=...
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : input.trim()
}

// Valideer of een sheet ID bruikbaar lijkt
export function isValidSheetId(id) {
  return typeof id === 'string' && id.length > 20 && /^[a-zA-Z0-9_-]+$/.test(id)
}
