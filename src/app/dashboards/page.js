'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this: npm install uuid

export default function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, keyId: null, keyName: '' });

  // Add this helper function at the top of your component
  const obfuscateKey = (key) => {
    const prefix = key.substring(0, 5);  // Show first 5 chars
    const suffix = key.substring(key.length - 4);  // Show last 4 chars
    const middle = '*'.repeat(8);  // Fixed length of asterisks
    return `${prefix}${middle}${suffix}`;
};

  // Inside your existing useEffect
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      
      console.log('Setting up real-time subscription...');
      
      // Add subscription after confirming auth
      const channel = supabase
        .channel('api_keys_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'api_keys',
          },
          (payload) => {
            // console.log('Change received:', payload);
            // console.log('Payload type:', payload.eventType); // INSERT, UPDATE, or DELETE
            // console.log('Changed record:', payload.new || payload.old);
            fetchApiKeys();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      // Initial fetch
      console.log('Performing initial fetch...');
      await fetchApiKeys();

      // Cleanup subscription
      return () => {
        console.log('Cleaning up subscription...');
        supabase.removeChannel(channel);
      };
    };
    
    checkAuth();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data);
    } catch (error) {
      toast.error('Failed to fetch API keys');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      const newKey = `sk-${uuidv4()}`;

      const { error } = await supabase.from('api_keys').insert([
        {
          name: newKeyName.trim(),
          key: newKey,
          user_id: (await supabase.auth.getUser()).data.user.id,
        },
      ]);

      if (error) throw error;

      setNewKeyName('');
      setShowCreateForm(false);
      toast.success('API key created successfully');

    } catch (error) {
      toast.error('Failed to create API key');
      console.error('Error:', error);
    }
  };

  const deleteApiKey = async (id) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('API key deleted successfully');
      setDeleteModal({ show: false, keyId: null, keyName: '' });
    } catch (error) {
      toast.error('Failed to delete API key');
      console.error('Error:', error);
    }
  };

  // Add this function to handle copying
  const copyToClipboard = async (text, keyName) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Key "${keyName}" copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy key');
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Toaster position="bottom-right" />
      
      {/* Header with New API Key button */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="mb-6 bg-[#9575cd] text-white px-4 py-2 rounded-md hover:bg-[#7e57c2] transition-colors flex items-center gap-2"
      >
        <span className="text-xl">+</span> New API key
      </button>

      {/* Create API Key Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>
            <form onSubmit={createApiKey}>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="API key name"
                className="w-full px-3 py-2 border rounded-md mb-4"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9575cd] text-white rounded-md hover:bg-[#7e57c2]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Keys Table */}
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
                  <td className="p-4 text-gray-700">{key.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 px-3 py-2 rounded flex items-center gap-2 flex-1">
                        <svg 
                          className="w-5 h-5 text-gray-400"
                          fill="none" 
                          strokeWidth="1.5" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                        <code className="text-gray-600 text-sm flex-1">{obfuscateKey(key.key)}</code>
                        <button
                          onClick={() => copyToClipboard(key.key, key.name)}
                          className="p-1 hover:bg-gray-100 rounded-full inline-flex items-center"
                          title="Copy full API key"
                        >
                          <svg 
                            className="w-4 h-4 text-gray-500 hover:text-gray-700"
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24"
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setDeleteModal({ 
                        show: true, 
                        keyId: key.id,
                        keyName: key.name 
                      })}
                      className="bg-[#ef5350] text-white px-4 py-1.5 rounded-md hover:bg-[#e53935] transition-colors flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
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

      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Delete API Key
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the API key "{deleteModal.keyName}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={() => deleteApiKey(deleteModal.keyId)}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setDeleteModal({ show: false, keyId: null, keyName: '' })}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 