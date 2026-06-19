import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiHash, FiLayers } from 'react-icons/fi';

const ProfileField = ({ icon: Icon, label, value, color = 'indigo' }) => {
  const colors = {
    indigo:  'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple:  'bg-purple-50 text-purple-600',
    amber:   'bg-amber-50 text-amber-600',
    red:     'bg-red-50 text-red-600',
    orange:  'bg-orange-50 text-orange-600',
  };
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5 break-all">{value || '—'}</p>
      </div>
    </div>
  );
};

const EmployeeProfile = () => {
  const { user } = useAuth();
  const nameStr  = user?.name || 'U';
  const initials = nameStr.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">

          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-500 mt-0.5">View your account information</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-2xl">
            {/* Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/30 flex-shrink-0">
                  <span className="text-3xl font-extrabold text-white">{initials}</span>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white leading-none">{nameStr}</h2>
                  <p className="text-indigo-200 text-sm mt-1">{user?.job_role}</p>
                  <span className="inline-block mt-2 text-xs font-mono text-indigo-100 bg-white/10 px-2 py-0.5 rounded">
                    {user?.employee_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ProfileField icon={FiHash}     label="Employee ID"    value={user?.employee_id} color="indigo"  />
              <ProfileField icon={FiUser}     label="Full Name"      value={user?.name}         color="emerald" />
              <ProfileField icon={FiMail}     label="Email Address"  value={user?.email}        color="purple"  />
              <ProfileField icon={FiPhone}    label="Mobile Number"  value={user?.mobile}       color="amber"   />
              <ProfileField icon={FiLayers}   label="Department"     value={user?.department}   color="red"     />
              <ProfileField icon={FiBriefcase} label="Job Role"      value={user?.job_role}     color="orange"  />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
