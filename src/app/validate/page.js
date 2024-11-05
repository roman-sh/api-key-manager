'use client';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ValidateApiKey() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      setResult(data);
      if (data.valid) {
        toast.success('API key is valid');
      } else {
        toast.error('API key is invalid');
      }
    } catch (error) {
      toast.error(error.message);
      setResult({ valid: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Validate API Key</h1>
      
      <form onSubmit={handleValidate} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            Enter API Key
          </label>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9575cd] focus:border-transparent"
            placeholder="pk_..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#9575cd] text-white px-4 py-2 rounded-md hover:bg-[#7e57c2] transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Validating...' : 'Validate Key'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-md ${
          result.valid 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {result.valid ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={result.valid ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </span>
          </div>
          {result.valid && (
            <div className="mt-2 text-sm text-green-600">
              Key Name: {result.keyName}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 