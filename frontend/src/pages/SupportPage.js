import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiHelpCircle, FiBook, FiSettings, FiAlertCircle, FiMapPin, FiLock, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const SupportPage = () => {
  const navigate = useNavigate();
  const [openGuide, setOpenGuide] = useState(null);

  useEffect(() => {
    document.title = 'Support & Help Center - Attendance Management System | Documentation';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get help with the Attendance Management System. Find troubleshooting guides, how-to documentation, common issues, and step-by-step instructions for employees and administrators.');
    }
  }, []);

  const toggleGuide = (index) => {
    setOpenGuide(openGuide === index ? null : index);
  };

  const guides = [
    {
      icon: <FiCheckCircle className="text-3xl text-green-600" />,
      title: 'How to Mark Attendance',
      category: 'Getting Started',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Step-by-Step Guide:</h4>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
            <li>
              <strong>Login:</strong> Go to the employee login page and enter your Employee ID and password.
            </li>
            <li>
              <strong>Allow Location Permissions:</strong> When prompted, click "Allow" to grant location access. 
              This is required for GPS verification.
            </li>
            <li>
              <strong>Check GPS Accuracy:</strong> The system will show your current GPS accuracy. Wait for 
              it to be within acceptable limits (usually 50-300 meters).
            </li>
            <li>
              <strong>Check In:</strong> Once at the office location with good GPS accuracy, click the "Check In" button.
            </li>
            <li>
              <strong>Wait for Confirmation:</strong> The system will verify your location and device, then confirm 
              your attendance with a success message.
            </li>
            <li>
              <strong>Check Out:</strong> When leaving, click the "Check Out" button to complete your attendance 
              for the day.
            </li>
          </ol>
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Make sure you're connected to a stable internet connection and have good GPS 
              signal (preferably near windows or outdoors) for best results.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: <FiMapPin className="text-3xl text-blue-600" />,
      title: 'Troubleshooting GPS Issues',
      category: 'Troubleshooting',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Common GPS Problems and Solutions:</h4>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <h5 className="font-semibold text-yellow-900 mb-2">Problem: GPS accuracy too low</h5>
            <p className="text-yellow-800 mb-2">Solutions:</p>
            <ul className="list-disc list-inside text-yellow-800 space-y-1 ml-4">
              <li>Move near a window or go outdoors</li>
              <li>Wait a few moments for GPS to stabilize</li>
              <li>Ensure location services are enabled in your device settings</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <h5 className="font-semibold text-red-900 mb-2">Problem: Location too far from office</h5>
            <p className="text-red-800 mb-2">Solutions:</p>
            <ul className="list-disc list-inside text-red-800 space-y-1 ml-4">
              <li>Ensure you are physically at the office location</li>
              <li>Your GPS may be inaccurate - improve GPS signal quality</li>
              <li>If you are at the office but getting this error, contact your administrator</li>
              <li>Check if you're supposed to mark WFH (Work From Home) instead</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <h5 className="font-semibold text-green-900 mb-2">Problem: Location permission denied</h5>
            <p className="text-green-800 mb-2">Solutions:</p>
            <ul className="list-disc list-inside text-green-800 space-y-1 ml-4">
              <li>Click the location icon in your browser's address bar</li>
              <li>Change the setting from "Block" to "Allow"</li>
              <li>Refresh the page and try again</li>
              <li>Check your browser's privacy settings</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      icon: <FiLock className="text-3xl text-purple-600" />,
      title: 'Password Reset Guide',
      category: 'Account Management',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">How to Reset Your Password:</h4>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
            <li>Go to the employee login page and click "Forgot Password"</li>
            <li>Enter your Employee ID and registered email address</li>
            <li>Click "Send OTP" to receive a one-time password via email</li>
            <li>Check your email inbox (and spam folder) for the OTP</li>
            <li>Enter the 6-digit OTP in the verification field</li>
            <li>Create a new strong password (minimum 8 characters)</li>
            <li>Confirm your new password and click "Reset Password"</li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h5 className="font-semibold text-blue-900 mb-2">Password Requirements:</h5>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
              <li>Minimum 8 characters long</li>
              <li>Use a mix of letters, numbers, and symbols</li>
              <li>Don't reuse old passwords</li>
              <li>Don't share your password with anyone</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-yellow-800">
              <strong>OTP not received?</strong> Check your spam folder, verify your email address is correct, 
              and wait a few minutes. OTPs are valid for 10 minutes.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: <FiAlertCircle className="text-3xl text-red-600" />,
      title: 'Common Error Messages',
      category: 'Troubleshooting',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Understanding Error Messages:</h4>
          
          <div className="space-y-4">
            <div className="border-l-4 border-red-400 bg-red-50 p-4">
              <h5 className="font-semibold text-red-900">❌ "Already checked in today"</h5>
              <p className="text-red-800 mt-2">
                You've already marked your check-in for today. You can only check in once per day.
              </p>
            </div>

            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
              <h5 className="font-semibold text-yellow-900">⏱️ "Too early to check in"</h5>
              <p className="text-yellow-800 mt-2">
                You're trying to check in before the allowed time window. Wait until the configured check-in time.
              </p>
            </div>

            <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
              <h5 className="font-semibold text-blue-900">📍 "GPS accuracy too low"</h5>
              <p className="text-blue-800 mt-2">
                Your device's GPS accuracy doesn't meet requirements. Move to a location with better GPS signal.
              </p>
            </div>

            <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
              <h5 className="font-semibold text-purple-900">📡 "Network validation failed"</h5>
              <p className="text-purple-800 mt-2">
                You're not connected to the office network. Connect to the office Wi-Fi or check with your admin.
              </p>
            </div>

            <div className="border-l-4 border-pink-400 bg-pink-50 p-4">
              <h5 className="font-semibold text-pink-900">🔒 "Device not recognized"</h5>
              <p className="text-pink-800 mt-2">
                This is a new or unrecognized device. The system will register it. Contact admin if you see this repeatedly.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <FiSettings className="text-3xl text-indigo-600" />,
      title: 'Work From Home (WFH) Attendance',
      category: 'Features',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">How to Mark WFH Attendance:</h4>
          <p className="text-gray-700">
            If your organization has enabled Work From Home attendance tracking:
          </p>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
            <li>Login to your employee dashboard</li>
            <li>Look for the "Mark WFH Attendance" button or option</li>
            <li>Click the WFH attendance button</li>
            <li>The system may have relaxed location requirements for WFH</li>
            <li>Confirm your WFH attendance</li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h5 className="font-semibold text-blue-900 mb-2">WFH vs Office Attendance:</h5>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
              <li>WFH attendance may have different validation rules</li>
              <li>GPS requirements may be more flexible</li>
              <li>Network validation may not be required</li>
              <li>WFH days are tracked separately in reports</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> WFH attendance policies vary by organization. Check with your 
              administrator for specific WFH rules and requirements.
            </p>
          </div>
        </div>
      )
    },
    {
      icon: <FiBook className="text-3xl text-teal-600" />,
      title: 'Viewing Attendance History',
      category: 'Features',
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">How to View Your Attendance Records:</h4>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
            <li>Login to your employee dashboard</li>
            <li>Click on "Attendance" or "Attendance History" in the navigation menu</li>
            <li>You'll see a table with your complete attendance history</li>
            <li>Use filters to view specific date ranges or attendance status</li>
            <li>Check your attendance statistics and summaries</li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h5 className="font-semibold text-blue-900 mb-2">Attendance Status Types:</h5>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4">
              <li><strong>Present:</strong> You checked in on time</li>
              <li><strong>Late:</strong> You checked in after the grace period</li>
              <li><strong>Absent:</strong> No attendance was marked</li>
              <li><strong>WFH:</strong> Work from home attendance</li>
              <li><strong>Holiday:</strong> Government or office holiday</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-green-800">
              <strong>Need a Report?</strong> If you need an official attendance report, contact your 
              administrator. They can generate detailed PDF or Excel reports for you.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <FiCheckCircle className="text-3xl text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">Attendance Management System</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="text-gray-700 hover:text-blue-600 font-medium">Home</button>
              <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-blue-600 font-medium">About</button>
              <button onClick={() => navigate('/features')} className="text-gray-700 hover:text-blue-600 font-medium">Features</button>
              <button onClick={() => navigate('/faq')} className="text-gray-700 hover:text-blue-600 font-medium">FAQ</button>
              <button onClick={() => navigate('/contact')} className="text-gray-700 hover:text-blue-600 font-medium">Contact</button>
              <button
                onClick={() => navigate('/employee/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <FiHelpCircle className="text-6xl text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Support & Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers, troubleshooting guides, and step-by-step documentation
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/faq')}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg hover:shadow-lg transition-shadow text-left"
            >
              <FiHelpCircle className="text-4xl text-blue-600 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">FAQ</h3>
              <p className="text-gray-700">Frequently asked questions and quick answers</p>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg hover:shadow-lg transition-shadow text-left"
            >
              <FiCheckCircle className="text-4xl text-green-600 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-700">Get help from our support team</p>
            </button>
            <button
              onClick={() => navigate('/employee/login')}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg hover:shadow-lg transition-shadow text-left"
            >
              <FiLock className="text-4xl text-purple-600 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login</h3>
              <p className="text-gray-700">Access your employee account</p>
            </button>
          </div>
        </div>
      </section>

      {/* Guides and Documentation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Documentation & Guides</h2>
          <div className="space-y-4">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleGuide(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="mr-4">{guide.icon}</div>
                    <div>
                      <div className="text-sm text-blue-600 font-semibold mb-1">{guide.category}</div>
                      <h3 className="text-xl font-bold text-gray-900">{guide.title}</h3>
                    </div>
                  </div>
                  {openGuide === index ? (
                    <FiChevronUp className="text-2xl text-blue-600 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="text-2xl text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openGuide === index && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <div className="pt-6">
                      {guide.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/faq')}
              className="px-8 py-3 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-lg border-2 border-blue-600"
            >
              View FAQ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FiCheckCircle className="text-2xl text-blue-400 mr-2" />
                <span className="text-xl font-bold">AMS</span>
              </div>
              <p className="text-gray-400">
                Modern attendance management for modern organizations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Pages</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => navigate('/about')} className="text-gray-400 hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => navigate('/features')} className="text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/faq')} className="text-gray-400 hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => navigate('/support')} className="text-gray-400 hover:text-white transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/employee/login')} className="text-gray-400 hover:text-white transition-colors">Login</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/privacy-policy')} className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms-and-conditions')} className="text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Attendance Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SupportPage;
