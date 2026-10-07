export const DEFAULT_FILTERS = Object.freeze({
  query: '',
  status: 'all',
  priority: 'all',
})

const VALID_STATUSES = new Set(['all', 'open', 'in_progress', 'resolved'])
const VALID_PRIORITIES = new Set(['all', 'high', 'medium', 'low'])

export function parseFilters(search) {
  const params = new URLSearchParams(search)
  const status = params.get('status') ?? DEFAULT_FILTERS.status
  const priority = params.get('priority') ?? DEFAULT_FILTERS.priority

  return {
    query: params.get('q')?.trimStart() ?? DEFAULT_FILTERS.query,
    status: VALID_STATUSES.has(status) ? status : DEFAULT_FILTERS.status,
    priority: VALID_PRIORITIES.has(priority) ? priority : DEFAULT_FILTERS.priority,
  }
}

export function buildFilterSearch(filters, currentSearch = '') {
  const params = new URLSearchParams(currentSearch)
  params.delete('q')
  params.delete('status')
  params.delete('priority')

  const query = filters.query.trim()
  if (query) params.set('q', query)
  if (filters.status !== DEFAULT_FILTERS.status) params.set('status', filters.status)
  if (filters.priority !== DEFAULT_FILTERS.priority) params.set('priority', filters.priority)

  const nextSearch = params.toString()
  return nextSearch ? `?${nextSearch}` : ''
}

export function filterIssues(issues, filters) {
  // This is derived data, not state: the same inputs always produce the same
  // visible list and there is nothing extra to synchronize.
  const needle = filters.query.trim().toLocaleLowerCase()

  return issues.filter((issue) => {
    const searchable = [issue.id, issue.title, issue.assignee, ...issue.labels]
      .join(' ')
      .toLocaleLowerCase()

    return (
      (!needle || searchable.includes(needle)) &&
      (filters.status === 'all' || issue.status === filters.status) &&
      (filters.priority === 'all' || issue.priority === filters.priority)
    )
  })
}

export function summarizeIssues(issues) {
  return issues.reduce(
    (summary, issue) => ({
      ...summary,
      total: summary.total + 1,
      [issue.status]: summary[issue.status] + 1,
    }),
    { total: 0, open: 0, in_progress: 0, resolved: 0 },
  )
}

export function createEditorState(issue) {
  return {
    step: 'details',
    fields: {
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      assignee: issue.assignee,
      description: issue.description,
    },
    errors: {},
    submitStatus: 'idle',
    submitError: null,
  }
}

export function validateEditor(fields) {
  const errors = {}
  if (!fields.title.trim()) errors.title = 'Give the issue a title.'
  if (!fields.assignee.trim()) errors.assignee = 'Choose an assignee or write Unassigned.'
  if (fields.description.trim().length < 20) {
    errors.description = 'Add at least 20 characters so the issue is actionable.'
  }
  return errors
}

export function editorReducer(state, action) {
  // Every case describes one user event and returns a new state. Side effects
  // such as saving belong to the component that dispatches these actions.
  switch (action.type) {
    case 'field_changed': {
      return {
        ...state,
        fields: { ...state.fields, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
        submitStatus: 'idle',
        submitError: null,
      }
    }
    case 'next': {
      const errors = validateEditor(state.fields)
      if (Object.keys(errors).length > 0) return { ...state, errors }
      return { ...state, step: 'review', errors: {} }
    }
    case 'back':
      return { ...state, step: 'details', submitStatus: 'idle', submitError: null }
    case 'submit_started':
      return { ...state, submitStatus: 'saving', submitError: null }
    case 'submit_succeeded':
      return { ...state, submitStatus: 'saved', submitError: null }
    case 'submit_failed':
      return { ...state, submitStatus: 'error', submitError: action.message }
    default:
      throw new Error(`Unknown editor action: ${action.type}`)
  }
}
