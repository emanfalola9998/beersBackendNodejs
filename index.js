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
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Missing request body' });
    }

    const {
      name,
      description,
      abv: rawAbv
    } = req.body;

    // Sanitize and convert abv
    const abv = parseFloat(String(rawAbv).replace('%', '').trim());
    if (isNaN(abv)) {
      return res.status(400).json({ error: 'Invalid ABV format' });
    }

    if (!name || !abv || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newBeer = await Beer.create(req.body);
    res.status(201).json(newBeer);
  } catch (err) {
    console.error('❌ Error saving beer:', err);
    res.status(500).send('Internal Server Error');
  }
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

app.post('/api/proxy/beer-submit', async (req, res) => {
  try {
    const response = await fetch('https://emmanuelfalola.app.n8n.cloud/webhook-test/beer-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    // Forward status and response body
    res.status(response.status)
    const data = await response.text()  // or response.json() if you expect JSON
    res.send(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed' })
  }
})



const PORT = process.env.PORT || 3001;  // fallback to 3001 if PORT is not set locally

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

