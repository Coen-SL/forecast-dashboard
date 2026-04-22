import { useMemo, useState } from 'react'
import FilterBar from './components/FilterBar'
import KpiCard from './components/KpiCard'
import VarianceTable from './components/VarianceTable'
import ForecastEditor from './components/ForecastEditor'
import ChannelPerformance from './components/ChannelPerformance'
import { createDemoDataset, OUTLETS, PARKS, PERIODS, TIME_LEVELS } from './data/demoData'
import { trafficLight, variance } from './utils/indicators'

const metrics = ['revenue', 'covers', 'avgSpend', 'margin']

export default function App() {
  const [rows, setRows] = useState(() => createDemoDataset())
  const [timeLevel, setTimeLevel] = useState('month')
  const [filters, setFilters] = useState({ park: 'all', period: '2026-04', outlet: 'all' })

  const outletOptions = useMemo(() => {
    return OUTLETS.filter((o) => filters.park === 'all' || o.park === filters.park).map((o) => o.name)
  }, [filters.park])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (row.timeLevel !== timeLevel) return false
      if (row.period !== filters.period) return false
      if (filters.park !== 'all' && row.park !== filters.park) return false
      if (filters.outlet !== 'all' && row.outlet !== filters.outlet) return false
      return true
    })
  }, [filters, rows, timeLevel])

  const kpiTotals = useMemo(() => {
    return metrics.reduce((acc, metric) => {
      const totals = filteredRows.reduce((sum, row) => {
        sum.actual += row.metrics[metric].actual
        sum.budget += row.metrics[metric].budget
        sum.forecast += row.metrics[metric].forecast
        return sum
      }, { actual: 0, budget: 0, forecast: 0 })

      if (metric === 'margin' || metric === 'avgSpend') {
        const divisor = Math.max(filteredRows.length, 1)
        totals.actual /= divisor
        totals.budget /= divisor
        totals.forecast /= divisor
      }

      acc[metric] = totals
      return acc
    }, {})
  }, [filteredRows])

  const updateForecastValue = (id, metric, value) => {
    setRows((current) => current.map((row) => {
      if (row.id !== id) return row
      return {
        ...row,
        metrics: {
          ...row.metrics,
          [metric]: {
            ...row.metrics[metric],
            forecast: Number.isFinite(value) ? value : row.metrics[metric].forecast,
          },
        },
      }
    }))
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <h1>Forecasting Dashboard</h1>
          <p>Professional first version with filters, KPI monitoring, and editable forecasts.</p>
        </div>
        <div className="time-levels">
          {TIME_LEVELS.map((level) => (
            <button
              type="button"
              key={level}
              className={level === timeLevel ? 'active' : ''}
              onClick={() => setTimeLevel(level)}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <FilterBar
        filters={filters}
        options={{ parks: PARKS, periods: PERIODS, outlets: outletOptions }}
        onChange={(field, value) => setFilters((prev) => ({ ...prev, [field]: value }))}
      />

      <section className="kpi-row">
        {metrics.map((metric) => {
          const score = variance(kpiTotals[metric].actual, kpiTotals[metric].budget)
          return (
            <KpiCard
              key={metric}
              metric={metric}
              totals={kpiTotals[metric]}
              indicator={trafficLight(metric, score)}
            />
          )
        })}
      </section>

      <ChannelPerformance rows={filteredRows} />
      <VarianceTable rows={filteredRows} />
      <ForecastEditor rows={filteredRows} onUpdate={updateForecastValue} />
    </main>
  )
}
