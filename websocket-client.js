const WebSocket = require('ws');
let ws;

function connect() {
    ws = new WebSocket('ws://localhost:3005');
    
    ws.on('open', () => {
        console.log('Connected to web interface');
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
    
    ws.on('close', () => {
        console.log('Disconnected from web interface, attempting to reconnect...');
        setTimeout(connect, 5000);
    });
}

function sendToWeb(type, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data }));
    }
}

function updateMonitoringInfo(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            type: 'monitoring_update',
            data: {
                positions: data.positions || [],
                soldPositions: data.soldPositions || [],
                walletBalanceSOL: data.walletBalanceSOL,
                walletBalanceUSD: data.walletBalanceUSD,
                lastUpdateTime: data.lastUpdateTime
            }
        };
        ws.send(JSON.stringify(message));
        console.log(`Positions updated (${data.positions.length} active, ${data.soldPositions.length} sold)`);
    } else {
        console.log('WebSocket not ready. State:', ws ? ws.readyState : 'no websocket');
    }
}

module.exports = {
    connect,
    sendToWeb,
    updateMonitoringInfo
}; 