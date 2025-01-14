module.exports = {
    // Solana RPC Configuration
    RPC_URL: 'https://api.mainnet-beta.solana.com', // Solana Mainnet RPC URL
    WALLET_PRIVATE_KEY: '2TnEgLSmHHgf25BkBRvLpUAieJu3dqWNNPmrMcNAuUoDQD8kkasZghyJck2mDDU3VzJTPGWLSTsmvj7JtT5EvQz', // Your private key (keep secure!)

    // Scanner Settings
    SCAN_INTERVAL_MINUTES: 10, // Time between scans in minutes

    // Trading Configuration
    AMOUNT_SOL: 0.5, // Fixed amount of SOL for trading
    MIN_AMOUNT_SOL: 0.2, // Minimum fallback amount of SOL for trading
    PROFIT_THRESHOLD_PERCENT: 100, // Sell if token increases by 100% from entry price
    LOSS_THRESHOLD_PERCENT: 50, // Sell if token decreases by 50% from entry price

    // Price Monitoring
    PRICE_CHECK_INTERVAL_MINUTES: 5, // Time between monitoring price changes for purchased tokens
};

