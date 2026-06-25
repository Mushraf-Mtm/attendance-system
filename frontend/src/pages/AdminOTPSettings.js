import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import { Spinner } from '../components/Loader';
import { getOTPSettings, updateOTPSettings } from '../services/api';
import { FiSave, FiRefreshCw, FiClock, FiShield, FiAlertCircle, FiInfo } from 'react-icons/fi';

const Field = ({ label, hint, error, icon: Icon, children }) => (
  <div>
    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">{label}</label>
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Icon size={14} className="text-[#64748B]" /></div>}
      <div className={Icon ? 'pl-9' : ''}>{children}</div>
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    {hint && !error && <p className="mt-1.5 text-xs text-[#475569]">{hint}</p>}
  </div>
);

const AdminOTPSettings = () => {
  const [loading, setSaving_] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ otp_expiry_minutes:5, otp_resend_seconds:60, otp_max_attempts:3, otp_requests_per_hour:5 });
  const [originalSettings, setOriginalSettings] = useState(null);
  const [errors, setErrors] = useState({});
  const [alertDialog, setAlertDialog] = useState({ isOpen:false, title:'', message:'', type:'success' });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setSaving_(true);
      const response = await getOTPSettings();
      if (response.data.success) { setSettings(response.data.settings); setOriginalSettings(response.data.settings); }
    } catch (error) {
      setAlertDialog({ isOpen:true, title:'Error', message: error.response?.data?.message || 'Failed to load OTP settings', type:'error' });
    } finally { setSaving_(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: parseInt(value) || 0 });
    if (errors[name]) setErrors({ ...errors, [name]:'' });
  };

  const validateSettings = () => {
    const newErrors = {};
    if (settings.otp_expiry_minutes < 1 || settings.otp_expiry_minutes > 60) newErrors.otp_expiry_minutes = 'Must be 1–60 minutes';
    if (settings.otp_resend_seconds < 30 || settings.otp_resend_seconds > 300) newErrors.otp_resend_seconds = 'Must be 30–300 seconds';
    if (settings.otp_max_attempts < 1 || settings.otp_max_attempts > 10) newErrors.otp_max_attempts = 'Must be 1–10 attempts';
    if (settings.otp_requests_per_hour < 1 || settings.otp_requests_per_hour > 20) newErrors.otp_requests_per_hour = 'Must be 1–20 requests';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateSettings()) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'Please fix the errors before saving', type:'error' }); return; }
    setSaving(true);
    try {
      const response = await updateOTPSettings(settings);
      if (response.data.success) { setOriginalSettings(settings); setAlertDialog({ isOpen:true, title:'Success', message:'OTP settings updated successfully! Changes apply immediately.', type:'success' }); }
    } catch (error) {
      setAlertDialog({ isOpen:true, title:'Error', message: error.response?.data?.message || 'Failed to update OTP settings', type:'error' });
    } finally { setSaving(false); }
  };

  const handleReset = () => { setSettings(originalSettings); setErrors({}); };
  const hasChanges = () => originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) return <div className="flex h-screen bg-[#0E1320]"><Sidebar /><div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div></div>;

  const FIELDS = [
    { name:'otp_expiry_minutes',    icon:FiClock,       label:'OTP Expiry Time (Minutes)',      hint:'How long an OTP remains valid (1–60 min)',             min:1,  max:60  },
    { name:'otp_resend_seconds',    icon:FiRefreshCw,   label:'Resend Cooldown (Seconds)',       hint:'Minimum wait before OTP can be resent (30–300 sec)',   min:30, max:300 },
    { name:'otp_max_attempts',      icon:FiShield,      label:'Maximum Verification Attempts',   hint:'Failed attempts before OTP is invalidated (1–10)',     min:1,  max:10  },
    { name:'otp_requests_per_hour', icon:FiAlertCircle, label:'Requests Per Hour (Rate Limit)',  hint:'Max OTP requests per employee per hour (1–20)',        min:1,  max:20  },
  ];

  const RECOMMENDED = [
    { label:'Expiry', value:'5 min' }, { label:'Resend', value:'60 sec' },
    { label:'Attempts', value:'3 max' }, { label:'Rate', value:'5 / hr' },
  ];

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto dark-scroll">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">OTP Settings</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">Configure OTP security parameters for password management</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Info banner */}
            <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <FiInfo size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300/80">Changes apply immediately. Users with active OTPs continue using old settings until they request a new one.</p>
            </div>

            {/* Fields */}
            <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center"><FiShield size={16} /></div>
                <h2 className="text-sm font-bold text-white">Security Configuration</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {FIELDS.map(({ name, icon, label, hint, min, max }) => (
                  <Field key={name} label={label} hint={hint} error={errors[name]} icon={icon}>
                    <input
                      type="number" name={name} value={settings[name]} onChange={handleChange}
                      min={min} max={max} required
                      className={`admin-input ${icon ? 'pl-9' : ''} ${errors[name] ? 'border-red-500/50' : ''}`}
                      style={icon ? { paddingLeft:'2.25rem' } : {}}
                    />
                  </Field>
                ))}
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
              <div className="px-6 py-4 border-b border-white/[0.06]"><h2 className="text-sm font-bold text-white">Security Guidelines</h2></div>
              <div className="p-6 space-y-3">
                {[
                  ['Shorter expiry times', 'are more secure but may inconvenience users'],
                  ['Higher resend cooldowns', 'prevent OTP spam and brute-force attacks'],
                  ['Lower max attempts', 'improve security but may frustrate legitimate users'],
                  ['Stricter rate limits', 'protect against abuse but may impact user experience'],
                ].map(([bold, rest]) => (
                  <div key={bold} className="flex items-start gap-2 text-xs text-[#64748B]">
                    <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                    <p><span className="font-semibold text-[#CBD5E1]">{bold}</span> {rest}</p>
                  </div>
                ))}
              </div>
              {/* Recommended pill row */}
              <div className="px-6 pb-6">
                <div className="flex gap-3 p-4 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-2xl">
                  <FiShield size={15} className="text-[#60A5FA] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#CBD5E1] mb-3">Recommended Defaults</p>
                    <div className="grid grid-cols-4 gap-3">
                      {RECOMMENDED.map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <p className="text-xs text-[#64748B]">{label}</p>
                          <p className="text-sm font-bold text-[#60A5FA]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hasChanges() && <p className="text-xs text-amber-400 text-center">You have unsaved changes</p>}

            <div className="flex gap-3 pb-6">
              <button type="button" onClick={handleReset} disabled={!hasChanges() || saving}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#94A3B8] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <FiRefreshCw size={14} /> Reset
              </button>
              <button type="submit" disabled={!hasChanges() || saving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-blue-500 rounded-xl shadow-glow-blue-sm hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all">
                {saving ? <><Spinner size="sm" color="white" /> Saving…</> : <><FiSave size={14} /> Save Settings</>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog({ ...alertDialog, isOpen:false })} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
};

export default AdminOTPSettings;
