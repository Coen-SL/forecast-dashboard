const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const currency2Fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatMetricValue = (metric, value) => {
  if (metric === 'margin') return `${(value * 100).toFixed(1)}%`
  if (metric === 'revenue') return currencyFmt.format(value)
  if (metric === 'avgSpend') return currency2Fmt.format(value)
  return intFmt.format(value)
}

export const metricLabel = {
  revenue: 'Revenue',
  covers: 'Covers',
  avgSpend: 'Average Spend',
  margin: 'Margin',
}
