import { formatMetricValue, metricLabel } from '../utils/formatters'
import { trafficLight, variance } from '../utils/indicators'

const metrics = ['revenue', 'covers', 'avgSpend', 'margin']

export default function VarianceTable({ rows }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Forecast vs Actual vs Budget</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>Channel</th>
            <th>Metric</th>
            <th>Actual</th>
            <th>Budget</th>
            <th>Forecast</th>
            <th>Signal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            metrics.map((metric) => {
              const vals = row.metrics[metric]
              const score = variance(vals.actual, vals.budget)
              const signal = trafficLight(metric, score)
              return (
                <tr key={`${row.id}-${metric}`}>
                  <td>{row.channel}</td>
                  <td>{metricLabel[metric]}</td>
                  <td>{formatMetricValue(metric, vals.actual)}</td>
                  <td>{formatMetricValue(metric, vals.budget)}</td>
                  <td>{formatMetricValue(metric, vals.forecast)}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: signal.color }}>{signal.label}</span>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </section>
  )
}
