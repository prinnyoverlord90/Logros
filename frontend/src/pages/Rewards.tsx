import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
}

const Rewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    api.get('/rewards').then(res => setRewards(res.data));
  }, []);

  const redeem = (rewardId: string) => {
    if (!user) {
      alert('Debes iniciar sesión primero');
      return;
    }
    api.post(`/users/${user.id}/redeem`, { rewardId })
      .then(() => alert('¡Reward canjeada!'))
      .catch(err => {
        const error = err.response?.data?.error;
        if (error === 'Insufficient points') {
          alert('No tienes suficientes puntos. Necesitas conseguir más. Ve a Achievements para ver cómo ganar puntos.');
        } else {
          alert('Error: ' + error);
        }
      });
  };

  if (!user) return <div className="card">Debes iniciar sesión para canjear rewards.</div>;

  return (
    <div className="card">
      <h2>Recompensas</h2>
      <p>Tus puntos: {user.currentPoints || 0}</p>
      <ul>
        {rewards.map(r => (
          <li key={r.id}>
            <strong>{r.name}</strong>: {r.description} <br />
            <em>Costo: {r.cost} puntos</em>
            <br />
            <button onClick={() => redeem(r.id)}>Canjear</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Rewards;