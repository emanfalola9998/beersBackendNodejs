const express = require('express');
const cors = require('cors');
const Beer = require('./models/beer');
const sequelize = require('./db');

const app = express();

app.use(cors({
  origin: 'https://deploy-preview-18--beerfrontend.netlify.app',
  credentials: true,
}));
app.use(express.json());

// Sync the model (creates table if needed)
Beer.sync();

// Routes

app.get('/api/beers', async (req, res) => {
  const beers = await Beer.findAll();
  res.json(beers);
});

app.get('/api/beers/:id', async (req, res) => {
  const beer = await Beer.findByPk(req.params.id);
  if (!beer) return res.status(404).json({ error: 'Beer not found' });
  res.json(beer);
});

app.post('/api/beers', async (req, res) => {
  const { name, abv } = req.body;
  const newBeer = await Beer.create({ name, abv });
  res.status(201).json(newBeer);
});

app.put('/api/beers/:id', async (req, res) => {
  const beer = await Beer.findByPk(req.params.id);
  if (!beer) return res.status(404).json({ error: 'Beer not found' });

  const { name, abv } = req.body;
  await beer.update({ name: name ?? beer.name, abv: abv ?? beer.abv });
  res.json(beer);
});

app.delete('/api/beers/:id', async (req, res) => {
  const beer = await Beer.findByPk(req.params.id);
  if (!beer) return res.status(404).json({ error: 'Beer not found' });

  await beer.destroy();
  res.status(204).send();
});

const PORT = process.env.PORT || 3001;  // fallback to 3001 if PORT is not set locally

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

