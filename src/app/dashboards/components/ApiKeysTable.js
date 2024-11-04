'use client';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ApiKeysTable({ 
  apiKeys, 
  isLoading, 
  onDelete, 
  onEditName 
}) {
  const [editingKey, setEditingKey] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleEditSubmit = async (keyId) => {
    try {
      await onEditName(keyId, editingName);
      setEditingKey(null);
      setEditingName('');
    } catch (error) {
      toast.error('Failed to update key name');
    }
  };

  const obfuscateKey = (key) => {
    const prefix = key.substring(0, 5);
    const suffix = key.substring(key.length - 4);
    const middle = '*'.repeat(8);
    return `${prefix}${middle}${suffix}`;
  };

  const copyToClipboard = async (text, keyName) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Key "${keyName}" copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy key');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 text-gray-600 font-medium">API key name</th>
            <th className="text-left p-4 text-gray-600 font-medium">API key</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="3" className="text-center py-8">Loading API keys...</td>
            </tr>
          ) : apiKeys.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-8 text-gray-500">
                No API keys found. Create one to get started.
              </td>
            </tr>
          ) : (
            apiKeys.map((key) => (
              <tr key={key.id} className="border-b last:border-b-0">
                <td className="p-4 text-gray-700">
                  {editingKey === key.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#9575cd] focus:border-transparent"
                        placeholder="Enter key name"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSubmit(key.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Save"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setEditingKey(null);
                          setEditingName('');
                        }}
                        className="p-1 text-gray-600 hover:text-gray-700"
                        title="Cancel"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingKey(key.id);
                          setEditingName(key.name);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <span>{key.name}</span>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 px-3 py-2 rounded flex items-center gap-2 flex-1">
                      <svg className="w-5 h-5 text-gray-400" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                      </svg>
                      <code className="text-gray-600 text-sm flex-1">{obfuscateKey(key.key)}</code>
                      <button
                        onClick={() => copyToClipboard(key.key, key.name)}
                        className="p-1 hover:bg-gray-100 rounded-full inline-flex items-center"
                        title="Copy full API key"
                      >
                        <svg className="w-4 h-4 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onDelete(key.id, key.name)}
                    className="bg-[#ef5350] text-white px-4 py-1.5 rounded-md hover:bg-[#e53935] transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete API key
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 