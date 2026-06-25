import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import { Spinner } from '../components/Loader';
import { FiMapPin, FiClock, FiSave, FiToggleLeft, FiToggleRight, FiWifi, FiShield, FiInfo } from 'react-icons/fi';
import { getSettings, updateSettings } from '../services/api';

const SectionCard = ({ icon: Icon, iconColor, title, children }) => (
  <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}><Icon size={16} /></div>
      <h2 className="text-sm font-bold text-white">{title}</h2>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">{label}</label>
    {children}
    {hint && <p className="text-xs text-[#475569] mt-1.5">{hint}</p>}
  </div>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState({ latitude:'', longitude:'', allowedRadius:'', gpsAccuracyThreshold:100, lateAfterTime:'', officeStartTime:'09:00', officeEndTime:'18:00', autoCheckoutTime:'18:32', halfDayThreshold:4, checkInEnabled:true, checkOutEnabled:true, officePublicIP:'', allowedIPs:'', attendanceValidationMode:'location_or_network', attendanceRateLimit:5 });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen:false, title:'', message:'', type:'success' });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { setLoading(true); const response = await getSettings(); if (response.data.success) { const s = response.data.settings; setSettings({ latitude:s.companyLocation.latitude, longitude:s.companyLocation.longitude, allowedRadius:s.companyLocation.allowedRadius, gpsAccuracyThreshold:s.companyLocation.gpsAccuracyThreshold||100, lateAfterTime:s.workingHours.lateAfterTime, officeStartTime:s.workingHours.officeStartTime||'09:00', officeEndTime:s.workingHours.officeEndTime||'18:00', autoCheckoutTime:s.workingHours.autoCheckoutTime||'18:32', halfDayThreshold:s.workingHours.halfDayThreshold||4, checkInEnabled:s.workingHours.checkInEnabled!==undefined?s.workingHours.checkInEnabled:true, checkOutEnabled:s.workingHours.checkOutEnabled!==undefined?s.workingHours.checkOutEnabled:true, officePublicIP:s.network?.officePublicIP||'', allowedIPs:s.network?.allowedIPs||'', attendanceValidationMode:s.validation?.attendanceValidationMode||'location_or_network', attendanceRateLimit:s.security?.attendanceRateLimit||5 }); } }
    catch (error) { console.error(error); setAlertDialog({ isOpen:true, title:'Error', message:'Failed to load settings', type:'error' }); }
    finally { setLoading(false); }
  };

  const handleChange  = e => { const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setSettings({ ...settings, [e.target.name]: value }); };
  const handleToggle  = field => setSettings({ ...settings, [field]: !settings[field] });
  const handleSubmit  = async e => {
    e.preventDefault(); setSaving(true);
    try { const response = await updateSettings(settings); if (response.data.success) setAlertDialog({ isOpen:true, title:'Success', message:'Settings updated successfully! Changes apply immediately.', type:'success' }); }
    catch (error) { setAlertDialog({ isOpen:true, title:'Error', message: error.response?.data?.message || 'Failed to update settings', type:'error' }); }
    finally { setSaving(false); }
  };
  const getCurrentLocation = () => {
    if (!navigator.geolocation) { setAlertDialog({ isOpen:true, title:'Error', message:'Geolocation is not supported by your browser', type:'error' }); return; }
    navigator.geolocation.getCurrentPosition(position => { setSettings({ ...settings, latitude:position.coords.latitude.toFixed(6), longitude:position.coords.longitude.toFixed(6) }); setAlertDialog({ isOpen:true, title:'Success', message:'Current location captured successfully!', type:'success' }); }, () => { setAlertDialog({ isOpen:true, title:'Error', message:'Unable to get your location.', type:'error' }); }, { enableHighAccuracy:true, timeout:10000, maximumAge:0 });
  };

  if (loading) return <div className="flex h-screen bg-[#0E1320]"><Sidebar /><div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div></div>;

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto dark-scroll">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-2xl">
          <div className="mb-6"><h1 className="text-xl font-bold text-white">System Settings</h1><p className="text-sm text-[#94A3B8] mt-0.5">Configure office location and attendance rules</p></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <SectionCard icon={FiMapPin} iconColor="bg-[#3B82F6]/20 text-[#60A5FA]" title="Office Location">
              <Field label="Latitude" hint="Range: -90 to 90"><input type="number" step="0.000001" name="latitude" value={settings.latitude} onChange={handleChange} className="admin-input" placeholder="13.0827" required /></Field>
              <Field label="Longitude" hint="Range: -180 to 180"><input type="number" step="0.000001" name="longitude" value={settings.longitude} onChange={handleChange} className="admin-input" placeholder="80.2707" required /></Field>
              <Field label="Allowed Radius (meters)" hint="Employees must be within this distance to check in"><input type="number" name="allowedRadius" value={settings.allowedRadius} onChange={handleChange} className="admin-input" placeholder="100" required /></Field>
              <Field label="GPS Accuracy Threshold">
                <select name="gpsAccuracyThreshold" value={settings.gpsAccuracyThreshold} onChange={handleChange} className="admin-select" required>
                  <option value="50">50m — Very High Accuracy</option>
                  <option value="100">100m — High Accuracy (Recommended)</option>
                  <option value="200">200m — Medium Accuracy</option>
                  <option value="300">300m — Low Accuracy</option>
                  <option value="500">500m — Very Low Accuracy</option>
                </select>
              </Field>
              <button type="button" onClick={getCurrentLocation} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-semibold hover:bg-emerald-500/20 transition-colors">
                <FiMapPin size={15} /> Use My Current Location
              </button>
            </SectionCard>

            <SectionCard icon={FiWifi} iconColor="bg-blue-500/20 text-blue-400" title="Network Validation">
              <Field label="Office Public IP" hint="Primary office public IP address for network validation"><input type="text" name="officePublicIP" value={settings.officePublicIP} onChange={handleChange} className="admin-input" placeholder="122.165.45.100 (optional)" /></Field>
              <Field label="Additional Allowed IPs" hint="Multiple IPs separated by commas"><textarea name="allowedIPs" value={settings.allowedIPs} onChange={handleChange} rows="3" className="admin-input resize-none" placeholder="122.165.45.101, 122.165.45.102 (optional)" /></Field>
            </SectionCard>

            <SectionCard icon={FiShield} iconColor="bg-purple-500/20 text-purple-400" title="Security & Validation">
              <Field label="Attendance Validation Mode" hint='"Location OR Network" is recommended for most offices.'>
                <select name="attendanceValidationMode" value={settings.attendanceValidationMode} onChange={handleChange} className="admin-select" required>
                  <option value="location_only">Location Only — GPS validation required</option>
                  <option value="network_only">Network Only — Office IP validation required</option>
                  <option value="location_or_network">Location OR Network — Either passes (Recommended)</option>
                  <option value="location_and_network">Location AND Network — Both required</option>
                </select>
              </Field>
              <Field label="Attendance Rate Limit (requests per minute)" hint="Prevents spam and abuse."><input type="number" name="attendanceRateLimit" value={settings.attendanceRateLimit} onChange={handleChange} min="1" max="20" className="admin-input" required /></Field>
            </SectionCard>

            <SectionCard icon={FiClock} iconColor="bg-amber-500/20 text-amber-400" title="Office Timing & Rules">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Office Start Time" hint="Check-in window opens"><input type="time" name="officeStartTime" value={settings.officeStartTime} onChange={handleChange} className="admin-input" required /></Field>
                <Field label="Late After Time" hint='After this = "Late"'><input type="time" name="lateAfterTime" value={settings.lateAfterTime} onChange={handleChange} className="admin-input" required /></Field>
                <Field label="Office End Time" hint="Earliest checkout time"><input type="time" name="officeEndTime" value={settings.officeEndTime} onChange={handleChange} className="admin-input" required /></Field>
                <Field label="Auto Checkout Time" hint="System auto-checkout time"><input type="time" name="autoCheckoutTime" value={settings.autoCheckoutTime} onChange={handleChange} className="admin-input" required /></Field>
              </div>
              <Field label="Half Day Threshold (hours)" hint='Less than this = "Half Day"'><input type="number" step="0.5" name="halfDayThreshold" value={settings.halfDayThreshold} onChange={handleChange} className="admin-input" placeholder="4" required /></Field>
            </SectionCard>

            {/* Attendance Controls */}
            <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
              <div className="px-6 py-4 border-b border-white/[0.06]"><h2 className="text-sm font-bold text-white">Attendance Controls</h2></div>
              <div className="divide-y divide-white/[0.04]">
                {[{ field:'checkInEnabled', label:'Enable Check-In', desc:'Allow employees to check in' }, { field:'checkOutEnabled', label:'Enable Check-Out', desc:'Allow employees to check out' }].map(({ field, label, desc }) => (
                  <div key={field} className="flex items-center justify-between px-6 py-4">
                    <div><p className="text-sm font-semibold text-white">{label}</p><p className="text-xs text-[#64748B] mt-0.5">{desc}</p></div>
                    <button type="button" onClick={() => handleToggle(field)} className={`text-3xl transition-colors ${settings[field] ? 'text-emerald-400' : 'text-[#334155]'}`}>
                      {settings[field] ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="flex gap-3 p-4 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-2xl">
              <FiInfo size={15} className="text-[#60A5FA] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#94A3B8] space-y-1">
                <p className="font-bold text-[#CBD5E1] mb-1">Important Notes</p>
                <p>• Changes apply immediately — no server restart needed</p>
                <p>• Settings are stored in database and sync across all instances</p>
                <p>• Check-in/Check-out toggles control whether employees can use these buttons</p>
                <p>• Give early checkout permission to specific employees from Employee Management</p>
                <p>• Use "Location OR Network" mode for offices with both Wi-Fi and Ethernet users</p>
              </div>
            </div>

            <div className="flex justify-end pb-6">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow-blue-sm hover:-translate-y-0.5">
                {saving ? <><Spinner size="sm" color="white" /> Saving…</> : <><FiSave size={15} /> Save Settings</>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog({ ...alertDialog, isOpen:false })} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
};
export default AdminSettings;
