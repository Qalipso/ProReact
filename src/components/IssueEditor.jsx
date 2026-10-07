import { useReducer } from 'react'
import { saveIssue } from '../issuesCache.js'
import { createEditorState, editorReducer } from '../state.js'
import { PRIORITY_LABELS, STATUS_LABELS } from './issueLabels.js'

export function IssueEditor({ issue, onClose }) {
  // The reducer owns one temporary draft and all valid workflow transitions.
  // Its initializer runs again when the parent gives this editor a new key.
  const [editor, dispatch] = useReducer(editorReducer, issue, createEditorState)

  function updateField(event) {
    dispatch({
      type: 'field_changed',
      field: event.target.name,
      value: event.target.value,
    })
  }

  async function submitChanges() {
    dispatch({ type: 'submit_started' })

    try {
      // Reducers stay pure. The request belongs in this event handler, and the
      // handler uses the draft snapshot from the render that created it.
      await saveIssue(issue.id, editor.fields)
      dispatch({ type: 'submit_succeeded' })
    } catch (error) {
      dispatch({
        type: 'submit_failed',
        message: error instanceof Error ? error.message : 'Could not save the issue.',
      })
    }
  }

  return (
    <div className="editor">
      <div className="editor-heading">
        <div>
          <h2>{editor.step === 'details' ? 'Edit issue' : 'Review changes'}</h2>
          <p>{editor.step === 'details'
            ? 'Update the details for the selected issue.'
            : 'Check everything before saving.'}</p>
        </div>
        <button className="text-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      {editor.step === 'details' ? (
        <EditorForm
          editor={editor}
          onChange={updateField}
          onReview={() => dispatch({ type: 'next' })}
        />
      ) : (
        <EditorReview
          editor={editor}
          onBack={() => dispatch({ type: 'back' })}
          onSave={submitChanges}
        />
      )}
    </div>
  )
}

function EditorForm({ editor, onChange, onReview }) {
  return (
    <div className="editor-fields">
      <Field label="Title" error={editor.errors.title}>
        <input name="title" value={editor.fields.title} onChange={onChange} />
      </Field>
      <Field label="Description" error={editor.errors.description}>
        <textarea
          name="description"
          rows="6"
          value={editor.fields.description}
          onChange={onChange}
        />
      </Field>
      <div className="field-row">
        <Field label="Status">
          <select name="status" value={editor.fields.status} onChange={onChange}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </Field>
        <Field label="Priority">
          <select name="priority" value={editor.fields.priority} onChange={onChange}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>
      </div>
      <button className="primary-button" type="button" onClick={onReview}>
        Review
      </button>
    </div>
  )
}

function EditorReview({ editor, onBack, onSave }) {
  return (
    <div className="review-card">
      <ReviewRow label="Title" value={editor.fields.title} />
      <ReviewRow label="Status" value={STATUS_LABELS[editor.fields.status]} />
      <ReviewRow label="Priority" value={PRIORITY_LABELS[editor.fields.priority]} />
      <ReviewRow label="Description" value={editor.fields.description} multiline />

      {editor.submitStatus === 'saved' ? (
        <p className="save-message success">Saved to the server cache.</p>
      ) : null}
      {editor.submitStatus === 'error' ? (
        <p className="save-message error">{editor.submitError}</p>
      ) : null}

      <div className="editor-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          Back
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={editor.submitStatus === 'saving'}
          onClick={onSave}
        >
          {editor.submitStatus === 'saving' ? 'Saving…' : 'Save issue'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}

function ReviewRow({ label, value, multiline }) {
  return (
    <div className={`review-row ${multiline ? 'is-multiline' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
