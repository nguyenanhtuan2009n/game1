import express from 'express';
import path from 'path';
import 'dotenv/config';
import { handleGmTurn } from './server/gmHandler.ts';
import { generateInitialTurn } from './src/services/proceduralGm.ts';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/api/gm/turn', async (req, res) => {
  try {
    const result = await handleGmTurn(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error handling GM turn:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

app.post('/api/gm/init', (req, res) => {
  try {
    const { name, race, origin, baseStats, initialBonds, initialLanguages, carriedSp, carriedKp, preRolledTalent, rawBaseStats } = req.body;
    const result = generateInitialTurn(name, race, origin, baseStats, initialBonds, initialLanguages, carriedSp, carriedKp, preRolledTalent, rawBaseStats);
    res.json(result);
  } catch (err: any) {
    console.error('Error handling GM init:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// Serve frontend in production
const distPath = path.resolve(import.meta.dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
