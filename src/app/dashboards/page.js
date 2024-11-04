'use client';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { useApiKeys } from './hooks/useApiKeys';
import ApiKeysTable from './components/ApiKeysTable';
import CreateKeyModal from './components/CreateKeyModal';
import DeleteKeyModal from './components/DeleteKeyModal';
import UserMenu from './components/UserMenu';
import LoadingSpinner from './components/LoadingSpinner';

export default function ApiKeysManager() {
  const { userEmail, isAuthChecking, isAuthenticated, handleLogout } = useAuth();
  const { apiKeys, isLoading, fetchApiKeys, handleEditName } = useApiKeys();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, keyId: null, keyName: '' });

  if (isAuthChecking) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#9575cd] text-white px-4 py-2 rounded-md hover:bg-[#7e57c2] transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span> New API key
        </button>

        <UserMenu 
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      </div>

      <ApiKeysTable 
        apiKeys={apiKeys}
        isLoading={isLoading}
        onDelete={(id, name) => setDeleteModal({ show: true, keyId: id, keyName: name })}
        onEditName={handleEditName}
      />

      {showCreateForm && (
        <CreateKeyModal 
          onClose={() => setShowCreateForm(false)} 
          onCreated={fetchApiKeys}
        />
      )}

      {deleteModal.show && (
        <DeleteKeyModal 
          keyId={deleteModal.keyId}
          keyName={deleteModal.keyName}
          onClose={() => setDeleteModal({ show: false, keyId: null, keyName: '' })}
          onDeleted={fetchApiKeys}
        />
      )}

      <Toaster position="bottom-right" />
    </div>
  );
} 