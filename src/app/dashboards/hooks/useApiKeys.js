import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Helper function to generate a random API key using UUID v4
function generateApiKey() {
  const uuid = crypto.randomUUID();
  return `pk_${uuid.replace(/-/g, '')}`;
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditName = async (keyId, newName) => {
    try {
      if (!newName.trim()) {
        toast.error('Key name cannot be empty');
        return;
      }

      const { error } = await supabase
        .from('api_keys')
        .update({ name: newName.trim() })
        .eq('id', keyId);

      if (error) throw error;

      toast.success('API key name updated');
      await fetchApiKeys();
    } catch (error) {
      console.error('Error updating key name:', error);
      toast.error('Failed to update key name');
      throw error;
    }
  };

  const handleDelete = async (keyId) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      toast.success('API key deleted successfully');
      await fetchApiKeys();
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error('Failed to delete API key');
      throw error;
    }
  };

  const handleCreate = async (keyName) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{ 
          name: keyName.trim(),
          user_id: user.id,
          key: generateApiKey()
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('API key created successfully');
      await fetchApiKeys();
      return data;
    } catch (error) {
      console.error('Error creating key:', error);
      toast.error('Failed to create API key');
      throw error;
    }
  };

  useEffect(() => {
    fetchApiKeys();

    // Set up real-time subscription
    const channel = supabase
      .channel('api_keys_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_keys'
        },
        () => {
          fetchApiKeys();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
    apiKeys, 
    isLoading, 
    fetchApiKeys,
    handleEditName,
    handleDelete,
    handleCreate
  };
} 