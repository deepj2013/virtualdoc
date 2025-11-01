import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>🚀 VirtualDoc Platform</h1>
            <p>Healthcare Platform is Running!</p>
            <div style={{ marginTop: '2rem' }}>
              <h2>Services Status</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>✅ Auth Service: <a href="http://localhost:3001">http://localhost:3001</a></li>
                <li>✅ User Service: <a href="http://localhost:3002">http://localhost:3002</a></li>
                <li>✅ Patient Service: <a href="http://localhost:3003">http://localhost:3003</a></li>
                <li>✅ Appointment Service: <a href="http://localhost:3004">http://localhost:3004</a></li>
              </ul>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
