import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Connect to the server
const socket = io('https://cautious-tribble-q79vx566r5xxf6jr-3001.app.github.dev', {
  transports: ['websocket'],
});

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      console.log('Message received from server:', msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('user list', (userList) => {
      console.log('Updated user list:', userList);
      setUsers(userList);
    });

    return () => {
      socket.off('chat message');
      socket.off('user list');
    };
  }, []);

  const login = () => {
    if (username.trim()) {
      socket.emit('login', username);
      setIsLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() && selectedUser) {
      const msg = { 
        text: message, 
        sender: username, 
        receiver: selectedUser
      };
      console.log('Sending message:', msg);
      socket.emit('chat message', msg);
      setMessage('');
    }
  };

  // Filter out the current user from the user list
  const filteredUsers = users.filter(user => user !== username);

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Enter Your Username</h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          style={{ padding: '10px', width: '80%' }}
        />
        <button onClick={login} style={{ padding: '10px 20px', marginTop: '10px' }}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '160px', borderRight: '1px solid #ddd', padding: '10px' }}>
        <h2>Users</h2>
        <ul style={{ listStyleType: 'none', padding: '0' }}>
          {filteredUsers.map(user => (
            <li 
              key={user}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: user === selectedUser ? '#f0f0f0' : 'transparent',
                borderRadius: '5px'
              }}
            >
              {user}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: '20px'}}>
        {selectedUser ? (
          <>
            <h1 style={{    marginTop: 0}}> Chat with {selectedUser}</h1>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', maxWidth: '87%' }}>
              {messages
                .filter(msg => 
                  (msg.sender === username && msg.receiver === selectedUser) || 
                  (msg.sender === selectedUser && msg.receiver === username))
                .map((msg, index) => (
                  <MessageBubble key={index} msg={msg} currentUser={username} />
              ))}
            </div>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ padding: '10px', width: '80%' }}
            />
            <button onClick={sendMessage} style={{ padding: '10px 20px' }}>Send</button>
          </>
        ) : (
          <h2>Select a user to start chatting</h2>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg, currentUser }) {
  const bubbleStyle = {
    maxWidth: '80%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '10px',
    color: 'white',
  };

  const userStyle = {
    ...bubbleStyle,
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  };

  const replyStyle = {
    ...bubbleStyle,
    backgroundColor: '#6c757d',
    alignSelf: 'flex-start',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: msg.sender === currentUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={msg.sender === currentUser ? userStyle : replyStyle}>
        {msg.text}
      </div>
    </div>
  );
}

export default App;

