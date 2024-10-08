import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload } from 'lucide-react';
import io from 'socket.io-client';
import { marked } from 'marked';
import DOMPurify from 'dompurify';


function ChatArea({}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatAreaRef = useRef(null);
  const socketRef = useRef(null);
  const roomCode = new URLSearchParams(window.location.search).get('roomCode');
  const userName = new URLSearchParams(window.location.search).get('userName');
  const WS_URL = 'wss://sb-backend-lmha.onrender.com';
  const API_URL = 'https://sb-backend-lmha.onrender.com';


  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(WS_URL, {query: { roomCode }});
    // After the socket connection
    socketRef.current.emit('join_room', { 'roomCode': roomCode, 'userName': userName });

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            'Content-Type': 'application/json',
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH"
          },
          body: JSON.stringify({ roomCode: roomCode }),
        });
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

    socketRef.current.on('ping_server', (ping) => {
      socketRef.current.emit('ping_server', { 'incrementor' : ping.incrementor+1, 'message' : 'Sent the ping back!'});
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
        const response = await fetch(`${API_URL}/api/upload`, {
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
      <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary w-full max-w-3xl mx-auto">
  {messages.map((message) => (
    <div
      key={message.id}        
      className={`${
        message.sender === userName 
          ? 'ml-auto bg-blue-800 text-white' 
          : 'mr-auto bg-gray-200 text-gray-800'
      } rounded-lg p-3 max-w-3/4 flex flex-wrap`}>
      <div className={`flex justify-between items-center mb-2 w-full ${
        message.sender === userName ? 'flex-row-reverse' : 'flex-row'
      }`}>
        <span className="font-semibold">{message.sender}</span>
        <span className="text-xs opacity-75">{message.timestamp}</span>
        
      </div>
      <div className="w-full break-words whitespace-normal overflow-wrap-break-word word-break-all"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(message.content)) }}/>
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
