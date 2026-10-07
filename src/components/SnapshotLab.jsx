import { useState } from 'react'

export function SnapshotLab() {
  const [count, setCount] = useState(0)
  const [observation, setObservation] = useState(
    'Run an experiment, then explain which render snapshot each callback used.',
  )

  function addThree() {
    const eventSnapshot = count

    // Each updater receives the latest queued value, so this event adds three.
    setCount((current) => current + 1)
    setCount((current) => current + 1)
    setCount((current) => current + 1)

    setObservation(
      `The handler still saw ${eventSnapshot}. React queued three updaters for the next render.`,
    )
  }

  function scheduleStaleUpdate() {
    const scheduledFrom = count

    // This is intentionally stale. Change the count before the timer fires and
    // this callback will overwrite newer work with its old snapshot + 1.
    window.setTimeout(() => {
      setCount(scheduledFrom + 1)
      setObservation(
        `The stale callback captured ${scheduledFrom} and later replaced the count with ${scheduledFrom + 1}.`,
      )
    }, 1500)

    setObservation(`Scheduled from snapshot ${scheduledFrom}. Click “Add 3” before it fires.`)
  }

  function scheduleSafeUpdate() {
    const scheduledFrom = count

    // The callback still remembers when it was created, but the updater asks
    // React for the latest queued value when the timer finally runs.
    window.setTimeout(() => {
      setCount((current) => current + 1)
      setObservation(
        `The safe callback was scheduled at ${scheduledFrom}, then incremented the latest value.`,
      )
    }, 1500)

    setObservation(`Safe update scheduled at ${scheduledFrom}. Click “Add 3” before it fires.`)
  }

  function resetLab() {
    setCount(0)
    setObservation('The next event will receive a new render snapshot with count 0.')
  }

  return (
    <section className="snapshot-lab" aria-labelledby="snapshot-title">
      <div className="snapshot-copy">
        <h2 id="snapshot-title">Demo 2</h2>
        <p>Try a simple state snapshot experiment.</p>
      </div>

      <div className="snapshot-console">
        <div className="snapshot-value" aria-live="polite">
          <strong>{count}</strong>
        </div>
        <p className="snapshot-observation">{observation}</p>
        <div className="snapshot-actions">
          <button className="primary-button" type="button" onClick={addThree}>Add 3</button>
          <button className="secondary-button" type="button" onClick={scheduleStaleUpdate}>
            Schedule stale +1
          </button>
          <button className="secondary-button" type="button" onClick={scheduleSafeUpdate}>
            Schedule safe +1
          </button>
          <button className="text-button" type="button" onClick={resetLab}>Reset</button>
        </div>
      </div>
    </section>
  )
}
