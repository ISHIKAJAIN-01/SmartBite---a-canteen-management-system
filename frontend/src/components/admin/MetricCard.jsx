import './MetricCard.css'

export default function MetricCard({ label, value, change, caption, icon, tone = 'brown' }) {
  return <article className="metric-card card">
    <div className="metric-top"><span className="metric-label">{label}</span><span className={`metric-icon tone-${tone}`}>{icon}</span></div>
    <div className="metric-value">{value}</div>
    <div className="metric-bottom"><span className={`metric-change ${change?.startsWith('-') ? 'negative' : ''}`}>{change}</span><span className="metric-caption">{caption}</span></div>
  </article>
}
