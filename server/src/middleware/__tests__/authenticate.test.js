const jwt = require('jsonwebtoken');
const authenticate = require('../authenticate');
const env = require('../../config/env');

describe('Authenticate Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('should return 401 if Authorization header is missing', () => {
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' })
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token format is invalid', () => {
    req.headers.authorization = 'InvalidTokenFormat';
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should attach user payload and call next() if JWT is valid', () => {
    const payload = { sub: '507f1f77bcf86cd799439011', role: 'buyer', email: 'test@example.com' };
    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET);
    req.headers.authorization = `Bearer ${token}`;

    authenticate(req, res, next);

    expect(req.user).toEqual({
      id: payload.sub,
      role: payload.role,
      email: payload.email
    });
    expect(next).toHaveBeenCalled();
  });
});
