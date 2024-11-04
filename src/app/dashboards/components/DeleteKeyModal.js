'use client';
import { useState } from 'react';
import { useApiKeys } from '../hooks/useApiKeys';

export default function DeleteKeyModal({ keyId, keyName, onClose, onDeleted }) {
  const [isLoading, setIsLoading] = useState(false);
  const { handleDelete } = useApiKeys();

  const onConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await handleDelete(keyId);
      onDeleted();
      onClose();
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Delete API Key</h2>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the API key "{keyName}"? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete Key'}
          </button>
        </div>
      </div>
    </div>
  );
} 