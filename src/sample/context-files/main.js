(function() {
    const vscode = acquireVsCodeApi();
    const chatMessages = document.getElementById('chat-messages');
    const fileList = document.getElementById('file-list');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const selectFilesButton = document.getElementById('select-files');

    selectFilesButton.addEventListener('click', () => {
        vscode.postMessage({ command: 'selectFile' });
    });

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat('User', message);
            chatInput.value = '';
            // Here you would typically send the message to an AI service
            // For this example, we'll just echo the message
            setTimeout(() => {
                addMessageToChat('AI', `You said: ${message}`);
            }, 1000);
        }
    }

    function addMessageToChat(sender, message, context = '') {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        const senderElement = document.createElement('strong');
        senderElement.textContent = `${sender}: `;

        const messageText = document.createTextNode(message);
        messageElement.appendChild(senderElement);
        messageElement.appendChild(messageText);

        if (context) {
            const contextElement = document.createElement('div');
            contextElement.className = 'context';
            contextElement.textContent = context;
            messageElement.appendChild(contextElement);
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'addFiles':
                message.files.forEach(file => {
                    const fileElement = document.createElement('div');
                    fileElement.className = 'file';
                    fileElement.textContent = file.name;
                    fileElement.title = file.content;
                    fileList.appendChild(fileElement);
                });
                break;
        }
    });
})();