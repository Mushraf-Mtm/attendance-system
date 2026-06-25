import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { employeeLogin } from '../services/api';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';

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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-[#2563EB]/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-[#7C3AED]/6 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2563EB] shadow-[0_8px_32px_rgba(37,99,235,0.35)] mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Employee Portal</h1>
          <p className="text-sm text-[#475569] mt-1">Sign in to manage your attendance</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-clay-modal border border-[#E2E8F0] p-8">
          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Employee ID</label>
              <div className="relative">
                <FiUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange}
                  className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3 pl-12 pr-4 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all" 
                  placeholder="e.g. EMP001" required autoFocus />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3 pl-12 pr-12 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                  placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-[0_4px_16px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <><FiLogIn size={16} /> Sign In</>
              }
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center">
            <Link to="/forgot-password" className="text-sm text-[#2563EB] hover:text-blue-700 font-medium transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
