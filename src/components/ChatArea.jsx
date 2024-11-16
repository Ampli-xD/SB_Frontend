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
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900">
      {/* Chat messages area */}
      <div 
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.userName === userName ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] break-words rounded-lg p-3 ${
                message.userName === userName
                  ? 'bg-blue-600 text-white ml-4'
                  : 'bg-white dark:bg-gray-800 dark:text-gray-100 mr-4'
              } shadow-md`}
            >
              <div className="text-xs opacity-75 mb-1">{message.userName}</div>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked(message.content))
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Message input area */}
      <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
          />
          <label className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </label>
          <button
            onClick={sendMessage}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;