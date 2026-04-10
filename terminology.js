// ═══════════════════════════════════════════════════════════════
// TERMINOLOGY — Enkelvoudige bron van waarheid voor alle labels
// Geen "groep" meer — overal "scenario"
// ═══════════════════════════════════════════════════════════════

export const LABELS = {
  // Core scenario terminology
  scenario: 'Scenario',
  scenarios: "Scenario's",
  scenarioNr: 'Scenario Nr',
  scenarioNaam: 'Scenario Naam',

  // Budget / Forecast / Actueel — the three pillars
  budget: 'Budget',
  forecast: 'Forecast',
  actueel: 'Actueel',
  afwijking: 'Afwijking',

  // KPI names
  omzet: 'Omzet',
  gastnachten: 'Gastnachten',
  gnb: 'GNB',
  gnbFull: 'Gem. Besteding per Gast',
  ppu: 'PPU',
  ppuFull: 'Prijs per Productief Uur',
  payroll: 'Payroll',
  cos: 'COS',
  cosFull: 'Cost of Sales',
  opex: 'OPEX',
  opexFull: 'Operating Expenses',
  di: 'DI',
  diFull: 'Departmental Income',
  uren: 'Uren',

  // Time
  ytd: 'YTD',
  jaar: 'Jaar',
  maand: 'Maand',

  // Outlets
  outlet: 'Outlet',
  outlets: 'Outlets',
  park: 'Park Totaal',

  // Navigation
  overzicht: 'Overzicht',
  forecastNav: 'Forecast',
  actueelNav: 'Actueel',
  budgetNav: 'Budget',
  scenarioAnalyse: "Scenario Analyse",
  pandl: 'P&L',
  operationeel: 'Operationeel',
  instellingen: 'Instellingen',
}

// KPI definitie model — centraal geconfigureerd
export const KPI_DEFINITIONS = {
  omzet: {
    id: 'omzet',
    label: 'Omzet',
    unit: '€',
    format: 'currency',
    description: 'Totale omzet inclusief alle outlets',
    higherIsBetter: true,
    budgetCol: 'K',   // Omzet Budget
    forecastCol: 'Z', // Omzet Forecast
    actueelCol: 'AO', // Omzet Actueel
  },
  gastnachten: {
    id: 'gastnachten',
    label: 'Gastnachten',
    unit: 'GN',
    format: 'integer',
    description: 'Aantal gastnachten',
    higherIsBetter: true,
    budgetCol: 'I',
    forecastCol: 'X',
    actueelCol: 'AM',
  },
  gnb: {
    id: 'gnb',
    label: 'GNB',
    unit: '€/GN',
    format: 'currency2',
    description: 'Gemiddelde besteding per gast',
    higherIsBetter: true,
    budgetCol: 'J',
    forecastCol: 'Y',
    actueelCol: 'AN',
  },
  ppu: {
    id: 'ppu',
    label: 'PPU',
    unit: '€/u',
    format: 'currency2',
    description: 'Prijs per productief uur (Omzet / Totale uren)',
    higherIsBetter: true,
  },
  payroll: {
    id: 'payroll',
    label: 'Payroll',
    unit: '%',
    format: 'percent',
    description: 'Payrollkosten als % van omzet',
    higherIsBetter: false,
    budgetCol: 'R',
    forecastCol: 'AG',
    actueelCol: 'AV',
  },
  cos: {
    id: 'cos',
    label: 'COS',
    unit: '%',
    format: 'percent',
    description: 'Cost of Sales als % van omzet',
    higherIsBetter: false,
  },
  opex: {
    id: 'opex',
    label: 'OPEX',
    unit: '%',
    format: 'percent',
    description: 'Operationele kosten als % van omzet',
    higherIsBetter: false,
  },
  di: {
    id: 'di',
    label: 'DI',
    unit: '%',
    format: 'percent',
    description: 'Departmental Income als % van omzet',
    higherIsBetter: true,
    budgetCol: 'V',
    forecastCol: 'AK',
    actueelCol: 'AZ',
  },
}

// Outlet configuratie (uit DRIVERSET van de forecasttool)
export const OUTLETS = [
  { id: 'brasserie',     label: 'Brasserie',     sheetName: 'FC_Brasserie',     hasGN: true },
  { id: 'snackbar',      label: 'Snackbar',       sheetName: 'FC_Snackbar',      hasGN: true },
  { id: 'pizzalimone',   label: 'PizzaLimone',    sheetName: 'FC_PizzaLimone',   hasGN: true },
  { id: 'steaksburgers', label: 'SteaksBurgers',  sheetName: 'FC_SteaksBurgers', hasGN: true },
  { id: 'bowling',       label: 'Bowling',         sheetName: 'FC_Bowling',       hasGN: true },
  { id: 'chefe',         label: 'ChefE',           sheetName: 'FC_ChefE',         hasGN: true },
  { id: 'speelhal',      label: 'Speelhal',        sheetName: 'FC_Speelhal',      hasGN: true },
]

// Maandlabels
export const MONTHS = [
  'JAN','FEB','MAA','APR','MEI','JUN',
  'JUL','AUG','SEP','OKT','NOV','DEC',
]

// Scenario's uit de DRIVERSET (1–6)
export const SCENARIOS = [1,2,3,4,5,6].map(n => ({
  id: n,
  label: `Scenario ${n}`,
  shortLabel: `S${n}`,
}))
