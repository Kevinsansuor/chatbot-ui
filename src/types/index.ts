export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  sources?: DocumentSource[];
}

export interface DocumentSource {
  name: string;
  type: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  selected: boolean;
  status?: 'loading' | 'success' | 'error';
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  type: 'chat' | 'upload';
  environment: 'local' | 'production';
  active: boolean;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface ThemeConfig {
  isDark: boolean;
  isGrayscale: boolean;
  palette: ColorPalette;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
}