'use client';

import { useState } from 'react';

export default function TestPage() {
  const [results, setResults] = useState('');
  const [testing, setTesting] = useState(false);

  const runConnectivityTest = async () => {
    setTesting(true);
    setResults('Testing backend connectivity...\n\n');

    try {
      // Test 1: Simple fetch to check CORS
      setResults(prev => prev + '1. Testing CORS with simple fetch...\n');
      const corsTest = await fetch('https://padria-backend.onrender.com/api/admin/me', {
        method: 'GET',
        credentials: 'include',
      });
      setResults(prev => prev + `   Status: ${corsTest.status}\n   CORS Headers: ${corsTest.headers.get('Access-Control-Allow-Origin') || 'None'}\n\n`);

      // Test 2: Test with axios (your apiClient)
      setResults(prev => prev + '2. Testing with axios/apiClient...\n');
      const { default: apiClient } = await import('@/utils/apiClient');
      
      try {
        const response = await apiClient.get('/admin/me');
        setResults(prev => prev + `   Success! Data: ${JSON.stringify(response.data)}\n\n`);
      } catch (axiosError: any) {
        setResults(prev => prev + `   Error: ${axiosError.response?.status} - ${axiosError.response?.data?.detail || axiosError.message}\n\n`);
      }

      // Test 3: Try login
      setResults(prev => prev + '3. Testing login...\n');
      try {
        const loginResponse = await apiClient.post('/admin/login', {
          email: 'admin@example.com',
          password: 'PadriaBoutique2026'
        });
        setResults(prev => prev + `   Login Success! User: ${JSON.stringify(loginResponse.data.user)}\n\n`);
        
        // Test 4: Test /me after login
        setResults(prev => prev + '4. Testing /me after login...\n');
        const meAfterLogin = await apiClient.get('/admin/me');
        setResults(prev => prev + `   Me Success! Data: ${JSON.stringify(meAfterLogin.data)}\n\n`);
      } catch (loginError: any) {
        setResults(prev => prev + `   Login Error: ${loginError.response?.status} - ${loginError.response?.data?.detail || loginError.message}\n\n`);
      }

    } catch (error) {
      setResults(prev => prev + `Error: ${error}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Backend Connectivity Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-600 mb-4">
            This page tests the connection to your backend and authentication flow.
            Your frontend is now running on port 3001.
          </p>
          <button
            onClick={runConnectivityTest}
            disabled={testing}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg"
          >
            {testing ? 'Testing...' : 'Run Connectivity Test'}
          </button>
        </div>

        {results && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {results}
            </pre>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Important CORS Configuration:</h3>
          <p className="text-yellow-700 text-sm">
            Make sure your Render backend has this environment variable:<br/>
            <code className="bg-yellow-100 px-2 py-1 rounded">
              CORS_ORIGINS=http://localhost:3001,http://localhost:3000,https://your-production-domain.com
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}