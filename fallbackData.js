// ═══════════════════════════════════════════════════════════════
// FALLBACK DATA — Gebaseerd op de echte forecasttool structuur
// Outlets: Brasserie, Snackbar, PizzaLimone, SteaksBurgers, 
//          Bowling, ChefE, Speelhal
// KPIs: Omzet / GN / GNB / UTot / Pay€/% / COS€/% / OPEX€/% / DI€/% / PPU
// Periodes: JAN t/m DEC 2026
// ═══════════════════════════════════════════════════════════════

import { OUTLETS, MONTHS } from '../config/terminology.js'

// Park totaal per maand — realistisch vakantiepark profiel
const PARK_MONTHLY = {
  budget: {
    omzet:      [89204,  95340, 101820, 285600, 178340, 192040, 498600, 443200, 151840, 195420, 87540, 115760],
    gastnachten:[16800,  17200, 17400,  52000,  32000,  34000,  88000,  78000,  26000,  34000, 16000, 21000],
    gnb:        [5.31,   5.54,  5.85,   5.49,   5.57,   5.65,   5.67,   5.68,   5.84,   5.75,  5.47,  5.51],
    payrollPct: [0.28,   0.27,  0.26,   0.22,   0.24,   0.23,   0.19,   0.20,   0.25,   0.24,  0.28,  0.27],
    cosPct:     [0.293,  0.293, 0.293,  0.293,  0.293,  0.293,  0.293,  0.293,  0.293,  0.293, 0.293, 0.293],
    opexPct:    [0.020,  0.020, 0.020,  0.020,  0.020,  0.020,  0.020,  0.020,  0.020,  0.020, 0.020, 0.020],
    diPct:      [0.407,  0.417, 0.427,  0.467,  0.447,  0.457,  0.497,  0.487,  0.437,  0.447, 0.407, 0.417],
    ppu:        [44.2,   45.1,  46.8,   54.3,   50.1,   52.4,   68.9,   67.2,   47.8,   50.3,  43.1,  45.7],
    uren:       [2018,   2114,  2176,   5259,   3557,   3665,   7237,   6595,   3177,   3884,  2032,  2533],
  },
  forecast: {
    omzet:      [112800, 119280, 125400, 325800, 212600, 228040, 548400, 488200, 178640, 220640, 101540, 138000],
    gastnachten:[19800,  20800,  21200,  57000,  37000,  39200,  96800,  86000,  29400,  38600, 18800, 24400],
    gnb:        [5.70,   5.74,   5.92,   5.72,   5.75,   5.82,   5.67,   5.68,   6.08,   5.72,  5.40,  5.66],
    payrollPct: [0.265,  0.259,  0.251,  0.218,  0.238,  0.229,  0.188,  0.196,  0.248,  0.237, 0.271, 0.263],
    cosPct:     [0.293,  0.293,  0.293,  0.293,  0.293,  0.293,  0.293,  0.293,  0.293,  0.293, 0.293, 0.293],
    opexPct:    [0.020,  0.020,  0.020,  0.020,  0.020,  0.020,  0.020,  0.020,  0.020,  0.020, 0.020, 0.020],
    diPct:      [0.422,  0.428,  0.436,  0.469,  0.449,  0.458,  0.499,  0.491,  0.439,  0.450, 0.416, 0.424],
    ppu:        [47.3,   48.6,   50.2,   57.8,   53.4,   55.9,   72.1,   70.8,   50.9,   53.8,  46.4,  48.9],
    uren:       [2384,   2453,   2498,   5636,   3981,   4079,   7606,   6892,   3511,   4101,  2189,  2822],
  },
  actueel: {
    // Alleen jan t/m huidig (rest = null)
    omzet:      [108400, 122600, null, null, null, null, null, null, null, null, null, null],
    gastnachten:[19200,  21400,  null, null, null, null, null, null, null, null, null, null],
    gnb:        [5.65,   5.73,   null, null, null, null, null, null, null, null, null, null],
    payrollPct: [0.271,  0.262,  null, null, null, null, null, null, null, null, null, null],
    cosPct:     [0.298,  0.291,  null, null, null, null, null, null, null, null, null, null],
    opexPct:    [0.021,  0.019,  null, null, null, null, null, null, null, null, null, null],
    diPct:      [0.410,  0.428,  null, null, null, null, null, null, null, null, null, null],
    ppu:        [46.1,   49.8,   null, null, null, null, null, null, null, null, null, null],
    uren:       [2350,   2460,   null, null, null, null, null, null, null, null, null, null],
  },
}

// Per-outlet maandverdeling (% van park totaal)
const OUTLET_SHARE = {
  brasserie:     0.38,
  snackbar:      0.12,
  pizzalimone:   0.14,
  steaksburgers: 0.16,
  bowling:       0.08,
  chefe:         0.07,
  speelhal:      0.05,
}

function buildOutletData(outletId) {
  const share = OUTLET_SHARE[outletId] ?? 0.10
  const result = { budget: {}, forecast: {}, actueel: {} }
  for (const period of ['budget','forecast','actueel']) {
    const src = PARK_MONTHLY[period]
    result[period] = {
      omzet:      src.omzet.map(v => v != null ? Math.round(v * share) : null),
      gastnachten:src.gastnachten.map(v => v != null ? Math.round(v * share) : null),
      gnb:        src.gnb,
      payrollPct: src.payrollPct,
      cosPct:     src.cosPct,
      opexPct:    src.opexPct,
      diPct:      src.diPct,
      ppu:        src.ppu,
      uren:       src.uren.map(v => v != null ? Math.round(v * share) : null),
    }
  }
  return result
}

