import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
        <Link to="/leaderboard">Clasificación</Link>
        <Link to="/achievements">Logros</Link>
        <Link to="/rewards">Recompensas</Link>
        {isStreamer && <Link to="/admin">Administración</Link>}
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