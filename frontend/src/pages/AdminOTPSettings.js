import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import { getOTPSettings, updateOTPSettings } from '../services/api';
import { FiSave, FiRefreshCw, FiClock, FiShield, FiAlertCircle } from 'react-icons/fi';

const AdminOTPSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    otp_expiry_minutes: 5,
    otp_resend_seconds: 60,
    otp_max_attempts: 3,
    otp_requests_per_hour: 5
  });
  const [originalSettings, setOriginalSettings] = useState(null);
  const [errors, setErrors] = useState({});
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getOTPSettings();
      
      if (response.data.success) {
        const fetchedSettings = response.data.settings;
        setSettings(fetchedSettings);
        setOriginalSettings(fetchedSettings);
      }
    } catch (error) {
      console.error('Error fetching OTP settings:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to load OTP settings',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    setSettings({
      ...settings,
      [name]: numValue
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateSettings = () => {
    const newErrors = {};

    // Validate OTP Expiry Minutes (1-60)
    if (settings.otp_expiry_minutes < 1 || settings.otp_expiry_minutes > 60) {
      newErrors.otp_expiry_minutes = 'Must be between 1 and 60 minutes';
    }

    // Validate OTP Resend Seconds (30-300)
    if (settings.otp_resend_seconds < 30 || settings.otp_resend_seconds > 300) {
      newErrors.otp_resend_seconds = 'Must be between 30 and 300 seconds';
    }

    // Validate OTP Max Attempts (1-10)
    if (settings.otp_max_attempts < 1 || settings.otp_max_attempts > 10) {
      newErrors.otp_max_attempts = 'Must be between 1 and 10 attempts';
    }

    // Validate OTP Requests Per Hour (1-20)
    if (settings.otp_requests_per_hour < 1 || settings.otp_requests_per_hour > 20) {
      newErrors.otp_requests_per_hour = 'Must be between 1 and 20 requests';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate before saving
    if (!validateSettings()) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fix the errors before saving',
        type: 'error'
      });
      return;
    }

    setSaving(true);

    try {
      const response = await updateOTPSettings(settings);
      
      if (response.data.success) {
        setOriginalSettings(settings);
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'OTP settings updated successfully! Changes apply immediately.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating OTP settings:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update OTP settings',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setErrors({});
  };

  const hasChanges = () => {
    if (!originalSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-4">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">OTP Settings</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Configure OTP security parameters for password management</p>
          </div>

          {/* Main Card */}
          <div className="max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-6 sm:py-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 sm:p-4 rounded-full">
                    <FiShield className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Security Configuration</h2>
                    <p className="text-purple-100 text-sm sm:text-base mt-1">
                      Manage OTP behavior for password reset and change operations
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSave} className="px-6 sm:px-8 py-6 sm:py-8">
                {/* Info Box */}
                <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-start">
                    <FiAlertCircle className="text-blue-600 text-xl mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Important</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Changes to these settings apply immediately and affect all future OTP operations. 
                        Users with active OTPs will continue using the old settings until they request a new OTP.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OTP Expiry Minutes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      OTP Expiry Time (Minutes)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiClock className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="otp_expiry_minutes"
                        value={settings.otp_expiry_minutes}
                        onChange={handleChange}
                        min="1"
                        max="60"
                        className={`w-full pl-10 pr-4 py-3 border-2 ${errors.otp_expiry_minutes ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none`}
                        required
                      />
                    </div>
                    {errors.otp_expiry_minutes && (
                      <p className="mt-1 text-sm text-red-600">{errors.otp_expiry_minutes}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      How long an OTP remains valid (1-60 minutes)
                    </p>
                  </div>

                  {/* OTP Resend Cooldown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resend Cooldown (Seconds)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiRefreshCw className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="otp_resend_seconds"
                        value={settings.otp_resend_seconds}
                        onChange={handleChange}
                        min="30"
                        max="300"
                        className={`w-full pl-10 pr-4 py-3 border-2 ${errors.otp_resend_seconds ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none`}
                        required
                      />
                    </div>
                    {errors.otp_resend_seconds && (
                      <p className="mt-1 text-sm text-red-600">{errors.otp_resend_seconds}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Minimum wait time before OTP can be resent (30-300 seconds)
                    </p>
                  </div>

                  {/* OTP Max Attempts */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maximum Verification Attempts
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiShield className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="otp_max_attempts"
                        value={settings.otp_max_attempts}
                        onChange={handleChange}
                        min="1"
                        max="10"
                        className={`w-full pl-10 pr-4 py-3 border-2 ${errors.otp_max_attempts ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none`}
                        required
                      />
                    </div>
                    {errors.otp_max_attempts && (
                      <p className="mt-1 text-sm text-red-600">{errors.otp_max_attempts}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum failed verification attempts before OTP is invalidated (1-10)
                    </p>
                  </div>

                  {/* OTP Requests Per Hour */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Requests Per Hour (Rate Limit)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiAlertCircle className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="otp_requests_per_hour"
                        value={settings.otp_requests_per_hour}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        className={`w-full pl-10 pr-4 py-3 border-2 ${errors.otp_requests_per_hour ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none`}
                        required
                      />
                    </div>
                    {errors.otp_requests_per_hour && (
                      <p className="mt-1 text-sm text-red-600">{errors.otp_requests_per_hour}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum OTP requests allowed per employee per hour (1-20)
                    </p>
                  </div>
                </div>

                {/* Security Guidelines */}
                <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Security Guidelines</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-0.5">✓</span>
                      <span><strong>Shorter expiry times</strong> are more secure but may inconvenience users</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-0.5">✓</span>
                      <span><strong>Higher resend cooldowns</strong> prevent OTP spam and brute-force attacks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-0.5">✓</span>
                      <span><strong>Lower max attempts</strong> improve security but may frustrate legitimate users</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-0.5">✓</span>
                      <span><strong>Stricter rate limits</strong> protect against abuse but may impact user experience</span>
                    </li>
                  </ul>
                </div>

                {/* Recommended Settings */}
                <div className="mt-6 bg-purple-50 border border-purple-200 p-6 rounded-xl">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                    <FiShield className="mr-2" />
                    Recommended Settings
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Expiry:</p>
                      <p className="font-semibold text-purple-900">5 minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Resend:</p>
                      <p className="font-semibold text-purple-900">60 seconds</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Attempts:</p>
                      <p className="font-semibold text-purple-900">3 attempts</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rate Limit:</p>
                      <p className="font-semibold text-purple-900">5 per hour</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!hasChanges() || saving}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FiRefreshCw />
                    <span>Reset Changes</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!hasChanges() || saving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave />
                        <span>Save Settings</span>
                      </>
                    )}
                  </button>
                </div>

                {hasChanges() && (
                  <p className="mt-4 text-sm text-orange-600 text-center">
                    ⚠️ You have unsaved changes
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};

export default AdminOTPSettings;
