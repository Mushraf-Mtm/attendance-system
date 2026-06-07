import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import { FiMapPin, FiClock, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { getSettings, updateSettings } from '../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    latitude: '',
    longitude: '',
    allowedRadius: '',
    lateAfterTime: '',
    officeStartTime: '09:00',
    officeEndTime: '18:00',
    halfDayThreshold: 4,
    checkInEnabled: true,
    checkOutEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const response = await getSettings();

      if (response.data.success) {
        const s = response.data.settings;
        setSettings({
          latitude: s.companyLocation.latitude,
          longitude: s.companyLocation.longitude,
          allowedRadius: s.companyLocation.allowedRadius,
          lateAfterTime: s.workingHours.lateAfterTime,
          officeStartTime: s.workingHours.officeStartTime || '09:00',
          officeEndTime: s.workingHours.officeEndTime || '18:00',
          halfDayThreshold: s.workingHours.halfDayThreshold || 4,
          checkInEnabled: s.workingHours.checkInEnabled !== undefined ? s.workingHours.checkInEnabled : true,
          checkOutEnabled: s.workingHours.checkOutEnabled !== undefined ? s.workingHours.checkOutEnabled : true
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load settings',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings({
      ...settings,
      [e.target.name]: value
    });
  };

  const handleToggle = (field) => {
    setSettings({
      ...settings,
      [field]: !settings[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await updateSettings(settings);

      if (response.data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Settings updated successfully!\n\nIMPORTANT: Please restart the backend server for changes to take effect.\n\n1. Go to backend terminal\n2. Press Ctrl+C\n3. Run: node server.js',
          type: 'success'
        });
      }
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update settings',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Geolocation is not supported by your browser',
        type: 'error'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings({
          ...settings,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        });
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Current location captured successfully!',
          type: 'success'
        });
      },
      (error) => {
        setAlertDialog({
          isOpen: true,
          title: 'Error',
          message: 'Unable to get your location. Please enable location permission.',
          type: 'error'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (loading) {
    return (
      <div className="flex">
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
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure office location and attendance rules</p>
          </div>

          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
            <form onSubmit={handleSubmit}>
              {/* Location Settings */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <FiMapPin className="text-2xl text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Office Location</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={settings.latitude}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="13.0827"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={settings.longitude}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="80.2707"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed Radius (meters)
                    </label>
                    <input
                      type="number"
                      name="allowedRadius"
                      value={settings.allowedRadius}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Employees must be within this distance to check in
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiMapPin />
                    <span>Use My Current Location</span>
                  </button>
                </div>
              </div>

              {/* Time Settings */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <FiClock className="text-2xl text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-800">Office Timing & Rules</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Office Start Time
                    </label>
                    <input
                      type="time"
                      name="officeStartTime"
                      value={settings.officeStartTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Employees cannot check in before this time
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Late After Time
                    </label>
                    <input
                      type="time"
                      name="lateAfterTime"
                      value={settings.lateAfterTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Employees checking in after this time will be marked as "Late"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Office End Time
                    </label>
                    <input
                      type="time"
                      name="officeEndTime"
                      value={settings.officeEndTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Employees cannot check out before this time (unless given early checkout permission)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Half Day Threshold (hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      name="halfDayThreshold"
                      value={settings.halfDayThreshold}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If working hours are less than this, it will be marked as "Half Day"
                    </p>
                  </div>
                </div>
              </div>

              {/* Check-In/Check-Out Controls */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Controls</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800">Enable Check-In</h3>
                      <p className="text-sm text-gray-600">Allow employees to check in</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('checkInEnabled')}
                      className={`text-3xl transition-colors ${
                        settings.checkInEnabled ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {settings.checkInEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-800">Enable Check-Out</h3>
                      <p className="text-sm text-gray-600">Allow employees to check out</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('checkOutEnabled')}
                      className={`text-3xl transition-colors ${
                        settings.checkOutEnabled ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {settings.checkOutEnabled ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-400"
                >
                  <FiSave />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">⚠️ Important Notes:</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>After saving, you MUST restart the backend server</li>
                <li>Changes will apply to both frontend and backend</li>
                <li>Check-in/Check-out toggles control whether employees can use these buttons</li>
                <li>Office timing validation applies when check-in/check-out are enabled</li>
                <li>Give early checkout permission to specific employees from Employee Management</li>
              </ul>
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

export default AdminSettings;
