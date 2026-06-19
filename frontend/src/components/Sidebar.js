import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUsers, FiCalendar, FiLogOut, FiUser, FiClock,
  FiSettings, FiShield, FiMenu, FiX, FiLock, FiKey,
  FiAlertCircle, FiUmbrella, FiChevronRight,
} from 'react-icons/fi';

const adminSections = [
  {
    label: 'Overview',
    items: [{ path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' }],
  },
  {
    label: 'People',
    items: [
      { path: '/admin/employees',   icon: FiUsers,  label: 'Employees' },
      { path: '/admin/management',  icon: FiShield, label: 'Admin Management' },
    ],
  },
  {
    label: 'Time & Attendance',
    items: [
      { path: '/admin/attendance', icon: FiCalendar, label: 'Attendance' },
      { path: '/admin/holidays',   icon: FiUmbrella, label: 'Holidays' },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/settings',      icon: FiSettings,    label: 'Settings' },
      { path: '/admin/otp-settings',  icon: FiKey,         label: 'OTP Settings' },
      { path: '/admin/security-logs', icon: FiAlertCircle, label: 'Security Logs' },
    ],
  },
];

const employeeSections = [
  {
    label: 'Overview',
    items: [{ path: '/employee/dashboard', icon: FiHome, label: 'Dashboard' }],
  },
  {
    label: 'Attendance',
    items: [{ path: '/employee/attendance', icon: FiClock, label: 'My Attendance' }],
  },
  {
    label: 'Account',
    items: [
      { path: '/employee/profile',         icon: FiUser, label: 'Profile' },
      { path: '/employee/change-password', icon: FiLock, label: 'Change Password' },
    ],
  },
];

const NavItem = ({ path, icon: Icon, label, isActive, onClick }) => (
  <li>
    <Link
      to={path}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        <Icon size={17} />
      </span>
      <span className="truncate">{label}</span>
      {isActive && (
        <FiChevronRight size={13} className="ml-auto text-indigo-400 flex-shrink-0" />
      )}
    </Link>
  </li>
);

const Sidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout, isAdmin, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = async () => {
    try { await logout(); navigate('/'); }
    catch (e) { console.error('Logout error:', e); }
  };

  const sections = isAdmin ? adminSections : employeeSections;
  const nameStr  = user?.name || user?.username || 'U';
  const initials = nameStr.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsMobileMenuOpen(v => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white border border-slate-200 text-slate-700 p-2 rounded-lg shadow-sm"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40
        w-64 bg-white border-r border-slate-200 flex-shrink-0 h-screen
        transform transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 flex flex-col overflow-hidden
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <FiClock size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm leading-none">AttendanceMS</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{isAdmin ? 'Admin Panel' : 'Employee Portal'}</p>
          </div>
        </div>

        {/* User chip */}
        <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate leading-none">{nameStr}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {isAdmin ? 'Administrator' : user?.job_role}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map(section => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map(item => (
                  <NavItem
                    key={item.path}
                    {...item}
                    isActive={location.pathname === item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={() => { setIsMobileMenuOpen(false); handleLogoutClick(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <FiLogOut size={17} className="flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
