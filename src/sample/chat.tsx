import React, { useState, useEffect } from 'react';

declare const vscode: any;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMessage = (event: MessageEvent) => {
    const message = event.data;
    if (message.type === 'twinnyOnCompletion') {
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1]?.role === 'assistant') {
          newMessages[newMessages.length - 1].content = message.value.completion;
        } else {
          newMessages.push({ role: 'assistant', content: message.value.completion });
        }
        return newMessages;
      });
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, newMessage]);
      vscode.postMessage({ type: 'sendMessage', value: input });
      setInput('');
    }
  };

  return (
    <div>
      <div style={{ height: '300px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.role === 'user' ? 'You: ' : 'AI: '}</strong>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};