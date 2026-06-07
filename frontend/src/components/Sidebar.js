import React from 'react';
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
  FiShield
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAdmin, user } = useAuth();

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
  ];

  const employeeMenuItems = [
    { path: '/employee/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/employee/attendance', icon: FiClock, label: 'My Attendance' },
    { path: '/employee/profile', icon: FiUser, label: 'Profile' },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isAdmin ? 'Admin Panel' : 'Employee Portal'}
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">
              {user?.name || user?.username}
            </p>
            <p className="text-xs text-gray-400">
              {isAdmin ? 'Administrator' : user?.job_role}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogoutClick}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors w-full"
        >
          <FiLogOut className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
