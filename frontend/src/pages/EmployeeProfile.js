import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiHash, FiLayers } from 'react-icons/fi';

const ProfileField = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      <Icon size={17} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-[#0F172A] mt-0.5 break-all">{value || '—'}</p>
    </div>
  </div>
);

const EmployeeProfile = () => {
  const { user } = useAuth();
  const nameStr  = user?.name || 'U';
  const initials = nameStr.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

  const fields = [
    { icon:FiHash,      label:'Employee ID',   value:user?.employee_id, accent:'bg-[#2563EB]/10 text-[#2563EB]'  },
    { icon:FiUser,      label:'Full Name',      value:user?.name,        accent:'bg-emerald-50 text-emerald-600'   },
    { icon:FiMail,      label:'Email Address',  value:user?.email,       accent:'bg-purple-50 text-purple-600'     },
    { icon:FiPhone,     label:'Mobile Number',  value:user?.mobile,      accent:'bg-amber-50 text-amber-600'       },
    { icon:FiLayers,    label:'Department',     value:user?.department,  accent:'bg-red-50 text-red-500'           },
    { icon:FiBriefcase, label:'Job Role',       value:user?.job_role,    accent:'bg-orange-50 text-orange-600'     },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#0F172A]">My Profile</h1>
            <p className="text-sm text-[#475569] mt-0.5">View your account information</p>
          </div>

          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-clay overflow-hidden">
              {/* Banner */}
              <div className="relative bg-gradient-to-br from-[#2563EB] to-[#7C3AED] px-6 py-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 flex-shrink-0 shadow-clay-modal">
                    <span className="text-3xl font-extrabold text-white">{initials}</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-extrabold text-white leading-none">{nameStr}</h2>
                    <p className="text-blue-200 text-sm mt-1 font-medium">{user?.job_role}</p>
                    <span className="inline-block mt-2 text-xs font-mono text-blue-100 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
                      {user?.employee_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fields.map(f => <ProfileField key={f.label} {...f} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
