const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from 'public' directory
app.use(express.static('public'));

// Store latest data
let scriptLogs = [];
let monitoringInfo = null;

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected to server');
    
    // Send initial data if available
    if (scriptLogs.length > 0) {
        console.log('Sending initial logs to client');
        ws.send(JSON.stringify({ 
            type: 'log', 
            data: scriptLogs.join('\n') 
        }));
    }
    if (monitoringInfo) {
        console.log('Sending initial monitoring info to client');
        ws.send(JSON.stringify({ 
            type: 'monitoring_update', 
            data: monitoringInfo 
        }));
    }

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('Received message from client:', message.toString());
            
            if (data.type === 'log') {
                scriptLogs.push(data.data);
                broadcastUpdate('log', data.data);
            } else if (data.type === 'monitoring_update') {
                monitoringInfo = data.data;
                broadcastUpdate('monitoring_update', data.data);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcastUpdate(type, data) {
    console.log(`Broadcasting ${type} update to ${wss.clients.size} clients`);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify({ type, data }));
            } catch (error) {
                console.error('Error sending to client:', error);
            }
        }
    });
}

// Start server
const PORT = 3005;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = {
    broadcastUpdate
}; 