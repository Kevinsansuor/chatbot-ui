import React, { useState } from 'react';
import { X, Plus, Globe, Server, Trash2, Edit3, Power, PowerOff } from 'lucide-react';
import { WebhookConfig } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  webhooks: WebhookConfig[];
  onAddWebhook: (webhook: Omit<WebhookConfig, 'id'>) => void;
  onUpdateWebhook: (id: string, updates: Partial<WebhookConfig>) => void;
  onDeleteWebhook: (id: string) => void;
  onToggleGrayscale: () => void;
  isGrayscale: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  webhooks,
  onAddWebhook,
  onUpdateWebhook,
  onDeleteWebhook,
  onToggleGrayscale,
  isGrayscale,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'chat' as 'chat' | 'upload',
    environment: 'local' as 'local' | 'production',
    active: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWebhook) {
      onUpdateWebhook(editingWebhook, formData);
      setEditingWebhook(null);
    } else {
      onAddWebhook(formData);
    }
    setFormData({
      name: '',
      url: '',
      type: 'chat',
      environment: 'local',
      active: true,
    });
    setShowAddForm(false);
  };

  const startEdit = (webhook: WebhookConfig) => {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      type: webhook.type,
      environment: webhook.environment,
      active: webhook.active,
    });
    setEditingWebhook(webhook.id);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingWebhook(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      url: '',
      type: 'chat',
      environment: 'local',
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Theme Controls */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Theme Settings
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Grayscale Mode
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Toggle grayscale theme for better accessibility
                </p>
              </div>
              <button
                onClick={onToggleGrayscale}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isGrayscale ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isGrayscale ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Webhook Configuration
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Webhook
              </button>
            </div>

            {showAddForm && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  {editingWebhook ? 'Edit Webhook' : 'Add New Webhook'}
                </h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'chat' | 'upload' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="chat">Chat</option>
                        <option value="upload">Upload</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://your-webhook-url.com"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Environment
                      </label>
                      <select
                        value={formData.environment}
                        onChange={(e) => setFormData({ ...formData, environment: e.target.value as 'local' | 'production' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="local">Local</option>
                        <option value="production">Production</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {editingWebhook ? 'Update' : 'Add'} Webhook
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Webhook Documentation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                📄 Document Upload Webhook Configuration
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p><strong>Upload webhooks</strong> receive the actual file content + rich metadata via FormData:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li><code>file</code>: The uploaded file (multipart/form-data)</li>
                  <li><code>metadata</code>: JSON with comprehensive file info:</li>
                </ul>
                <div className="ml-5 text-xs bg-blue-100 dark:bg-blue-800 p-2 rounded">
                  <strong>Metadata includes:</strong> filename, type, size, extension, category (pdf/image/text), 
                  timestamps, user info, file analysis (isPDF, isImage, isDocument), and more.
                </div>
                <p><strong>Example server endpoint:</strong></p>
                <pre className="bg-blue-100 dark:bg-blue-800 p-2 rounded text-xs overflow-x-auto">
{`app.post('/webhook/upload', upload.single('file'), (req, res) => {
  const file = req.file; // Multer file object
  const metadata = JSON.parse(req.body.metadata);
  
  console.log('File:', metadata.originalName);
  console.log('Category:', metadata.category);
  console.log('Is PDF:', metadata.isPDF);
  console.log('User:', metadata.userName);
  
  res.json({ success: true });
});`}
                </pre>
              </div>
            </div>

            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {webhook.environment === 'production' ? (
                        <Globe className="w-5 h-5 text-green-500" />
                      ) : (
                        <Server className="w-5 h-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {webhook.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {webhook.type} • {webhook.environment}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateWebhook(webhook.id, { active: !webhook.active })}
                      className={`p-2 rounded-lg transition-colors ${
                        webhook.active
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {webhook.active ? (
                        <Power className="w-4 h-4" />
                      ) : (
                        <PowerOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(webhook)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteWebhook(webhook.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {webhooks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No webhooks configured yet. Add your first webhook to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};