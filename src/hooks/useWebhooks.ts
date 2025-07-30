import { useState, useEffect } from 'react';
import { WebhookConfig } from '../types';

export const useWebhooks = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => {
    const saved = localStorage.getItem('webhooks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  const addWebhook = (webhook: Omit<WebhookConfig, 'id'>) => {
    const newWebhook: WebhookConfig = {
      ...webhook,
      id: Date.now().toString(),
    };
    setWebhooks(prev => [...prev, newWebhook]);
  };

  const updateWebhook = (id: string, updates: Partial<WebhookConfig>) => {
    setWebhooks(prev =>
      prev.map(webhook =>
        webhook.id === id ? { ...webhook, ...updates } : webhook
      )
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
  };

  const sendToWebhook = async (type: 'chat' | 'upload', data: Record<string, unknown> | Record<string, unknown>[], files?: File[]) => {
    const activeWebhooks = webhooks.filter(w => w.type === type && w.active);

    const promises = activeWebhooks.map(async (webhook) => {
      try {
        let body: string | FormData;
        const headers: Record<string, string> = {};

        if (type === 'upload' && files && files.length > 0) {
          // Para webhooks de carga, usar FormData para enviar múltiples archivos
          const formData = new FormData();
          
          // Agregar cada archivo al FormData
          files.forEach(file => {
            formData.append('files', file);
          });
          
          // Enviar un array de metadatos, uno por cada archivo
          const metadataArray = Array.isArray(data) ? data : [data];
          formData.append('metadata', JSON.stringify(metadataArray));
          body = formData;
        } else {
          // Para webhooks de chat, usar JSON
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(data);
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body,
        });
        return response.json();
      } catch (error) {
        console.error(`Webhook ${webhook.name} failed:`, error);
        return null;
      }
    });

    return Promise.allSettled(promises);
  };

  return {
    webhooks,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    sendToWebhook,
  };
};