module.exports = {
    // Solana RPC Configuration
    RPC_URL: 'https://api.mainnet-beta.solana.com', // Solana Mainnet RPC URL

    // Scanner Settings
    SCAN_INTERVAL_MINUTES: 10, // Time between scans in minutes

    // Trading Configuration (optional)
    AMOUNT_SOL: 0.4, // Amount of SOL to trade
    TAKE_PROFIT_PERCENTAGE: 40, // Take profit when price increases by 40%
    STOP_LOSS_PERCENTAGE: 30, // Stop loss when price decreases by 30%
};
