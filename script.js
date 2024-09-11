// Simulated data storage (in a real application, you'd use local storage or fetch from JSON files)
let users = JSON.parse(localStorage.getItem('users')) || [];
let messages = JSON.parse(localStorage.getItem('messages')) || [];
let topics = JSON.parse(localStorage.getItem('topics')) || [];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Helper function to save data to local storage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('topics', JSON.stringify(topics));
}

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.querySelector('#login-form form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.querySelector('#username').value;
            const password = document.querySelector('#password').value;
            
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                alert('Login successful!');
                window.location.href = 'index.html';
            } else {
                alert('Invalid username or password');
            }
        });
    }

    // Registration form handling
    const registerForm = document.querySelector('#register-form form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.querySelector('#username').value;
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            const confirmPassword = document.querySelector('#confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (users.some(u => u.username === username)) {
                alert('Username already exists!');
                return;
            }
            
            const newUser = { id: users.length + 1, username, email, password, joinDate: new Date().toISOString() };
            users.push(newUser);
            saveData();
            alert('Registration successful!');
            window.location.href = 'login.html';
        });
    }

    // Chat functionality
    const chatForm = document.querySelector('#chat-form');
    const chatInput = document.querySelector('#chat-input');
    const chatMessages = document.querySelector('#chat-messages');

    if (chatForm && chatInput && chatMessages) {
        loadMessages();

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message && currentUser) {
                const newMessage = { id: messages.length + 1, userId: currentUser.id, username: currentUser.username, content: message, timestamp: new Date().toISOString() };
                messages.push(newMessage);
                saveData();
                addMessageToChat(newMessage);
                chatInput.value = '';
            }
        });

        // Simulated incoming messages
        setInterval(() => {
            if (messages.length > 0) {
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                addMessageToChat(randomMessage);
            }
        }, 5000);
    }

    function loadMessages() {
        chatMessages.innerHTML = '';
        messages.forEach(addMessageToChat);
    }

    function addMessageToChat(message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${message.username}:</strong> ${message.content}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Forum functionality
    const topicList = document.querySelector('#topic-list');
    const newTopicBtn = document.querySelector('#new-topic-btn');

    if (topicList && newTopicBtn) {
        loadTopics();

        newTopicBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert('Please log in to create a new topic');
                return;
            }
            const title = prompt('Enter a new topic title:');
            if (title) {
                const newTopic = { id: topics.length + 1, userId: currentUser.id, username: currentUser.username, title, timestamp: new Date().toISOString() };
                topics.push(newTopic);
                saveData();
                addTopicToList(newTopic);
            }
        });
    }

    function loadTopics() {
        topicList.innerHTML = '';
        topics.forEach(addTopicToList);
    }

    function addTopicToList(topic) {
        const topicElement = document.createElement('li');
        topicElement.textContent = `${topic.title} (by ${topic.username})`;
        topicList.appendChild(topicElement);
    }

    // Profile functionality
    const profileInfo = document.querySelector('#profile-info');
    const editProfileBtn = document.querySelector('#edit-profile-btn');

    if (profileInfo && editProfileBtn) {
        if (currentUser) {
            updateProfileInfo(currentUser);
        } else {
            profileInfo.innerHTML = '<p>Please log in to view your profile.</p>';
        }

        editProfileBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert('Please log in to edit your profile');
                return;
            }
            const newEmail = prompt('Enter your new email:', currentUser.email);
            if (newEmail) {
                currentUser.email = newEmail;
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    saveData();
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateProfileInfo(currentUser);
                    alert('Profile updated successfully!');
                }
            }
        });
    }

    function updateProfileInfo(user) {
        profileInfo.innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Join Date:</strong> ${new Date(user.joinDate).toLocaleDateString()}</p>
        `;
    }
});
