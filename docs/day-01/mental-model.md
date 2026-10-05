# Day 1 mental model

## One render, three inputs

```text
UI = f(props, state, context)
```

For one render, props, state, and context are read-only snapshots. The component
uses them to return a JSX description of the UI.

- **Props** are inputs owned and passed by a parent.
- **State** is React-managed memory associated with this component identity.
- **Context** is the nearest value published above the component for a subtree.

## The update pipeline

```text
event
  ↓
handler reads the last committed render snapshot
  ↓
setter queues a replacement or updater function
  ↓
React batches and schedules work
  ↓
render: process queues and call component functions
  ↓
reconciliation: match type, position, and key
  ↓
commit: mutate DOM, update refs, run layout work
  ↓
browser: style, layout, paint, composite
```

### Event and queue

The browser event invokes a handler created by the last committed render. That
handler keeps its render's values:

```jsx
function handleClick() {
  console.log(count) // 0
  setCount(count + 1)
  console.log(count) // still 0
}
```

A setter queues future state; it does not rewrite the current snapshot:

```jsx
setCount(5)                         // replace with 5
setCount((current) => current + 1) // transform queued current value
```

When the next value depends on the previous one, use a functional update.
Updater functions must be pure.

### Render, reconciliation, commit, and paint

React processes queued updates, calls components, and builds a next element
tree. It matches that tree against the current one. Render work may be repeated
or discarded, so it must stay pure.

```text
same type + same position/key → preserve state
different type/position/key   → reset state
```

Once a result is ready, React applies the required DOM changes, updates refs,
and runs layout work. A render can produce no DOM change. After commit, the
browser calculates and displays the frame.

## Props, state, and context

Props are read-only parent-to-child input. A child requests a change by calling
a callback prop; the owner changes state and passes a new prop snapshot down.

State lives in React, not inside the temporary function call. Two visually
identical component identities have independent state. Store the smallest
source of truth and derive the rest during render:

```jsx
const [selectedId, setSelectedId] = useState(null)
const selectedIssue = issues.find((issue) => issue.id === selectedId) ?? null
```

Context publishes a value to a subtree without forwarding it through every
intermediate component. Consumers read the nearest Provider. Context transports
a value; state or a reducer normally stores it.

## Stale closure

Every render creates its own callbacks. A delayed callback keeps the values
from the render that created it:

```jsx
setTimeout(() => {
  setIssues(issues.map(resolveOne)) // `issues` may now be stale
}, 1000)
```

If the operation means “transform the latest queued state,” use:

```jsx
setTimeout(() => {
  setIssues((currentIssues) => currentIssues.map(resolveOne))
}, 1000)
```

## Keys and state preservation

With index keys, removing the first row shifts every later identity:

```text
before: key 0 → A, key 1 → B with draft, key 2 → C
after:  key 0 → B, key 1 → C
```

React can associate A's state with B and B's draft with C. Use a stable ID:

```jsx
<IssueRow key={issue.id} issue={issue} />
```

A changed key can also be intentional:

```jsx
<IssueEditor key={selectedId} issue={selectedIssue} />
```

Changing `selectedId` replaces the editor identity and resets its local state.

## Strict Mode

In development, Strict Mode performs extra component, updater, Effect, and ref
checks. This helps expose impure render logic and missing cleanup. It does not
prove business logic correct, eliminate races, or guarantee performance.
