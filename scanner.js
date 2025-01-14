const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');

// Set to store previously purchased tokens
const purchasedTokens = new Set();

// Load previously purchased tokens from file if it exists
try {
    if (fs.existsSync('purchased_tokens.json')) {
        const data = fs.readFileSync('purchased_tokens.json', 'utf8');
        JSON.parse(data).forEach(token => purchasedTokens.add(token));
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

// Fetch trending tokens from CoinGecko API
async function fetchFromCoinGecko() {
    try {
        console.log('Fetching trending tokens from CoinGecko...');
        const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        return data.coins.map(coin => coin.item.symbol.toUpperCase()); // Extract symbols
    } catch (error) {
        console.error('Error fetching data from CoinGecko:', error.message);
        return [];
    }
}

// Match DEX Screener tokens with CoinGecko trending tokens
function matchTrendingTokens(dexTokens, trendingTokens) {
    console.log('Matching tokens with CoinGecko trending tokens...');
    return dexTokens.filter(token => {
        const symbol = token.symbol || '';
        return trendingTokens.includes(symbol.toUpperCase());
    });
}

// Analyze and process tokens
async function analyzeAndProcessTokens() {
    const dexTokens = await fetchFromDexScreener();
    const trendingTokens = await fetchFromCoinGecko();

    if (dexTokens.length === 0) {
        console.log('No tokens found from DEX Screener.');
        return;
    }

    if (trendingTokens.length === 0) {
        console.log('No trending tokens found from CoinGecko.');
        return;
    }

    // Match tokens with trending list
    const matchingTokens = matchTrendingTokens(dexTokens, trendingTokens);

    if (matchingTokens.length === 0) {
        console.log('No tokens matched the trending list.');
        return;
    }

    // Process matching tokens
    matchingTokens.forEach(token => {
        console.log(`Trending Token Found: ${token.name || 'Unknown'} (${token.symbol || 'N/A'})`);
        console.log(`• Address: ${token.address || 'N/A'}`);
        console.log(`• Price: $${(token.price || 'N/A')}`);
        console.log('--------------------------------------');
    });

    // Save tokens to prevent repeated purchases
    savePurchasedTokens();
}

// Main loop
async function main() {
    while (true) {
        await analyzeAndProcessTokens();
        console.log(`\nWaiting ${config.SCAN_INTERVAL_MINUTES || 10} minutes before next scan...`);
        await new Promise(resolve => setTimeout(resolve, (config.SCAN_INTERVAL_MINUTES || 10) * 60 * 1000));
    }
}

main();
