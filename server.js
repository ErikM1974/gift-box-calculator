import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

let accessToken = process.env.INITIAL_ACCESS_TOKEN;
const refreshToken = process.env.REFRESH_TOKEN;
let tokenExpiration = Date.now() + 86399000; // Current time + 24 hours in milliseconds

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

async function refreshAccessToken() {
    console.log('Refreshing access token...');
    const response = await fetch('https://c3eku948.caspio.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.CASPIO_CLIENT_ID,
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiration = Date.now() + (data.expires_in * 1000);
    console.log('Access token refreshed successfully');
}

app.get('/api/garment/:styleNumber', async (req, res) => {
    console.log(`Received request for style number: ${req.params.styleNumber}`);
    if (Date.now() >= tokenExpiration) {
        try {
            await refreshAccessToken();
        } catch (error) {
            console.error('Error refreshing token:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    const { styleNumber } = req.params;
    const apiUrl = process.env.CASPIO_API_URL;
    const headers = {
        'accept': 'application/json',
        'Authorization': `bearer ${accessToken}`
    };

    try {
        console.log(`Fetching data from Caspio API for style number: ${styleNumber}`);
        const response = await fetch(`${apiUrl}?q.where=STYLE_No='${styleNumber}'&q.limit=1`, { headers });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Received data from Caspio API:', data);
        if (data.Result && data.Result.length > 0) {
            const item = data.Result[0];
            res.json({
                description: item.PRODUCT_TITLE,
                price: item.Price_12_23,
                capPrice: item.CapPrice_24_143
            });
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment variables:');
    console.log('PORT:', process.env.PORT);
    console.log('CASPIO_CLIENT_ID:', process.env.CASPIO_CLIENT_ID);
    console.log('CASPIO_API_URL:', process.env.CASPIO_API_URL);
    console.log('INITIAL_ACCESS_TOKEN:', process.env.INITIAL_ACCESS_TOKEN ? 'Set' : 'Not set');
    console.log('REFRESH_TOKEN:', process.env.REFRESH_TOKEN ? 'Set' : 'Not set');
});