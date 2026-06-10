import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import { requestPasswordChange, completePasswordChange, resendOTP } from '../services/api';
import { FiLock, FiEye, FiEyeOff, FiKey, FiClock, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const [step, setStep] = useState(1); // 1: Current password, 2: OTP verification, 3: New password
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [maskedEmail, setMaskedEmail] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [countdown, setCountdown] = useState(0);
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  // Step 1: Submit current password and request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please enter your current password',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordChange(formData.currentPassword);
      
      if (response.data.success) {
        setMaskedEmail(response.data.maskedEmail);
        setExpiryMinutes(response.data.expiresInMinutes);
        setCountdown(60); // Default resend cooldown
        setStep(2);
        setAlertDialog({
          isOpen: true,
          title: 'OTP Sent',
          message: `OTP has been sent to ${response.data.maskedEmail}`,
          type: 'success'
        });
      }
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2 & 3: Verify OTP and change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.otp || !formData.newPassword || !formData.confirmNewPassword) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'All fields are required',
        type: 'error'
      });
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'New password and confirm password do not match',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await completePasswordChange(
        formData.otp,
        formData.newPassword,
        formData.confirmNewPassword
      );

      if (response.data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Password changed successfully!',
          type: 'success'
        });
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setStep(1);
          setFormData({
            currentPassword: '',
            otp: '',
            newPassword: '',
            confirmNewPassword: ''
          });
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      const errors = error.response?.data?.errors;
      
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: errors ? errors.join(', ') : errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);

    try {
      // Get user's email from sessionStorage
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const response = await resendOTP(userData.email, 'password_change');

      if (response.data.success) {
        setCountdown(60);
        setAlertDialog({
          isOpen: true,
          title: 'OTP Resent',
          message: 'A new OTP has been sent to your email',
          type: 'success'
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength],
      color: colors[strength]
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-4">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Change Password</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Update your account password</p>
          </div>

          {/* Main Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-6 sm:py-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 sm:p-4 rounded-full">
                    <FiLock className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Secure Password Change</h2>
                    <p className="text-blue-100 text-sm sm:text-base mt-1">
                      {step === 1 && 'Verify your current password'}
                      {step === 2 && 'Enter OTP sent to your email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="px-6 sm:px-8 py-6 sm:py-8">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} font-semibold`}>
                      1
                    </div>
                    <div className={`w-12 sm:w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} font-semibold`}>
                      2
                    </div>
                  </div>
                </div>

                {/* Step 1: Current Password */}
                {step === 1 && (
                  <form onSubmit={handleRequestOTP} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <FiKey />
                          <span>Verify & Send OTP</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP and New Password */}
                {step === 2 && (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    {/* Email Display */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex items-center">
                        <FiMail className="text-blue-600 text-xl mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">OTP sent to:</p>
                          <p className="text-lg font-semibold text-blue-600">{maskedEmail}</p>
                          <p className="text-xs text-blue-700 mt-1">Valid for {expiryMinutes} minutes</p>
                        </div>
                      </div>
                    </div>

                    {/* OTP Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none text-center text-2xl font-mono tracking-widest"
                        placeholder="000000"
                        maxLength="6"
                        required
                        autoFocus
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={countdown > 0 || loading}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {countdown > 0 ? (
                            <span className="flex items-center">
                              <FiClock className="mr-1" />
                              Resend in {countdown}s
                            </span>
                          ) : (
                            'Resend OTP'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Password Strength:</span>
                            <span className={`font-medium ${passwordStrength.label === 'Weak' ? 'text-red-600' : passwordStrength.label === 'Fair' ? 'text-orange-600' : passwordStrength.label === 'Good' ? 'text-yellow-600' : 'text-green-600'}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLock className="text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmNewPassword"
                          value={formData.confirmNewPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center">
                          <span className={`mr-2 ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          At least 8 characters
                        </li>
                        <li className="flex items-center">
                          <span className={`mr-2 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          One uppercase letter
                        </li>
                        <li className="flex items-center">
                          <span className={`mr-2 ${/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          One lowercase letter
                        </li>
                        <li className="flex items-center">
                          <span className={`mr-2 ${/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          One number
                        </li>
                        <li className="flex items-center">
                          <span className={`mr-2 ${/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}`}>✓</span>
                          One special character
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setFormData({ ...formData, otp: '', newPassword: '', confirmNewPassword: '' });
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Changing...</span>
                          </>
                        ) : (
                          <>
                            <FiKey />
                            <span>Change Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};

export default ChangePassword;
