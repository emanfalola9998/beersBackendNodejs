    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const Beer = require('./models/beer');
    const sequelize = require('./db');

    const app = express();

    // Determine if local or prod
    // const isLocal = process.env.NODE_ENV !== 'production';
    // const FRONTEND_ORIGIN = isLocal
    // ? 'http://localhost:5173'  // Vite default
    // : 'https://beerfrontend.netlify.app';  // or your Netlify domain

      const FRONTEND_ORIGIN = 'https://beerfrontend.netlify.app';  // or your Netlify domain

    app.use(cors({
    origin: FRONTEND_ORIGIN,
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
        const {
        name,
        description,
        abv: rawAbv,
        image_url,
        ph,
        first_brewed
        } = req.body;

        // Normalize and parse ABV
        let abv = rawAbv;
        if (typeof rawAbv === 'string') {
        abv = rawAbv.replace(/[^\d.]/g, ''); // remove %, =, etc.
        }
        abv = parseFloat(abv);

        if (isNaN(abv)) {
        console.error('Invalid ABV:', rawAbv);
        return res.status(400).json({ error: 'Invalid ABV format' });
        }

        const newBeer = await Beer.create({
        name,
        description,
        abv,
        image_url,
        ph,
        first_brewed
        });

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

