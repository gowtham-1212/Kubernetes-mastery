import express, { Request, Response } from 'express';
import { pool, initDb } from './db';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Get all users from DB
app.get('/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create a user in DB
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [name || 'Anonymous Developer']
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await initDb();
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
});