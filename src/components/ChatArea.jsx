import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload } from 'lucide-react';
import io from 'socket.io-client';

function ChatArea({}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatAreaRef = useRef(null);
  const socketRef = useRef(null);
  const roomCode = new URLSearchParams(window.location.search).get('roomCode');
  const userName = new URLSearchParams(window.location.search).get('userName');
  const WS_URL = 'wss://sb-backend-lmha.onrender.com';
  const API_URL = 'https://sb-backend-lmha.onrender.com/';


  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(WS_URL, {query: { roomCode }});
    // After the socket connection
    socketRef.current.emit('join_room', { 'roomCode': roomCode });

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/messages?roomCode=${roomCode}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Listen for incoming messages
    socketRef.current.on('chat_message', (message) => {
      console.log('Received message:', message);
      setMessages(prevMessages => [...prevMessages, message]);
      
    });

    // Clean up on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomCode]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && socketRef.current) {
      socketRef.current.emit('chat_message', {
        userName: userName,
        content: inputMessage,
        roomCode: roomCode
      });
      setInputMessage('');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomCode', roomCode);

      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('File uploaded successfully');
        } else {
          console.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:ml-64">
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary">
        {messages.map((message) => (
          <div
            key={message.id}        
            className={`${
              message.sender === userName ? 'ml-auto bg-primary text-secondary' : 'mr-auto bg-accent text-white'
            } rounded-lg p-3 max-w-3/4`}>
            <p className="mb-1">{message.content}</p>
            <span className="text-xs opacity-75">by{message.sender} at {new Date(message.timestamp).toLocaleTimeString(undefined, {timeZone: 'Asia/Kolkata'})}</span>
          </div>
        ))}
      </div>
      <div className="bg-primary text-secondary p-4 border-t border-secondary">
        <div className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-secondary text-primary rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent"/>
          <button
            onClick={sendMessage}
            className="bg-accent text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
            <Send size={20} />
          </button>
          <label className="ml-2 cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileUpload} />
            <Upload size={20} className="text-accent hover:text-opacity-80" />
          </label>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;