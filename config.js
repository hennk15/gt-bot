module.exports = {
    // Solana RPC Configuration
    RPC_URL: 'https://api.mainnet-beta.solana.com', // Solana Mainnet RPC URL

    // Scanner Settings
    SCAN_INTERVAL_MINUTES: 5, // Time between scans in minutes

    // Trading Configuration
    AMOUNT_SOL: 0.4, // Amount of SOL to use per trade
    PROFIT_THRESHOLD_PERCENT: 100, // Sell if token increases by 100% from entry price
    LOSS_THRESHOLD_PERCENT: 50, // Sell if token decreases by 50% from entry price

    // Price Monitoring
    PRICE_CHECK_INTERVAL_MINUTES: 5, // Time between monitoring price changes for purchased tokens
};
