import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  currentPoints: number;
  totalPoints: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios.get('/leaderboard').then(res => setUsers(res.data));
  }, []);

  return (
    <div className="card">
      <h2>Clasificación</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <div className="leaderboard-item">
              <div>{user.username}</div>
              <div style={{opacity:0.9}}>{user.currentPoints} puntos</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;