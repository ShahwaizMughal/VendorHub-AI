const authorize = require('../authorize');

describe('Authorize Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('should return 401 if user is not attached to req', () => {
    const middleware = authorize('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 if user role is not in allowed roles', () => {
    req.user = { role: 'buyer' };
    const middleware = authorize('admin', 'vendor');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() if user role matches allowed roles', () => {
    req.user = { role: 'vendor' };
    const middleware = authorize('admin', 'vendor');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
