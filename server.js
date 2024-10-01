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
const clientId = process.env.CASPIO_CLIENT_ID;
const clientSecret = process.env.CASPIO_CLIENT_SECRET;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${message}`);
}

async function refreshAccessToken() {
    log('Attempting to refresh access token...');
    try {
        const refreshUrl = 'https://c3eku948.caspio.com/oauth/token';
        const refreshBody = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
        });
        log(`Refresh URL: ${refreshUrl}`);
        log(`Refresh body: ${refreshBody.toString()}`);
        log(`Client ID: ${clientId}`);
        log(`Client Secret: ${clientSecret ? '[REDACTED]' : 'Not set'}`);
        log(`Refresh Token: ${refreshToken ? '[REDACTED]' : 'Not set'}`);

        const response = await fetch(refreshUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: refreshBody,
        }).catch(error => {
            log(`Network error during token refresh: ${error.message}`);
            throw error;
        });

        log(`Token refresh response status: ${response.status}`);
        log(`Token refresh response headers: ${JSON.stringify(response.headers.raw())}`);

        const responseText = await response.text();
        log(`Token refresh response body: ${responseText}`);

        if (!response.ok) {
            throw new Error(`Failed to refresh token. Status: ${response.status}, Response: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        accessToken = data.access_token;
        log('Access token refreshed successfully');
        log(`New access token: ${accessToken ? '[REDACTED]' : 'Not set'}`);
        return accessToken;
    } catch (error) {
        log(`Error in refreshAccessToken: ${error}`);
        throw error;
    }
}

// Define routes
app.get('/refresh-token', async (req, res) => {
    log('Received request to /refresh-token endpoint');
    try {
        await refreshAccessToken();
        log('Token refresh successful, sending response');
        res.json({ message: 'Token refreshed successfully', accessToken: '[REDACTED]' });
    } catch (error) {
        log(`Error in /refresh-token endpoint: ${error}`);
        res.status(500).json({ error: 'Failed to refresh token', details: error.message });
    }
});

app.get('/api/garment/:styleNumber', async (req, res) => {
    log(`Received request for style number: ${req.params.styleNumber}`);
    try {
        // Refresh the token before making the API call
        accessToken = await refreshAccessToken();

        const { styleNumber } = req.params;
        const apiUrl = process.env.CASPIO_API_URL;
        const headers = {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };

        log(`Fetching data from Caspio API for style number: ${styleNumber}`);
        log(`API URL: ${apiUrl}`);
        log(`Headers: ${JSON.stringify(headers)}`);

        const response = await fetch(`${apiUrl}?q.where=STYLE_No='${styleNumber}'&q.limit=1`, { headers });
        
        log(`Caspio API response status: ${response.status}`);
        
        const responseText = await response.text();
        log(`Caspio API response: ${responseText}`);

        if (!response.ok) {
            throw new Error(`Caspio API response was not ok. Status: ${response.status}, Response: ${responseText}`);
        }
        
        const data = JSON.parse(responseText);
        
        if (data.Result && data.Result.length > 0) {
            const item = data.Result[0];
            const responseData = {
                description: item.PRODUCT_TITLE,
                price: item.Price_12_23,
                capPrice: item.CapPrice_24_143
            };
            log(`Sending response: ${JSON.stringify(responseData)}`);
            res.json(responseData);
        } else {
            log('Item not found');
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        log(`Error in /api/garment/:styleNumber: ${error}`);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Catch-all route should be last
app.get('*', (req, res) => {
    log(`Received request to catch-all route: ${req.url}`);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    log(`Server started at: ${new Date().toISOString()}`);
    log(`Server is running on port ${PORT}`);
    log('Environment variables:');
    log(`PORT: ${process.env.PORT}`);
    log(`CASPIO_CLIENT_ID: ${process.env.CASPIO_CLIENT_ID}`);
    log(`CASPIO_CLIENT_SECRET: ${process.env.CASPIO_CLIENT_SECRET ? '[REDACTED]' : 'Not set'}`);
    log(`CASPIO_API_URL: ${process.env.CASPIO_API_URL}`);
    log(`INITIAL_ACCESS_TOKEN: ${process.env.INITIAL_ACCESS_TOKEN ? '[REDACTED]' : 'Not set'}`);
    log(`REFRESH_TOKEN: ${process.env.REFRESH_TOKEN ? '[REDACTED]' : 'Not set'}`);
});