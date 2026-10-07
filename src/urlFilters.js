import { useSyncExternalStore } from 'react'
import { buildFilterSearch, parseFilters } from './state.js'

const URL_CHANGE_EVENT = 'proreact:urlchange'

function subscribe(listener) {
  window.addEventListener('popstate', listener)
  window.addEventListener(URL_CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener('popstate', listener)
    window.removeEventListener(URL_CHANGE_EVENT, listener)
  }
}

function getSnapshot() {
  return window.location.search
}

export function useUrlFilters() {
  // The URL is the source of truth. React subscribes to it instead of mirroring
  // search params into useState and trying to keep two copies synchronized.
  const search = useSyncExternalStore(subscribe, getSnapshot, () => '')
  return parseFilters(search)
}

export function setUrlFilters(filters, { replace = false } = {}) {
  const search = buildFilterSearch(filters, window.location.search)
  const nextUrl = `${window.location.pathname}${search}${window.location.hash}`

  // Typing replaces the current entry; deliberate select changes create a new
  // entry so Back and Forward behave like users expect.
  const method = replace ? 'replaceState' : 'pushState'
  window.history[method](null, '', nextUrl)
  window.dispatchEvent(new Event(URL_CHANGE_EVENT))
}
