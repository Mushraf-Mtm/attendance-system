import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { employeeLogin } from '../services/api';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Spinner } from '../components/Loader';

const EmployeeLogin = () => {
  const [formData, setFormData] = useState({ employee_id:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await employeeLogin({ employee_id: formData.employee_id, password: formData.password });
      if (response.data.success) { login(response.data.user, response.data.token); navigate('/employee/dashboard'); }
      else { setError(response.data.message || 'Invalid credentials. Please try again.'); }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* --- Premium Ambient Background --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-400/20 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      
      {/* Background Dots & Waves */}
      <div className="absolute bottom-10 right-10 w-64 h-64 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94A3B8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-10 left-10 w-64 h-64 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94A3B8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>

      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10 items-center min-h-[600px]">
        
        {/* ================= LEFT COLUMN: SECURITY ILLUSTRATION ================= */}
        <div className="hidden lg:flex flex-col justify-center items-center relative w-full h-full">
          
          {/* Main Dashboard / Office Illustration Container */}
          <div className="relative w-80 h-80 animate-float" style={{ animationDuration: '6s' }}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl scale-125"></div>
            
            {/* The Dashboard UI */}
            <svg viewBox="0 0 200 150" className="w-full h-full drop-shadow-2xl relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="20" width="180" height="120" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
              <rect x="10" y="20" width="180" height="24" rx="12" fill="#F1F5F9" />
              <circle cx="25" cy="32" r="3" fill="#EF4444" />
              <circle cx="35" cy="32" r="3" fill="#F59E0B" />
              <circle cx="45" cy="32" r="3" fill="#10B981" />
              
              {/* Content Lines */}
              <rect x="25" y="60" width="60" height="6" rx="3" fill="#E2E8F0" />
              <rect x="25" y="75" width="40" height="6" rx="3" fill="#E2E8F0" />
              
              {/* Bar Chart */}
              <g className="animate-pulse" style={{ animationDuration: '4s' }}>
                <rect x="100" y="90" width="12" height="30" rx="2" fill="#3B82F6" />
                <rect x="120" y="70" width="12" height="50" rx="2" fill="#7C3AED" />
                <rect x="140" y="100" width="12" height="20" rx="2" fill="#10B981" />
              </g>

              {/* User Profile Area */}
              <circle cx="160" cy="32" r="6" fill="#94A3B8" />
              <rect x="25" y="100" width="50" height="20" rx="4" fill="#DBEAFE" />
            </svg>

            {/* Floating Clock */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 animate-float" style={{ animationDelay: '1s' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#2563EB" />
                <circle cx="50" cy="50" r="30" fill="#FFFFFF" />
                <path d="M50 35 V50 L60 60" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="50" r="4" fill="#0F172A" />
              </svg>
            </div>

            {/* Floating Calendar */}
            <div className="absolute -top-10 -left-10 w-20 h-20 animate-float" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
                <rect x="20" y="30" width="60" height="50" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="4" />
                <rect x="20" y="30" width="60" height="20" rx="8" fill="#EF4444" />
                <rect x="35" y="20" width="8" height="20" rx="4" fill="#64748B" />
                <rect x="55" y="20" width="8" height="20" rx="4" fill="#64748B" />
                <circle cx="50" cy="65" r="8" fill="#10B981" />
              </svg>
            </div>

            {/* Floating Particles / Sparkles */}
            <div className="absolute top-10 -right-12 w-6 h-6 text-yellow-400 animate-ping" style={{ animationDuration: '3s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
            </div>
            <div className="absolute bottom-10 -left-6 w-4 h-4 text-blue-400 animate-pulse" style={{ animationDuration: '2s' }}>
              <circle cx="12" cy="12" r="10" fill="currentColor" />
            </div>
          </div>
          
          <div className="mt-12 text-center max-w-[90%] space-y-4">
            <h2 className="text-2xl font-bold text-[#0F172A] leading-tight">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AttendNest</span></h2>
            <p className="text-sm text-[#64748B]">Your personalized portal to track attendance, request leaves, monitor working hours, and manage your daily activities seamlessly.</p>
            
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/80 border border-[#E2E8F0] p-3 rounded-xl shadow-sm text-left group hover:-translate-y-1 transition-transform relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-50 rounded-bl-full group-hover:bg-blue-100 transition-colors" />
                <FiCheckCircle className="text-blue-500 mb-2" size={16} />
                <h4 className="text-xs font-bold text-[#0F172A]">Daily Attendance</h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">One-click secure check-in.</p>
              </div>
              <div className="bg-white/80 border border-[#E2E8F0] p-3 rounded-xl shadow-sm text-left group hover:-translate-y-1 transition-transform relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-purple-50 rounded-bl-full group-hover:bg-purple-100 transition-colors" />
                <FiLock className="text-purple-500 mb-2" size={16} />
                <h4 className="text-xs font-bold text-[#0F172A]">Trusted Devices</h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">Approved devices only.</p>
              </div>
              <div className="bg-white/80 border border-[#E2E8F0] p-3 rounded-xl shadow-sm text-left group hover:-translate-y-1 transition-transform relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 rounded-bl-full group-hover:bg-emerald-100 transition-colors" />
                <FiClock className="text-emerald-500 mb-2" size={16} />
                <h4 className="text-xs font-bold text-[#0F172A]">Work Flexibility</h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">WFH & Early Checkout.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: FORM CARD ================= */}
        <div className="w-full flex flex-col items-center">
          
          <div className="w-full max-w-[420px] text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-[0_8px_24px_rgba(37,99,235,0.3)] mb-4 animate-float" style={{ animationDuration: '5s' }}>
              <FiCalendar size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2">Employee Login</h1>
            <p className="text-[#64748B] font-medium">Access Your Account</p>
          </div>

          {/* Premium Glass Card */}
          <div className="w-full max-w-[420px] bg-white/90 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] transition-shadow duration-300">
            
            {/* Card Header Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED]" />

            {/* Card Body */}
            <div className="p-8 pt-10">
              {error && <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 text-sm font-medium shadow-sm"><span className="text-red-500 font-bold">⚠</span>{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Employee ID</label>
                  <div className="relative group">
                    <FiUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />
                    <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} 
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium placeholder:text-[#94A3B8] placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all shadow-sm" 
                      placeholder="e.g. EMP001" required autoFocus />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Password</label>
                  <div className="relative group">
                    <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#2563EB] transition-colors" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} 
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3.5 pl-11 pr-12 text-sm font-medium placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all shadow-sm tracking-wide" 
                      placeholder="••••••••••••" required />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1 rounded-md hover:bg-[#E2E8F0]">
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link to="/forgot-password" className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline underline-offset-4 transition-all">
                    Forgot Password?
                  </Link>
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:transform-none transition-all mt-2">
                  {loading ? <><Spinner size="sm" color="white" /> Authenticating…</> : <><FiLogIn size={16} /> Secure Sign In</>}
                </button>
              </form>
            </div>
          </div>
          
          <p className="text-center text-xs font-semibold text-[#94A3B8] mt-8">&copy; {new Date().getFullYear()} AttendNest. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
};
export default EmployeeLogin;
