import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset, verifyResetOTP, resetPassword, resendOTP } from '../services/api';
import { FiMail, FiKey, FiLock, FiEye, FiEyeOff, FiClock, FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi';
import { Spinner } from '../components/Loader';

const PwReq = ({ met, label }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${met ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F1F5F9] text-[#CBD5E1]'}`}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
    <span className={met ? 'text-emerald-700 font-medium' : 'text-[#94A3B8]'}>{label}</span>
  </div>
);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email:'', otp:'', newPassword:'', confirmNewPassword:'' });
  const [showPasswords, setShowPasswords] = useState({ new:false, confirm:false });
  const [maskedEmail, setMaskedEmail] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    let timer;
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); setSuccess(''); };
  const toggleShow = (field) => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });

  const handleRequestOTP = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!formData.email) { setError('Please enter your email address'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      const response = await requestPasswordReset(formData.email);
      if (response.data.success) { setMaskedEmail(response.data.maskedEmail || formData.email); setExpiryMinutes(response.data.expiresInMinutes || 5); setCountdown(60); setStep(2); setSuccess('OTP has been sent to your email address'); }
    } catch (error) { setError(error.response?.data?.message || 'Failed to send OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!formData.otp) { setError('Please enter the OTP'); return; }
    if (formData.otp.length !== 6) { setError('OTP must be 6 digits'); return; }
    setLoading(true);
    try {
      const response = await verifyResetOTP(formData.email, formData.otp);
      if (response.data.success) { setStep(3); setSuccess('OTP verified successfully'); }
    } catch (error) { setError(error.response?.data?.message || 'Invalid OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!formData.newPassword || !formData.confirmNewPassword) { setError('All fields are required'); return; }
    if (formData.newPassword !== formData.confirmNewPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const response = await resetPassword(formData.email, formData.otp, formData.newPassword, formData.confirmNewPassword);
      if (response.data.success) { setStep(4); setSuccess('Password reset successfully!'); }
    } catch (error) {
      const errors = error.response?.data?.errors;
      setError(errors ? errors.join(', ') : error.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const response = await resendOTP(formData.email, 'password_reset');
      if (response.data.success) { setCountdown(60); setSuccess('A new OTP has been sent to your email'); }
    } catch (error) { setError(error.response?.data?.message || 'Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  const getPwStrength = (password) => {
    if (!password) return { pct:0, label:'', color:'', textColor:'' };
    let s = 0;
    if (password.length >= 8) s++; if (/[a-z]/.test(password)) s++; if (/[A-Z]/.test(password)) s++; if (/[0-9]/.test(password)) s++; if (/[^a-zA-Z0-9]/.test(password)) s++;
    const labels = ['','Weak','Fair','Good','Strong','Very Strong'];
    const colors = ['','bg-red-500','bg-orange-500','bg-yellow-500','bg-emerald-500','bg-emerald-600'];
    const textColors = ['','text-red-600','text-orange-600','text-yellow-600','text-emerald-600','text-emerald-700'];
    return { pct:(s/5)*100, label:labels[s], color:colors[s], textColor:textColors[s] };
  };
  const pwStrength = getPwStrength(formData.newPassword);

  const stepLabels = ['', 'Enter Email', 'Verify OTP', 'New Password'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-[#2563EB]/6 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2563EB] shadow-[0_8px_32px_rgba(37,99,235,0.35)] mb-4">
            <FiKey size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">{step === 4 ? 'Password Reset!' : 'Reset Password'}</h1>
          <p className="text-sm text-[#475569] mt-1">
            {step === 1 && 'Enter your email to receive OTP'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Create your new password'}
            {step === 4 && 'Your password has been reset successfully'}
          </p>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-6">
            {[1,2,3].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 ${step >= s ? 'text-[#2563EB]' : 'text-[#CBD5E1]'}`}>
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 ${step > s ? 'bg-[#2563EB] border-[#2563EB] text-white' : step === s ? 'border-[#2563EB] text-[#2563EB]' : 'border-[#E2E8F0] text-[#CBD5E1]'}`}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className="text-[10px] font-semibold hidden sm:block">{stepLabels[s]}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${step > s ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-clay-modal overflow-hidden">
          {/* Header stripe */}
          <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] px-6 py-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><FiShield size={18} className="text-white" /></div>
            <div>
              <p className="text-sm font-bold text-white">Secure Password Reset</p>
              <p className="text-xs text-blue-200 mt-0.5">
                {step === 1 && 'Verify your email address'} {step === 2 && `OTP sent to ${maskedEmail}`}
                {step === 3 && 'Create your new password'}  {step === 4 && 'All done!'}
              </p>
            </div>
          </div>

          <div className="p-6">
            {error   && <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"><span>⚠</span>{error}</div>}
            {success && <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm"><FiCheckCircle size={14} />{success}</div>}

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} 
                      className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3 pl-12 pr-4 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all" 
                      placeholder="Enter your registered email" required autoFocus />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all">
                  {loading ? <><Spinner size="sm" color="white" /> Sending…</> : <><FiMail size={15} /> Send OTP</>}
                </button>
                <div className="text-center"><Link to="/employee/login" className="text-sm text-[#2563EB] hover:text-blue-700 font-semibold flex items-center justify-center gap-1"><FiArrowLeft size={13} /> Back to Login</Link></div>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex items-start gap-3 bg-[#2563EB]/8 border border-[#2563EB]/20 rounded-xl p-4">
                  <FiMail size={15} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <div><p className="text-xs font-semibold text-[#0F172A]">OTP sent to:</p><p className="text-sm font-bold text-[#2563EB]">{maskedEmail}</p><p className="text-xs text-[#64748B] mt-0.5">Valid for {expiryMinutes} minutes</p></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Enter OTP</label>
                  <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="emp-input text-center text-2xl font-mono tracking-widest" placeholder="000000" maxLength="6" required autoFocus />
                  <div className="mt-2 text-right">
                    <button type="button" onClick={handleResendOTP} disabled={countdown > 0 || loading} className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 disabled:text-[#CBD5E1] disabled:cursor-not-allowed transition-colors">
                      {countdown > 0 ? <span className="flex items-center gap-1 justify-end"><FiClock size={11} /> Resend in {countdown}s</span> : 'Resend OTP'}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-semibold text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl hover:bg-[#E2E8F0] transition-colors">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all">
                    {loading ? <><Spinner size="sm" color="white" /> Verifying…</> : <><FiKey size={14} /> Verify OTP</>}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {[['new','New Password'],['confirm','Confirm New Password']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">{label}</label>
                    <div className="relative">
                      <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                      <input type={showPasswords[field] ? 'text' : 'password'} name={field === 'new' ? 'newPassword' : 'confirmNewPassword'} value={field === 'new' ? formData.newPassword : formData.confirmNewPassword} onChange={handleChange} 
                        className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3 pl-12 pr-12 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all" 
                        placeholder={field === 'new' ? 'Enter new password' : 'Confirm new password'} required autoFocus={field === 'new'} />
                      <button type="button" onClick={() => toggleShow(field)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                        {showPasswords[field] ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {field === 'new' && formData.newPassword && (
                      <div className="mt-1.5">
                        <div className="flex justify-between text-xs mb-1"><span className="text-[#94A3B8]">Strength:</span><span className={`font-semibold ${pwStrength.textColor}`}>{pwStrength.label}</span></div>
                        <div className="w-full bg-[#F1F5F9] rounded-full h-1.5"><div className={`${pwStrength.color} h-1.5 rounded-full transition-all duration-300`} style={{ width:`${pwStrength.pct}%` }} /></div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-[#475569] mb-2">Password requirements:</p>
                  <PwReq met={formData.newPassword.length >= 8}         label="At least 8 characters"  />
                  <PwReq met={/[A-Z]/.test(formData.newPassword)}       label="One uppercase letter"   />
                  <PwReq met={/[a-z]/.test(formData.newPassword)}       label="One lowercase letter"   />
                  <PwReq met={/[0-9]/.test(formData.newPassword)}       label="One number"             />
                  <PwReq met={/[^a-zA-Z0-9]/.test(formData.newPassword)} label="One special character" />
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all">
                  {loading ? <><Spinner size="sm" color="white" /> Resetting…</> : <><FiLock size={14} /> Reset Password</>}
                </button>
              </form>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto"><FiCheckCircle size={32} /></div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">Password Reset Successfully!</h3>
                  <p className="text-sm text-[#475569]">You can now login with your new password.</p>
                </div>
                <button onClick={() => navigate('/employee/login')} className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all">
                  <FiArrowLeft size={14} /> Go to Login
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#94A3B8] mt-6">&copy; {new Date().getFullYear()} AttendNest. All rights reserved.</p>
      </div>
    </div>
  );
};
export default ForgotPassword;
