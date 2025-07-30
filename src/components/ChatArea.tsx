import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreHorizontal, ThumbsUp, ThumbsDown, Copy, Bot, User, FileText, AlertCircle, ChevronRight, X, CheckCircle } from 'lucide-react';
import { Message, Chat } from '../types';
import './ChatArea.css';

interface Webhook {
  id: string;
  name: string;
  url: string;
  type: string;
  environment: string;
  active: boolean;
}

interface ChatAreaProps {
  chat: Chat | null;
  onSendMessage: (content: string, sources?: string[]) => void;
  selectedDocuments: string[];
  onOpenDocuments: () => void;
  hasWebhooks?: boolean;
  onOpenSettings?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  onSendMessage,
  selectedDocuments,
  onOpenDocuments,
  hasWebhooks = false,
  onOpenSettings,
}) => {
  const [message, setMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showWebhookMessage, setShowWebhookMessage] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();

    // Si hay mensajes y el último es del bot, desactivamos el estado de typing
    if (chat?.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (!lastMessage.isUser) {
        setIsBotTyping(false);
      }
    }
  }, [chat?.messages]);

  // Efecto para actualizar el mensaje cuando cambia el estado de los webhooks
  useEffect(() => {
    // Asegurarnos de que el mensaje se muestre cuando cambia el estado de los webhooks
    if (hasWebhooks) {
      setShowWebhookMessage(true);
      // Ocultamos el mensaje de éxito después de 5 segundos
      const timer = setTimeout(() => {
        setShowWebhookMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowWebhookMessage(true); // Siempre mostrar el mensaje de advertencia cuando no hay webhooks
    }
  }, [hasWebhooks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsBotTyping(true);
    onSendMessage(message, selectedDocuments);
    setMessage('');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to Chatbot
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start a new conversation to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
      <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {chat.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDocuments}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Abrir documentos"
          >
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!msg.isUser && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className={`max-w-2xl ${msg.isUser ? 'order-first' : ''}`}>
              <div
                className={`p-4 rounded-lg ${msg.isUser
                  ? 'bg-blue-600 text-white ml-auto'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                  }`}
              >
                <div className={`text-sm ${msg.isUser ? 'text-white' : 'text-gray-900 dark:text-white'} overflow-x-auto`}>
                  <div className="whitespace-pre-wrap break-words min-w-0">
                    {msg.content}
                  </div>
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Fuentes ({msg.sources.length})
                    </p>
                    <div className="space-y-1 overflow-x-auto">
                      {msg.sources.map((source, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs whitespace-nowrap">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {source.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!msg.isUser && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => copyMessage(msg.content)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                    <ThumbsUp className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                    <ThumbsDown className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            {msg.isUser && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            )}
          </div>
        ))}
        {isBotTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="typing-indicator bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {showWebhookMessage && (
          <div className={`mb-4 p-4 ${hasWebhooks 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
          } border rounded-lg`}>
            <div className="flex items-start gap-3">
              {hasWebhooks ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className={`text-sm font-medium ${hasWebhooks 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-yellow-800 dark:text-yellow-200'}`}>
                    {hasWebhooks ? 'Webhook configurado correctamente' : 'Configuración necesaria'}
                  </h3>
                  <button 
                    onClick={() => setShowWebhookMessage(false)}
                    className={`p-1 -mt-1 -mr-1 rounded-lg transition-colors ${hasWebhooks
                      ? 'hover:bg-green-100 dark:hover:bg-green-800'
                      : 'hover:bg-yellow-100 dark:hover:bg-yellow-800'}`}
                  >
                    <X className={`w-4 h-4 ${hasWebhooks
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-yellow-600 dark:text-yellow-500'}`} />
                  </button>
                </div>
                {!hasWebhooks && (
                  <>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      Para que el chat funcione correctamente, necesitas configurar al menos un webhook. 
                      Sigue estos pasos:
                    </p>
                    <ol className="mt-2 ml-4 space-y-2 text-sm text-yellow-700 dark:text-yellow-300 list-decimal">
                      <li>Abre el panel de administración</li>
                      <li>Ve a la sección de webhooks</li>
                      <li>Configura al menos un webhook para el chat</li>
                    </ol>
                    <button 
                      onClick={onOpenSettings}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100">
                      Abrir configuración <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                {hasWebhooks && (
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                    ✅ Los webhooks están configurados y funcionando correctamente. 
                    Tus mensajes serán procesados automáticamente.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {selectedDocuments.length > 0 && (
          <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <span>Fuentes ({selectedDocuments.length})</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3 w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pregunta a chat bot"
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};