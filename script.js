// Simulated data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let messages = JSON.parse(localStorage.getItem('messages')) || [];
let topics = JSON.parse(localStorage.getItem('topics')) || [];
let threads = JSON.parse(localStorage.getItem('threads')) || [];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Helper function to save data to local storage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('topics', JSON.stringify(topics));
    localStorage.setItem('threads', JSON.stringify(threads));
}

// Helper function to generate a random avatar
function generateAvatar(username) {
    return `https://avatars.dicebear.com/api/initials/${username}.svg`;
}

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
            
            const newUser = { 
                id: users.length + 1, 
                username, 
                email, 
                password, 
                joinDate: new Date().toISOString(),
                avatar: generateAvatar(username)
            };
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
                const newMessage = { 
                    id: messages.length + 1, 
                    userId: currentUser.id, 
                    username: currentUser.username, 
                    content: message, 
                    timestamp: new Date().toISOString(),
                    avatar: currentUser.avatar
                };
                messages.push(newMessage);
                saveData();
                addMessageToChat(newMessage);
                chatInput.value = '';
            }
        });
    }

    function loadMessages() {
        chatMessages.innerHTML = '';
        messages.forEach(addMessageToChat);
    }

    function addMessageToChat(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <img src="${message.avatar}" alt="${message.username}" class="avatar">
            <div class="message-content">
                <strong>${message.username}:</strong> ${message.content}
            </div>
        `;
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
                const newTopic = { 
                    id: topics.length + 1, 
                    userId: currentUser.id, 
                    username: currentUser.username, 
                    title, 
                    timestamp: new Date().toISOString(),
                    avatar: currentUser.avatar
                };
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
        topicElement.innerHTML = `
            <img src="${topic.avatar}" alt="${topic.username}" class="avatar">
            <a href="thread.html?topicId=${topic.id}">${topic.title}</a> (by ${topic.username})
        `;
        topicList.appendChild(topicElement);
    }

    // Thread functionality
    const threadContainer = document.querySelector('#thread-container');
    const replyForm = document.querySelector('#reply-form');

    if (threadContainer && replyForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const topicId = parseInt(urlParams.get('topicId'));
        
        if (topicId) {
            loadThread(topicId);

            replyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!currentUser) {
                    alert('Please log in to reply');
                    return;
                }
                const content = document.querySelector('#reply-content').value.trim();
                if (content) {
                    const newReply = {
                        id: threads.length + 1,
                        topicId: topicId,
                        userId: currentUser.id,
                        username: currentUser.username,
                        content: content,
                        timestamp: new Date().toISOString(),
                        avatar: currentUser.avatar
                    };
                    threads.push(newReply);
                    saveData();
                    addReplyToThread(newReply);
                    document.querySelector('#reply-content').value = '';
                }
            });
        }
    }

    function loadThread(topicId) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
            const threadTitle = document.createElement('h2');
            threadTitle.textContent = topic.title;
            threadContainer.appendChild(threadTitle);

            const topicPost = document.createElement('div');
            topicPost.className = 'thread-post';
            topicPost.innerHTML = `
                <img src="${topic.avatar}" alt="${topic.username}" class="avatar">
                <div class="post-content">
                    <strong>${topic.username}</strong>
                    <p>${topic.title}</p>
                    <small>${new Date(topic.timestamp).toLocaleString()}</small>
                </div>
            `;
            threadContainer.appendChild(topicPost);

            const replies = threads.filter(t => t.topicId === topicId);
            replies.forEach(addReplyToThread);
        }
    }

    function addReplyToThread(reply) {
        const replyElement = document.createElement('div');
        replyElement.className = 'thread-post';
        replyElement.innerHTML = `
            <img src="${reply.avatar}" alt="${reply.username}" class="avatar">
            <div class="post-content">
                <strong>${reply.username}</strong>
                <p>${reply.content}</p>
                <small>${new Date(reply.timestamp).toLocaleString()}</small>
            </div>
        `;
        threadContainer.appendChild(replyElement);
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
            <img src="${user.avatar}" alt="${user.username}" class="avatar large">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Join Date:</strong> ${new Date(user.joinDate).toLocaleDateString()}</p>
        `;
    }
});
