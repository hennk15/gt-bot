module.exports = {
    // Solana RPC Configuration
    RPC_URL: 'https://api.mainnet-beta.solana.com', // Primary RPC URL
    RPC_ENDPOINTS: [
        'https://api.mainnet-beta.solana.com', // Add additional endpoints if needed
    ],

    // Wallet Settings
    PRIVATE_KEY: '2TnEgLSmHHgf25BkBRvLpUAieJu3dqWNNPmrMcNAuUoDQD8kkasZghyJck2mDDU3VzJTPGWLSTsmvj7JtT5EvQz', // Wallet private key

    // Trading Configuration
    AMOUNT_SOL: 0.4, // Amount of SOL to trade
    TAKE_PROFIT_PERCENTAGE: 40, // Take profit when price increases by 40%
    STOP_LOSS_PERCENTAGE: 30, // Stop loss when price decreases by 30%

    // Price Monitoring
    PRICE_CHECK_INTERVAL: 10, // Interval in seconds for price checks

    // Auto-sell Settings
    SELL_SLIPPAGE_BPS: 3000, // 30% slippage tolerance for selling
    SELL_PRIORITY_FEE_SOL: 0.0015, // Priority fee for faster sell execution

    // Scanner Configuration
    SCAN_INTERVAL_MINUTES: 10, // Time between token scans in minutes
};
