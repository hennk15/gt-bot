const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');
const wsClient = require('./websocket-client');

// Set to store previously purchased tokens
const purchasedTokens = new Set();

// Load previously purchased tokens from file if it exists
try {
    if (fs.existsSync('purchased_tokens.json')) {
        const data = fs.readFileSync('purchased_tokens.json', 'utf8');
        const tokens = JSON.parse(data);
        tokens.forEach(token => purchasedTokens.add(token));
    }
} catch (error) {
    console.error('Error loading purchased tokens:', error.message);
}

// Function to save purchased tokens to file
function savePurchasedTokens() {
    try {
        fs.writeFileSync('purchased_tokens.json', JSON.stringify(Array.from(purchasedTokens), null, 2));
    } catch (error) {
        console.error('Error saving purchased tokens:', error.message);
    }
}

// Connect to WebSocket server
wsClient.connect();

// Store original console methods
const originalConsole = {
    log: console.log,
    error: console.error
};

// Override console.log to send to web interface
console.log = function () {
    const text = Array.from(arguments).join(' ');
    originalConsole.log.apply(console, arguments);
    wsClient.sendToWeb('log', text);
};

// Override console.error to send to web interface
console.error = function () {
    const text = Array.from(arguments).join(' ');
    originalConsole.error.apply(console, arguments);
    wsClient.sendToWeb('log', 'Error: ' + text);
};

// Fetch data from DEX Screener API
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

// Fetch data from Jupiter API (used as Ape Pro proxy)
async function fetchFromJupiter() {
    try {
        console.log('Fetching data from Jupiter API...');
        const response = await fetch('https://quote-api.jup.ag/v4/prices');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return Object.entries(data.data || {}).map(([address, info]) => ({
            address,
            price: info.price || 'N/A',
            mint: info.mint || 'Unknown Mint',
        }));
    } catch (error) {
        console.error('Error fetching data from Jupiter API:', error.message);
        return [];
    }
}

// Combine and process data from both APIs
async function getTokenProfiles() {
    try {
        const dexData = await fetchFromDexScreener();
        const jupiterData = await fetchFromJupiter();

        console.log(`Fetched ${dexData.length} tokens from DEX Screener.`);
        console.log(`Fetched ${jupiterData.length} tokens from Jupiter API.`);

        // Combine data
        const combinedData = [...dexData, ...jupiterData];
        console.log(`Combined data contains ${combinedData.length} tokens.`);
        return combinedData;
    } catch (error) {
        console.error('Error combining data from APIs:', error.message);
        return [];
    }
}

// Analyze and process tokens
async function analyzeAndProcessTokens() {
    const tokens = await getTokenProfiles();
    if (tokens.length === 0) {
        console.log('No tokens found to process.');
        return;
    }

    tokens.forEach(token => {
        console.log(`Token: ${token.name || token.address}, Price: ${token.price || 'N/A'}`);
    });

    // Save tokens to prevent repeated purchases
    savePurchasedTokens();
}

// Main loop
async function main() {
    try {
        while (true) {
            await analyzeAndProcessTokens();
            console.log(`\nWaiting ${config.SCAN_INTERVAL_MINUTES || 10} minutes before next scan...`);
            await new Promise(resolve => setTimeout(resolve, (config.SCAN_INTERVAL_MINUTES || 10) * 60 * 1000));
        }
    } catch (error) {
        console.error('Error in main loop:', error.message);
    }
}

main();

