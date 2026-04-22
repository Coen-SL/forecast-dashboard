import { formatMetricValue } from '../utils/formatters'

export default function ChannelPerformance({ rows }) {
  const channelTotals = rows.reduce((acc, row) => {
    if (!acc[row.channel]) {
      acc[row.channel] = { revenue: 0, covers: 0, avgSpend: 0, margin: 0, count: 0 }
    }
    acc[row.channel].revenue += row.metrics.revenue.actual
    acc[row.channel].covers += row.metrics.covers.actual
    acc[row.channel].avgSpend += row.metrics.avgSpend.actual
    acc[row.channel].margin += row.metrics.margin.actual
    acc[row.channel].count += 1
    return acc
  }, {})

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Channel Snapshot</h2>
      </div>
      <div className="channel-grid">
        {Object.entries(channelTotals).map(([channel, totals]) => (
          <article key={channel} className="channel-card">
            <h3>{channel}</h3>
            <ul>
              <li><span>Revenue</span><strong>{formatMetricValue('revenue', totals.revenue)}</strong></li>
              <li><span>Covers</span><strong>{formatMetricValue('covers', totals.covers)}</strong></li>
              <li><span>Average Spend</span><strong>{formatMetricValue('avgSpend', totals.avgSpend / totals.count)}</strong></li>
              <li><span>Margin</span><strong>{formatMetricValue('margin', totals.margin / totals.count)}</strong></li>
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
