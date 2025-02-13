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