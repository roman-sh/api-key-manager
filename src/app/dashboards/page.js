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
    try {
      const newKey = `sk_${uuidv4()}`;
      const { data, error } = await supabase
        .from('api_keys')
        .insert([
          {
            name: newKeyName,
            key: newKey,
            user_id: (await supabase.auth.getUser()).data.user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNewKeyName('');
      setShowCreateForm(false);
      toast.success('API key created successfully');
      
      // Show the new key only once
      toast(
        <div className="text-sm">
          <p className="font-medium mb-1">Save your API key - it won't be shown again!</p>
          <code className="bg-gray-100 px-2 py-1 rounded">{newKey}</code>
        </div>,
        { duration: 10000 }
      );
    } catch (error) {
      toast.error('Failed to create API key');
      console.error('Error:', error);
    }
  };

  const deleteApiKey = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('API key deleted successfully');
    } catch (error) {
      toast.error('Failed to delete API key');
      console.error('Error:', error);
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
                        <code className="text-gray-600 text-sm flex-1">{key.key}</code>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteApiKey(key.id)}
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
    </div>
  );
} 