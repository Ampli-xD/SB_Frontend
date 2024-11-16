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
        className="lg:hidden fixed top-4 right-4 z-20 p-2 rounded bg-[#141415] border-2 border-[rgba(255,255,255,0.15)]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-[#66CCFF]" />
        ) : (
          <Menu className="w-6 h-6 text-[#66CCFF]" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-[#080809] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          borderRight: '2px solid rgba(255,255,255,0.15)',
          fontFamily: "'JetBrains Mono', monospace"
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b-2 border-[rgba(255,255,255,0.15)] bg-[#141415]">
            <h1 className="text-xl font-bold text-[#FFFFFF] font-['Share_Tech_Mono']">{appName}</h1>
            <div className="flex items-center mt-2">
              <span className="w-2 h-2 rounded-full bg-[#66FF99] mr-2"></span>
              <p className="text-sm text-[#FFFFFF]">{roomName}</p>
            </div>
          </div>

          {/* Room Info */}
          <div className="p-4 border-b-2 border-[rgba(255,255,255,0.15)] bg-[#1A1A1B]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#8A8A8B]">Room Code:</span>
              <span className="text-sm font-mono bg-[#222223] px-2 py-1 rounded border border-[rgba(255,255,255,0.15)]">
                {roomCode}
              </span>
            </div>
            
            <button
              onClick={copyJoiningLink}
              className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#66CCFF] hover:bg-[#0066CC] text-[#080809] rounded transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Share2 className="w-4 h-4" />
              <span>Share Room Link</span>
            </button>
            
            {showCopiedTooltip && (
              <div className="mt-2 text-center text-sm text-[#66FF99]">
                Copied to clipboard!
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4" style={{ background: 'linear-gradient(180deg, rgba(0,178,255,0.08) 0%, rgba(0,178,255,0.02) 100%)' }}>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-[#FFFFFF] rounded hover:bg-[#1A1A1B] transition-colors border border-[rgba(255,255,255,0.15)]">
                <Users className="w-5 h-5 text-[#66CCFF]" />
                <span>Online Users</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-[#FFFFFF] rounded hover:bg-[#1A1A1B] transition-colors border border-[rgba(255,255,255,0.15)]">
                <Database className="w-5 h-5 text-[#66CCFF]" />
                <span>Uploaded Files</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-2 border-[rgba(255,255,255,0.15)] bg-[#141415]">
            <p className="text-xs text-center text-[#8A8A8B]">
              2024 {appName}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;