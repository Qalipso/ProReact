import { useEffect, useSyncExternalStore } from 'react'
import { getIssues, updateIssue } from './issuesApi.js'

let snapshot = Object.freeze({
  status: 'idle',
  data: [],
  error: null,
  lastUpdated: null,
})
let inFlightQuery = null
const listeners = new Set()

function emit(nextSnapshot) {
  // Replacing the whole snapshot gives every subscriber one consistent view.
  snapshot = Object.freeze(nextSnapshot)
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

export function refreshIssues() {
  // Strict Mode may mount, clean up, and mount again in development. Reusing
  // the in-flight promise prevents that check from creating duplicate reads.
  if (inFlightQuery) return inFlightQuery

  emit({ ...snapshot, status: 'loading', error: null })
  inFlightQuery = getIssues()
    .then((issues) => {
      emit({ status: 'success', data: issues, error: null, lastUpdated: Date.now() })
      return issues
    })
    .catch((error) => {
      emit({
        ...snapshot,
        status: 'error',
        error: error instanceof Error ? error.message : 'Could not load issues.',
      })
      throw error
    })
    .finally(() => {
      inFlightQuery = null
    })

  return inFlightQuery
}

export async function saveIssue(issueId, changes) {
  // The API remains authoritative: publish to the cache only after it accepts
  // the mutation. A production app would usually delegate this to Query/SWR.
  const updatedIssue = await updateIssue(issueId, changes)
  emit({
    status: 'success',
    data: snapshot.data.map((issue) => issue.id === issueId ? updatedIssue : issue),
    error: null,
    lastUpdated: Date.now(),
  })
  return updatedIssue
}

export function useIssues() {
  const query = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  useEffect(() => {
    if (getSnapshot().status === 'idle') void refreshIssues().catch(() => {})
  }, [])

  return query
}
