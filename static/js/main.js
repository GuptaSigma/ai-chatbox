let chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];
const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const loading = document.getElementById('loading');

function renderChat() {
    chatContainer.innerHTML = '';
    if (chatHistory.length === 0) {
        chatContainer.innerHTML = `<p class="text-center text-gray-400 mt-10">Start a conversation!</p>`;
        return;
    }
    chatHistory.forEach(msg => {
        const isUser = msg.role === 'user';
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = `p-3 rounded-lg max-w-[80%] ${isUser ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`;
        
        contentDiv.innerHTML = isUser ? msg.content : marked.parse(msg.content);
        msgDiv.appendChild(contentDiv);
        chatContainer.appendChild(msgDiv);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    chatHistory.push({ role: 'user', content: text });
    userInput.value = '';
    renderChat();

    loading.classList.remove('hidden');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to fetch');

        chatHistory.push({ role: 'assistant', content: data.response });
        localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    } catch (err) {
        chatHistory.push({ role: 'assistant', content: `⚠️ **Error:** ${err.message}` });
    } finally {
        loading.classList.add('hidden');
        renderChat();
    }
});

function clearChat() {
    chatHistory = [];
    localStorage.removeItem('chat_history');
    renderChat();
}

renderChat();