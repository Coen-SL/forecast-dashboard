import { formatMetricValue, metricLabel } from '../utils/formatters'

export default function KpiCard({ metric, totals, indicator }) {
  return (
    <article className="panel kpi-card">
      <header>
        <h3>{metricLabel[metric]}</h3>
        <span className="badge" style={{ backgroundColor: indicator.color }}>{indicator.label}</span>
      </header>
      <div className="kpi-grid">
        <div>
          <small>Actual</small>
          <strong>{formatMetricValue(metric, totals.actual)}</strong>
        </div>
        <div>
          <small>Budget</small>
          <strong>{formatMetricValue(metric, totals.budget)}</strong>
        </div>
        <div>
          <small>Forecast</small>
          <strong>{formatMetricValue(metric, totals.forecast)}</strong>
        </div>
      </div>
    </article>
  )
}
