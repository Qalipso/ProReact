import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildFilterSearch,
  createEditorState,
  editorReducer,
  filterIssues,
  parseFilters,
} from '../src/state.js'

const issues = [
  { id: 'ISS-1', title: 'Broken checkout', status: 'open', priority: 'high', assignee: 'Maya', labels: ['payment'] },
  { id: 'ISS-2', title: 'Wrong timezone', status: 'resolved', priority: 'low', assignee: 'Leo', labels: ['reports'] },
]

test('URL parsing falls back from invalid enum values', () => {
  assert.deepEqual(parseFilters('?q=checkout&status=unknown&priority=high'), {
    query: 'checkout',
    status: 'all',
    priority: 'high',
  })
})

test('URL serialization omits defaults and preserves unrelated parameters', () => {
  assert.equal(
    buildFilterSearch(
      { query: 'audit log', status: 'open', priority: 'all' },
      '?panel=compact&status=resolved',
    ),
    '?panel=compact&q=audit+log&status=open',
  )
})

test('visible issues are derived from data and filters', () => {
  const visible = filterIssues(issues, { query: 'payment', status: 'open', priority: 'high' })
  assert.deepEqual(visible.map((issue) => issue.id), ['ISS-1'])
})

test('editor reducer blocks review when the draft is invalid', () => {
  const state = createEditorState({
    ...issues[0],
    description: 'Long enough issue description',
  })
  const blankTitle = editorReducer(state, { type: 'field_changed', field: 'title', value: '' })
  const next = editorReducer(blankTitle, { type: 'next' })

  assert.equal(next.step, 'details')
  assert.equal(next.errors.title, 'Give the issue a title.')
})

test('editor reducer advances one valid interaction to review', () => {
  const state = createEditorState({
    ...issues[0],
    description: 'Long enough issue description',
  })
  const next = editorReducer(state, { type: 'next' })

  assert.equal(next.step, 'review')
  assert.deepEqual(next.errors, {})
})
