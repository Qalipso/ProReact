# Notes from the first sketch

This file records the initial handwritten model separately from the more
precise wording to use in code reviews and interviews.

## Initial model captured on paper

```text
UI = f(props, state, context)

Event → Queue → Render → Comparison → Commit → Show
          batching       reconciliation
```

### Event and queue

- event work: change state, request/write data, show a notification, API call;
- queue: value replacement, functional updater, and batching.

### Render, comparison, commit, show

- process the queue, define the next state, call functions, and produce JSX;
- recursively compare children using type, position, and key;
- preserve component identity and calculate required DOM changes;
- add, remove, and update DOM elements, attributes, text, and refs;
- run layout-related logic and let the browser display the result.

### Props

Props are the component interface: required data, settings, actions, and nested
content. Data moves `Board → List → Row`. A callback is passed down, invoked by
the row, and can make the board produce new props and a new snapshot. Props are
read-only and can contain text, numbers, booleans, arrays, objects, handlers,
JSX, and `children`.

### State

- component memory associated with identity;
- identity is related to type, position, and key;
- state is read as a snapshot and must not be mutated;
- setters replace values;
- prefer fewer independent values;
- keep an ID instead of duplicating a selected object.

### Context

- makes data available to a subtree;
- useful for theme, locale, current user, permissions, interface settings,
  shared dispatch, and dependencies;
- should not automatically replace explicit props.

## Precision corrections

### Event does not directly change state

An event invokes a handler. The handler may queue updates and perform effects:

```text
click → handler → setter → queued update
                ├→ request
                └→ notification
```

### Comparison belongs to render work

The official high-level model is `trigger → render → commit`. Separating
comparison is useful for learning, but reconciliation is part of render work.

### State belongs to identity

State is not identity and is not stored in JSX. React associates stored state
with a component identity in the tree. Matching type, position, and key
preserves it; changing the match resets it.

### Keys are local to siblings

A key identifies an element among siblings, not globally. A stable business ID
is normally appropriate. An index becomes unsafe when rows can be inserted,
deleted, filtered, sorted, or reordered.

### Context transports; state stores

```text
state/reducer → stores the value
Provider      → publishes it to a subtree
useContext    → reads the nearest value
```

### Show is browser work

React commits DOM changes. The browser then calculates styles and layout,
paints, and composites the visible frame. `useLayoutEffect` runs after DOM
mutation but before paint; ordinary Effects are post-commit synchronization.

## Missing blocks to add during practice

- an explicit stale-closure timeline;
- a concrete index-key failure sequence;
- an intentional reset using a key;
- Strict Mode signals and limitations;
- code comments explaining ownership, snapshots, and identity decisions.
