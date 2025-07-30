import React from 'react';
import { Search, Plus, MessageSquare, Settings, Moon, Sun } from 'lucide-react';
import { Chat, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  user: User | null;
  onSettingsClick: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  user,
  onSettingsClick,
  onThemeToggle,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Chatbot
        </h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar chat"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeChat === chat.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{chat.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onThemeToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.isAdmin ? 'Admin' : 'User'}
              </p>
            </div>
            {user.isAdmin && (
              <button
                onClick={onSettingsClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};