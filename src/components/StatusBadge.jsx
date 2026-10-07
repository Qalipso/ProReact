import { STATUS_LABELS } from './issueLabels.js'

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>
}
