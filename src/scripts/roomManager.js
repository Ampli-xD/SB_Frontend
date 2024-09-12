
const API_BASE_URL = 'https://sb-backend-lmha.onrender.com/';

async function createRoom(userName, roomName, geminiKey, pineconeKey) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms/create`, {
      method: 'POST',
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/json',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH"
      },
      body: JSON.stringify({ userName, roomName, geminiKey, pineconeKey }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, roomCode: data.roomCode };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Error creating room:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

async function joinRoom(roomCode) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms/join`, {
      method: 'POST',
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/json',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH"
      },
      body: JSON.stringify({ userName, roomCode }),
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, roomName: data.roomName };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('Error joining room:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

function showStatus(message, isError = false) {
  const statusMessage = document.getElementById('statusMessage');
  if (statusMessage) {
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden', 'text-green-600', 'text-red-600');
    statusMessage.classList.add(isError ? 'text-red-600' : 'text-green-600');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const createRoomBtn = document.getElementById('createRoomBtn');
  const joinRoomBtn = document.getElementById('joinRoomBtn');
  const importRoomBtn = document.getElementById('importRoomBtn');
  const roomNameInput = document.getElementById('roomName');
  const roomCodeInput = document.getElementById('roomCode');
  const geminiKeyInput = document.getElementById('geminiKey');
  const userNameInput = document.getElementById('userName');
  const pineconeKeyInput = document.getElementById('pineconeKey');
  const importFileInput = document.getElementById('importFile');

  createRoomBtn?.addEventListener('click', async () => {
    const roomName = roomNameInput.value.trim();
    const geminiKey = geminiKeyInput.value.trim();
    const pineconeKey = pineconeKeyInput.value.trim();
    const userName = userNameInput.value.trim();
    if (roomName && geminiKey && pineconeKey) {
      try {
        const result = await createRoom(userName, roomName, geminiKey, pineconeKey);
        console.log(result);
        if (result.success) {
          window.location.href = `/chat?roomCode=${roomCode}&userName=${userName}`;
        } else {
          showStatus(result.error, true);
        }
      } catch (error) {
        showStatus('An unexpected error occurred', true);
      }
    } else {
      showStatus('Please enter a room name, Gemini key, and Pinecone key', true);
    }
  });

  joinRoomBtn?.addEventListener('click', async () => {
    const roomCode = roomCodeInput.value.trim();
    const userName = userNameInput.value.trim();
    if (roomCode) {
      try {
        const result = await joinRoom(userName, roomCode); 
        if (result.success) {
          window.location.href = `/chat?roomCode=${roomCode}`;
        } else {
          showStatus(result.error, true);
        }
      } catch (error) {
        showStatus('An unexpected error occurred', true);
      }
    } else {
      showStatus('Please enter a room code', true);
    }
  });


  importRoomBtn?.addEventListener('click', async () => {
    const file = importFileInput.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        showStatus('Please select a JSON file', true);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE_URL}/rooms/import`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          showStatus(`Room imported: ${data.roomName}`);
          setTimeout(() => {
            window.location.href = `/chat?roomCode=${data.roomCode}`;
          }, 1500);
        } else {
          showStatus(data.message || 'Failed to import room', true);
        }
      } catch (error) {
        showStatus('Error importing room. Please try again.', true);
      }
    } else {
      showStatus('Please select a file to import', true);
    }
  });

  // Tab switching logic
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const tabContents = document.querySelectorAll('.tab-content');

  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const tabId = trigger.getAttribute('data-tab');
      
      tabTriggers.forEach(t => {
        t.classList.remove('active', 'bg-primary', 'text-secondary');
        t.classList.add('bg-secondary', 'text-primary');
      });
      tabContents.forEach(c => c.classList.add('hidden'));
      
      trigger.classList.add('active', 'bg-primary', 'text-secondary');
      trigger.classList.remove('bg-secondary', 'text-primary');
      const activeTab = document.getElementById(`${tabId}-tab`);
      if (activeTab) {
        activeTab.classList.remove('hidden');
      }
      const statusMessageElement = document.getElementById('statusMessage');
      if (statusMessageElement) {
        statusMessageElement.classList.add('hidden');
      }
    });
  });
});