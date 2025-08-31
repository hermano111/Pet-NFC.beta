import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PetProfile from './pages/PetProfile'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/pet/:id" element={<PetProfile />} />
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-text mb-4">PetNFC</h1>
                <p className="text-slate-600">Escanea la chapita de tu mascota para acceder a su perfil</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
