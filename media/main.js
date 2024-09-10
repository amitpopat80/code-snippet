(function() {
    const vscode = acquireVsCodeApi();

    const chatView = document.getElementById('chat-view');
    const fileView = document.getElementById('file-view');
    const settingsView = document.getElementById('settings-view');
    const chatTab = document.getElementById('chat-tab');
    const fileTab = document.getElementById('file-tab');
    const settingsTab = document.getElementById('settings-tab');
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const useFileContentCheckbox = document.getElementById('use-file-content-checkbox');

    let currentFileContent = '';
    let currentFileName = '';

    function switchTab(activeTab, activeView, inactiveTabs, inactiveViews) {
        activeTab.classList.add('active');
        activeView.classList.add('active');
        inactiveTabs.forEach(tab => tab.classList.remove('active'));
        inactiveViews.forEach(view => view.classList.remove('active'));
    }

    chatTab.addEventListener('click', () => {
        switchTab(chatTab, chatView, [fileTab, settingsTab], [fileView, settingsView]);
    });

    fileTab.addEventListener('click', () => {
        switchTab(fileTab, fileView, [chatTab, settingsTab], [chatView, settingsView]);
    });

    settingsTab.addEventListener('click', () => {
        switchTab(settingsTab, settingsView, [chatTab, fileTab], [chatView, fileView]);
    });

    function formatMessage(message) {
        const codeBlockRegex = /```([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(message)) !== null) {
            // Add text before code block
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: message.slice(lastIndex, match.index) });
            }
            // Add code block
            parts.push({ type: 'code', content: match[1].trim() });
            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last code block
        if (lastIndex < message.length) {
            parts.push({ type: 'text', content: message.slice(lastIndex) });
        }

        return parts;
    }

    function addMessage(message, isUser, useFileContext = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'llm-message');
        
        if (isUser && useFileContext) {
            const contextInfo = document.createElement('div');
            contextInfo.classList.add('context-info');
            contextInfo.textContent = `[Using context from: ${currentFileName}]`;
            messageElement.appendChild(contextInfo);
        }
        
        const formattedParts = formatMessage(message);
        formattedParts.forEach(part => {
            if (part.type === 'text') {
                const textElement = document.createElement('p');
                textElement.textContent = part.content;
                messageElement.appendChild(textElement);
            } else if (part.type === 'code') {
                const preElement = document.createElement('pre');
                const codeElement = document.createElement('code');
                codeElement.textContent = part.content;
                preElement.appendChild(codeElement);
                messageElement.appendChild(preElement);
            }
        });
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            const useFileContext = useFileContentCheckbox.checked;
            addMessage(message, true, useFileContext);
            const fileContent = useFileContext ? currentFileContent : '';
            vscode.postMessage({ 
                type: 'sendMessage', 
                message, 
                fileContent,
                fileName: useFileContext ? currentFileName : ''
            });
            messageInput.value = '';
        }
    });

    useFileContentCheckbox.addEventListener('change', () => {
        if (useFileContentCheckbox.checked) {
            currentFileContent = document.getElementById('file-content').textContent;
            currentFileName = document.getElementById('file-name').textContent;
            vscode.postMessage({ type: 'showInfo', message: 'File content will be used as context in the next message' });
        } else {
            currentFileContent = '';
            currentFileName = '';
            vscode.postMessage({ type: 'showInfo', message: 'File content will not be used as context' });
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
            case 'updateFileContent':
                document.getElementById('file-content').textContent = message.content;
                currentFileContent = message.content;
                break;
        }
    });
})();