import { formatMetricValue } from '../utils/formatters'

const editableMetrics = ['revenue', 'covers', 'avgSpend', 'margin']

export default function ForecastEditor({ rows, onUpdate }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Editable Forecast Inputs</h2>
      </div>
      <div className="editor-list">
        {rows.map((row) => (
          <div className="editor-card" key={`${row.id}-editor`}>
            <h3>{row.outlet}</h3>
            <p>{row.channel} · {row.park}</p>
            {editableMetrics.map((metric) => (
              <label key={`${row.id}-${metric}`}>
                <span>{metric}</span>
                <input
                  type="number"
                  step={metric === 'margin' ? '0.001' : metric === 'avgSpend' ? '0.01' : '1'}
                  value={row.metrics[metric].forecast}
                  onChange={(e) => onUpdate(row.id, metric, Number(e.target.value))}
                />
                <em>{formatMetricValue(metric, row.metrics[metric].forecast)}</em>
              </label>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
