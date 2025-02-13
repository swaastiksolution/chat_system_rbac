const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const roles = {
    ADMIN: 'admin',
    USER: 'user'
};

const clients = new Map();

function broadcast(message, sender) {
    clients.forEach((client, ws) => {
        if (client.role !== roles.ADMIN && ws !== sender) {
            ws.send(JSON.stringify(message));
        }
    });
}

wss.on('connection', (ws, req) => {
    const role = req.url.split('role=')[1];

    if (!role || ![roles.ADMIN, roles.USER].includes(role)) {
        ws.close();
        return;
    }

    clients.set(ws, { role });

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'chat') {
            broadcast(parsedMessage, ws);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});