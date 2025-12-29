import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'fallback_secret';

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Admin check using DB count
    const userCountRes = await query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(userCountRes.rows[0].count) === 0;
    const role = isFirstUser ? 'admin' : 'user';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert and verify
    const result = await query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, credits',
      [username, hashedPassword, role]
    );
    
    if (!result.rows.length) {
      throw new Error('User insertion failed: No rows returned');
    }
    
    console.log('[Auth] User registered:', result.rows[0].username);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Auth] Registration error:', err);
    res.status(400).json({ error: 'Username taken or database error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
      
      console.log('[Auth] User logged in:', user.username);
      res.json({ id: user.id, username: user.username, role: user.role, credits: user.credits });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
