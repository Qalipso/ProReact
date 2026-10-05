# ProReact

Personal React learning repository focused on understanding the runtime model
before accumulating patterns and abstractions.

Each study day contains theory, original notes, a practical exercise, evidence
and interview checkpoints, and selected resources.

## Day 1 — render, commit, state, identity

Start here: [`docs/day-01/README.md`](docs/day-01/README.md).

The first practical project will be an issue triage board. It will eventually
support adding, editing, filtering, selecting, and resetting issues. The board
is deliberately not implemented yet: the current application is a clean lab
for writing and explaining every important React decision in the code.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## Repository structure

```text
docs/day-01/                  theory, plan, resources, and original evidence
src/App.jsx                   empty Day 1 lab
```

## Learning rule

Do not count a concept as learned only because the application builds. Keep
three kinds of evidence: working code, a concrete reproduction or test, and a
short verbal explanation in your own words.
