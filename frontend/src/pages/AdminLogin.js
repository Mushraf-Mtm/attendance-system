import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLogin } from '../services/api';
import { FiShield, FiLock, FiEye, FiEyeOff, FiLogIn, FiUser, FiActivity, FiUsers, FiCpu } from 'react-icons/fi';
import { Spinner } from '../components/Loader';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => { setFormData(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await adminLogin({ username: formData.username, password: formData.password });
      if (response.data.success) { login(response.data.user, response.data.token); navigate('/admin/dashboard'); }
      else setError(response.data.message || 'Invalid credentials. Please try again.');
    } catch (err) { setError(err.response?.data?.message || 'Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden selection:bg-blue-500/30">
      
      {/* ─── Ambient Glow Blobs ─── */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-6xl flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16 relative z-10">
        
        {/* ─── Dashboard Preview / Stats Section (Left on Desktop) ─── */}
        <div className="flex-1 w-full lg:max-w-xl animate-fadeIn hidden md:block">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">System Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Center</span></h2>
            <p className="text-[#94A3B8] mt-3 text-sm lg:text-base leading-relaxed">Access real-time analytics, manage employee attendance, monitor trusted devices, and ensure seamless organizational operations.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mock Dashboard Cards */}
            <div className="bg-[#0B1120] border border-white/[0.05] p-5 rounded-2xl shadow-clay-admin relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full transition-all group-hover:bg-blue-500/10" />
              <FiCpu size={20} className="text-blue-400 mb-3" />
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Device Management</p>
              <div className="flex flex-col gap-1"><span className="text-lg font-black text-white leading-tight">Control</span><span className="text-xs text-[#94A3B8]">Approve/Reject devices</span></div>
            </div>

            <div className="bg-[#0B1120] border border-white/[0.05] p-5 rounded-2xl shadow-clay-admin relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full transition-all group-hover:bg-purple-500/10" />
              <FiActivity size={20} className="text-purple-400 mb-3" />
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Security Audit</p>
              <div className="flex flex-col gap-1"><span className="text-lg font-black text-white leading-tight">Monitor</span><span className="text-xs text-[#94A3B8]">Track admin logs</span></div>
            </div>

            <div className="bg-[#0B1120] border border-white/[0.05] p-5 rounded-2xl shadow-clay-admin relative overflow-hidden group hover:-translate-y-1 transition-transform col-span-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full transition-all group-hover:bg-cyan-500/10" />
              <div className="flex items-start justify-between">
                <div>
                  <FiLock size={20} className="text-cyan-400 mb-3" />
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">OTP & Access Guard</p>
                  <p className="text-xl font-black text-white">Configure security layers</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Login Card Section (Right on Desktop) ─── */}
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-[#10192D]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 lg:p-10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-b-full shadow-[0_0_20px_rgba(59,130,246,0.6)]" />

            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B1120] to-[#161D2E] border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.4)] mb-5 relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg group-hover:bg-blue-500/40 transition-colors" />
                <FiShield size={26} className="text-blue-400 relative z-10" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Authorization</h1>
              <p className="text-xs font-bold text-[#64748B] mt-2 uppercase tracking-widest">Identify Yourself</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 animate-fadeIn">
                <FiShield size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-xs font-bold text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 ml-1">Username</label>
                <div className="relative group">
                  <FiUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-400 transition-colors" />
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Enter admin ID" required
                    className="w-full bg-[#050816] border border-white/[0.05] text-white text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#475569] shadow-inner" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 ml-1">Secure Password</label>
                <div className="relative group">
                  <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-400 transition-colors" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••••••" required
                    className="w-full bg-[#050816] border border-white/[0.05] text-white text-sm rounded-xl py-3.5 pl-11 pr-11 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-[#475569] shadow-inner font-medium tracking-wide" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3.5 px-6 rounded-xl text-sm font-bold shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.4)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none">
                {loading
                  ? <><Spinner size={16} color="white" /><span>Authenticating...</span></>
                  : <><FiLogIn size={16} /><span>Secure Sign In</span></>
                }
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 pt-6 border-t border-white/[0.05]">
              <FiShield size={12} className="text-emerald-400" />
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">End-to-end encrypted connection</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
