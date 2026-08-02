import { Home } from './pages/Home'

function App() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="navbar-brand">
          <span className="brand-icon">🚆</span>
          TrainBook
        </a>
        <span className="navbar-badge">BETA</span>
      </nav>

      {/* Page Content */}
      <Home />
    </>
  )
}

export default App
