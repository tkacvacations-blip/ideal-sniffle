import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

export function CheckAdmin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      setMetadata(user.app_metadata);
    }
  }, [user]);

  const refreshSession = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      alert('Session refreshed! Please wait a moment...');

      window.location.reload();
    } catch (error) {
      console.error('Error refreshing session:', error);
      alert('Failed to refresh session. Try logging out and back in.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Access Diagnostic</h1>

          <div className="space-y-4 mb-8">
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-700 mb-2">User ID</h2>
              <p className="text-sm text-gray-600 font-mono break-all">{user?.id || 'Not logged in'}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-700 mb-2">Email</h2>
              <p className="text-sm text-gray-600">{user?.email || 'Not logged in'}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-700 mb-2">Admin Status</h2>
              <p className={`text-lg font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                {isAdmin ? '✓ You are an admin' : '✗ You are NOT an admin'}
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-700 mb-2">App Metadata</h2>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={refreshSession}
              disabled={refreshing}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Session'}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Sign Out & Sign Back In
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              Try Admin Panel Again
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Return Home
            </button>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h3>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Click "Refresh Session" button above</li>
              <li>If that doesn't work, click "Sign Out & Sign Back In"</li>
              <li>After signing back in, try accessing admin panel</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
