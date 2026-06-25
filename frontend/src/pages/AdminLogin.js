import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLogin } from '../services/api';
import { FiShield, FiLock, FiEye, FiEyeOff, FiLogIn, FiUser } from 'react-icons/fi';

const AdminLogin = () => {
  const [formData, setFormData]       = useState({ username: '', password: '' });
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

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
    <div className="min-h-screen bg-[#0E1320] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3B82F6]/8 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#6366f1]/8 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#6366f1] shadow-glow-blue mb-4">
            <FiShield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Secure administrative access</p>
        </div>

        {/* Card */}
        <div className="bg-[#161D2E] border border-white/[0.08] rounded-2xl shadow-clay-admin p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <FiShield size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <FiUser size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Enter admin username" required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/15 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter admin password" required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-12 pr-12 text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/15 transition-all" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#6366f1] text-white py-3 px-6 rounded-xl font-semibold text-sm shadow-glow-blue hover:shadow-[0_0_28px_rgba(59,130,246,0.55)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in…</span></>
                : <><FiLogIn size={16} /><span>Sign In</span></>
              }
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <FiLock size={12} className="text-[#475569]" />
          <p className="text-xs text-[#475569]">Secure administrative access only</p>
        </div>
        <p className="text-center text-xs text-[#374151] mt-2">© {new Date().getFullYear()} AttendNest. All rights reserved.</p>
      </div>
    </div>
  );
};
export default AdminLogin;
