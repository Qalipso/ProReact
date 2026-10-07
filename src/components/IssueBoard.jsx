import { useState } from 'react'
import { refreshIssues, useIssues } from '../issuesCache.js'
import { filterIssues } from '../state.js'
import { setUrlFilters, useUrlFilters } from '../urlFilters.js'
import { IssueEditor } from './IssueEditor.jsx'
import { PRIORITY_LABELS, STATUS_LABELS } from './issueLabels.js'

export function IssueBoard() {
  const filters = useUrlFilters()
  const issuesQuery = useIssues()

  // Selection belongs here because the list changes it and the editor reads it.
  // We keep only the ID, so the issue itself never has a second, stale copy.
  const [selectedIssueId, setSelectedIssueId] = useState('ISS-1042')

  // These values are cheap projections of existing sources of truth. Keeping
  // them out of state removes three synchronization rules from the app.
  const visibleIssues = filterIssues(issuesQuery.data, filters)
  const selectedIssue =
    issuesQuery.data.find((issue) => issue.id === selectedIssueId) ?? null

  function changeFilter(name, value, options) {
    setUrlFilters({ ...filters, [name]: value }, options)
  }

  function clearFilters() {
    setUrlFilters({ query: '', status: 'all', priority: 'all' })
  }

  return (
    <section className="demo-section" aria-labelledby="demo-one-title">
      <header className="demo-heading">
        <h2 id="demo-one-title">Demo 1</h2>
        <p>Work with a list of issues and edit the selected item.</p>
      </header>

      <div className="workspace">
        <div className="board-panel">
          <FilterBar
            filters={filters}
            resultCount={visibleIssues.length}
            onChange={changeFilter}
            onClear={clearFilters}
          />

          <IssueQueryState query={issuesQuery} />

          {issuesQuery.status === 'success' && visibleIssues.length === 0 ? (
            <BoardMessage title="No matching issues">
              Change or clear the URL-backed filters.
            </BoardMessage>
          ) : null}

          <IssueList
            issues={visibleIssues}
            selectedIssueId={selectedIssueId}
            onSelectIssue={setSelectedIssueId}
          />
        </div>

        <aside className="detail-panel" aria-label="Issue editor">
          {selectedIssue ? (
            <IssueEditor
              issue={selectedIssue}
              key={selectedIssue.id}
              onClose={() => setSelectedIssueId(null)}
            />
          ) : (
            <EmptySelection />
          )}
        </aside>
      </div>
    </section>
  )
}

function FilterBar({ filters, resultCount, onChange, onClear }) {
  const hasFilters = filters.query || filters.status !== 'all' || filters.priority !== 'all'

  return (
    <div className="filters">
      <div className="filter-controls">
        <label className="search-field">
          <span className="sr-only">Search issues</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Search issues"
            onChange={(event) => onChange('query', event.target.value, { replace: true })}
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by priority</span>
          <select
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={(event) => onChange('priority', event.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
        </label>
      </div>

      <div className="filter-summary">
        <span>{resultCount} {resultCount === 1 ? 'issue' : 'issues'}</span>
        {hasFilters ? (
          <button className="text-button" type="button" onClick={onClear}>
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  )
}

function IssueQueryState({ query }) {
  if (query.status === 'loading' && query.data.length === 0) {
    return (
      <BoardMessage title="Loading the server cache…">
        The issue API is answering the first query.
      </BoardMessage>
    )
  }

  if (query.status === 'error') {
    return (
      <BoardMessage title="The query failed" tone="error">
        <span>{query.error}</span>{' '}
        <button
          className="text-button"
          type="button"
          onClick={() => void refreshIssues().catch(() => {})}
        >
          Try again
        </button>
      </BoardMessage>
    )
  }

  return null
}

function IssueList({ issues, selectedIssueId, onSelectIssue }) {
  // Stable IDs keep each row attached to the same issue after filtering.
  return (
    <div className="issue-list" aria-live="polite">
      <div className="issue-list-header" aria-hidden="true">
        <span>ID</span>
        <span>Title</span>
        <span>Status</span>
        <span>Priority</span>
      </div>
      {issues.map((issue) => (
        <IssueRow
          issue={issue}
          isSelected={issue.id === selectedIssueId}
          key={issue.id}
          onSelect={() => onSelectIssue(issue.id)}
        />
      ))}
    </div>
  )
}

function IssueRow({ issue, isSelected, onSelect }) {
  return (
    <button
      className={`issue-row ${isSelected ? 'is-selected' : ''}`}
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
    >
      <span className="issue-id">{issue.id}</span>
      <strong>{issue.title}</strong>
      <span>{STATUS_LABELS[issue.status]}</span>
      <span>{PRIORITY_LABELS[issue.priority]}</span>
    </button>
  )
}

function EmptySelection() {
  return (
    <div className="empty-selection">
      <h2>Select an issue</h2>
      <p>Choose a row to open its editor.</p>
    </div>
  )
}

function BoardMessage({ title, tone, children }) {
  return (
    <div className={`board-message ${tone === 'error' ? 'is-error' : ''}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  )
}
