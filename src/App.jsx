import './App.css'

/**
 * Day 1 lab: render, commit, state, and identity.
 *
 * Build the issue triage board here from scratch. As each concept is added,
 * explain the ownership and identity decisions in nearby comments:
 *
 * - Which component owns each state value, and why?
 * - Which values are derived during render instead of stored?
 * - Which callback communicates an event back to the owner?
 * - Which key represents the issue's stable identity?
 * - Which key change intentionally resets local state?
 * - Which delayed callback demonstrates a stale closure before it is fixed?
 */
function App() {
  return (
    <main className="lab-shell">
      <p className="eyebrow">ProReact · Day 1</p>
      <h1>Issue triage board</h1>
      <p className="lab-status">
        Empty lab ready. Start with the data model and component boundaries.
      </p>
    </main>
  )
}

export default App
