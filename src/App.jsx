import './App.css'
import { IssueBoard } from './components/IssueBoard.jsx'
import { SnapshotLab } from './components/SnapshotLab.jsx'

function App() {
  return (
    <main className="app-shell">
      <header className="page-header">
        <h1>React demos</h1>
        <p>Small, focused examples to practice React runtime and state design.</p>
      </header>
      <IssueBoard />
      <SnapshotLab />
    </main>
  )
}

export default App
