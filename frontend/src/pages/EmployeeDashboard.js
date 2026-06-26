import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import LocationDialog from '../components/LocationDialog';
import AlertDialog from '../components/AlertDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { getTodayAttendance, checkIn, checkOut, getWFHStatus, getSettings, getEmployeeMonthlyAttendance } from '../services/api';
import { getCurrentLocation, getDeviceInfo, getDeviceFingerprintData, getIPAddress } from '../utils/location';
import { formatTime, formatWorkingHours, format24To12Hour, formatDate } from '../utils/formatTime';
import {
  FiLogIn, FiLogOut, FiClock, FiCheckCircle, FiAlertCircle, FiInfo,
  FiCalendar, FiTrendingUp, FiSun, FiMoon, FiSunrise, FiActivity,
  FiBriefcase, FiHome, FiTarget, FiZap, FiBell, FiBarChart2, FiAward
} from 'react-icons/fi';

/* ─── Constants ─── */
const MOTIVATIONAL_MESSAGES = [
  { text: "Great job! Keep up the consistency!", icon: "🎯" },
  { text: "You're building discipline every day!", icon: "💪" },
  { text: "Small improvements lead to big success!", icon: "🌟" },
  { text: "Attendance builds trust and reliability!", icon: "🤝" },
  { text: "You're on track for an excellent month!", icon: "📈" },
  { text: "Consistency is the key to greatness!", icon: "🔑" },
  { text: "Your dedication doesn't go unnoticed!", icon: "⭐" },
  { text: "Another productive day ahead!", icon: "🚀" },
  { text: "Show up, stand out, succeed!", icon: "🏆" },
  { text: "Every day counts towards your goals!", icon: "🎯" },
  { text: "You're doing excellent! Keep it up!", icon: "🎉" },
  { text: "Punctuality is the soul of business!", icon: "⏰" },
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ─── Helpers ─── */
const formatLiveTimer = (totalSeconds) => {
  if (totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const toLocalDateStr = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

/* ════════════════════════════════════════════════════════════════ */

const EmployeeDashboard = () => {
  /* ─── Existing State (unchanged) ─── */
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

  /* ─── New State ─── */
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [monthlyHolidays, setMonthlyHolidays]     = useState([]);
  const [currentTime, setCurrentTime]             = useState(new Date());
  const [liveSeconds, setLiveSeconds]             = useState(0);

  const { user } = useAuth();

  /* ─── Live Clock ─── */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ─── Data Fetch (MODIFIED — added monthly attendance call) ─── */
  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    try {
      const now = new Date();
      const [attendanceRes, wfhRes, settingsRes, monthlyRes] = await Promise.all([
        getTodayAttendance(),
        getWFHStatus(),
        getSettings(),
        getEmployeeMonthlyAttendance(now.getMonth() + 1, now.getFullYear()),
      ]);
      if (attendanceRes.data.success) setTodayAttendance(attendanceRes.data.attendance);
      if (wfhRes.data.success) setWfhEnabled(wfhRes.data.wfh_enabled);
      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);
        setCheckInEnabled(settingsRes.data.settings.workingHours.checkInEnabled !== undefined ? settingsRes.data.settings.workingHours.checkInEnabled : true);
        setCheckOutEnabled(settingsRes.data.settings.workingHours.checkOutEnabled !== undefined ? settingsRes.data.settings.workingHours.checkOutEnabled : true);
      } else { setAlertDialog({ isOpen:true, title:'Error', message:'Failed to load settings. Please refresh.', type:'error' }); }
      if (monthlyRes.data.success) {
        setMonthlyAttendance(monthlyRes.data.attendance || []);
        setMonthlyHolidays(monthlyRes.data.holidays || []);
      }
    } catch (e) {
      console.error(e);
      setAlertDialog({ isOpen:true, title:'Error', message:'Failed to load data. Please refresh.', type:'error' });
    } finally { setLoading(false); }
  };

  /* ════════════════════════════════════════════════════════════════
     ▐  EXISTING HANDLERS — COMPLETELY UNCHANGED
     ════════════════════════════════════════════════════════════════ */

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

  /* ════════════════════════════════════════════════════════════════
     ▐  END EXISTING HANDLERS
     ════════════════════════════════════════════════════════════════ */

  /* ─── Live Working Timer ─── */
  useEffect(() => {
    if (todayAttendance?.login_time && !todayAttendance?.logout_time) {
      const loginTime = new Date(todayAttendance.login_time);
      const update = () => setLiveSeconds(Math.max(0, Math.floor((Date.now() - loginTime.getTime()) / 1000)));
      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    } else if (todayAttendance?.login_time && todayAttendance?.logout_time) {
      const loginTime = new Date(todayAttendance.login_time);
      const logoutTime = new Date(todayAttendance.logout_time);
      setLiveSeconds(Math.max(0, Math.floor((logoutTime.getTime() - loginTime.getTime()) / 1000)));
    } else {
      setLiveSeconds(0);
    }
  }, [todayAttendance]);

  /* ─── Derived Values ─── */
  const hasCheckedIn  = !!todayAttendance?.login_time;
  const hasCheckedOut = !!todayAttendance?.logout_time;
  const nameStr  = user?.name || user?.username || 'Employee';
  const initials = nameStr.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  // Greeting
  const hour = currentTime.getHours();
  const greeting     = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '👋' : hour < 17 ? '☀️' : '🌙';
  const GreetingIcon  = hour < 12 ? FiSunrise : hour < 17 ? FiSun : FiMoon;

  // Current month
  const currentMonthName = MONTH_NAMES[currentTime.getMonth()];

  /* ─── Stats (computed from monthly attendance) ─── */
  const stats = useMemo(() => {
    const presentDays = monthlyAttendance.filter(r => r.login_time).length;
    const lateDays    = monthlyAttendance.filter(r => r.attendance_status === 'Late').length;
    const wfhDays     = monthlyAttendance.filter(r => r.is_wfh && r.login_time).length;

    // Calculate working days up to today (excl. Sundays & holidays)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const maxDay = now.getDate();
    let workingDays = 0;
    for (let d = 1; d <= maxDay; d++) {
      const date = new Date(year, month, d);
      if (date.getDay() === 0) continue; // Skip Sunday
      const dateStr = toLocalDateStr(date);
      const isHoliday = monthlyHolidays.some(h => toLocalDateStr(h.holiday_date) === dateStr);
      if (!isHoliday) workingDays++;
    }
    const percentage = workingDays > 0 ? Math.min(100, Math.round((presentDays / workingDays) * 100)) : 0;

    return { presentDays, lateDays, wfhDays, percentage, workingDays };
  }, [monthlyAttendance, monthlyHolidays]);

  /* ─── Weekly Chart Data ─── */
  const weekData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = toLocalDateStr(d);
      const record = monthlyAttendance.find(r => toLocalDateStr(r.attendance_date) === dateStr);

      return {
        day,
        hours: record?.total_working_hours ? parseFloat(record.total_working_hours) : 0,
        hasLogin: !!record?.login_time,
        status: record?.attendance_status,
        isToday: d.toDateString() === today.toDateString(),
        isFuture: d.setHours(0,0,0,0) > today.setHours(0,0,0,0),
      };
    });
  }, [monthlyAttendance]);

  const maxBarHours = Math.max(8, ...weekData.map(d => d.hours));

  /* ─── Upcoming Holidays ─── */
  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return monthlyHolidays
      .filter(h => {
        const hd = new Date(h.holiday_date);
        hd.setHours(0, 0, 0, 0);
        return hd >= today;
      })
      .sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date));
  }, [monthlyHolidays]);

  /* ─── Recent Attendance (last 7 records with login) ─── */
  const recentAttendance = useMemo(() => {
    return monthlyAttendance.filter(r => r.login_time).slice(0, 7);
  }, [monthlyAttendance]);

  /* ─── Motivational Message ─── */
  const motivationalMsg = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length];
  }, []);

  /* ─── Today's Timeline ─── */
  const timeline = useMemo(() => {
    const steps = [
      {
        title: 'Check In',
        subtitle: hasCheckedIn ? `Checked in at ${formatTime(todayAttendance?.login_time)}` : 'Awaiting check-in',
        icon: FiLogIn,
        completed: hasCheckedIn,
        active: !hasCheckedIn,
      },
      {
        title: 'Working',
        subtitle: hasCheckedIn && !hasCheckedOut ? 'Currently working...' : hasCheckedOut ? 'Shift completed' : 'Pending',
        icon: FiBriefcase,
        completed: hasCheckedOut,
        active: hasCheckedIn && !hasCheckedOut,
      },
      {
        title: 'Expected Checkout',
        subtitle: settings?.workingHours?.officeEndTime ? format24To12Hour(settings.workingHours.officeEndTime) : '—',
        icon: FiClock,
        completed: hasCheckedOut,
        active: false,
      },
      {
        title: 'Check Out',
        subtitle: hasCheckedOut
          ? `Checked out at ${formatTime(todayAttendance?.logout_time)}${todayAttendance?.is_auto_checkout ? ' (Auto)' : ''}`
          : 'Pending',
        icon: FiLogOut,
        completed: hasCheckedOut,
        active: false,
      },
    ];
    return steps;
  }, [hasCheckedIn, hasCheckedOut, todayAttendance, settings]);

  /* ─── Progress Ring geometry ─── */
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - stats.percentage / 100);

  /* ════════════════════════════════════════════════════════════════
     ▐  RENDER
     ════════════════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: '#F5F7FB' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-sm text-[#64748B] mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ background: '#F5F7FB' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-4 py-5 lg:px-8 lg:py-7 max-w-[1400px] mx-auto">

          {/* ═══════════════════════════════════════════════════════
              SECTION 1: TOP HEADER
              ═══════════════════════════════════════════════════════ */}
          <header className="clay-header-card px-5 py-5 lg:px-7 lg:py-6 mb-6 animate-fadeInUp stagger-1 pt-16 lg:pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Greeting */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F6CE1] to-[#7B93F5] flex items-center justify-center text-[#0F172A] shadow-[0_4px_14px_rgba(79,108,225,0.3)] flex-shrink-0">
                  <GreetingIcon size={22} />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-[#1E293B]">
                    {greeting}, {nameStr.split(' ')[0]}! <span className="inline-block">{greetingEmoji}</span>
                  </h1>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    {currentTime.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                  </p>
                </div>
              </div>

              {/* Right side: Clock + Notification + Avatar */}
              <div className="flex items-center gap-3">
                {/* Live Clock */}
                <div className="flex items-center gap-2 bg-white/70 border border-[#E7EBF2]/80 rounded-2xl px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_4px_rgba(149,163,187,0.06)]">
                  <div className="clay-live-dot" />
                  <span className="text-lg font-bold font-mono text-[#1E293B] tracking-wider">
                    {currentTime.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
                  </span>
                </div>

                {/* Notification */}
                <button className="w-10 h-10 rounded-2xl bg-white/70 border border-[#E7EBF2]/80 flex items-center justify-center text-[#64748B] hover:text-[#4F6CE1] hover:bg-[#f0f4ff] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <FiBell size={18} />
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4F6CE1] to-[#7B93F5] flex items-center justify-center text-[#0F172A] text-sm font-bold shadow-[0_3px_10px_rgba(79,108,225,0.25)]">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          {/* ═══════════════════════════════════════════════════════
              WFH BANNER
              ═══════════════════════════════════════════════════════ */}
          {wfhEnabled && (
            <div className="clay-wfh-banner flex items-center gap-3 px-5 py-3.5 mb-6 animate-fadeInUp stagger-2">
              <div className="w-8 h-8 rounded-xl bg-[#4F6CE1]/10 flex items-center justify-center flex-shrink-0">
                <FiHome size={16} className="text-[#4F6CE1]" />
              </div>
              <span className="text-sm font-semibold text-[#4F6CE1]">Work From Home is enabled for your account</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              SECTION 2: STAT CARDS
              ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Present Days */}
            <div className="clay-stat-card p-5 animate-fadeInUp stagger-2">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <FiCheckCircle size={20} className="text-emerald-500" />
                </div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">This Month</span>
              </div>
              <p className="text-3xl font-bold text-[#1E293B] animate-countUp">{stats.presentDays}</p>
              <p className="text-xs text-[#64748B] mt-1 font-medium">Present Days</p>
            </div>

            {/* Late Days */}
            <div className="clay-stat-card p-5 animate-fadeInUp stagger-3">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <FiAlertCircle size={20} className="text-amber-500" />
                </div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">This Month</span>
              </div>
              <p className="text-3xl font-bold text-[#1E293B] animate-countUp">{stats.lateDays}</p>
              <p className="text-xs text-[#64748B] mt-1 font-medium">Late Days</p>
            </div>

            {/* Attendance % */}
            <div className="clay-stat-card p-5 animate-fadeInUp stagger-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <FiTrendingUp size={20} className="text-[#4F6CE1]" />
                </div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">This Month</span>
              </div>
              <p className="text-3xl font-bold text-[#1E293B] animate-countUp">{stats.percentage}<span className="text-lg text-[#64748B] ml-0.5">%</span></p>
              <p className="text-xs text-[#64748B] mt-1 font-medium">Attendance Rate</p>
            </div>

            {/* WFH Days */}
            <div className="clay-stat-card p-5 animate-fadeInUp stagger-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <FiHome size={20} className="text-purple-500" />
                </div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">This Month</span>
              </div>
              <p className="text-3xl font-bold text-[#1E293B] animate-countUp">{stats.wfhDays}</p>
              <p className="text-xs text-[#64748B] mt-1 font-medium">WFH Days</p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 3: CHECK IN / CHECK OUT
              ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 animate-fadeInUp stagger-5">
            {/* Check In */}
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || hasCheckedIn || !checkInEnabled}
              className={`clay-action-card clay-checkin relative p-6 flex flex-col items-center gap-4 ${hasCheckedIn || !checkInEnabled ? 'bg-[#F8FAFC] !border-[#E7EBF2]' : ''}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                hasCheckedIn || !checkInEnabled
                  ? 'bg-[#F1F5F9]'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100'
              }`}>
                {actionLoading && loadingMessage
                  ? <Spinner size="lg" />
                  : <FiLogIn size={28} className={hasCheckedIn || !checkInEnabled ? 'text-[#64748B]' : 'text-emerald-600'} />
                }
              </div>
              <div className="text-center">
                <p className={`text-base font-bold ${hasCheckedIn || !checkInEnabled ? 'text-[#64748B]' : 'text-[#1E293B]'}`}>
                  {!checkInEnabled ? 'Check-In Disabled' : hasCheckedIn ? 'Checked In' : 'Check In'}
                </p>
                <p className={`text-xs mt-1 ${hasCheckedIn || !checkInEnabled ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  {actionLoading && loadingMessage ? loadingMessage : !checkInEnabled ? 'Contact admin to enable' : hasCheckedIn ? `at ${formatTime(todayAttendance?.login_time)}` : 'Tap to mark attendance'}
                </p>
              </div>
              {hasCheckedIn && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FiCheckCircle size={16} className="text-emerald-500" />
                </div>
              )}
            </button>

            {/* Check Out */}
            <button
              onClick={handleCheckOut}
              disabled={actionLoading || !hasCheckedIn || hasCheckedOut || !checkOutEnabled}
              className={`clay-action-card clay-checkout relative p-6 flex flex-col items-center gap-4 ${!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'bg-[#F8FAFC] !border-[#E7EBF2]' : ''}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                !hasCheckedIn || hasCheckedOut || !checkOutEnabled
                  ? 'bg-[#F1F5F9]'
                  : 'bg-gradient-to-br from-red-50 to-red-100'
              }`}>
                <FiLogOut size={28} className={!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'text-[#64748B]' : 'text-red-500'} />
              </div>
              <div className="text-center">
                <p className={`text-base font-bold ${!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'text-[#64748B]' : 'text-[#1E293B]'}`}>
                  {!checkOutEnabled ? 'Check-Out Disabled' : hasCheckedOut ? 'Checked Out' : 'Check Out'}
                </p>
                <p className={`text-xs mt-1 ${!hasCheckedIn || hasCheckedOut || !checkOutEnabled ? 'text-[#64748B]' : 'text-[#64748B]'}`}>
                  {!checkOutEnabled ? 'Contact admin to enable' : hasCheckedOut ? `at ${formatTime(todayAttendance?.logout_time)}` : 'Tap to end your shift'}
                </p>
              </div>
              {hasCheckedOut && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FiCheckCircle size={16} className="text-emerald-500" />
                </div>
              )}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 4: PROGRESS RING + WORKING HOURS + MOTIVATIONAL
              ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

            {/* Attendance Progress Ring */}
            <div className="clay-card-soft p-6 flex flex-col items-center justify-center animate-fadeInUp stagger-6">
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">Attendance Progress</h3>
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F6CE1" />
                      <stop offset="100%" stopColor="#7B93F5" />
                    </linearGradient>
                  </defs>
                  <circle cx="70" cy="70" r={ringRadius} className="clay-progress-track" />
                  <circle
                    cx="70" cy="70" r={ringRadius}
                    className="clay-progress-bar"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 70 70)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#1E293B]">{stats.percentage}%</span>
                  <span className="text-[10px] text-[#64748B] font-medium mt-0.5">{currentMonthName}</span>
                </div>
              </div>
              <p className="text-xs text-[#64748B] mt-4 text-center">
                {stats.percentage >= 90 ? 'Outstanding! Keep it up! 🏆' : stats.percentage >= 75 ? 'Great job! Almost perfect! 🎉' : stats.percentage >= 50 ? 'Good progress! Stay consistent! 💪' : 'Let\'s improve this month! 📈'}
              </p>
            </div>

            {/* Working Hours Card (Live Timer) */}
            <div className="clay-card-soft p-6 animate-fadeInUp stagger-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FiClock size={16} className="text-[#4F6CE1]" />
                </div>
                <h3 className="text-sm font-bold text-[#1E293B]">Working Hours</h3>
              </div>

              {/* Live Timer */}
              <div className="text-center mb-5 py-4 rounded-2xl bg-gradient-to-br from-[#f8faff] to-[#f1f5f9] border border-[#E7EBF2]/60">
                <p className="text-4xl font-bold font-mono text-[#1E293B] tracking-wider">
                  {formatLiveTimer(liveSeconds)}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {hasCheckedIn && !hasCheckedOut && <div className="clay-live-dot" />}
                  <span className="text-xs text-[#64748B] font-medium">
                    {hasCheckedIn && !hasCheckedOut ? 'Currently Working' : hasCheckedOut ? 'Shift Completed' : 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B] flex items-center gap-2">
                    <FiTarget size={13} /> Expected Checkout
                  </span>
                  <span className="font-semibold text-[#1E293B]">
                    {settings?.workingHours?.officeEndTime ? format24To12Hour(settings.workingHours.officeEndTime) : '—'}
                  </span>
                </div>
                <div className="h-px bg-[#E7EBF2]/80" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B] flex items-center gap-2">
                    <FiActivity size={13} /> Shift Time
                  </span>
                  <span className="font-semibold text-[#1E293B]">
                    {settings?.workingHours?.officeStartTime && settings?.workingHours?.officeEndTime
                      ? `${format24To12Hour(settings.workingHours.officeStartTime)} – ${format24To12Hour(settings.workingHours.officeEndTime)}`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Motivational Card */}
            <div className="clay-motivational p-6 flex flex-col items-center justify-center text-center animate-fadeInUp stagger-8">
              <div className="w-14 h-14 rounded-2xl bg-white/80 border border-[#E7EBF2]/60 flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(149,163,187,0.06)]">
                <span className="text-3xl">{motivationalMsg.icon}</span>
              </div>
              <p className="text-base font-bold text-[#1E293B] mb-2">{motivationalMsg.text}</p>
              <p className="text-xs text-[#64748B]">Daily Motivation</p>
              <div className="flex items-center gap-1 mt-4">
                <FiZap size={12} className="text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Keep Going</span>
                <FiZap size={12} className="text-amber-400" />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 5: WEEKLY CHART + TIMELINE
              ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

            {/* Weekly Attendance Chart */}
            <div className="clay-card-soft p-6 animate-fadeInUp stagger-7">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FiBarChart2 size={16} className="text-[#4F6CE1]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E293B]">Weekly Overview</h3>
                </div>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">This Week</span>
              </div>

              <div className="flex items-end justify-between gap-2 h-36 px-1">
                {weekData.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Hours label on hover */}
                    <span className={`text-[10px] font-semibold transition-opacity ${d.hours > 0 ? 'text-[#4F6CE1]' : 'text-[#475569]'} ${d.hours > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {d.hours > 0 ? `${d.hours.toFixed(1)}h` : '–'}
                    </span>
                    {/* Bar */}
                    <div
                      className={`clay-bar w-full origin-bottom ${
                        d.isFuture
                          ? 'bg-[#F1F5F9]'
                          : d.hours > 0
                            ? d.status === 'Late' ? 'bg-gradient-to-t from-amber-400 to-amber-300' : 'bg-gradient-to-t from-[#4F6CE1] to-[#7B93F5]'
                            : 'bg-[#E8ECF4]'
                      }`}
                      style={{
                        height: d.isFuture ? '8px' : d.hours > 0 ? `${Math.max(12, (d.hours / maxBarHours) * 100)}%` : '8px',
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                    {/* Day label */}
                    <span className={`text-[10px] font-semibold ${d.isToday ? 'text-[#4F6CE1]' : 'text-[#64748B]'}`}>
                      {d.day}
                    </span>
                    {d.isToday && <div className="w-1 h-1 rounded-full bg-[#4F6CE1] -mt-1" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Timeline */}
            <div className="clay-card-soft p-6 animate-fadeInUp stagger-8">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FiActivity size={16} className="text-[#4F6CE1]" />
                </div>
                <h3 className="text-sm font-bold text-[#1E293B]">Today's Timeline</h3>
              </div>

              <div className="space-y-0">
                {timeline.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Dot + Line */}
                    <div className="flex flex-col items-center">
                      <div className={`clay-timeline-dot ${step.completed ? 'completed' : step.active ? 'active' : 'pending'}`}>
                        <step.icon size={15} />
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`clay-timeline-line ${step.completed ? 'bg-emerald-300' : 'bg-[#E7EBF2]'}`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className={`pb-4 ${i === timeline.length - 1 ? '' : ''}`}>
                      <p className={`text-sm font-semibold ${step.completed ? 'text-emerald-700' : step.active ? 'text-[#4F6CE1]' : 'text-[#64748B]'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">{step.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 6: RECENT ATTENDANCE
              ═══════════════════════════════════════════════════════ */}
          <div className="clay-card-soft overflow-hidden mb-6 animate-fadeInUp stagger-8">
            <div className="px-6 py-4 border-b border-[#E7EBF2]/80 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <FiCalendar size={16} className="text-[#4F6CE1]" />
              </div>
              <h3 className="text-sm font-bold text-[#1E293B]">Recent Attendance</h3>
            </div>

            {recentAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full clay-table">
                  <thead>
                    <tr className="border-b border-[#E7EBF2]">
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Working Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.map(record => (
                      <tr key={record.id}>
                        <td className="font-medium text-[#1E293B]">{formatDate(record.attendance_date)}</td>
                        <td className="text-[#64748B]">{formatTime(record.login_time)}</td>
                        <td className="text-[#64748B]">
                          {formatTime(record.logout_time)}
                          {record.is_auto_checkout && record.logout_time && (
                            <span className="block text-[10px] text-amber-500 font-medium">(Auto checkout)</span>
                          )}
                        </td>
                        <td className="text-[#64748B]">
                          {record.total_working_hours ? formatWorkingHours(parseFloat(record.total_working_hours)) : '—'}
                        </td>
                        <td>
                          <StatusBadge status={record.attendance_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <FiCalendar size={28} className="mx-auto mb-2 text-[#475569]" />
                <p className="text-sm font-semibold text-[#64748B]">No attendance records yet</p>
                <p className="text-xs text-[#64748B] mt-1">Check in to start tracking</p>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 7: TODAY'S SUMMARY + UPCOMING HOLIDAYS
              ═══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

            {/* Today's Summary */}
            <div className="clay-card-soft overflow-hidden animate-fadeInUp stagger-9">
              <div className="px-6 py-4 border-b border-[#E7EBF2]/80 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FiClock size={16} className="text-[#4F6CE1]" />
                </div>
                <h3 className="text-sm font-bold text-[#1E293B]">Today's Summary</h3>
              </div>
              {todayAttendance ? (
                <div className="grid grid-cols-2 divide-x divide-[#E7EBF2]/60">
                  {[
                    { label: 'Login Time', value: formatTime(todayAttendance.login_time) || '—', sub: null },
                    { label: 'Logout Time', value: formatTime(todayAttendance.logout_time) || '—', sub: todayAttendance.is_auto_checkout && todayAttendance.logout_time ? 'Auto checkout' : null },
                    { label: 'Working Hours', value: formatWorkingHours(parseFloat(todayAttendance.total_working_hours)), sub: null },
                    { label: 'Status', value: null, badge: true },
                  ].map(({ label, value, sub, badge }) => (
                    <div key={label} className="px-5 py-4">
                      <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1.5">{label}</p>
                      {badge
                        ? <div className="mt-1"><StatusBadge status={todayAttendance.attendance_status} size="md" /></div>
                        : <>
                            <p className="text-lg font-bold text-[#1E293B]">{value}</p>
                            {sub && <p className="text-[10px] text-amber-500 mt-0.5 font-medium">{sub}</p>}
                          </>
                      }
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <FiAlertCircle size={28} className="mx-auto mb-2 text-[#475569]" />
                  <p className="text-sm font-semibold text-[#64748B]">No attendance record for today</p>
                  <p className="text-xs text-[#64748B] mt-1">Check in to start tracking your attendance</p>
                </div>
              )}
            </div>

            {/* Upcoming Holidays */}
            <div className="clay-card-soft overflow-hidden animate-fadeInUp stagger-10">
              <div className="px-6 py-4 border-b border-[#E7EBF2]/80 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                  <FiAward size={16} className="text-purple-500" />
                </div>
                <h3 className="text-sm font-bold text-[#1E293B]">Upcoming Holidays</h3>
                <span className="ml-auto text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{currentMonthName}</span>
              </div>

              <div className="p-4">
                {upcomingHolidays.length > 0 ? (
                  <div className="space-y-2.5">
                    {upcomingHolidays.map(holiday => {
                      const holidayDate = new Date(holiday.holiday_date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      holidayDate.setHours(0, 0, 0, 0);
                      const daysLeft = Math.ceil((holidayDate - today) / 86400000);
                      const dayName = new Date(holiday.holiday_date).toLocaleDateString('en-US', { weekday: 'long' });
                      const displayDate = new Date(holiday.holiday_date);

                      return (
                        <div key={holiday.id} className="clay-holiday-item flex items-center gap-3.5">
                          {/* Date circle */}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center justify-center flex-shrink-0 border border-purple-100/80">
                            <span className="text-[9px] font-bold text-purple-500 uppercase leading-none">
                              {displayDate.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-purple-700 leading-none mt-0.5">
                              {displayDate.getDate()}
                            </span>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1E293B] truncate">{holiday.holiday_title}</p>
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                              {holiday.holiday_type} · {dayName}
                            </p>
                          </div>
                          {/* Days left badge */}
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                            daysLeft === 0
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : daysLeft <= 3
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-purple-50 text-purple-600 border border-purple-200'
                          }`}>
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-3">
                      <FiCalendar size={20} className="text-[#475569]" />
                    </div>
                    <p className="text-sm text-[#64748B] font-medium">No upcoming holidays this month.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 8: INSTRUCTIONS
              ═══════════════════════════════════════════════════════ */}
          <div className="clay-card-soft overflow-hidden animate-fadeInUp stagger-10 mb-4" style={{ background: 'linear-gradient(135deg, #fffcf0, #fefaf0)' }}>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <FiInfo size={14} className="text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-amber-900">Important Instructions</h3>
              </div>
              <ul className="text-xs text-amber-800/90 space-y-1.5 ml-5 list-disc">
                <li>Make sure location services are enabled on your device</li>
                <li>Check in when you arrive at the office or start working from home</li>
                <li>Check out when you finish your work for the day</li>
                <li>You can only check in and check out once per day</li>
                {!wfhEnabled && settings && <li>You must be within {settings.companyLocation.allowedRadius} meters of the office to check in</li>}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DIALOGS (COMPLETELY UNCHANGED)
          ═══════════════════════════════════════════════════════ */}
      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(d => ({ ...d, isOpen:false }))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} confirmText={confirmDialog.type === 'warning' ? 'Check Out' : 'Check In'} />
      <LocationDialog isOpen={locationDialog.isOpen} onClose={() => setLocationDialog(d => ({ ...d, isOpen:false }))} onAllow={locationDialog.onAllow} title={locationDialog.title} message={locationDialog.message} type={locationDialog.type} />
      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog(d => ({ ...d, isOpen:false }))} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
};

export default EmployeeDashboard;
