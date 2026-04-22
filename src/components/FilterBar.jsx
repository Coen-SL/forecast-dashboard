export default function FilterBar({ filters, options, onChange }) {
  return (
    <section className="panel filter-bar">
      <div>
        <label>Park</label>
        <select value={filters.park} onChange={(e) => onChange('park', e.target.value)}>
          <option value="all">All parks</option>
          {options.parks.map((park) => (
            <option key={park} value={park}>{park}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Period</label>
        <select value={filters.period} onChange={(e) => onChange('period', e.target.value)}>
          {options.periods.map((period) => (
            <option key={period} value={period}>{period}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Outlet</label>
        <select value={filters.outlet} onChange={(e) => onChange('outlet', e.target.value)}>
          <option value="all">All outlets</option>
          {options.outlets.map((outlet) => (
            <option key={outlet} value={outlet}>{outlet}</option>
          ))}
        </select>
      </div>
    </section>
  )
}
