import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role || 'admin' },
    SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

/** Protects every write (POST/PUT/DELETE) route in the admin API. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    req.user = jwt.verify(token, SECRET);
    return next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return res
      .status(401)
      .json({ error: expired ? 'Session expired. Please sign in again.' : 'Invalid token.' });
  }
}
