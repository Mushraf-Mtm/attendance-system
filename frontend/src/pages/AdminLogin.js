import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLogin } from '../services/api';
import { FiShield, FiLock, FiEye, FiEyeOff, FiLogIn, FiUser, FiActivity, FiCpu, FiTerminal } from 'react-icons/fi';
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
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- Ambient Glowing Background --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10 items-center min-h-[600px]">
        
        {/* ================= LEFT COLUMN: CYBER SECURITY ILLUSTRATION ================= */}
        <div className="hidden lg:flex flex-col justify-center items-center relative w-full h-full">
          
          {/* Main Cyber Scene */}
          <div className="relative w-80 h-80 animate-float" style={{ animationDuration: '7s' }}>
            {/* Core Glow */}
            <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl scale-110"></div>
            
            {/* Server Rack SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Rack Outline */}
              <rect x="50" y="30" width="100" height="140" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="4" />
              
              {/* Server Nodes */}
              <g className="animate-pulse" style={{ animationDuration: '3s' }}>
                <rect x="60" y="50" width="80" height="20" rx="4" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
                <circle cx="75" cy="60" r="4" fill="#3B82F6" />
                <rect x="90" y="58" width="40" height="4" rx="2" fill="#3B82F6" opacity="0.5" />
              </g>

              <g className="animate-pulse" style={{ animationDuration: '4s' }}>
                <rect x="60" y="80" width="80" height="20" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="2" />
                <circle cx="75" cy="90" r="4" fill="#10B981" />
                <rect x="90" y="88" width="40" height="4" rx="2" fill="#10B981" opacity="0.5" />
              </g>

              <g className="animate-pulse" style={{ animationDuration: '2.5s' }}>
                <rect x="60" y="110" width="80" height="20" rx="4" fill="#0F172A" stroke="#8B5CF6" strokeWidth="2" />
                <circle cx="75" cy="120" r="4" fill="#8B5CF6" />
                <rect x="90" y="118" width="40" height="4" rx="2" fill="#8B5CF6" opacity="0.5" />
              </g>
              
              {/* Network Connections */}
              <path d="M150 60 L180 60 M150 90 L170 90 M150 120 L190 120" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Rotating Shield */}
            <div className="absolute -top-6 -right-6 w-24 h-24 animate-float" style={{ animationDelay: '1.5s' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 L85 25 V50 C85 75 50 95 50 95 C50 95 15 75 15 50 V25 L50 10 Z" fill="#1E293B" stroke="#3B82F6" strokeWidth="4" />
                <path d="M35 45 L45 55 L65 35" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Data Chart / Hologram */}
            <div className="absolute -bottom-8 -left-8 w-28 h-28 animate-float" style={{ animationDuration: '5s', animationDelay: '0.2s' }}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                <rect x="10" y="20" width="80" height="60" rx="8" fill="#0F172A" stroke="#475569" strokeWidth="2" />
                <path d="M20 60 L40 40 L55 50 L80 25" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="40" cy="40" r="3" fill="#8B5CF6" />
                <circle cx="55" cy="50" r="3" fill="#8B5CF6" />
                <circle cx="80" cy="25" r="3" fill="#8B5CF6" />
              </svg>
            </div>

            {/* Floating Cyber Nodes */}
            <div className="absolute top-16 -left-12 w-6 h-6 text-cyan-400 animate-ping" style={{ animationDuration: '3s' }}>
              <div className="w-full h-full bg-cyan-400 rounded-full blur-[2px]"></div>
            </div>
            <div className="absolute bottom-16 -right-6 w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDuration: '2s' }}>
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-md"></div>
            </div>
          </div>
          
          <div className="mt-12 text-center max-w-[90%] space-y-4">
            <h2 className="text-2xl font-bold text-white leading-tight">System Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Center</span></h2>
            <p className="text-sm text-[#94A3B8]">Access real-time analytics, manage employees, monitor attendance, review trusted devices, configure security, and control your organization securely.</p>
            
            {/* Feature Cards Grid (Dark Mode) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg text-left group hover:-translate-y-1 hover:bg-[#1F2937]/80 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-bl-full group-hover:bg-blue-500/20 transition-colors" />
                <FiCpu className="text-blue-400 mb-2" size={16} />
                <h4 className="text-xs font-bold text-white">Device Mgmt</h4>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Approve/Reject devices.</p>
              </div>
              <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg text-left group hover:-translate-y-1 hover:bg-[#1F2937]/80 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-bl-full group-hover:bg-purple-500/20 transition-colors" />
                <FiActivity className="text-purple-400 mb-2" size={16} />
                <h4 className="text-xs font-bold text-white">Security Audit</h4>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Monitor system logs.</p>
              </div>
              <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg text-left group hover:-translate-y-1 hover:bg-[#1F2937]/80 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/10 rounded-bl-full group-hover:bg-cyan-500/20 transition-colors" />
                <FiTerminal className="text-cyan-400 mb-2" size={16} />
                <h4 className="text-xs font-bold text-white">Access Guard</h4>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">Configure security layers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DARK FORM CARD ================= */}
        <div className="w-full flex flex-col items-center">
          
          <div className="w-full max-w-[420px] text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(59,130,246,0.2)] mb-4 animate-float relative group" style={{ animationDuration: '5s' }}>
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-lg transition-colors group-hover:bg-blue-500/40"></div>
              <FiShield size={24} className="text-blue-400 relative z-10" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Admin Authorization</h1>
            <p className="text-[#94A3B8] font-medium uppercase tracking-widest text-xs">Identify Yourself</p>
          </div>

          {/* Premium Dark Glass Card */}
          <div className="w-full max-w-[420px] bg-[#111827]/90 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-[0_25px_50px_rgba(0,0,0,0.6)] transition-shadow duration-300">
            
            {/* Card Header Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500" />

            {/* Card Body */}
            <div className="p-8 pt-10">
              {error && (
                <div className="mb-5 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3.5 text-sm font-medium shadow-sm">
                  <FiShield size={16} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-300 font-bold">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Username</label>
                  <div className="relative group">
                    <FiUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-blue-400 transition-colors" />
                    <input type="text" name="username" value={formData.username} onChange={handleChange} 
                      className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-[#475569] placeholder:font-normal focus:bg-[#0F172A] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner" 
                      placeholder="Enter admin ID" required autoFocus />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Secure Password</label>
                  <div className="relative group">
                    <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-blue-400 transition-colors" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} 
                      className="w-full bg-[#0B1120] border border-white/10 text-white rounded-xl py-3.5 pl-11 pr-12 text-sm font-medium placeholder:text-[#475569] focus:bg-[#0F172A] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner tracking-wide" 
                      placeholder="••••••••••••" required />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.6)] disabled:opacity-50 disabled:transform-none transition-all mt-4">
                  {loading ? <><Spinner size={16} color="white" /> Authenticating…</> : <><FiLogIn size={16} /> Secure Sign In</>}
                </button>
              </form>

              {/* Secure Footer */}
              <div className="mt-8 flex items-center justify-center gap-2 pt-6 border-t border-white/10">
                <FiShield size={14} className="text-emerald-400" />
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">End-to-end encrypted connection</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
};
export default AdminLogin;
