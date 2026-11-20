import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../src/app.js';

let mongo, token;
beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-with-enough-length';
  process.env.NODE_ENV = 'test';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});
afterEach(async () => { await mongoose.connection.dropDatabase(); });
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });

test('signup, login and protect a user-owned leads API', async () => {
  const signup = await request(app).post('/api/auth/signup').send({ name: 'Taylor', email: 'taylor@example.com', password: 'password123' });
  expect(signup.status).toBe(201);
  token = signup.body.token;
  const created = await request(app).post('/api/leads').set('Authorization', `Bearer ${token}`).send({ name: 'Jordan Lee', email: 'jordan@example.com', phone: '9876543210', company: 'Acme', source: 'Website', status: 'New' });
  expect(created.status).toBe(201);
  const list = await request(app).get('/api/leads').set('Authorization', `Bearer ${token}`);
  expect(list.body.leads).toHaveLength(1);
  const counts = await request(app).get('/api/leads/dashboard').set('Authorization', `Bearer ${token}`);
  expect(counts.body.byStatus.New).toBe(1);
});

test('reject invalid lead data and unauthenticated access', async () => {
  const unauthenticated = await request(app).get('/api/leads');
  expect(unauthenticated.status).toBe(401);
  const signup = await request(app).post('/api/auth/signup').send({ name: 'Taylor', email: 'taylor@example.com', password: 'password123' });
  const invalid = await request(app).post('/api/leads').set('Authorization', `Bearer ${signup.body.token}`).send({ name: '', email: 'not-an-email' });
  expect(invalid.status).toBe(400);
});
