# Day 1 — render, commit, state, identity

Suggested time: 2.5–3 hours. Output: code, evidence, and a verbal explanation.

## Learning goals

By the end of the session, explain and demonstrate:

- what causes a render and how render differs from commit;
- why UI can be modeled as `UI = f(props, state, context)`;
- how state snapshots, batching, and functional updates work;
- how stale closures appear;
- how component identity preserves or resets state;
- why index keys can move state between rows;
- what Strict Mode reveals and what it does not guarantee.

## Starting evidence

The original sketch is preserved exactly as received. A rotated copy is used
below for easier reading.

![Day 1 React mental model sketch](assets/mental-model-sketch.jpg)

- [Original unmodified image](assets/mental-model-sketch-original.jpg)
- [Transcription and review](notes-from-sketch.md)
- [Polished mental model](mental-model.md)
- [Documentation and videos](resources.md)

## Reference implementation: issue triage board

The repository now contains a complete example instead of an empty starter.
Read it in this order:

1. `src/App.jsx` — composition root with no application state.
2. `src/components/SnapshotLab.jsx` — snapshots, batching, functional updates,
   and an intentional stale closure.
3. `src/components/IssueBoard.jsx` — props, lifted selection, stable keys, and
   values derived during render.
4. `src/components/IssueEditor.jsx` — keyed identity and a reducer-owned draft.
5. `src/main.jsx` — development `StrictMode` boundary.

The implemented ownership tree is:

```text
App
├── IssueBoard
│   ├── URL filters
│   ├── server-cache subscription
│   ├── selectedIssueId
│   ├── FilterBar
│   ├── IssueList
│   │   └── IssueCard
│   └── IssueEditor (keyed local reducer)
└── SnapshotLab (isolated Day 1 experiment)
```

Keep derived values out of state when possible:

```jsx
const visibleIssues = issues.filter((issue) =>
  filter === 'all' ? true : issue.status === filter,
)
```

## Runtime experiments included in the app

### 1. Stale closure

Use **Schedule stale +1**, then press **Add 3** before the timer fires. The old
callback replaces the newer count because it captured an earlier render's
`count`. Repeat with **Schedule safe +1**: its functional updater transforms the
latest queued value instead.

> The delayed callback was created during render ____. It captured ____. Before
> it ran, ____. It later calculated the next state from ____, causing ____.

### 2. Identity and keys

Issue rows use `issue.id`, so filtering does not transfer identity between rows.
The editor also uses `key={selectedIssue.id}` intentionally: start editing one
issue, select another, and observe that the old local draft is reset.

> The key represented ____, not the issue's identity. After ____, React matched
> the previous row identity to ____, so the local state ____.

## Verbal interview checker

Answer without reading notes:

1. What exactly happens after a state setter is called?
2. Why can two visually identical components hold different state?
3. When is an index key unsafe? Give a concrete failure sequence.
4. What does Strict Mode help reveal, and what does it not guarantee?

## Completion evidence

- [x] The application starts locally.
- [x] Edit, filter, select, save, and reset work.
- [x] Stale and safe delayed updates are reproducible in the UI.
- [x] Stable IDs are used as list keys.
- [x] A changed editor key intentionally resets its local reducer.
- [x] The root is wrapped in Strict Mode.
- [ ] All four verbal answers can be given without reading.
- [x] Tests, lint, and production build pass.
