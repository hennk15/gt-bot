const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
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

// Fetch wallet balance
async function getWalletBalance() {
    try {
        const connection = new Connection(config.RPC_URL);
        const wallet = Keypair.fromSecretKey(Buffer.from(config.WALLET_PRIVATE_KEY, 'base64'));
        const balance = await connection.getBalance(wallet.publicKey); // In lamports
        return balance / 1e9; // Convert to SOL
    } catch (error) {
        console.error('Error fetching wallet balance:', error.message);
        return 0;
    }
}

// Determine purchase amount
async function getPurchaseAmount() {
    const balance = await getWalletBalance();
    console.log(`Current Wallet Balance: ${balance.toFixed(2)} SOL`);

    if (balance >= config.AMOUNT_SOL) {
        return config.AMOUNT_SOL;
    } else if (balance >= config.MIN_AMOUNT_SOL) {
        console.warn(`Insufficient balance for ${config.AMOUNT_SOL} SOL. Defaulting to ${config.MIN_AMOUNT_SOL} SOL.`);
        return config.MIN_AMOUNT_SOL;
    } else {
        console.error('Insufficient balance for trading.');
        return 0; // No trade if balance is below the minimum
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
async function tradeToken(token) {
    const purchaseAmount = await getPurchaseAmount();

    if (purchaseAmount === 0) {
        console.log(`Skipping trade for ${token.name || 'Unknown'} (${token.symbol || 'N/A'}) due to insufficient balance.`);
        return;
    }

    const entryPrice = token.price || 0;
    if (entryPrice === 0) {
        console.error(`Token ${token.name || 'Unknown'} (${token.symbol || 'N/A'}) has no price data.`);
        return;
    }

    console.log(`Trading new token: ${token.name || 'Unknown'} (${token.symbol || 'N/A'})`);
    console.log(`• Address: ${token.address || 'N/A'}`);
    console.log(`• Entry Price: $${entryPrice.toFixed(2)}`);
    console.log(`• Amount Allocated: ${purchaseAmount} SOL`);
    console.log('--------------------------------------');

    // Add token to purchased tokens
    purchasedTokens.set(token.address, {
        name: token.name || 'Unknown',
        symbol: token.symbol || 'N/A',
        address: token.address || 'N/A',
        entryPrice,
        purchaseAmount,
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

            // Sell logic
            if (priceChange >= config.PROFIT_THRESHOLD_PERCENT) {
                console.log(`Selling ${token.name} (${token.symbol}) for 100% profit.`);
                purchasedTokens.delete(address);
                savePurchasedTokens();
            } else if (priceChange <= -config.LOSS_THRESHOLD_PERCENT) {
                console.log(`Selling ${token.name} (${token.symbol}) due to 50% loss.`);
                purchasedTokens.delete(address);
                savePurchasedTokens();
            } else {
                console.log(`Holding ${token.name} (${token.symbol}).`);
            }

            console.log('--------------------------------------');
        } catch (error) {
            console.error(`Error monitoring token ${token.name || 'Unknown'} (${token.symbol}):`, error.message);
        }
    }
}

// Main loop
async function analyzeAndTradeTokens() {
    const tokens = await fetchFromDexScreener();

    if (tokens.length === 0) {
        console.log('No tokens found from DEX Screener.');
        return;
    }

    tokens.forEach(async token => {
        if (!isAlreadyPurchased(token.address)) {
            await tradeToken(token);
        }
    });

    await monitorTokens();
}

async function main() {
    while (true) {
        await analyzeAndTradeTokens();
        console.log(`\nWaiting ${config.SCAN_INTERVAL_MINUTES || 10} minutes before next scan...`);
        await new Promise(resolve => setTimeout(resolve, (config.SCAN_INTERVAL_MINUTES || 10) * 60 * 1000));
    }
}

main();
