import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import { Spinner } from '../components/Loader';
import { FiMapPin, FiClock, FiSave, FiToggleLeft, FiToggleRight, FiWifi, FiShield, FiInfo } from 'react-icons/fi';
import { getSettings, updateSettings } from '../services/api';

const SectionCard = ({ icon: Icon, iconColor, title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon size={16} />
      </div>
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900 placeholder:text-slate-400";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    latitude: '',
    longitude: '',
    allowedRadius: '',
    gpsAccuracyThreshold: 100,
    lateAfterTime: '',
    officeStartTime: '09:00',
    officeEndTime: '18:00',
    autoCheckoutTime: '18:32',
    halfDayThreshold: 4,
    checkInEnabled: true,
    checkOutEnabled: true,
    officePublicIP: '',
    allowedIPs: '',
    attendanceValidationMode: 'location_or_network',
    attendanceRateLimit: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  useEffect(() => { fetchSettings(); }, []);

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
          gpsAccuracyThreshold: s.companyLocation.gpsAccuracyThreshold || 100,
          lateAfterTime: s.workingHours.lateAfterTime,
          officeStartTime: s.workingHours.officeStartTime || '09:00',
          officeEndTime: s.workingHours.officeEndTime || '18:00',
          autoCheckoutTime: s.workingHours.autoCheckoutTime || '18:32',
          halfDayThreshold: s.workingHours.halfDayThreshold || 4,
          checkInEnabled: s.workingHours.checkInEnabled !== undefined ? s.workingHours.checkInEnabled : true,
          checkOutEnabled: s.workingHours.checkOutEnabled !== undefined ? s.workingHours.checkOutEnabled : true,
          officePublicIP: s.network?.officePublicIP || '',
          allowedIPs: s.network?.allowedIPs || '',
          attendanceValidationMode: s.validation?.attendanceValidationMode || 'location_or_network',
          attendanceRateLimit: s.security?.attendanceRateLimit || 5
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings({ ...settings, [e.target.name]: value });
  };

  const handleToggle = (field) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await updateSettings(settings);
      if (response.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Settings updated successfully! Changes apply immediately.', type: 'success' });
      }
    } catch (error) {
      setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to update settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Geolocation is not supported by your browser', type: 'error' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings({ ...settings, latitude: position.coords.latitude.toFixed(6), longitude: position.coords.longitude.toFixed(6) });
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Current location captured successfully!', type: 'success' });
      },
      () => {
        setAlertDialog({ isOpen: true, title: 'Error', message: 'Unable to get your location. Please enable location permission.', type: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">System Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Configure office location and attendance rules</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Office Location */}
            <SectionCard icon={FiMapPin} iconColor="bg-indigo-50 text-indigo-600" title="Office Location">
              <Field label="Latitude" hint="Range: -90 to 90">
                <input type="number" step="0.000001" name="latitude" value={settings.latitude} onChange={handleChange} className={inputCls} placeholder="13.0827" required />
              </Field>
              <Field label="Longitude" hint="Range: -180 to 180">
                <input type="number" step="0.000001" name="longitude" value={settings.longitude} onChange={handleChange} className={inputCls} placeholder="80.2707" required />
              </Field>
              <Field label="Allowed Radius (meters)" hint="Employees must be within this distance to check in">
                <input type="number" name="allowedRadius" value={settings.allowedRadius} onChange={handleChange} className={inputCls} placeholder="100" required />
              </Field>
              <Field label="GPS Accuracy Threshold" hint="Lower values = stricter validation. 100m is recommended for most offices.">
                <select name="gpsAccuracyThreshold" value={settings.gpsAccuracyThreshold} onChange={handleChange} className={inputCls} required>
                  <option value="50">50m — Very High Accuracy</option>
                  <option value="100">100m — High Accuracy (Recommended)</option>
                  <option value="200">200m — Medium Accuracy</option>
                  <option value="300">300m — Low Accuracy</option>
                  <option value="500">500m — Very Low Accuracy</option>
                </select>
              </Field>
              <button type="button" onClick={getCurrentLocation} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                <FiMapPin size={15} />
                Use My Current Location
              </button>
            </SectionCard>

            {/* Network Validation */}
            <SectionCard icon={FiWifi} iconColor="bg-blue-50 text-blue-600" title="Network Validation">
              <Field label="Office Public IP" hint="Primary office public IP address for network validation">
                <input type="text" name="officePublicIP" value={settings.officePublicIP} onChange={handleChange} className={inputCls} placeholder="122.165.45.100 (optional)" />
              </Field>
              <Field label="Additional Allowed IPs" hint="Multiple IPs separated by commas. Useful for offices with multiple internet connections.">
                <textarea name="allowedIPs" value={settings.allowedIPs} onChange={handleChange} rows="3" className={`${inputCls} resize-none`} placeholder="122.165.45.101, 122.165.45.102 (optional)" />
              </Field>
            </SectionCard>

            {/* Security & Validation */}
            <SectionCard icon={FiShield} iconColor="bg-purple-50 text-purple-600" title="Security & Validation">
              <Field label="Attendance Validation Mode" hint='Choose validation strategy. "Location OR Network" is recommended for offices with both Wi-Fi and Ethernet users.'>
                <select name="attendanceValidationMode" value={settings.attendanceValidationMode} onChange={handleChange} className={inputCls} required>
                  <option value="location_only">Location Only — GPS validation required</option>
                  <option value="network_only">Network Only — Office IP validation required</option>
                  <option value="location_or_network">Location OR Network — Either passes (Recommended)</option>
                  <option value="location_and_network">Location AND Network — Both required</option>
                </select>
              </Field>
              <Field label="Attendance Rate Limit (requests per minute)" hint="Maximum check-in/check-out attempts per employee per minute. Prevents spam and abuse.">
                <input type="number" name="attendanceRateLimit" value={settings.attendanceRateLimit} onChange={handleChange} min="1" max="20" className={inputCls} placeholder="5" required />
              </Field>
            </SectionCard>

            {/* Office Timing */}
            <SectionCard icon={FiClock} iconColor="bg-amber-50 text-amber-600" title="Office Timing & Rules">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Office Start Time" hint="Employees cannot check in before this time">
                  <input type="time" name="officeStartTime" value={settings.officeStartTime} onChange={handleChange} className={inputCls} required />
                </Field>
                <Field label="Late After Time" hint='Check-ins after this are marked "Late"'>
                  <input type="time" name="lateAfterTime" value={settings.lateAfterTime} onChange={handleChange} className={inputCls} required />
                </Field>
                <Field label="Office End Time" hint="Employees cannot check out before this time">
                  <input type="time" name="officeEndTime" value={settings.officeEndTime} onChange={handleChange} className={inputCls} required />
                </Field>
                <Field label="Auto Checkout Time" hint="System auto-checkouts employees who forget">
                  <input type="time" name="autoCheckoutTime" value={settings.autoCheckoutTime} onChange={handleChange} className={inputCls} required />
                </Field>
              </div>
              <Field label="Half Day Threshold (hours)" hint='If working hours are less than this, marked as "Half Day"'>
                <input type="number" step="0.5" name="halfDayThreshold" value={settings.halfDayThreshold} onChange={handleChange} className={inputCls} placeholder="4" required />
              </Field>
            </SectionCard>

            {/* Attendance Controls */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">Attendance Controls</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { field: 'checkInEnabled', label: 'Enable Check-In', desc: 'Allow employees to check in' },
                  { field: 'checkOutEnabled', label: 'Enable Check-Out', desc: 'Allow employees to check out' },
                ].map(({ field, label, desc }) => (
                  <div key={field} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <button type="button" onClick={() => handleToggle(field)} className={`text-3xl transition-colors ${settings[field] ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {settings[field] ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="flex gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <FiInfo size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-700 space-y-1">
                <p className="font-semibold text-indigo-800 mb-1">Important Notes</p>
                <p>• Changes apply immediately — no server restart needed</p>
                <p>• Settings are stored in database and sync across all instances</p>
                <p>• Check-in/Check-out toggles control whether employees can use these buttons</p>
                <p>• Give early checkout permission to specific employees from Employee Management</p>
                <p>• Use "Location OR Network" mode for offices with both Wi-Fi and Ethernet users</p>
                <p>• Rate limit of 5 requests/minute is recommended to prevent spam</p>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end pb-6">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                {saving ? <Spinner size="sm" color="white" /> : <FiSave size={15} />}
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>

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
