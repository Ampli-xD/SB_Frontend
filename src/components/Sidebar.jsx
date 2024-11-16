  import React, { useState, useEffect } from 'react';
import { Users, Database, Download, Menu, X, Share2, Copy } from 'lucide-react';

function Sidebar({ appName }) {
  const roomCode = new URLSearchParams(window.location.search).get('roomCode');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const WS_URL = 'wss://sb-backend-lmha.onrender.com';
  const API_URL = 'https://sb-backend-lmha.onrender.com';
  const joiningLink = `stormbrainer.vercel.app/`;
  const [roomName, setRoomName] = useState("");
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  useEffect(() => {
    const fetchRoomName = async () => {
      try {
        const response = await fetch(`${API_URL}/api/room-name`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomCode }),
        });
        const data = await response.json();
        setRoomName(data.roomName || "Unnamed Room");
      } catch (error) {
        console.error('Error fetching room name:', error);
        setRoomName("Unnamed Room");
      }
    };

    fetchRoomName();
  }, [roomCode]);

  const copyJoiningLink = () => {
    navigator.clipboard.writeText(joiningLink);
    setShowCopiedTooltip(true);
    setTimeout(() => setShowCopiedTooltip(false), 2000);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-20 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{appName}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{roomName}</p>
          </div>

          {/* Room Info */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Room Code:</span>
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {roomCode}
              </span>
            </div>
            
            <button
              onClick={copyJoiningLink}
              className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Room Link</span>
            </button>
            
            {showCopiedTooltip && (
              <div className="mt-2 text-center text-sm text-green-600 dark:text-green-400">
                Copied to clipboard!
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Users className="w-5 h-5" />
                <span>Online Users</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Database className="w-5 h-5" />
                <span>Uploaded Files</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              2024 {appName}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;