import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  currentPoints: number;
  achievements: { id: string; name: string; description: string; points: number; category: string; count: number }[];
}

interface Achievement {
  id: string;
  name: string;
}

interface LeaderboardUser {
  id: string;
  username: string;
  currentPoints: number;
  totalPoints: number;
}

const Admin = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/achievements').then(res => setAchievements(res.data));
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    axios.get('http://localhost:3000/leaderboard?limit=100').then(res => setLeaderboardUsers(res.data));
  };

  const searchUsers = () => {
    axios.get(`http://localhost:3000/users?username=${query}`).then(res => setUsers(res.data));
  };

  const selectUser = (user: User) => {
    axios.get(`http://localhost:3000/users/${user.id}`).then(res => setSelectedUser(res.data));
  };

  const award = () => {
    if (selectedUser && selectedAchievement) {
      axios.post(`http://localhost:3000/users/${selectedUser.id}/achievements/${selectedAchievement}`)
        .then(() => alert('Logro otorgado'))
        .catch(err => alert('Error'));
    }
  };

  const deleteUser = (userId: string, username: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${username}?`)) {
      axios.delete(`http://localhost:3000/users/${userId}`)
        .then(() => {
          alert('Usuario eliminado');
          loadLeaderboard();
        })
        .catch(err => alert('Error al eliminar usuario'));
    }
  };

  return (
    <div className="card">
      <h2>Admin</h2>

      <h3>Gestión de Leaderboard</h3>
      <p>Usuarios en la clasificación:</p>
      <ul>
        {leaderboardUsers.map(u => (
          <li key={u.id}>
            {u.username} ({u.currentPoints} puntos) 
            <button onClick={() => deleteUser(u.id, u.username)} style={{ marginLeft: '10px', color: 'red' }}>Eliminar</button>
          </li>
        ))}
      </ul>

      <h3>Buscar y Gestionar Usuarios</h3>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar usuario por nombre" />
      <button onClick={searchUsers}>Buscar</button>
      <ul>
        {users.map(u => <li key={u.id} onClick={() => selectUser(u)}>{u.username} ({u.currentPoints} puntos)</li>)}
      </ul>
      {selectedUser && (
        <div>
          <p>Usuario seleccionado: {selectedUser.username} ({selectedUser.currentPoints} puntos)</p>
          <h3>Logros:</h3>
          <ul>
            {selectedUser.achievements.map(a => (
              <li key={a.id}>{a.name}: {a.description} ({a.points} puntos) - Desbloqueado {a.count} vez(a)</li>
            ))}
          </ul>
          <select onChange={e => setSelectedAchievement(e.target.value)}>
            <option value="">Seleccionar logro</option>
            {achievements.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button onClick={award}>Otorgar Logro</button>
        </div>
      )}
    </div>
  );
};

export default Admin;