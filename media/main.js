(function() {
    const vscode = acquireVsCodeApi();

    const chatView = document.getElementById('chat-view');
    const settingsView = document.getElementById('settings-view');
    const chatTab = document.getElementById('chat-tab');
    const settingsTab = document.getElementById('settings-tab');
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    function switchTab(activeTab, activeView, inactiveTab, inactiveView) {
        activeTab.classList.add('active');
        activeView.classList.add('active');
        inactiveTab.classList.remove('active');
        inactiveView.classList.remove('active');
    }

    chatTab.addEventListener('click', () => {
        switchTab(chatTab, chatView, settingsTab, settingsView);
    });

    settingsTab.addEventListener('click', () => {
        switchTab(settingsTab, settingsView, chatTab, chatView);
    });

    function addMessage(message, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'llm-message');
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            vscode.postMessage({ type: 'sendMessage', message });
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'addMessage':
                addMessage(message.reply, false);
                break;
        }
    });
})();