// Berekening helpers
function sum(arr) {
  return arr.filter(v => v != null).reduce((a,b) => a+b, 0)
}
function avg(arr) {
  const valid = arr.filter(v => v != null)
  return valid.length ? valid.reduce((a,b) => a+b, 0) / valid.length : 0
}
function ytdSum(arr, uptoMonth) {
  return arr.slice(0, uptoMonth + 1).filter(v => v != null).reduce((a,b) => a+b, 0)
}

// Huidig actueel maanden beschikbaar (0-indexed)
export const ACTUEEL_MONTHS_AVAILABLE = 1 // jan + feb

export function buildFallbackData() {
  const park = PARK_MONTHLY

  // Outlet data
  const outletData = {}
  for (const outlet of OUTLETS) {
    outletData[outlet.id] = buildOutletData(outlet.id)
  }

  // Maandelijkse park KPIs voor charts
  const monthly = MONTHS.map((maand, i) => ({
    maand,
    index: i,
    budget: {
      omzet:       park.budget.omzet[i],
      gastnachten: park.budget.gastnachten[i],
      gnb:         park.budget.gnb[i],
      payrollPct:  park.budget.payrollPct[i],
      cosPct:      park.budget.cosPct[i],
      opexPct:     park.budget.opexPct[i],
      diPct:       park.budget.diPct[i],
      ppu:         park.budget.ppu[i],
      uren:        park.budget.uren[i],
    },
    forecast: {
      omzet:       park.forecast.omzet[i],
      gastnachten: park.forecast.gastnachten[i],
      gnb:         park.forecast.gnb[i],
      payrollPct:  park.forecast.payrollPct[i],
      cosPct:      park.forecast.cosPct[i],
      opexPct:     park.forecast.opexPct[i],
      diPct:       park.forecast.diPct[i],
      ppu:         park.forecast.ppu[i],
      uren:        park.forecast.uren[i],
    },
    actueel: {
      omzet:       park.actueel.omzet[i],
      gastnachten: park.actueel.gastnachten[i],
      gnb:         park.actueel.gnb[i],
      payrollPct:  park.actueel.payrollPct[i],
      cosPct:      park.actueel.cosPct[i],
      opexPct:     park.actueel.opexPct[i],
      diPct:       park.actueel.diPct[i],
      ppu:         park.actueel.ppu[i],
      uren:        park.actueel.uren[i],
    },
  }))

  // Jaar KPI summaries
  const jaar = {
    budget: {
      omzet:      sum(park.budget.omzet),
      gastnachten:sum(park.budget.gastnachten),
      gnb:        sum(park.budget.omzet) / sum(park.budget.gastnachten),
      payrollPct: avg(park.budget.payrollPct),
      cosPct:     park.budget.cosPct[0],
      opexPct:    park.budget.opexPct[0],
      diPct:      avg(park.budget.diPct),
      ppu:        avg(park.budget.ppu),
      uren:       sum(park.budget.uren),
    },
    forecast: {
      omzet:      sum(park.forecast.omzet),
      gastnachten:sum(park.forecast.gastnachten),
      gnb:        sum(park.forecast.omzet) / sum(park.forecast.gastnachten),
      payrollPct: avg(park.forecast.payrollPct),
      cosPct:     park.forecast.cosPct[0],
      opexPct:    park.forecast.opexPct[0],
      diPct:      avg(park.forecast.diPct),
      ppu:        avg(park.forecast.ppu),
      uren:       sum(park.forecast.uren),
    },
    actueel: {
      omzet:      sum(park.actueel.omzet.filter(Boolean)),
      gastnachten:sum(park.actueel.gastnachten.filter(Boolean)),
      gnb:        sum(park.actueel.omzet.filter(Boolean)) / sum(park.actueel.gastnachten.filter(Boolean)),
      payrollPct: avg(park.actueel.payrollPct.filter(v => v != null)),
      cosPct:     avg(park.actueel.cosPct.filter(v => v != null)),
      opexPct:    avg(park.actueel.opexPct.filter(v => v != null)),
      diPct:      avg(park.actueel.diPct.filter(v => v != null)),
      ppu:        avg(park.actueel.ppu.filter(v => v != null)),
      uren:       sum(park.actueel.uren.filter(Boolean)),
    },
  }

  // Outlet jaaroverzicht voor vergelijkingstabel
  const outletJaar = OUTLETS.map(outlet => {
    const d = outletData[outlet.id]
    return {
      ...outlet,
      budget: {
        omzet:      sum(d.budget.omzet),
        gastnachten:sum(d.budget.gastnachten),
      },
      forecast: {
        omzet:      sum(d.forecast.omzet),
        gastnachten:sum(d.forecast.gastnachten),
      },
      actueel: {
        omzet:      sum(d.actueel.omzet.filter(Boolean)),
        gastnachten:sum(d.actueel.gastnachten.filter(Boolean)),
      },
    }
  })

  return {
    monthly,
    jaar,
    outletJaar,
    outletData,
    meta: {
      source: 'fallback',
      lastUpdated: new Date().toISOString(),
      actueelMonths: ACTUEEL_MONTHS_AVAILABLE,
    }
  }
}
