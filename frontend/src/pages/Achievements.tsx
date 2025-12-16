import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  isRepeatable: boolean;
}

interface UserAchievement {
  id: string;
  achievement: Achievement;
  count: number;
  awardedAt: string;
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    axios.get('http://localhost:3000/achievements').then(res => setAchievements(res.data));
  }, []);

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:3000/users/${user.id}`).then(res => setUserAchievements(res.data.achievements));
    }
  }, [user]);

  const hasAchievement = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement.id === achievementId);
  };

  return (
    <div className="card">
      <h2>Logros Disponibles</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Estado</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Nombre</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Descripción</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {achievements.map(a => {
            const owned = hasAchievement(a.id);
            const status = owned ? '✔️' + (a.isRepeatable ? ' 🔁' : '') : '❌';
            return (
              <tr key={a.id}>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{status}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{a.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{a.description}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{a.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Achievements;