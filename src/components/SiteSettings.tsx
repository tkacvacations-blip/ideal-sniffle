import { useState, useEffect } from 'react';
import { Settings, Globe, CheckCircle, AlertTriangle } from 'lucide-react';
import { getSiteSettings, updateSiteSetting } from '../lib/site-settings';

export function SiteSettings() {
  const [bookingsEnabled, setBookingsEnabled] = useState(false);
  const [siteMode, setSiteMode] = useState<'live' | 'preview' | 'testing' | 'maintenance'>('preview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSiteSettings();
      setBookingsEnabled(settings.bookings_enabled);
      setSiteMode(settings.site_mode);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const success1 = await updateSiteSetting('bookings_enabled', bookingsEnabled.toString());
      const success2 = await updateSiteSetting('site_mode', siteMode);

      if (success1 && success2) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleGoLive = async () => {
    if (confirm('Are you ready to go live? This will enable bookings and make your site public.')) {
      setSaving(true);
      try {
        await updateSiteSetting('bookings_enabled', 'true');
        await updateSiteSetting('site_mode', 'live');
        setBookingsEnabled(true);
        setSiteMode('live');
        setMessage({ type: 'success', text: 'Site is now LIVE!' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to go live. Please try again.' });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Site Settings</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          <div className="border-b pb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Site Status</h3>
            <div className={`p-6 rounded-xl ${
              siteMode === 'live' ? 'bg-green-50 border-2 border-green-500' :
              siteMode === 'testing' ? 'bg-blue-50 border-2 border-blue-500' :
              'bg-amber-50 border-2 border-amber-500'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Globe className={`w-8 h-8 ${
                    siteMode === 'live' ? 'text-green-600' :
                    siteMode === 'testing' ? 'text-blue-600' :
                    'text-amber-600'
                  }`} />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {siteMode === 'live' ? 'LIVE' :
                       siteMode === 'testing' ? 'Testing Mode' :
                       siteMode === 'preview' ? 'Preview Mode' :
                       'Maintenance Mode'}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {siteMode === 'live' && 'Your site is live and accepting bookings'}
                      {siteMode === 'testing' && 'Private testing - bookings enabled with test payments'}
                      {siteMode === 'preview' && 'Your site is in preview mode - bookings disabled'}
                      {siteMode === 'maintenance' && 'Your site is in maintenance mode'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Site Mode
              </label>
              <select
                value={siteMode}
                onChange={(e) => setSiteMode(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="preview">Preview Mode - Site visible, bookings disabled</option>
                <option value="testing">Testing Mode - Private live testing with bookings enabled</option>
                <option value="live">Live - Full public launch with real payments</option>
                <option value="maintenance">Maintenance Mode - Show maintenance page</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Enable Bookings</h4>
                <p className="text-sm text-gray-600">Allow customers to make bookings</p>
              </div>
              <button
                onClick={() => setBookingsEnabled(!bookingsEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  bookingsEnabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    bookingsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {siteMode !== 'live' && (
              <button
                onClick={handleGoLive}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Going Live...' : 'GO LIVE NOW!'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Pre-Launch Checklist</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Database configured and migrations applied
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Stripe payment integration configured
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Email notifications configured (Resend)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Edge functions deployed
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Calendar sync configured
            </li>
          </ul>
          <p className="mt-4 text-sm text-blue-900 font-medium">
            When ready, click "GO LIVE NOW" to enable bookings and launch your site!
          </p>
        </div>
      </div>
    </div>
  );
}
