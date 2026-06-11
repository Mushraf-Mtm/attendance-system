import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import LocationDialog from '../components/LocationDialog';
import AlertDialog from '../components/AlertDialog';
import { 
  getTodayAttendance, 
  checkIn, 
  checkOut,
  getWFHStatus,
  getSettings
} from '../services/api';
import { getCurrentLocation, getDeviceInfo, getIPAddress } from '../utils/location';
import { formatTime, formatWorkingHours } from '../utils/formatTime';
import { FiLogIn, FiLogOut, FiClock, FiMapPin } from 'react-icons/fi';

const EmployeeDashboard = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [wfhEnabled, setWfhEnabled] = useState(false);
  const [checkInEnabled, setCheckInEnabled] = useState(true);
  const [checkOutEnabled, setCheckOutEnabled] = useState(true);
  const [settings, setSettings] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'info'
  });
  const [locationDialog, setLocationDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'permission',
    onAllow: null
  });
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceRes, wfhRes, settingsRes] = await Promise.all([
        getTodayAttendance(),
        getWFHStatus(),
        getSettings()
      ]);

      if (attendanceRes.data.success) {
        setTodayAttendance(attendanceRes.data.attendance);
      }

      if (wfhRes.data.success) {
        setWfhEnabled(wfhRes.data.wfh_enabled);
      }

      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);
        setCheckInEnabled(settingsRes.data.settings.workingHours.checkInEnabled !== undefined ? settingsRes.data.settings.workingHours.checkInEnabled : true);
        setCheckOutEnabled(settingsRes.data.settings.workingHours.checkOutEnabled !== undefined ? settingsRes.data.settings.workingHours.checkOutEnabled : true);
      } else {
        console.error('Failed to load settings:', settingsRes.data);
        setAlertDialog({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load settings. Please refresh the page.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load data. Please refresh the page.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = () => {
    if (!settings) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Settings not loaded. Please refresh the page.',
        type: 'error'
      });
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: 'Check In',
      message: wfhEnabled 
        ? 'Are you sure you want to check in? Your current location will be recorded.'
        : `Are you sure you want to check in? You must be within ${settings.companyLocation.allowedRadius} meters of the office. Your location will be verified.`,
      onConfirm: async () => {
        setActionLoading(true);
        
        try {
          // Show location permission dialog first
          setLocationDialog({
            isOpen: true,
            title: settings.messages.locationPermissionTitle,
            message: settings.messages.locationPermissionMessage,
            type: 'permission',
            onAllow: async () => {
              try {
                // Get location
                const location = await getCurrentLocation();
                
                // Get device info
                const deviceInfo = getDeviceInfo();
                
                // Get IP address
                const ipAddress = await getIPAddress();

                const data = {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  accuracy: location.accuracy,
                  address: 'Location captured',
                  device_info: deviceInfo.device_info,
                  browser_info: deviceInfo.browser_info,
                  ip_address: ipAddress
                };

                const response = await checkIn(data);
                
                if (response.data.success) {
                  setAlertDialog({
                    isOpen: true,
                    title: 'Check-in Successful',
                    message: 'Your attendance has been recorded successfully!',
                    type: 'success'
                  });
                  fetchData();
                }
              } catch (error) {
                console.error('Check-in error:', error);
                console.error('Error response:', error.response?.data);
                
                // Show appropriate error dialog
                if (error.type === 'denied') {
                  setLocationDialog({
                    isOpen: true,
                    title: settings.messages.locationDeniedTitle,
                    message: settings.messages.locationDeniedMessage,
                    type: 'error',
                    onAllow: null
                  });
                } else if (error.type === 'unavailable') {
                  setLocationDialog({
                    isOpen: true,
                    title: settings.messages.locationUnavailableTitle,
                    message: settings.messages.locationUnavailableMessage,
                    type: 'error',
                    onAllow: null
                  });
                } else if (error.type === 'timeout') {
                  setLocationDialog({
                    isOpen: true,
                    title: settings.messages.locationTimeoutTitle,
                    message: settings.messages.locationTimeoutMessage,
                    type: 'warning',
                    onAllow: null
                  });
                } else if (error.response?.data?.message) {
                  // Backend validation errors (outside radius, duplicate, etc.)
                  setAlertDialog({
                    isOpen: true,
                    title: 'Check-in Failed',
                    message: error.response.data.message + (error.response.data.distance ? `\n\nYou are ${error.response.data.distance} meters away from the office.` : ''),
                    type: 'error'
                  });
                } else {
                  setAlertDialog({
                    isOpen: true,
                    title: 'Check-in Failed',
                    message: error.message || 'Unable to complete check-in. Please try again.',
                    type: 'error'
                  });
                }
              } finally {
                setActionLoading(false);
              }
            }
          });
        } catch (error) {
          setActionLoading(false);
        }
      },
      type: 'info'
    });
  };

  const handleCheckOut = () => {
    if (!settings) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Settings not loaded. Please refresh the page.',
        type: 'error'
      });
      return;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: 'Check Out',
      message: 'Are you sure you want to check out? Your working hours will be calculated and recorded.',
      onConfirm: async () => {
        setActionLoading(true);
        
        try {
          // Show location permission dialog
          setLocationDialog({
            isOpen: true,
            title: settings.messages.locationPermissionTitle,
            message: settings.messages.locationPermissionMessage,
            type: 'permission',
            onAllow: async () => {
              try {
                // Get location
                const location = await getCurrentLocation();

                const data = {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  address: 'Location captured'
                };

                const response = await checkOut(data);
                
                if (response.data.success) {
                  setAlertDialog({
                    isOpen: true,
                    title: 'Check-out Successful',
                    message: 'Your check-out has been recorded successfully!\n\nWorking hours: ' + formatWorkingHours(parseFloat(response.data.attendance.total_working_hours)),
                    type: 'success'
                  });
                  fetchData();
                }
              } catch (error) {
                console.error('Check-out error:', error);
                
                // Show appropriate error dialog
                if (error.type === 'denied') {
                  setLocationDialog({
                    isOpen: true,
                    title: settings.messages.locationDeniedTitle,
                    message: settings.messages.locationDeniedMessage,
                    type: 'error',
                    onAllow: null
                  });
                } else if (error.response?.data?.message) {
                  setAlertDialog({
                    isOpen: true,
                    title: 'Check-out Failed',
                    message: error.response.data.message,
                    type: 'error'
                  });
                } else {
                  setAlertDialog({
                    isOpen: true,
                    title: 'Check-out Failed',
                    message: error.message || 'Unable to complete check-out. Please try again.',
                    type: 'error'
                  });
                }
              } finally {
                setActionLoading(false);
              }
            }
          });
        } catch (error) {
          setActionLoading(false);
        }
      },
      type: 'warning'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-green-100 text-green-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Half Day': 'bg-orange-100 text-orange-800',
      'Absent': 'bg-red-100 text-red-800',
      'Work From Home': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const hasCheckedIn = todayAttendance?.login_time;
  const hasCheckedOut = todayAttendance?.logout_time;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back!</p>
          </div>

          {/* WFH Status */}
          {wfhEnabled && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-4 md:mb-6">
              <div className="flex items-center text-sm md:text-base">
                <FiMapPin className="mr-2 flex-shrink-0" />
                <span className="font-medium">Work From Home is enabled for your account</span>
              </div>
            </div>
          )}

          {/* Check In/Out Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || hasCheckedIn || !checkInEnabled}
              className={`p-4 md:p-8 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 md:space-y-4 transition-colors ${
                hasCheckedIn || !checkInEnabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <FiLogIn className="text-3xl md:text-5xl" />
              <span className="text-lg md:text-2xl font-bold text-center">
                {!checkInEnabled ? 'Check-In Disabled' : (hasCheckedIn ? 'Already Checked In' : 'Check In')}
              </span>
              {!checkInEnabled && (
                <span className="text-xs md:text-sm">Contact admin to enable</span>
              )}
            </button>

            <button
              onClick={handleCheckOut}
              disabled={actionLoading || !hasCheckedIn || hasCheckedOut || !checkOutEnabled}
              className={`p-4 md:p-8 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 md:space-y-4 transition-colors ${
                !hasCheckedIn || hasCheckedOut || !checkOutEnabled
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <FiLogOut className="text-3xl md:text-5xl" />
              <span className="text-lg md:text-2xl font-bold text-center">
                {!checkOutEnabled ? 'Check-Out Disabled' : (hasCheckedOut ? 'Already Checked Out' : 'Check Out')}
              </span>
              {!checkOutEnabled && (
                <span className="text-xs md:text-sm">Contact admin to enable</span>
              )}
            </button>
          </div>

          {/* Today's Attendance */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
              <FiClock className="mr-2" />
              Today's Attendance
            </h2>

            {todayAttendance ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="border-l-4 border-green-500 pl-3 md:pl-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Login Time</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">
                    {formatTime(todayAttendance.login_time)}
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-3 md:pl-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Logout Time</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">
                    {formatTime(todayAttendance.logout_time)}
                  </p>
                  {todayAttendance.is_auto_checkout && todayAttendance.logout_time && (
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      (Auto checkout by system)
                    </p>
                  )}
                </div>

                <div className="border-l-4 border-blue-500 pl-3 md:pl-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Working Hours</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-800">
                    {formatWorkingHours(parseFloat(todayAttendance.total_working_hours))}
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-3 md:pl-4">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium ${getStatusColor(todayAttendance.attendance_status)}`}>
                    {todayAttendance.attendance_status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <p className="text-sm md:text-base">No attendance record for today</p>
                <p className="text-xs md:text-sm mt-2">Please check in to start tracking your attendance</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 md:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Important Instructions:</h3>
            <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-gray-700">
              <li>Make sure location services are enabled on your device</li>
              <li>Check in when you arrive at the office or start working from home</li>
              <li>Check out when you finish your work for the day</li>
              <li>You can only check in and check out once per day</li>
              {!wfhEnabled && settings && (
                <li>You must be within {settings.companyLocation.allowedRadius} meters of the office to check in</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.type === 'warning' ? 'Check Out' : 'Check In'}
      />

      {/* Location Dialog */}
      <LocationDialog
        isOpen={locationDialog.isOpen}
        onClose={() => setLocationDialog({ ...locationDialog, isOpen: false })}
        onAllow={locationDialog.onAllow}
        title={locationDialog.title}
        message={locationDialog.message}
        type={locationDialog.type}
      />

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

export default EmployeeDashboard;
