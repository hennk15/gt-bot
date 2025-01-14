const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config');

// Set to store purchased tokens and their entry prices
const purchasedTokens = new Map();

// Load previously purchased tokens from file
try {
    if (fs.existsSync('purchased_tokens.json')) {
        const data = fs.readFileSync('purchased_tokens.json', 'utf8');
        const tokens = JSON.parse(data);
        tokens.forEach(token => purchasedTokens.set(token.address, token));
    }
} catch (error) {
    console.error('Error loading purchased tokens:', error.message);
}

// Save purchased tokens to file
function savePurchasedTokens() {
    try {
        const tokens = Array.from(purchasedTokens.values());
        fs.writeFileSync('purchased_tokens.json', JSON.stringify(tokens, null, 2));
    } catch (error) {
        console.error('Error saving purchased tokens:', error.message);
    }
}

// Fetch all tokens from DEX Screener
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

// Check if a token is already purchased
function isAlreadyPurchased(tokenAddress) {
    return purchasedTokens.has(tokenAddress);
}

// Simulate trading a token
function tradeToken(token) {
    const entryPrice = token.price || 0;
    if (entryPrice === 0) {
        console.error(`Token ${token.name} (${token.symbol}) has no price data.`);
        return;
    }

    console.log(`Trading new token: ${token.name || 'Unknown'} (${token.symbol || 'N/A'})`);
    console.log(`• Address: ${token.address || 'N/A'}`);
    console.log(`• Entry Price: $${entryPrice.toFixed(2)}`);
    console.log('--------------------------------------');

    // Add token to purchased tokens
    purchasedTokens.set(token.address, {
        name: token.name || 'Unknown',
        symbol: token.symbol || 'N/A',
        address: token.address || 'N/A',
        entryPrice,
    });

    savePurchasedTokens();
}

// Monitor tokens and decide whether to sell or hold
async function monitorTokens() {
    console.log('Monitoring purchased tokens...');
    for (const [address, token] of purchasedTokens.entries()) {
        try {
            // Fetch current price from DEX Screener
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
            const data = await response.json();
            const currentPrice = parseFloat(data.priceUsd) || 0;

            if (currentPrice === 0) {
                console.log(`Unable to fetch price for ${token.name} (${token.symbol}).`);
                continue;
            }

            const priceChange = ((currentPrice - token.entryPrice) / token.entryPrice) * 100;

            console.log(`Token: ${token.name} (${token.symbol})`);
            console.log(`• Entry Price: $${token.entryPrice.toFixed(2)}`);
            console.log(`• Current Price: $${currentPrice.toFixed(2)}`);
            console.log(`• Price Change: ${priceChange.toFixed(2)}%`);

            // Decide whether to sell
            if (priceChange >= 100) {
                console.log(`Selling ${token.name} (${token.symbol}) for 100% profit.`);
                purchasedTokens.delete(address);
                savePurchasedTokens();
            } else if (priceChange <= -50) {
                console.log(`Selling ${token.name} (${token.symbol}) due to 50% loss.`);
                purchasedTokens.delete(address);
                savePurchasedTokens();
            } else {
                console.log(`Holding ${token.name} (${token.symbol}).`);
            }

            console.log('--------------------------------------');
        } catch (error) {
            console.error(`Error monitoring token ${token.name} (${token.symbol}):`, error.message);
        }
    }
}

// Main trading function
async function analyzeAndTradeTokens() {
    const tokens = await fetchFromDexScreener();

    if (tokens.length === 0) {
        console.log('No tokens found from DEX Screener.');
        return;
    }

    // Trade all new tokens
    tokens.forEach(token => {
        if (!isAlreadyPurchased(token.address)) {
            tradeToken(token);
        }
    });

    // Monitor purchased tokens
    await monitorTokens();
}

// Main loop
async function main() {
    while (true) {
        await analyzeAndTradeTokens();
        console.log(`\nWaiting ${config.SCAN_INTERVAL_MINUTES || 10} minutes before next scan...`);
        await new Promise(resolve => setTimeout(resolve, (config.SCAN_INTERVAL_MINUTES || 10) * 60 * 1000));
    }
}

main();
