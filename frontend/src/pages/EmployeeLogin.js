import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { employeeLogin } from '../services/api';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';

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
    <div className="min-h-screen bg-[#F3F6FA] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      
      {/* ─── Ambient Glow Blobs (Light Theme) ─── */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16 relative z-10">
        
        {/* ─── Dashboard Preview / Stats Section (Left on Desktop) ─── */}
        <div className="flex-1 w-full lg:max-w-xl animate-fadeIn hidden md:block">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AttendNest</span></h2>
            <p className="text-[#64748B] mt-3 text-sm lg:text-base leading-relaxed font-medium">Your personalized portal to track attendance, request leaves, and monitor your daily working hours seamlessly.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mock Dashboard Cards (Light Theme Claymorphism) */}
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[6px_6px_20px_rgba(0,0,0,0.05),-6px_-6px_20px_rgba(255,255,255,0.8)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full transition-all group-hover:bg-blue-100" />
              <FiCheckCircle size={20} className="text-blue-500 mb-3 relative z-10" />
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1 relative z-10">Daily Attendance</p>
              <div className="flex flex-col gap-1 relative z-10"><span className="text-lg font-black text-[#0F172A] leading-tight">One-Click</span><span className="text-xs text-[#64748B]">Seamless check-ins</span></div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[6px_6px_20px_rgba(0,0,0,0.05),-6px_-6px_20px_rgba(255,255,255,0.8)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full transition-all group-hover:bg-purple-100" />
              <FiLock size={20} className="text-purple-500 mb-3 relative z-10" />
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1 relative z-10">Trusted Devices</p>
              <div className="flex flex-col gap-1 relative z-10"><span className="text-lg font-black text-[#0F172A] leading-tight">Secure</span><span className="text-xs text-[#64748B]">Approved devices only</span></div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[6px_6px_20px_rgba(0,0,0,0.05),-6px_-6px_20px_rgba(255,255,255,0.8)] relative overflow-hidden group hover:-translate-y-1 transition-transform col-span-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full transition-all group-hover:bg-emerald-100" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <FiClock size={20} className="text-emerald-500 mb-3" />
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Work Flexibility</p>
                  <p className="text-xl font-black text-[#0F172A]">WFH & Early Checkout</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Login Card Section (Right on Desktop) ─── */}
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 lg:p-10 shadow-[10px_10px_30px_rgba(0,0,0,0.05),-10px_-10px_30px_rgba(255,255,255,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-b-full shadow-[0_2px_15px_rgba(59,130,246,0.3)]" />

            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-[inset_0_2px_10px_rgba(255,255,255,1),4px_4px_15px_rgba(59,130,246,0.15)] mb-5 relative group">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#blueGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Employee Login</h1>
              <p className="text-xs font-bold text-[#64748B] mt-2 uppercase tracking-widest">Access your account</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3 animate-fadeIn">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500 font-bold">!</div>
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 ml-1">Employee ID</label>
                <div className="relative group">
                  <FiUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-500 transition-colors" />
                  <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} placeholder="e.g. EMP001" required
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-[#64748B] shadow-inner" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative group">
                  <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-blue-500 transition-colors" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••••••" required
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm rounded-xl py-3.5 pl-11 pr-11 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-[#64748B] shadow-inner font-medium tracking-wide" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#475569] transition-colors">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-[#0F172A] py-3.5 px-6 rounded-xl text-sm font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.35)] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none">
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Signing in...</span></>
                  : <><FiLogIn size={16} /><span>Secure Sign In</span></>
                }
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeLogin;
