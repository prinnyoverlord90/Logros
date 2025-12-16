import request from 'supertest';
import app from '../src/index';

describe('Achievement Controller', () => {
  it('should get achievements', async () => {
    const res = await request(app).get('/achievements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});