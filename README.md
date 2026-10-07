# ProReact

Personal React learning repository focused on understanding the runtime model
before accumulating patterns and abstractions.

Each study day contains theory, original notes, a practical exercise, evidence
and interview checkpoints, and selected resources.

## Day 1 — render, commit, state, identity

Start here: [`docs/day-01/README.md`](docs/day-01/README.md).

The first practical project began as an empty issue triage lab and now includes
the completed reference implementation plus a focused runtime experiment.

## Day 2 — state design

Start here: [`docs/day-02/README.md`](docs/day-02/README.md).

The board now demonstrates URL-backed filters, local lifted selection, derived
projections, a server-cache boundary, and reducer-driven multi-step editing.
The accompanying state inventory records owner, lifetime, source of truth, and
update authority for every value.

The app also includes an interactive Day 1 snapshot lab. Use the combined
[`example walkthrough`](docs/example-walkthrough.md) to reproduce batching,
stale closures, functional updates, keyed resets, and the Day 2 state choices.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

## Repository structure

```text
docs/day-01/                  render/commit/state/identity foundations
docs/day-02/                  state design lecture, inventory, and evidence
src/App.jsx                    composition root
src/components/               board, editor, and snapshot experiment
src/state.js                  pure derivations and editor reducer
src/urlFilters.js             URL state adapter
src/issuesApi.js              simulated server boundary
src/issuesCache.js            server-state cache
test/state.test.js            pure state-rule tests
```

## Learning rule

Do not count a concept as learned only because the application builds. Keep
three kinds of evidence: working code, a concrete reproduction or test, and a
short verbal explanation in your own words.
