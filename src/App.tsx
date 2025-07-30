import React, { useState, useEffect } from 'react';
import { Menu, X, FileText, LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { DocumentSidebar } from './components/DocumentSidebar';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useWebhooks } from './hooks/useWebhooks';
import { Chat, Message, Document } from './types';

// Helper functions for file metadata
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
};

const isDocumentType = (mimeType: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf'
  ];
  return documentTypes.includes(mimeType);
};

const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  return 'other';
};

function App() {
  const { theme, toggleDarkMode, toggleGrayscale } = useTheme();
  const { user, isLoginModalOpen, setIsLoginModalOpen, login, loginAsUser, logout } = useAuth();
  const { webhooks, addWebhook, updateWebhook, deleteWebhook, sendToWebhook } = useWebhooks();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDocumentSidebarOpen, setIsDocumentSidebarOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('documents');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024000,
        uploadedAt: new Date(),
        selected: false,
      },
      {
        id: '2',
        name: 'document.word',
        type: 'application/msword',
        size: 512000,
        uploadedAt: new Date(),
        selected: false,
      },
      {
        id: '3',
        name: 'document.txt',
        type: 'text/plain',
        size: 256000,
        uploadedAt: new Date(),
        selected: false,
      },
      {
        id: '4',
        name: 'document.excel',
        type: 'application/vnd.ms-excel',
        size: 768000,
        uploadedAt: new Date(),
        selected: false,
      },
    ]
  });

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  }, [user, setIsLoginModalOpen]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Chat title',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const handleSendMessage = async (content: string, selectedDocSources?: string[]) => {
    if (!activeChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isUser: true,
    };

    // Add user message
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChat
          ? {
            ...chat,
            messages: [...chat.messages, userMessage],
            updatedAt: new Date(),
          }
          : chat
      )
    );

    try {
      // Send to webhook
      const selectedDocs = documents.filter(doc => doc.selected);
      const webhookData = {
        message: content,
        documents: selectedDocs.map(doc => ({ name: doc.name, type: doc.type })),
        timestamp: new Date().toISOString(),
      };

      const responses = await sendToWebhook('chat', webhookData);

      // Simulate bot response
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: selectedDocs.length > 0
            ? `Las cualidades de este documento son estas, otras, algunas y estas otras.`
            : `I understand your message: "${content}". How can I help you further?`,
          timestamp: new Date(),
          isUser: false,
          sources: selectedDocs.map(doc => ({ name: doc.name, type: doc.type })),
        };

        setChats(prev =>
          prev.map(chat =>
            chat.id === activeChat
              ? {
                ...chat,
                messages: [...chat.messages, botMessage],
                updatedAt: new Date(),
              }
              : chat
          )
        );
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDocumentUpload = async (files: File[]) => {
    try {
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Verificar tamaño de cada archivo
      for (const file of files) {
        if (file.size > maxSize) {
          throw new Error(`El archivo ${file.name} excede el límite de 5MB`);
        }
      }

      // Crear documentos nuevos
      const newDocs = files.map(file => ({
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        selected: false,
      }));

      // Actualizar documentos
      setDocuments(prev => {
        // Verificar límite total de documentos
        if (prev.length + files.length > 100) {
          alert('Se excedería el límite máximo de documentos');
          return prev;
        }
        return [...prev, ...newDocs];
      });

      // Preparar los metadatos para cada archivo
      const webhookDataArray = files.map((file, index) => ({
        // Basic file information
        filename: file.name,
        originalName: file.name,
        type: file.type,
        mimeType: file.type,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),

        // File analysis
        extension: getFileExtension(file.name),
        isPDF: file.type === 'application/pdf',
        isImage: file.type.startsWith('image/'),
        isText: file.type.startsWith('text/'),
        isDocument: isDocumentType(file.type),

        // Timestamps
        timestamp: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),

        // Additional metadata
        documentId: newDocs[index].id,
        category: getFileCategory(file.type),

        // Browser information
        lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
        webkitRelativePath: (file as any).webkitRelativePath || '',

        // User context
        userId: user?.id || 'anonymous',
        userRole: user?.isAdmin ? 'admin' : 'user',
        userName: user?.name || 'Unknown User'
      }));

      // Enviar todos los archivos en una sola petición
      await sendToWebhook('upload', webhookDataArray, files);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(error instanceof Error ? error.message : 'Error al subir el documento');
    }

  };

  const handleDocumentSelect = (documentId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId ? { ...doc, selected: !doc.selected } : doc
      )
    );
  };

  const handleDocumentDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const selectedDocuments = documents.filter(doc => doc.selected).map(doc => doc.id);
  const currentChat = chats.find(chat => chat.id === activeChat) || null;

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative z-30 h-full`}>
        <Sidebar
          isOpen={true}
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onNewChat={createNewChat}
          user={user}
          onSettingsClick={() => setIsAdminPanelOpen(true)}
          onThemeToggle={toggleDarkMode}
          isDark={theme.isDark}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}

        <ChatArea
          chat={currentChat}
          onSendMessage={handleSendMessage}
          selectedDocuments={selectedDocuments}
          onOpenDocuments={() => setIsDocumentSidebarOpen(true)}
          hasWebhooks={webhooks.filter(w => w.type === 'chat' && w.active).length > 0}
          onOpenSettings={() => setIsAdminPanelOpen(true)}
        />
      </div>

      {/* Document Sidebar */}
      {isDocumentSidebarOpen && (
        <div className="fixed lg:relative z-20 h-full">
          <DocumentSidebar
            isOpen={true}
            onClose={() => setIsDocumentSidebarOpen(false)}
            documents={documents}
            onDocumentSelect={handleDocumentSelect}
            onDocumentUpload={handleDocumentUpload}
            onDocumentDelete={handleDocumentDelete}
          />
        </div>
      )}

      {/* Overlay for mobile */}
      {(isSidebarOpen || isDocumentSidebarOpen) && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsDocumentSidebarOpen(false);
          }}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={login}
        onUserLogin={loginAsUser}
      />

      {/* Admin Panel */}
      {user?.isAdmin && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          webhooks={webhooks}
          onAddWebhook={addWebhook}
          onUpdateWebhook={updateWebhook}
          onDeleteWebhook={deleteWebhook}
          onToggleGrayscale={toggleGrayscale}
          isGrayscale={theme.isGrayscale}
        />
      )}
    </div>
  );
}

export default App;