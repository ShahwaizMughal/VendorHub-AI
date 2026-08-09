const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth & User API Integration Tests', () => {
  const buyerUser = {
    name: 'Jane Buyer',
    email: 'jane@buyer.com',
    password: 'Password123!',
    role: 'buyer'
  };

  const vendorUser = {
    name: 'John Vendor',
    email: 'john@vendor.com',
    password: 'Password123!',
    role: 'vendor',
    companyName: 'Acme Supplies Inc'
  };

  describe('POST /api/auth/register', () => {
    test('should register a new buyer user', async () => {
      const res = await request(app).post('/api/auth/register').send(buyerUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(buyerUser.email.toLowerCase());
      expect(res.body.data.user.isVerified).toBe(false);

      const dbUser = await User.findOne({ email: buyerUser.email });
      expect(dbUser).not.toBeNull();
    });

    test('should fail registration if vendor omits companyName', async () => {
      const invalidVendor = { ...vendorUser, companyName: '' };
      const res = await request(app).post('/api/auth/register').send(invalidVendor);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject registration with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(buyerUser);
      const res = await request(app).post('/api/auth/register').send(buyerUser);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('Email Verification & Vendor Login Guard', () => {
    test('vendor cannot login if email is unverified (returns 403)', async () => {
      await request(app).post('/api/auth/register').send(vendorUser);

      const loginRes = await request(app).post('/api/auth/login').send({
        email: vendorUser.email,
        password: vendorUser.password
      });

      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error.code).toBe('UNVERIFIED_EMAIL');
    });

    test('verifying email enables vendor login', async () => {
      await request(app).post('/api/auth/register').send(vendorUser);

      const dbUser = await User.findOne({ email: vendorUser.email }).select('+verificationTokenHash');
      dbUser.isVerified = true;
      await dbUser.save();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: vendorUser.email,
        password: vendorUser.password
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.accessToken).toBeDefined();
      expect(loginRes.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Silent Token Refresh & Rotation', () => {
    test('refresh rotates access token and refresh cookie', async () => {
      await request(app).post('/api/auth/register').send(buyerUser);
      const dbUser = await User.findOne({ email: buyerUser.email });
      dbUser.isVerified = true;
      await dbUser.save();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: buyerUser.email,
        password: buyerUser.password
      });

      const cookies = loginRes.headers['set-cookie'];

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /api/users/me and PATCH /api/users/me', () => {
    test('authenticated user can fetch and update their profile', async () => {
      await request(app).post('/api/auth/register').send(buyerUser);
      const dbUser = await User.findOne({ email: buyerUser.email });
      dbUser.isVerified = true;
      await dbUser.save();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: buyerUser.email,
        password: buyerUser.password
      });

      const token = loginRes.body.data.accessToken;

      const meRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.email).toBe(buyerUser.email.toLowerCase());

      const updateRes = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Jane Updated Buyer' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.user.name).toBe('Jane Updated Buyer');
    });
  });

  describe('DELETE /api/users/me & POST /api/users/me/restore (Soft Delete)', () => {
    test('user can soft delete account, blocking login and profile access', async () => {
      await request(app).post('/api/auth/register').send(buyerUser);
      const dbUser = await User.findOne({ email: buyerUser.email });
      dbUser.isVerified = true;
      await dbUser.save();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: buyerUser.email,
        password: buyerUser.password
      });

      const token = loginRes.body.data.accessToken;

      // Soft delete user profile
      const deleteRes = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.data.message).toBe('Account deactivated successfully');

      // Verify in DB that isDeleted is true and deletedAt is set
      const deletedDbUser = await User.findOne({ email: buyerUser.email });
      expect(deletedDbUser.isDeleted).toBe(true);
      expect(deletedDbUser.deletedAt).toBeInstanceOf(Date);

      // Verify profile fetch returns 404
      const meRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(404);

      // Verify login is blocked with 401 ACCOUNT_DELETED
      const retryLogin = await request(app).post('/api/auth/login').send({
        email: buyerUser.email,
        password: buyerUser.password
      });

      expect(retryLogin.status).toBe(401);
      expect(retryLogin.body.error.code).toBe('ACCOUNT_DELETED');
    });

    test('account can be restored via restore endpoint', async () => {
      await request(app).post('/api/auth/register').send(buyerUser);
      const dbUser = await User.findOne({ email: buyerUser.email });
      dbUser.isVerified = true;
      await dbUser.save();

      const loginRes = await request(app).post('/api/auth/login').send({
        email: buyerUser.email,
        password: buyerUser.password
      });

      const token = loginRes.body.data.accessToken;

      // Soft delete
      await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      // Restore account
      const restoreRes = await request(app)
        .post('/api/users/me/restore')
        .set('Authorization', `Bearer ${token}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.success).toBe(true);
      expect(restoreRes.body.data.user.isDeleted).toBe(false);

      // Verify user can log in again
      const reloginRes = await request(app).post('/api/auth/login').send({
        email: buyerUser.email,
        password: buyerUser.password
      });

      expect(reloginRes.status).toBe(200);
      expect(reloginRes.body.success).toBe(true);
    });
  });
});
