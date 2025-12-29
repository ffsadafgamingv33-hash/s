import express from 'express';
import { query, getClient } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[Items] Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.post('/', async (req, res) => {
  const { name, description, price, type, content } = req.body;
  try {
    const result = await query(
      'INSERT INTO items (name, description, price, type, content) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, type, content]
    );
    
    if (!result.rows.length) {
      throw new Error('Item insertion failed');
    }

    console.log('[Items] Item created:', result.rows[0].name);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Items] Creation error:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Purchase logic with transaction
router.post('/purchase', async (req, res) => {
  const { userId, itemId } = req.body;
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const userRes = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const itemRes = await client.query('SELECT * FROM items WHERE id = $1', [itemId]);
    
    const user = userRes.rows[0];
    const item = itemRes.rows[0];
    
    if (!user || !item) throw new Error('User or item not found');
    if (user.credits < item.price) throw new Error('Insufficient credits');
    
    // Deduct credits
    await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [item.price, userId]);
    
    // Record purchase
    const purchaseRes = await client.query(
      'INSERT INTO purchases (user_id, item_id, item_name, content_delivered, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, itemId, item.name, item.content, item.price]
    );
    
    await client.query('COMMIT');
    console.log('[Purchase] Success:', { userId, itemId });
    res.json(purchaseRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Purchase] Failed, rolled back:', err);
    res.status(400).json({ error: err instanceof Error ? err.message : 'Purchase failed' });
  } finally {
    client.release();
  }
});

export default router;
