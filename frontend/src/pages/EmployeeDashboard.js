import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import LocationDialog from '../components/LocationDialog';
import AlertDialog from '../components/AlertDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { getTodayAttendance, checkIn, checkOut, getWFHStatus, getSettings } from '../services/api';
import { getCurrentLocation, getDeviceInfo, getDeviceFingerprintData, getIPAddress } from '../utils/location';
import { formatTime, formatWorkingHours } from '../utils/formatTime';
import { FiLogIn, FiLogOut, FiClock, FiMapPin, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const EmployeeDashboard = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [actionLoading, setActionLoading]   = useState(false);
  const [wfhEnabled, setWfhEnabled]         = useState(false);
  const [checkInEnabled, setCheckInEnabled] = useState(true);
  const [checkOutEnabled, setCheckOutEnabled] = useState(true);
  const [settings, setSettings]             = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [confirmDialog, setConfirmDialog]   = useState({ isOpen:false, title:'', message:'', onConfirm:null, type:'info' });
  const [locationDialog, setLocationDialog] = useState({ isOpen:false, title:'', message:'', type:'permission', onAllow:null });
  const [alertDialog, setAlertDialog]       = useState({ isOpen:false, title:'', message:'', type:'success' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, wfhRes, settingsRes] = await Promise.all([getTodayAttendance(), getWFHStatus(), getSettings()]);
      if (attendanceRes.data.success) setTodayAttendance(attendanceRes.data.attendance);
      if (wfhRes.data.success) setWfhEnabled(wfhRes.data.wfh_enabled);
      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);
        setCheckInEnabled(settingsRes.data.settings.workingHours.checkInEnabled !== undefined ? settingsRes.data.settings.workingHours.checkInEnabled : true);
        setCheckOutEnabled(settingsRes.data.settings.workingHours.checkOutEnabled !== undefined ? settingsRes.data.settings.workingHours.checkOutEnabled : true);
      } else { setAlertDialog({ isOpen:true, title:'Error', message:'Failed to load settings. Please refresh.', type:'error' }); }
    } catch (e) {
      console.error(e);
      setAlertDialog({ isOpen:true, title:'Error', message:'Failed to load data. Please refresh.', type:'error' });
    } finally { setLoading(false); }
  };

  const handleCheckIn = () => {
    if (!settings) { setAlertDialog({ isOpen:true, title:'Error', message:'Settings not loaded. Please refresh.', type:'error' }); return; }
    setConfirmDialog({
      isOpen:true, title:'Check In', type:'info',
      message: wfhEnabled ? 'Are you sure you want to check in? Your current location will be recorded.' : `Are you sure you want to check in? You must be within ${settings.companyLocation.allowedRadius} meters of the office.`,
      onConfirm: async () => {
        setActionLoading(true); setLoadingMessage('Requesting location permission...');
        try {
          setLocationDialog({ isOpen:true, title:settings.messages.locationPermissionTitle, message:settings.messages.locationPermissionMessage, type:'permission',
            onAllow: async () => {
              try {
                setLoadingMessage('Getting your location...');
                const location = await getCurrentLocation();
                setLoadingMessage('Collecting device information...');
                const deviceInfo = getDeviceInfo(); const fingerprintData = getDeviceFingerprintData(); const ipAddress = await getIPAddress();
                setLoadingMessage('Marking attendance...');
                const data = { latitude:location.latitude, longitude:location.longitude, accuracy:location.accuracy, address:'Location captured', device_info:deviceInfo.device_info, browser_info:deviceInfo.browser_info, screenResolution:fingerprintData.screenResolution, timezone:fingerprintData.timezone, ip_address:ipAddress };
                const response = await checkIn(data);
                if (response.data.success) { setLoadingMessage(''); setAlertDialog({ isOpen:true, title:'✅ Check-in Successful', message:'Your attendance has been recorded successfully!', type:'success' }); await fetchData(); }
                else { setLoadingMessage(''); setAlertDialog({ isOpen:true, title:'❌ Check-in Failed', message:response.data.message || 'Check-in failed. Please try again.', type:'error' }); }
              } catch (error) {
                setLoadingMessage('');
                if (error.type === 'denied') { setLocationDialog({ isOpen:true, title:'❌ Location Permission Denied', message:settings.messages.locationDeniedMessage || 'Please enable location permissions.', type:'error', onAllow:null }); }
                else if (error.type === 'unavailable') { setLocationDialog({ isOpen:true, title:'❌ Location Unavailable', message:settings.messages.locationUnavailableMessage || 'Unable to retrieve your location.', type:'error', onAllow:null }); }
                else if (error.type === 'timeout') { setLocationDialog({ isOpen:true, title:'⏱️ Location Timeout', message:settings.messages.locationTimeoutMessage || 'Location request timed out.', type:'warning', onAllow:null }); }
                else if (error.response?.data?.message) {
                  let msg = error.response.data.message;
                  if (error.response.data.distance) msg += `\n\n📍 Distance: ${error.response.data.distance} meters from office`;
                  if (error.response.data.accuracyInfo) { const { accuracy, threshold } = error.response.data.accuracyInfo; msg += `\n\n📡 GPS Accuracy: ${accuracy}m (Required: ${threshold}m or better)`; }
                  if (error.response.data.validationMode) msg += `\n\n🔒 Validation Mode: ${error.response.data.validationMode.replace(/_/g,' ').toUpperCase()}`;
                  setAlertDialog({ isOpen:true, title:'❌ Check-in Failed', message:msg, type:'error' });
                } else { setAlertDialog({ isOpen:true, title:'❌ Check-in Failed', message:error.message || 'Unable to complete check-in.', type:'error' }); }
              } finally { setActionLoading(false); setLoadingMessage(''); }
            },
          });
        } catch (e) { setActionLoading(false); setLoadingMessage(''); }
      },
    });
  };

  const handleCheckOut = () => {
    if (!settings) { setAlertDialog({ isOpen:true, title:'Error', message:'Settings not loaded. Please refresh.', type:'error' }); return; }
    setConfirmDialog({
      isOpen:true, title:'Check Out', type:'warning',
      message:'Are you sure you want to check out? Your working hours will be calculated and recorded.',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          setLocationDialog({ isOpen:true, title:settings.messages.locationPermissionTitle, message:settings.messages.locationPermissionMessage, type:'permission',
            onAllow: async () => {
              try {
                const location = await getCurrentLocation();
                const response = await checkOut({ latitude:location.latitude, longitude:location.longitude, address:'Location captured' });
                if (response.data.success) {
                  setAlertDialog({ isOpen:true, title:'Check-out Successful', message:'Your check-out has been recorded successfully!\n\nWorking hours: ' + formatWorkingHours(parseFloat(response.data.attendance.total_working_hours)), type:'success' });
                  fetchData();
                }
              } catch (error) {
                if (error.type === 'denied') { setLocationDialog({ isOpen:true, title:settings.messages.locationDeniedTitle, message:settings.messages.locationDeniedMessage, type:'error', onAllow:null }); }
                else if (error.response?.data?.message) { setAlertDialog({ isOpen:true, title:'Check-out Failed', message:error.response.data.message, type:'error' }); }
                else { setAlertDialog({ isOpen:true, title:'Check-out Failed', message:error.message || 'Unable to complete check-out.', type:'error' }); }
              } finally { setActionLoading(false); }
            },
          });
        } catch (e) { setActionLoading(false); }
      },
    });
  };

  if (loading) return <div className="flex h-screen bg-[#F8FAFC]"><Sidebar /><div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div></div>;

  const hasCheckedIn  = !!todayAttendance?.login_time;
  const hasCheckedOut = !!todayAttendance?.logout_time;
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8">

          {/* Header */}
          <div className="mb-7 pt-14 lg:pt-0">
            <h1 className="text-xl font-bold text-[#0F172A]">{greeting}! 👋</h1>
            <p className="text-sm text-[#475569] mt-0.5">{now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>

          {/* WFH Banner */}
          {wfhEnabled && (
            <div className="flex items-center gap-3 bg-[#2563EB]/8 border border-[#2563EB]/20 text-[#2563EB] px-4 py-3 rounded-2xl mb-5 text-sm">
              <FiMapPin size={16} className="flex-shrink-0" />
              <span className="font-semibold">Work From Home is enabled for your account</span>
            </div>
          )}

          {/* Check In / Out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Check In Card */}
            <button onClick={handleCheckIn} disabled={actionLoading || hasCheckedIn || !checkInEnabled}
              className={`group relative rounded-2xl p-6 flex flex-col items-center gap-4 border-2 transition-all duration-200 clay-card-hover ${
                hasCheckedIn || !checkInEnabled
                  ? 'bg-[#F1F5F9] border-[#E2E8F0] cursor-not-allowed'
                  : 'bg-white border-emerald-200 hover:border-emerald-400 shadow-clay cursor-pointer'
              }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${hasCheckedIn || !checkInEnabled ? 'bg-[#E2E8F0]' : 'bg-emerald-50 group-hover:bg-emerald-100'}`}>
                {actionLoading && loadingMessage ? <Spinner size="lg" /> : <FiLogIn size={28} className={hasCheckedIn || !checkInEnabled ? 'text-[#94A3B8]' : 'text-emerald-600'} />}
              </div>
              <div className="text-center">
                <p className={`text-base font-bold ${hasCheckedIn || !checkInEnabled ? 'text-[#94A3B8]' : 'text-[#0F172A]'}`}>
                  {!checkInEnabled ? 'Check-In Disabled' : hasCheckedIn ? 'Checked In' : 'Check In'}
                </p>
                <p className={`text-xs mt-0.5 ${hasCheckedIn || !checkInEnabled ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                  {actionLoading && loadingMessage ? loadingMessage : !checkInEnabled ? 'Contact admin to enable' : hasCheckedIn ? `at ${formatTime(todayAttendance?.login_time)}` : 'Tap to mark attendance'}
                </p>
              </div>
              {hasCheckedIn && <FiCheckCircle size={18} className="absolute top-4 right-4 text-emerald-500" />}
            </button>

            {/* Check Out Card */}
            <button onClick={handleCheckOut} disabled={actionLoading || !hasCheckedIn || hasCheckedOut || !checkOutEnabled}
              className={`group relative rounded-2xl p-6 flex flex-col items-center gap-4 border-2 transition-all duration-200 clay-card-hover ${
                !hasCheckedIn || hasCheckedOut || !checkOutEnabled
                  ? 'bg-[#F1F5F9] border-[#E2E8F0] cursor-not-allowed'
                  : 'bg-white border-red-200 hover:border-red-400 shadow-clay cursor-pointer'
              }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'bg-[#E2E8F0]' : 'bg-red-50 group-hover:bg-red-100'}`}>
                <FiLogOut size={28} className={!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'text-[#94A3B8]' : 'text-red-500'} />
              </div>
              <div className="text-center">
                <p className={`text-base font-bold ${!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'text-[#94A3B8]' : 'text-[#0F172A]'}`}>
                  {!checkOutEnabled ? 'Check-Out Disabled' : hasCheckedOut ? 'Checked Out' : 'Check Out'}
                </p>
                <p className={`text-xs mt-0.5 ${!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>
                  {!checkOutEnabled ? 'Contact admin to enable' : hasCheckedOut ? `at ${formatTime(todayAttendance?.logout_time)}` : 'Tap to end your shift'}
                </p>
              </div>
              {hasCheckedOut && <FiCheckCircle size={18} className="absolute top-4 right-4 text-emerald-500" />}
            </button>
          </div>

          {/* Today summary */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-clay mb-5">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
              <FiClock size={16} className="text-[#94A3B8]" />
              <h2 className="font-bold text-[#0F172A] text-sm">Today's Summary</h2>
            </div>
            {todayAttendance ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#E2E8F0]">
                {[
                  { label:'Login Time',     value: formatTime(todayAttendance.login_time) || '—', sub: null },
                  { label:'Logout Time',    value: formatTime(todayAttendance.logout_time) || '—', sub: todayAttendance.is_auto_checkout && todayAttendance.logout_time ? 'Auto checkout' : null },
                  { label:'Working Hours',  value: formatWorkingHours(parseFloat(todayAttendance.total_working_hours)), sub: null },
                  { label:'Status',         value: null, badge: true },
                ].map(({ label, value, sub, badge }) => (
                  <div key={label} className="px-5 py-4">
                    <p className="text-xs text-[#94A3B8] font-medium mb-1">{label}</p>
                    {badge
                      ? <div className="mt-1"><StatusBadge status={todayAttendance.attendance_status} size="md" /></div>
                      : <><p className="text-lg font-bold text-[#0F172A]">{value}</p>{sub && <p className="text-xs text-amber-600 mt-0.5">{sub}</p>}</>
                    }
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-[#94A3B8]">
                <FiAlertCircle size={28} className="mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#475569]">No attendance record for today</p>
                <p className="text-xs mt-1">Check in to start tracking your attendance</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <FiInfo size={15} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">Important Instructions</h3>
            </div>
            <ul className="text-xs text-amber-800 space-y-1 ml-5 list-disc">
              <li>Make sure location services are enabled on your device</li>
              <li>Check in when you arrive at the office or start working from home</li>
              <li>Check out when you finish your work for the day</li>
              <li>You can only check in and check out once per day</li>
              {!wfhEnabled && settings && <li>You must be within {settings.companyLocation.allowedRadius} meters of the office to check in</li>}
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(d => ({ ...d, isOpen:false }))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} confirmText={confirmDialog.type === 'warning' ? 'Check Out' : 'Check In'} />
      <LocationDialog isOpen={locationDialog.isOpen} onClose={() => setLocationDialog(d => ({ ...d, isOpen:false }))} onAllow={locationDialog.onAllow} title={locationDialog.title} message={locationDialog.message} type={locationDialog.type} />
      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog(d => ({ ...d, isOpen:false }))} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
};

export default EmployeeDashboard;
