const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');

// Removed WebSocket client
// const wsClient = require('./websocket-client');

// Load purchased tokens
const purchasedTokens = new Set();
try {
    if (fs.existsSync('purchased_tokens.json')) {
        const data = fs.readFileSync('purchased_tokens.json', 'utf8');
        JSON.parse(data).forEach(token => purchasedTokens.add(token));
    }
} catch (error) {
    console.error('Error loading purchased tokens:', error.message);
}

function savePurchasedTokens() {
    try {
        fs.writeFileSync('purchased_tokens.json', JSON.stringify(Array.from(purchasedTokens), null, 2));
    } catch (error) {
        console.error('Error saving purchased tokens:', error.message);
    }
}

// Fetch data from DEX Screener
async function fetchFromDexScreener() {
    try {
        console.log('Fetching data from DEX Screener...');
        const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching data from DEX Screener:', error.message);
        return [];
    }
}

// Temporarily disable Jupiter API
async function fetchFromJupiter() {
    console.log('Skipping Jupiter API (temporary)...');
    return [];
}

// Combine data from APIs
async function getTokenProfiles() {
    const dexData = await fetchFromDexScreener();
    const jupiterData = await fetchFromJupiter();

    console.log(`Fetched ${dexData.length} tokens from DEX Screener.`);
    console.log(`Fetched ${jupiterData.length} tokens from Jupiter API.`);

    const combinedData = [...dexData, ...jupiterData];
    console.log(`Combined data contains ${combinedData.length} tokens.`);
    return combinedData;
}

// Analyze tokens
async function analyzeAndProcessTokens() {
    const tokens = await getTokenProfiles();
    if (tokens.length === 0) {
        console.log('No tokens to process.');
        return;
    }

    tokens.forEach(token => {
        console.log(`Token: ${token.name || token.address || 'Unknown'}, Price: ${token.price || 'N/A'}`);
    });

    savePurchasedTokens();
}

// Main loop
async function main() {
    while (true) {
        await analyzeAndProcessTokens();
        console.log(`\nWaiting ${config.SCAN_INTERVAL_MINUTES} minutes before next scan...`);
        await new Promise(resolve => setTimeout(resolve, config.SCAN_INTERVAL_MINUTES * 60 * 1000));
    }
}

main();
