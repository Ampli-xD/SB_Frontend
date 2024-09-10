document.addEventListener('DOMContentLoaded', () => {
    const roomCode = new URLSearchParams(window.location.search).get('roomCode');
    console.log('Room code:', roomCode);
    
    
    if (!roomCode) {
      console.error('No room code provided');
      return;
    }
  
    // Room auto-deletion warning
    const ROOM_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
    let lastActivityTime = Date.now();
  
    function updateLastActivityTime() {
      lastActivityTime = Date.now();
      // You can emit a user activity event to the server here if needed
    }
  
    function checkRoomExpiry() {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (timeSinceLastActivity > ROOM_EXPIRY_TIME - 5 * 60 * 1000) { // Show warning 5 minutes before expiry
        alert('Warning: This room will be deleted in 5 minutes due to inactivity.');
      }
    }
  
    setInterval(checkRoomExpiry, 60 * 1000); // Check every minute
  
    // Update last activity time on user interactions
    ['click', 'keypress', 'scroll'].forEach(event => {
      document.addEventListener(event, updateLastActivityTime);
    });
  
    // Implement any additional chat application logic here
  });