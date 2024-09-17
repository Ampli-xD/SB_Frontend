  import React, { useState, useEffect, useR } from 'react';
  import { Users, Database, Download, Menu } from 'lucide-react';
  import io from 'socket.io-client';
  
  function Sidebar({ appName }) {
    const roomCode = new URLSearchParams(window.location.search).get('roomCode');
    let roomName = "";
    // const [onlineUsers, setOnlineUsers] = useState([]);
    // const [uploadedData, setUploadedData] = useState([]);
    // const [isOnlineListOpen, setIsOnlineListOpen] = useState(false);
    // const [isDataListOpen, setIsDataListOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // const socketRef = useRef(null);
    const WS_URL = 'wss://sb-backend-lmha.onrender.com';
    const API_URL = 'https://sb-backend-lmha.onrender.com';
    const joiningLink = `stormbrainer.vercel.app/`;
  
    useEffect(() => {
      // socketRef.current = io(WS_URL, {query: { roomCode }});

      // const fetchOnlineUsers = async () => {
      //   try {
      //     const response = await fetch(`${API_URL}/api/online-users` ,{
      //       method: 'POST',
      //       headers: {
      //         "Access-Control-Allow-Headers" : "Content-Type",
      //         "Access-Control-Allow-Origin": "*",
      //         'Content-Type': 'application/json',
      //         "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH"
      //       },
      //       body: JSON.stringify({ roomCode }),
      //     });
      //     const data = await response.json();
      //     setOnlineUsers(data);
      //   } catch (error) {
      //     console.error('Error fetching online users:', error);
      //   }
      // };

      // const fetchUploadedData = async () => {
      //   try {
      //     const response = await fetch(`/api/uploaded-data?roomCode=${roomCode}`);
      //     const data = await response.json();
      //     setUploadedData(data);
      //   } catch (error) {
      //     console.error('Error fetching uploaded data:', error);
      //   }
      // };

      const fetchRoomName = async () => {
        try {
          const data1 = new FormData();
          data1.append('roomCode', roomCode);
          const response = await fetch(`${API_URL}/api/rooms/name`,{
            method: 'POST',
            headers: {
              "Access-Control-Allow-Headers" : "Content-Type",
              "Access-Control-Allow-Origin": "*",
              'Content-Type': 'application/json',
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH"
            },
            body: JSON.stringify({ roomCode }),
          });
          
          const data = await response.json();
          return(data.name);
        } catch (error) {
          console.error('Error fetching online users:', error);
        }
      };
  
      // fetchOnlineUsers();
      // fetchUploadedData();
      roomName = fetchRoomName();
  
      // socketRef.current.on('online_users_update', (users) => {
      //   console.log('Received online users:', users);
      //   setOnlineUsers(users);
      // });
  
      // socketRef.current.on('uploaded_data_update', (data) => {
      //   setUploadedData(data);
      // });
  
      // return () => {
      //   socketRef.current.disconnect();
      // };
    }, [roomCode]);
  
    const copyJoiningLink = () => {
      navigator.clipboard.writeText(joiningLink).then(() => {
        alert('Room Code copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    };
  
    const exportRoom = async () => {
      try {
        const response = await fetch(`${API_URL}/api/export-room`, {
          method: 'POST',
          headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            'Content-Type': 'application/json',
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH"
          },
          body: JSON.stringify({ roomCode: roomCode }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `room_${roomCode}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting room:', error);
      }
    };
    
  
  return (
    <>
    <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 bg-primary text-secondary p-2 rounded-md"
      >
        <Menu size={24} />
      </button>
      <div className={`w-64 bg-primary text-secondary border-r border-secondary flex flex-col fixed inset-y-0 left-0 z-10 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-4 border-b border-secondary flex items-center">
          <img src="/placeholder.svg?height=40&width=40" alt="Logo" className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold">{appName}</h1>
        </div>

      <div className="p-4 border-b border-secondary">
        <p className="text-sm text-secondary mb-1">Room Code: {roomCode}</p>
        <button onClick={copyJoiningLink} className="text-secondary hover:text-secondary-200 text-sm font-medium">
          Click to copy url.
        </button>
      </div>

      <div className="p-4 mt-auto">
        <h2 className="font-semibold mb-2 flex items-center">
          <Download className="mr-2" size={18} />
          <span>Export</span>
        </h2>
        <button onClick={exportRoom} className="w-full bg-secondary text-primary py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2">
          Export Room
        </button>
      </div>
    </div>
    </>
  );
}

export default Sidebar;
