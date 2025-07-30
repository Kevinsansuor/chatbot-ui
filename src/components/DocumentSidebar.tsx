import React, { useState } from 'react';
import { X, Upload, FileText, File, MoreVertical, Trash2 } from 'lucide-react';
import { Document } from '../types';

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onDocumentSelect: (documentId: string) => void;
  onDocumentUpload: (files: File[]) => void;
  onDocumentDelete: (documentId: string) => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  isOpen,
  onClose,
  documents,
  onDocumentSelect,
  onDocumentUpload,
  onDocumentDelete,
}) => {
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      alert(`El archivo ${file.name} excede el límite de 5MB`);
      return false;
    }
    return true;
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.slice(0, 5).filter(validateFile); // Limitar a 5 archivos
    if (files.length > 5) {
      alert('Solo se pueden subir hasta 5 archivos a la vez');
    }
    validFiles.forEach(file => onDocumentUpload(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    onDocumentUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onDocumentUpload(files);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Documentos
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <input
                type="checkbox"
                checked={doc.selected}
                onChange={() => onDocumentSelect(doc.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-shrink-0">
                {getFileIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(doc.size)}
                </p>
              </div>
              <div className="relative group">
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => onDocumentDelete(doc.id)}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Upload Document
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            pdf/word/images/txt/excel...
          </p>
          <input
            type="file"
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg cursor-pointer transition-colors"
          >
            Choose Files
          </label>
        </div>
      </div>
    </div>
  );
};