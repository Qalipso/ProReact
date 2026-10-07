const SERVER_LATENCY_MS = 360

// This module acts like a tiny remote system for the lesson. Components never
// import this array directly; they must cross the async API boundary below.
let serverIssues = [
  {
    id: 'ISS-1042',
    title: 'Checkout freezes after applying a saved address',
    status: 'open',
    priority: 'high',
    assignee: 'Maya Chen',
    labels: ['checkout', 'regression'],
    updatedAt: '12 min ago',
    description: 'Customers with a saved address see a frozen payment step after choosing express delivery.',
  },
  {
    id: 'ISS-1038',
    title: 'Audit log omits bulk role changes',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Jon Bell',
    labels: ['security', 'admin'],
    updatedAt: '34 min ago',
    description: 'Bulk role updates succeed, but the resulting actor and target entries are missing from the audit log.',
  },
  {
    id: 'ISS-1034',
    title: 'Empty search announces the wrong result count',
    status: 'open',
    priority: 'medium',
    assignee: 'Nora Díaz',
    labels: ['accessibility', 'search'],
    updatedAt: '1 hr ago',
    description: 'The live region announces the previous result count after the final search character is removed.',
  },
  {
    id: 'ISS-1027',
    title: 'CSV export uses the browser timezone',
    status: 'resolved',
    priority: 'medium',
    assignee: 'Leo Martin',
    labels: ['reports', 'timezone'],
    updatedAt: 'Yesterday',
    description: 'Scheduled exports should use the workspace timezone instead of the timezone of the browser that created them.',
  },
  {
    id: 'ISS-1021',
    title: 'Avatar fallback shifts the member table',
    status: 'open',
    priority: 'low',
    assignee: 'Unassigned',
    labels: ['ui', 'members'],
    updatedAt: 'Yesterday',
    description: 'Initials-based avatars are two pixels wider than image avatars and move the member table columns.',
  },
  {
    id: 'ISS-1016',
    title: 'Retry banner survives a successful sync',
    status: 'resolved',
    priority: 'low',
    assignee: 'Maya Chen',
    labels: ['sync', 'offline'],
    updatedAt: '2 days ago',
    description: 'The retry banner remains visible after the background sync completes successfully on a restored connection.',
  },
]

function clone(value) {
  return structuredClone(value)
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, SERVER_LATENCY_MS))
}

export async function getIssues() {
  await wait()
  return clone(serverIssues)
}

export async function updateIssue(issueId, changes) {
  await wait()
  const issueIndex = serverIssues.findIndex((issue) => issue.id === issueId)
  if (issueIndex === -1) throw new Error(`Issue ${issueId} no longer exists.`)

  const updatedIssue = {
    ...serverIssues[issueIndex],
    ...changes,
    id: serverIssues[issueIndex].id,
    labels: serverIssues[issueIndex].labels,
    updatedAt: 'Just now',
  }

  serverIssues = serverIssues.map((issue) => issue.id === issueId ? updatedIssue : issue)
  return clone(updatedIssue)
}
