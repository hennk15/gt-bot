module.exports = {
    // Your wallet's private key (keep this secure!)
    PRIVATE_KEY: "",
    
    // Amount of SOL to spend
    AMOUNT_TO_SPEND: 0.1,
    
    // Slippage tolerance in basis points (1 bp = 0.01%, 100 bp = 1%)
    SLIPPAGE_BPS: 2500, // 25% slippage
    
    // Priority fee in SOL (increased for faster execution)
    PRIORITY_FEE_SOL: 0.0015,
    
    // List of RPC endpoints to use (will try them in order)
    RPC_ENDPOINTS: [
        'https://api.mainnet-beta.solana.com',
        // Add more RPC endpoints here for more stability
        // https://instantnodes.io/ for examples (need account)
    ],

    // Keep as fallback
    RPC_URL: 'https://api.mainnet-beta.solana.com',

    // Price monitoring settings
    PRICE_CHECK_INTERVAL: 10, // seconds
    STOP_LOSS_PERCENTAGE: 30, // sell if price drops by 30%
    TAKE_PROFIT_PERCENTAGE: 100, // sell if price increases by 100%
    
    // Auto-sell settings
    SELL_SLIPPAGE_BPS: 3000, // 30% slippage for selling
    SELL_PRIORITY_FEE_SOL: 0.0015, // Increased priority fee for selling

    // Scanner settings
    SCAN_INTERVAL_MINUTES: 10 // Time between token scans
} 