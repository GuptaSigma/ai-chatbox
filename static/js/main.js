let allChats = JSON.parse(localStorage.getItem('all_chats')) || [];
let currentChatId = localStorage.getItem('current_chat_id');
let currentPersona = localStorage.getItem('current_persona') || 'angelic';
let userName = localStorage.getItem('user_name') || 'Guest';
let chatContainer, chatForm, userInput, loading, chatsList, chatTitle, userNameInput;

function saveAllChats() {
    localStorage.setItem('all_chats', JSON.stringify(allChats));
}

function migrateOldFormat() {
    if (allChats.length > 0) return;
    const oldChatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];
    if (oldChatHistory.length === 0) return;
    allChats = [{
        id: Date.now().toString(),
        title: 'Imported Chat',
        messages: oldChatHistory,
        createdAt: new Date().toISOString()
    }];
    currentChatId = allChats[0].id;
    localStorage.removeItem('chat_history');
    saveAllChats();
}

function initializeDOMReferences() {
    chatContainer = document.getElementById('chat-container');
    chatForm = document.getElementById('chat-form');
    userInput = document.getElementById('user-input');
    loading = document.getElementById('loading');
    chatsList = document.getElementById('chats-list');
    chatTitle = document.getElementById('chat-title');
    userNameInput = document.getElementById('user-name');
}

function initializeApp() {
    userNameInput.value = userName;
    const personaInput = document.querySelector(`input[value="${currentPersona}"]`);
    if (personaInput) personaInput.checked = true;
    if (allChats.length === 0) {
        createNewChat();
    } else if (!currentChatId || !allChats.find(chat => chat.id === currentChatId)) {
        currentChatId = allChats[0].id;
    }
    localStorage.setItem('current_chat_id', currentChatId);
    localStorage.setItem('current_persona', currentPersona);
    localStorage.setItem('user_name', userName);
    renderChatsList();
    renderCurrentChat();
}

function createNewChat() {
    const newChat = {
        id: Date.now().toString(),
        title: `Chat ${allChats.length + 1}`,
        messages: [],
        createdAt: new Date().toISOString()
    };
    allChats.push(newChat);
    currentChatId = newChat.id;
    saveAllChats();
    renderChatsList();
    renderCurrentChat();
}

function deleteCurrentChat() {
    if (allChats.length <= 1) {
        alert('You must keep at least one chat.');
        return;
    }
    allChats = allChats.filter(chat => chat.id !== currentChatId);
    currentChatId = allChats[0].id;
    saveAllChats();
    renderChatsList();
    renderCurrentChat();
}

function switchChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem('current_chat_id', currentChatId);
    renderChatsList();
    renderCurrentChat();
}

function updateUserName() {
    userName = userNameInput.value || 'Guest';
    localStorage.setItem('user_name', userName);
}

function updatePersona(persona) {
    currentPersona = persona;
    localStorage.setItem('current_persona', currentPersona);
}

function renderChatsList() {
    chatsList.innerHTML = '';
    if (allChats.length === 0) {
        chatsList.innerHTML = '<p class="text-gray-500 text-sm p-4">No chats yet. Create one!</p>';
        return;
    }
    allChats.forEach(chat => {
        const isActive = chat.id === currentChatId;
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? `${lastMessage.content.substring(0, 30)}...` : 'New chat';
        const chatItem = document.createElement('div');
        chatItem.className = `p-3 rounded-lg cursor-pointer transition ${
            isActive ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`;
        chatItem.innerHTML = `
            <div class="font-semibold truncate">${chat.title}</div>
            <div class="text-xs opacity-75 truncate">${preview}</div>
            <div class="text-xs opacity-50 mt-1">Now</div>
        `;
        chatItem.onclick = () => switchChat(chat.id);
        chatsList.appendChild(chatItem);
    });
}

function renderCurrentChat() {
    const currentChat = allChats.find(chat => chat.id === currentChatId);
    if (!currentChat) return;
    chatTitle.textContent = currentChat.title;
    chatContainer.innerHTML = '';
    if (currentChat.messages.length === 0) {
        chatContainer.innerHTML = `<div class="text-center text-gray-400 mt-20"><p class="text-lg">You don't have any chat history yet.</p></div>`;
        return;
    }
    currentChat.messages.forEach(message => {
        const messageRow = document.createElement('div');
        messageRow.className = `flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`;
        const content = document.createElement('div');
        content.className = `p-4 rounded-lg max-w-xl ${
            message.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-100 border border-gray-500'
        }`;
        content.innerHTML = message.role === 'user' ? message.content : marked.parse(message.content);
        messageRow.appendChild(content);
        chatContainer.appendChild(messageRow);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addMessageToChat(role, content) {
    const currentChat = allChats.find(chat => chat.id === currentChatId);
    if (!currentChat) return;
    currentChat.messages.push({ role, content });
    if (role === 'user' && currentChat.messages.length === 1) {
        currentChat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }
    saveAllChats();
    renderChatsList();
    renderCurrentChat();
}

function setupChatForm() {
    chatForm.addEventListener('submit', async event => {
        event.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        addMessageToChat('user', text);
        userInput.value = '';
        loading.classList.remove('hidden');
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, persona: currentPersona, userName })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to fetch');
            addMessageToChat('assistant', data.response);
        } catch (error) {
            addMessageToChat('assistant', `⚠️ **Error:** ${error.message}`);
        } finally {
            loading.classList.add('hidden');
        }
    });
}

function clearAllChats() {
    if (!confirm('Are you sure? This will delete all chats.')) return;
    allChats = [];
    createNewChat();
}

function exportChats() {
    const dataBlob = new Blob([JSON.stringify(allChats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rudri-chats-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function toggleSettings() {}

document.addEventListener('DOMContentLoaded', () => {
    initializeDOMReferences();
    migrateOldFormat();
    setupChatForm();
    initializeApp();
});
