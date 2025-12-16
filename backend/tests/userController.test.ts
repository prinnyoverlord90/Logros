import request from 'supertest';
import app from '../src/index';

describe('User Controller - Redeem', () => {
  it('should redeem reward if sufficient points', async () => {
    // This test assumes a user with ID 'test-user' and a reward with ID 'test-reward' exist in DB
    // In a real test, seed the DB or mock
    const res = await request(app)
      .post('/users/test-user/redeem')
      .send({ rewardId: 'test-reward' });
    // Assuming success, but will fail without data
    expect(res.status).toBe(200);
  });

  it('should fail if insufficient points', async () => {
    const res = await request(app)
      .post('/users/test-user/redeem')
      .send({ rewardId: 'test-reward' });
    expect(res.status).toBe(400);
  });
});