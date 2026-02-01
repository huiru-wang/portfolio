
import React, { useState, useRef, useEffect } from 'react';
import RetroButton from './RetroButton';
import { ChatMessage, Language } from '@/lib/types';
import { i18nData } from '@/lib/data';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface ChatWidgetProps {
  language: Language;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ language, isOpen, setIsOpen }) => {
  const t = i18nData[language].ui.chat;
  
  // Initialize messages only once, or reset when language changes? 
  // For better UX, we append a new greeting if language changes, or just let the user continue.
  // Here we will just set the initial state.
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: t.greeting }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');

  // Effect to update greeting if the chat is empty and language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
       setMessages([{ role: 'model', content: t.greeting }]);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: inputValue };
    const historyToSend: ChatMessage[] = [...messages, userMsg].slice(-5);
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    streamingContentRef.current = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyToSend }),
      });

      if (!res.ok || !res.body) {
        throw new Error(res.statusText || 'Request failed');
      }

      // 先追加一条空内容的 model 消息，用于打字机式更新
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          streamingContentRef.current += chunk;
          // 打字机模式：每次收到片段就更新最后一条消息的 content
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'model') {
              next[next.length - 1] = { ...last, content: streamingContentRef.current };
            }
            return next;
          });
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button - 仅聊天关闭时显示 */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50">
          <RetroButton 
            variant="yellow" 
            onClick={() => setIsOpen(true)}
            className="rounded-full !px-4 !py-4 flex items-center gap-2 border-2"
          >
            <MessageSquare size={24} />
            <span className="hidden md:inline font-black">{t.button_label}</span>
          </RetroButton>
        </div>
      )}

      {/* Slide-out Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white border-l-4 border-black z-40 transform transition-transform duration-300 ease-in-out shadow-[-10px_0_15px_rgba(0,0,0,0.1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-4 border-b-2 border-black bg-retro-yellow flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center border-2 border-black">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-black font-mono font-bold">{t.powered_by}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/50 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dot-pattern">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.content}
                    {msg.role === 'model' && isLoading && idx === messages.length - 1 && (
                      <span className="inline-block w-2 h-4 ml-0.5 bg-black animate-pulse align-middle" aria-hidden />
                    )}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'model' && !messages[messages.length - 1]?.content && (
              <div className="flex justify-start">
                <div className="bg-retro-yellow border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                  <p className="text-sm font-mono animate-pulse font-bold">{t.thinking}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t-2 border-black bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t.placeholder}
                className="flex-1 border-2 border-black p-2 font-mono text-sm focus:outline-none focus:bg-gray-50 bg-retro-bg"
              />
              <RetroButton 
                variant="primary" 
                className="!px-3" 
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                <Send size={18} />
              </RetroButton>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
