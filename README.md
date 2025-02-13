# chat_system_rbac
----
This example will include a simple server using Node.js and WebSocket, and a React client that connects to the server. The roles will be managed on the server-side.

## Breaking this into three parts:

- The Node.js server with WebSocket and role-based access control.
- The React client to connect to the server.
- The shared code for role definitions and utility functions.

----

### 1. Node.js Server
````js
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
````

### 2. React Client
````js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const roles = {
    ADMIN: 'admin',
    USER: 'user'
};

const App = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [role, setRole] = useState(roles.USER);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8080?role=${role}`);
        ws.current.onmessage = (event) => {
            const parsedMessage = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        };

        return () => {
            ws.current.close();
        };
    }, [role]);

    const sendMessage = () => {
        const messageObject = {
            type: 'chat',
            content: message,
            role
        };
        ws.current.send(JSON.stringify(messageObject));
        setMessage('');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Chat App</h1>
                <div>
                    <label>
                        Role:
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value={roles.ADMIN}>Admin</option>
                            <option value={roles.USER}>User</option>
                        </select>
                    </label>
                </div>
                <div className="chat-window">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            {msg.content}
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </header>
        </div>
    );
};

export default App;
````

### 3. Shared Code for Role Definitions and Utility Functions
````js
export const roles = {
    ADMIN: 'admin',
    USER: 'user'
};
````

### 4. App Styling (Optional)
````js
.App {
    text-align: center;
}

.App-header {
    background-color: #282c34;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;
}

.chat-window {
    width: 80%;
    max-width: 600px;
    height: 400px;
    border: 1px solid #ccc;
    overflow-y: scroll;
    margin-bottom: 20px;
}

.message {
    padding: 5px 10px;
    margin: 5px 0;
}

.message.admin {
    background-color: #ffcccc;
}

.message.user {
    background-color: #ccffcc;
}
````


## Running the Application

- Server: Run node `server.js` in the terminal to start the Node.js server.
- Client: Create a React project using `create-react-app`, replace the `App.js` and `App.css` with the provided code, and start the React application using `npm start`.


This example demonstrates a basic chat application with role-based access control. Admin messages are highlighted in a different color, and only non-admin users can receive messages from other users. Feel free to expand on this functionality according to your requirements.
