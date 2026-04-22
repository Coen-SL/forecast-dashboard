export const PARKS = ['North Park', 'Lakeside Park']
export const TIME_LEVELS = ['day', 'week', 'month', 'ytd']

export const OUTLETS = [
  { id: 'brasserie-1', name: 'Brasserie Main', park: 'North Park', channel: 'Brasserie' },
  { id: 'snackbar-1', name: 'Snackbar Plaza', park: 'North Park', channel: 'Snackbar' },
  { id: 'retail-1', name: 'Retail Corner', park: 'North Park', channel: 'Retail' },
  { id: 'brasserie-2', name: 'Brasserie Lakeview', park: 'Lakeside Park', channel: 'Brasserie' },
  { id: 'snackbar-2', name: 'Snackbar Pier', park: 'Lakeside Park', channel: 'Snackbar' },
  { id: 'retail-2', name: 'Retail Harbor', park: 'Lakeside Park', channel: 'Retail' },
]

const baseByOutlet = {
  'brasserie-1': { revenue: 21200, covers: 1080, avgSpend: 19.63, margin: 0.68 },
  'snackbar-1': { revenue: 9800, covers: 1350, avgSpend: 7.25, margin: 0.54 },
  'retail-1': { revenue: 7600, covers: 870, avgSpend: 8.74, margin: 0.49 },
  'brasserie-2': { revenue: 17400, covers: 930, avgSpend: 18.71, margin: 0.66 },
  'snackbar-2': { revenue: 8200, covers: 1210, avgSpend: 6.78, margin: 0.52 },
  'retail-2': { revenue: 6900, covers: 760, avgSpend: 9.08, margin: 0.47 },
}

const levelFactor = { day: 0.035, week: 0.22, month: 1, ytd: 3.25 }
const periodFactor = {
  '2026-04': 1,
  '2026-05': 1.08,
  '2026-Q2': 1.02,
  '2026-YTD': 1,
}

export const PERIODS = Object.keys(periodFactor)

export const createDemoDataset = () => {
  const rows = []

  OUTLETS.forEach((outlet, outletIndex) => {
    TIME_LEVELS.forEach((timeLevel, levelIndex) => {
      PERIODS.forEach((period, periodIndex) => {
        const base = baseByOutlet[outlet.id]
        const scalar = levelFactor[timeLevel] * periodFactor[period]

        const budgetRevenue = Math.round(base.revenue * scalar)
        const actualRevenue = Math.round(budgetRevenue * (0.92 + ((outletIndex + levelIndex + periodIndex) % 7) * 0.03))
        const forecastRevenue = Math.round(actualRevenue * (1.01 + ((periodIndex + outletIndex) % 3) * 0.012))

        const budgetCovers = Math.round(base.covers * scalar)
        const actualCovers = Math.round(budgetCovers * (0.93 + ((outletIndex + periodIndex) % 6) * 0.025))
        const forecastCovers = Math.round(actualCovers * (1 + ((levelIndex + periodIndex) % 4) * 0.01))

        const budgetAvgSpend = Number(base.avgSpend.toFixed(2))
        const actualAvgSpend = Number((actualRevenue / Math.max(actualCovers, 1)).toFixed(2))
        const forecastAvgSpend = Number((forecastRevenue / Math.max(forecastCovers, 1)).toFixed(2))

        const budgetMargin = Number(base.margin.toFixed(3))
        const actualMargin = Number((budgetMargin - 0.025 + ((outletIndex + periodIndex) % 5) * 0.012).toFixed(3))
        const forecastMargin = Number((actualMargin + 0.004 + (levelIndex % 3) * 0.005).toFixed(3))

        rows.push({
          id: `${outlet.id}-${timeLevel}-${period}`,
          park: outlet.park,
          outlet: outlet.name,
          channel: outlet.channel,
          timeLevel,
          period,
          metrics: {
            revenue: { actual: actualRevenue, budget: budgetRevenue, forecast: forecastRevenue },
            covers: { actual: actualCovers, budget: budgetCovers, forecast: forecastCovers },
            avgSpend: { actual: actualAvgSpend, budget: budgetAvgSpend, forecast: forecastAvgSpend },
            margin: { actual: actualMargin, budget: budgetMargin, forecast: forecastMargin },
          },
        })
      })
    })
  })

  return rows
}
