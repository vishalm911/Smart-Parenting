import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe,
  Save,
  RefreshCw
} from 'lucide-react';
import { AnimatedButton } from '../../components/AnimatedButton';
import { useAuthStore } from '../../store/authStore';

const AdminSettings = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'SpaceECE',
    siteDescription: 'Kids Learning & Development Platform',
    maintenanceMode: false,
    allowRegistration: true,
    
    // Notification Settings
    emailNotifications: true,
    parentAlerts: true,
    moodAlerts: true,
    achievementNotifications: true,
    
    // Security Settings
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30, // minutes
    twoFactorAuth: false,
    
    // Content Settings
    maxFileSize: 10, // MB
    allowedFileTypes: 'jpg, png, gif, pdf',
    autoModeration: true,
    profanityFilter: true,
    
    // Data Settings
    dataRetention: 365, // days
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset to default values
      setSettings({
        siteName: 'SpaceECE',
        siteDescription: 'Kids Learning & Development Platform',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        parentAlerts: true,
        moodAlerts: true,
        achievementNotifications: true,
        requireEmailVerification: true,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        twoFactorAuth: false,
        maxFileSize: 10,
        allowedFileTypes: 'jpg, png, gif, pdf',
        autoModeration: true,
        profanityFilter: true,
        dataRetention: 365,
        autoBackup: true,
        backupFrequency: 'daily',
      });
      alert('Settings reset to defaults');
    }
  };

  return (
    <div className="min-h-screen bg-light p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-dark mb-2">Admin Settings</h1>
            <p className="text-gray-600">Configure platform settings and preferences</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-gray-700 hover:bg-light-cream transition-colors"
            >
              <RefreshCw size={20} />
              Reset
            </button>
            <AnimatedButton 
              onClick={handleSave} 
              disabled={isSaving}
              icon={<Save size={20} />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </AnimatedButton>
          </div>
        </div>

        {/* General Settings */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Globe size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-dark">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="input-field"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Maintenance Mode</p>
                <p className="text-sm text-gray-600">Disable public access to the site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Allow User Registration</p>
                <p className="text-sm text-gray-600">Enable new users to create accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-info/20 flex items-center justify-center">
              <Bell size={24} className="text-info" />
            </div>
            <h2 className="text-2xl font-extrabold text-dark">Notification Settings</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Email Notifications</p>
                <p className="text-sm text-gray-600">Send email notifications to users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-info/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-info"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Parent Alerts</p>
                <p className="text-sm text-gray-600">Notify parents of child activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.parentAlerts}
                  onChange={(e) => setSettings({ ...settings, parentAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-info/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-info"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Mood Alerts</p>
                <p className="text-sm text-gray-600">Alert parents for negative mood patterns</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.moodAlerts}
                  onChange={(e) => setSettings({ ...settings, moodAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-info/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-info"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Achievement Notifications</p>
                <p className="text-sm text-gray-600">Notify users of new achievements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.achievementNotifications}
                  onChange={(e) => setSettings({ ...settings, achievementNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-info/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-info"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-error/20 flex items-center justify-center">
              <Shield size={24} className="text-error" />
            </div>
            <h2 className="text-2xl font-extrabold text-dark">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Require Email Verification</p>
                <p className="text-sm text-gray-600">Users must verify email before access</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-error/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                className="input-field"
                min="3"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="input-field"
                min="15"
                max="120"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-error/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center">
              <Mail size={24} className="text-success" />
            </div>
            <h2 className="text-2xl font-extrabold text-dark">Content Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Max File Upload Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                className="input-field"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Allowed File Types
              </label>
              <input
                type="text"
                value={settings.allowedFileTypes}
                onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                className="input-field"
                placeholder="jpg, png, gif, pdf"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Auto Moderation</p>
                <p className="text-sm text-gray-600">Automatically flag inappropriate content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoModeration}
                  onChange={(e) => setSettings({ ...settings, autoModeration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-success/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Profanity Filter</p>
                <p className="text-sm text-gray-600">Filter inappropriate language</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.profanityFilter}
                  onChange={(e) => setSettings({ ...settings, profanityFilter: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-success/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Database size={24} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-dark">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Data Retention Period (days)
              </label>
              <input
                type="number"
                value={settings.dataRetention}
                onChange={(e) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) })}
                className="input-field"
                min="30"
                max="730"
              />
              <p className="text-xs text-gray-600 mt-1">How long to keep deleted user data</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-light-cream rounded-xl">
              <div>
                <p className="font-semibold text-dark">Auto Backup</p>
                <p className="text-sm text-gray-600">Automatically backup database</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                className="input-field"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
