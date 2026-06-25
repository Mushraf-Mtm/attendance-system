import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import { requestPasswordChange, completePasswordChange, resendOTP } from '../services/api';
import { FiLock, FiEye, FiEyeOff, FiKey, FiClock, FiMail, FiShield, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Loader';

const ChangePassword = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ currentPassword:'', otp:'', newPassword:'', confirmNewPassword:'' });
  const [showPasswords, setShowPasswords] = useState({ current:false, new:false, confirm:false });
  const [maskedEmail, setMaskedEmail] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [countdown, setCountdown] = useState(0);
  const [alertDialog, setAlertDialog] = useState({ isOpen:false, title:'', message:'', type:'success' });

  React.useEffect(() => {
    let timer;
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'Please enter your current password', type:'error' }); return; }
    setLoading(true);
    try {
      const response = await requestPasswordChange(formData.currentPassword);
      if (response.data.success) {
        setMaskedEmail(response.data.maskedEmail); setExpiryMinutes(response.data.expiresInMinutes); setCountdown(60); setStep(2);
        setAlertDialog({ isOpen:true, title:'OTP Sent', message:`OTP has been sent to ${response.data.maskedEmail}`, type:'success' });
      }
    } catch (error) {
      setAlertDialog({ isOpen:true, title:'Error', message: error.response?.data?.message || 'Failed to send OTP. Please try again.', type:'error' });
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!formData.otp || !formData.newPassword || !formData.confirmNewPassword) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'All fields are required', type:'error' }); return; }
    if (formData.newPassword !== formData.confirmNewPassword) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'New password and confirm password do not match', type:'error' }); return; }
    setLoading(true);
    try {
      const response = await completePasswordChange(formData.otp, formData.newPassword, formData.confirmNewPassword);
      if (response.data.success) {
        setAlertDialog({ isOpen:true, title:'Success', message:'Password changed successfully!', type:'success' });
        setTimeout(() => { setStep(1); setFormData({ currentPassword:'', otp:'', newPassword:'', confirmNewPassword:'' }); }, 2000);
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      setAlertDialog({ isOpen:true, title:'Error', message: errors ? errors.join(', ') : error.response?.data?.message || 'Failed to change password', type:'error' });
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const response = await resendOTP(userData.email, 'password_change');
      if (response.data.success) { setCountdown(60); setAlertDialog({ isOpen:true, title:'OTP Resent', message:'A new OTP has been sent to your email', type:'success' }); }
    } catch (error) {
      setAlertDialog({ isOpen:true, title:'Error', message: error.response?.data?.message || 'Failed to resend OTP', type:'error' });
    } finally { setLoading(false); }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength:0, label:'', color:'' };
    let s = 0;
    if (password.length >= 8) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    const labels = ['','Weak','Fair','Good','Strong','Very Strong'];
    const colors = ['','bg-red-500','bg-orange-500','bg-yellow-500','bg-emerald-500','bg-emerald-600'];
    const textColors = ['','text-red-600','text-orange-600','text-yellow-600','text-emerald-600','text-emerald-700'];
    return { strength:(s/5)*100, label:labels[s], color:colors[s], textColor:textColors[s] };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const PwReq = ({ met, label }) => (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${met ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F1F5F9] text-[#CBD5E1]'}`}>
        <FiCheck size={10} />
      </span>
      <span className={met ? 'text-emerald-700' : 'text-[#94A3B8]'}>{label}</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#0F172A]">Change Password</h1>
            <p className="text-sm text-[#475569] mt-0.5">Update your account password securely</p>
          </div>

          <div className="max-w-lg">
            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-6">
              {[1, 2].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 ${step >= s ? 'text-[#2563EB]' : 'text-[#CBD5E1]'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step > s ? 'bg-[#2563EB] border-[#2563EB] text-white' : step === s ? 'border-[#2563EB] text-[#2563EB]' : 'border-[#E2E8F0] text-[#CBD5E1]'}`}>
                      {step > s ? <FiCheck size={13} /> : s}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block">{s === 1 ? 'Verify Password' : 'Enter OTP & New Password'}</span>
                  </div>
                  {i < 1 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${step > 1 ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />}
                </React.Fragment>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-clay overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiShield size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Secure Password Change</h2>
                    <p className="text-sm text-blue-200 mt-0.5">
                      {step === 1 ? 'Verify your current password' : `OTP sent to ${maskedEmail}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Step 1 */}
                {step === 1 && (
                  <form onSubmit={handleRequestOTP} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Current Password</label>
                      <div className="relative">
                        <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                        <input type={showPasswords.current ? 'text' : 'password'} name="currentPassword" value={formData.currentPassword} onChange={handleChange}
                          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3 pl-12 pr-12 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all" 
                          placeholder="Enter your current password" required />
                        <button type="button" onClick={() => toggleShow('current')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                          {showPasswords.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all">
                      {loading ? <><Spinner size="sm" color="white" /> Verifying…</> : <><FiKey size={16} /> Verify & Send OTP</>}
                    </button>
                  </form>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    {/* OTP info banner */}
                    <div className="flex items-start gap-3 bg-[#2563EB]/8 border border-[#2563EB]/20 rounded-xl p-4">
                      <FiMail size={16} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-[#0F172A]">OTP sent to:</p>
                        <p className="text-sm font-bold text-[#2563EB]">{maskedEmail}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">Valid for {expiryMinutes} minutes</p>
                      </div>
                    </div>

                    {/* OTP input */}
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Enter OTP</label>
                      <input type="text" name="otp" value={formData.otp} onChange={handleChange}
                        className="emp-input text-center text-2xl font-mono tracking-widest" placeholder="000000" maxLength="6" required autoFocus />
                      <div className="mt-2 text-right">
                        <button type="button" onClick={handleResendOTP} disabled={countdown > 0 || loading}
                          className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 disabled:text-[#CBD5E1] disabled:cursor-not-allowed transition-colors">
                          {countdown > 0 ? <span className="flex items-center gap-1 justify-end"><FiClock size={12} /> Resend in {countdown}s</span> : 'Resend OTP'}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">New Password</label>
                      <div className="relative">
                        <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                        <input type={showPasswords.new ? 'text' : 'password'} name="newPassword" value={formData.newPassword} onChange={handleChange}
                          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3 pl-12 pr-12 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all" 
                          placeholder="Enter new password" required />
                        <button type="button" onClick={() => toggleShow('new')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                          {showPasswords.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      {formData.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[#94A3B8]">Strength:</span>
                            <span className={`font-semibold ${passwordStrength.textColor}`}>{passwordStrength.label}</span>
                          </div>
                          <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
                            <div className={`${passwordStrength.color} h-1.5 rounded-full transition-all duration-300`} style={{ width:`${passwordStrength.strength}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Confirm New Password</label>
                      <div className="relative">
                        <FiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                        <input type={showPasswords.confirm ? 'text' : 'password'} name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange}
                          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl py-3 pl-12 pr-12 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all" 
                          placeholder="Confirm new password" required />
                        <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                          {showPasswords.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      {formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword && (
                        <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                      )}
                    </div>

                    {/* Password requirements */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-[#475569] mb-3">Password requirements:</p>
                      <PwReq met={formData.newPassword.length >= 8}         label="At least 8 characters"  />
                      <PwReq met={/[A-Z]/.test(formData.newPassword)}       label="One uppercase letter"   />
                      <PwReq met={/[a-z]/.test(formData.newPassword)}       label="One lowercase letter"   />
                      <PwReq met={/[0-9]/.test(formData.newPassword)}       label="One number"             />
                      <PwReq met={/[^a-zA-Z0-9]/.test(formData.newPassword)} label="One special character" />
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setStep(1); setFormData({ ...formData, otp:'', newPassword:'', confirmNewPassword:'' }); }}
                        className="flex-1 px-4 py-3 text-sm font-semibold text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl hover:bg-[#E2E8F0] transition-colors">
                        Back
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all">
                        {loading ? <><Spinner size="sm" color="white" /> Changing…</> : <><FiKey size={15} /> Change Password</>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog({ ...alertDialog, isOpen:false })} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
};

// Internal helper - defined outside component to avoid re-render issues
const PwReq = ({ met, label }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${met ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F1F5F9] text-[#CBD5E1]'}`}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </span>
    <span className={met ? 'text-emerald-700 font-medium' : 'text-[#94A3B8]'}>{label}</span>
  </div>
);

export default ChangePassword;
