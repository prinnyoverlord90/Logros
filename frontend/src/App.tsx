import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard';
import Achievements from './pages/Achievements';
import Rewards from './pages/Rewards';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div className="card">Cargando...</div>;

  const isStreamer = user?.username === 'vicky_el_vikingo90';

  return (
    <div>
      <h1>Logros de Vicky_el_vikingo90</h1>
      {user ? (
        <div>
          <p>Bienvenido, {user.username}!</p>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      ) : (
        <button onClick={login}>Iniciar sesión con Twitch</button>
      )}
      <nav className="nav">
        <a href="/leaderboard">Clasificación</a>
        <a href="/achievements">Logros</a>
        <a href="/rewards">Recompensas</a>
        {isStreamer && <a href="/admin">Administración</a>}
      </nav>
      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/rewards" element={<Rewards />} />
        {isStreamer && <Route path="/admin" element={<Admin />} />}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;