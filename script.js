// User roles and data
const GROUPS = {
    USER: 'User',
    MUTED: 'Muted',
    BANNED: 'Banned',
    ADMIN: 'Admin',
    DEV: 'Dev',
    MOD: 'Mod'
};

let currentUser = null;
let users = [
    { username: 'Zachary', password: 'adminpass', group: GROUPS.ADMIN },
    { username: 'Josiah', password: 'jdsa2010', group: GROUPS.USER },
    { username: 'Ryan', password: 'rmsa2013', group: GROUPS.USER },
    { username: 'Thomas', password: 'modpass', group: GROUPS.MOD },
    { username: 'John', password: 'devpass', group: GROUPS.DEV }
];

let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
let onlineUsers = [];

// Constants
const MAX_MESSAGE_LENGTH = 2000;
const CHAT_DELAY = 15000; // 15 seconds in milliseconds

let lastMessageTime = 0;

// Helper Functions
function displayMessages() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    const now = new Date();
    messages.forEach((msg, index) => {
        const msgDate = new Date(msg.timestamp);
        if ((now - msgDate) < 24 * 60 * 60 * 1000) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            
            // Add tags for Admin, Mod, and Dev
            let userTag = '';
            const userGroup = users.find(u => u.username === msg.user)?.group;
            if (userGroup === GROUPS.ADMIN) {
                userTag = '<span class="admin-tag">[Admin]</span>';
            } else if (userGroup === GROUPS.MOD) {
                userTag = '<span class="mod-tag">[Mod]</span> ';
            } else if (userGroup === GROUPS.DEV) {
                userTag = '<span class="dev-tag">[Dev]</span> ';
            }

            messageElement.innerHTML = `
                ${userTag}<span class="username">${msg.user}:</span> ${msg.text}
                ${currentUser && (currentUser.group === GROUPS.ADMIN || currentUser.group === GROUPS.DEV || currentUser.group === GROUPS.MOD) ? 
                    `<div class="message-actions">
                        <button onclick="editMessage(${index})">Edit</button>
                        <button onclick="deleteMessage(${index})">Delete</button>
                    </div>` : ''}
            `;
            chatMessages.appendChild(messageElement);
        }
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateCharCounter() {
    const messageInput = document.getElementById('message');
    const charCounter = document.getElementById('char-counter');
    if (!messageInput || !charCounter) return;

    const currentLength = messageInput.value.length;
    charCounter.textContent = `${currentLength}/${MAX_MESSAGE_LENGTH}`;
}

function showMutedMessage() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    chatInput.innerHTML = '<p>You have been muted. The Staff has seen fit to revoke your messaging permissions, and you are now unable to participate in the discussion.</p>';
}

function updateOnlineUsersCount() {
    const onlineUsersCount = document.getElementById('online-users-count');
    if (onlineUsersCount) {
        onlineUsersCount.textContent = onlineUsers.length;
    }
}

function cleanupOldMessages() {
    const now = new Date();
    const cstOffset = -6; // CST offset from UTC (adjust for CDT if needed)
    const cstNow = new Date(now.getTime() + cstOffset * 60 * 60 * 1000);
    const nextMidnight = new Date(cstNow);
    nextMidnight.setHours(24, 0, 0, 0);
    
    const timeUntilMidnight = nextMidnight.getTime() - cstNow.getTime();

    // Remove messages older than 24 hours
    messages = messages.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return (cstNow - msgDate) < 24 * 60 * 60 * 1000;
    });

    // Save updated messages to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(messages));

    // Schedule next cleanup at midnight CST/CDT
    setTimeout(cleanupOldMessages, timeUntilMidnight);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout');
    const sendMessageButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message');

    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    if (sendMessageButton && messageInput) {
        sendMessageButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        messageInput.addEventListener('input', updateCharCounter);
    }

    updateCharCounter();
    if (window.location.pathname.includes('chat.html')) {
        initializeChat();
    }
});

function handleLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        if (user.group === GROUPS.BANNED) {
            window.location.href = 'banned_message.html';
            return;
        }
        
        currentUser = user;
        onlineUsers.push(currentUser);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'chat.html';
    } else {
        alert('Invalid username or password');
    }
}

function handleLogout() {
    onlineUsers = onlineUsers.filter(user => user.username !== currentUser.username);
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    if (!messageInput) return;

    const now = Date.now();
    if ((currentUser.group === GROUPS.USER || currentUser.group === GROUPS.MOD) && 
        now - lastMessageTime < CHAT_DELAY) {
        const remainingTime = Math.ceil((CHAT_DELAY - (now - lastMessageTime)) / 1000);
        alert(`Please wait ${remainingTime} seconds before sending another message.`);
        return;
    }

    if (currentUser.group !== GROUPS.MUTED && currentUser.group !== GROUPS.BANNED) {
        const messageText = messageInput.value.trim();
        if (messageText && messageText.length <= MAX_MESSAGE_LENGTH) {
            messages.push({ 
                user: currentUser.username, 
                text: messageText,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            displayMessages();
            messageInput.value = '';
            updateCharCounter();
            lastMessageTime = now;
        } else if (messageText.length > MAX_MESSAGE_LENGTH) {
            alert(`Message must be ${MAX_MESSAGE_LENGTH} characters or less.`);
        }
    }
}

// Admin/Dev/Mod Functions
function editMessage(index) {
    if (currentUser.group === GROUPS.ADMIN || currentUser.group === GROUPS.DEV || currentUser.group === GROUPS.MOD) {
        const newText = prompt('Edit message:', messages[index].text);
        if (newText !== null) {
            messages[index].text = newText;
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            displayMessages();
        }
    }
}

function deleteMessage(index) {
    if (currentUser.group === GROUPS.ADMIN || currentUser.group === GROUPS.DEV || currentUser.group === GROUPS.MOD) {
        if (confirm('Are you sure you want to delete this message?')) {
            messages.splice(index, 1);
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            displayMessages();
        }
    }
}

function initializeChat() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
    } else {
        if (!onlineUsers.some(user => user.username === currentUser.username)) {
            onlineUsers.push(currentUser);
        }
        updateOnlineUsersCount();
        if (currentUser.group === GROUPS.MUTED) {
            showMutedMessage();
        } else {
            displayMessages();
            cleanupOldMessages(); // Start the cleanup process
        }
    }
}
