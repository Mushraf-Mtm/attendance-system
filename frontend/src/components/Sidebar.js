import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiCalendar, 
  FiLogOut, 
  FiUser,
  FiClock,
  FiSettings,
  FiShield,
  FiMenu,
  FiX,
  FiLock
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAdmin, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/employees', icon: FiUsers, label: 'Employees' },
    { path: '/admin/attendance', icon: FiCalendar, label: 'Attendance' },
    { path: '/admin/holidays', icon: FiCalendar, label: 'Holiday Management' },
    { path: '/admin/management', icon: FiShield, label: 'Admin Management' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
    { path: '/admin/otp-settings', icon: FiShield, label: 'OTP Settings' },
  ];

  const employeeMenuItems = [
    { path: '/employee/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/employee/attendance', icon: FiClock, label: 'My Attendance' },
    { path: '/employee/profile', icon: FiUser, label: 'Profile' },
    { path: '/employee/change-password', icon: FiLock, label: 'Change Password' },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        h-screen w-64 bg-gray-900 text-white flex flex-col
      `}>
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h1 className="text-xl sm:text-2xl font-bold">Attendance</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isAdmin ? 'Admin Panel' : 'Employee Portal'}
          </p>
        </div>

        {/* User Info */}
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-lg font-semibold">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs sm:text-sm truncate">
                {user?.name || user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {isAdmin ? 'Administrator' : user?.job_role}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="text-lg sm:text-xl flex-shrink-0" />
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogoutClick();
            }}
            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors w-full"
          >
            <FiLogOut className="text-lg sm:text-xl flex-shrink-0" />
            <span className="text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
