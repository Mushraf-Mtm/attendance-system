import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiMapPin, FiClock, FiUsers, FiCalendar, FiFileText, FiShield, FiLock, FiBarChart2, FiSmartphone, FiWifi, FiAlertCircle } from 'react-icons/fi';

const FeaturesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Features - AttendNest | GPS Tracking & Reporting';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover AttendNest features: GPS attendance tracking, employee management, automated reports, holiday management, OTP security, device fingerprinting, audit logs, and work-from-home support.');
    }
  }, []);

  const features = [
    {
      icon: <FiMapPin className="text-5xl text-blue-600" />,
      title: 'GPS Attendance Tracking',
      description: 'Verify employee location with GPS-based attendance validation. Configure accuracy thresholds and location boundaries to ensure employees check-in from the correct office location.',
      benefits: ['Real-time location verification', 'Configurable accuracy thresholds', 'Prevent proxy attendance', 'Support for multiple office locations']
    },
    {
      icon: <FiClock className="text-5xl text-green-600" />,
      title: 'Automated Check-In & Check-Out',
      description: 'Streamlined attendance marking with automatic timestamp recording. Employees can check-in and check-out with a single tap, and the system automatically tracks working hours.',
      benefits: ['One-tap attendance marking', 'Automatic working hours calculation', 'Late arrival detection', 'Auto-checkout at end of day']
    },
    {
      icon: <FiUsers className="text-5xl text-purple-600" />,
      title: 'Employee Management',
      description: 'Comprehensive employee management system with profiles, departments, roles, and contact information. Administrators can easily add, update, or deactivate employee accounts.',
      benefits: ['Complete employee profiles', 'Department organization', 'Role-based access control', 'Bulk employee operations']
    },
    {
      icon: <FiCalendar className="text-5xl text-yellow-600" />,
      title: 'Holiday Management',
      description: 'Configure government and office holidays with automatic attendance rule adjustments. The system prevents check-in on holidays and marks appropriate attendance status.',
      benefits: ['Government holiday calendar', 'Custom office holidays', 'Automatic attendance rules', 'Holiday notifications']
    },
    {
      icon: <FiFileText className="text-5xl text-indigo-600" />,
      title: 'Attendance Reports & Analytics',
      description: 'Generate detailed attendance reports with customizable date ranges. Export reports in PDF and Excel formats for easy sharing and analysis.',
      benefits: ['Customizable date ranges', 'PDF & Excel export', 'Employee-wise reports', 'Attendance statistics & insights']
    },
    {
      icon: <FiShield className="text-5xl text-red-600" />,
      title: 'Device Fingerprinting & Security',
      description: 'Advanced device fingerprinting technology identifies unique devices and prevents unauthorized access. Track device changes and monitor suspicious activities.',
      benefits: ['Unique device identification', 'Device change alerts', 'Prevent device sharing', 'Security audit trails']
    },
    {
      icon: <FiLock className="text-5xl text-pink-600" />,
      title: 'OTP Authentication',
      description: 'Secure password reset and authentication with OTP verification via email. Configurable OTP validity and rate limiting prevent abuse.',
      benefits: ['Email-based OTP', 'Configurable OTP validity', 'Rate limiting protection', 'Secure password reset']
    },
    {
      icon: <FiBarChart2 className="text-5xl text-teal-600" />,
      title: 'Real-Time Dashboard',
      description: 'Monitor attendance in real-time with intuitive dashboards for both administrators and employees. View today\'s attendance, statistics, and recent activities at a glance.',
      benefits: ['Real-time attendance stats', 'Present/Absent overview', 'Late arrivals tracking', 'Visual analytics']
    },
    {
      icon: <FiWifi className="text-5xl text-cyan-600" />,
      title: 'Network Validation',
      description: 'Additional security layer with IP-based network validation. Restrict attendance marking to office networks or approved IP addresses.',
      benefits: ['Office network detection', 'IP whitelist support', 'Network-based restrictions', 'Flexible validation rules']
    },
    {
      icon: <FiSmartphone className="text-5xl text-orange-600" />,
      title: 'Mobile Responsive Design',
      description: 'Fully responsive design works seamlessly on all devices. Employees can mark attendance from smartphones, tablets, or desktop computers.',
      benefits: ['Mobile-first design', 'Touch-optimized interface', 'Works on all screen sizes', 'Native app experience']
    },
    {
      icon: <FiAlertCircle className="text-5xl text-rose-600" />,
      title: 'Audit Logs & Monitoring',
      description: 'Comprehensive audit logging tracks all system activities. Monitor login attempts, attendance changes, and security events with detailed logs.',
      benefits: ['Complete activity tracking', 'Security event monitoring', 'Failed login alerts', 'Detailed audit reports']
    },
    {
      icon: <FiCheckCircle className="text-5xl text-emerald-600" />,
      title: 'Work From Home Support',
      description: 'Dedicated WFH attendance tracking with flexible validation rules. Support hybrid work models with separate policies for office and remote work.',
      benefits: ['WFH attendance marking', 'Flexible validation rules', 'Hybrid work support', 'Remote work analytics']
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
              <span className="text-xl font-bold text-gray-800">AttendNest</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="text-gray-700 hover:text-blue-600 font-medium">Home</button>
              <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-blue-600 font-medium">About</button>
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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful Features for Modern Attendance Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage employee attendance efficiently, securely, and accurately
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <FiCheckCircle className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Organizations Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Administrators</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Complete employee management dashboard</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Real-time attendance monitoring</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Customizable attendance policies</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Comprehensive reporting and analytics</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Security logs and audit trails</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Employees</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Simple one-tap check-in and check-out</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">View attendance history and statistics</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Mobile-friendly interface</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Profile management and password reset</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Clear feedback on attendance status</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Experience All Features Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start using our comprehensive attendance management system
          </p>
          <button
            onClick={() => navigate('/employee/login')}
            className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FiCheckCircle className="text-2xl text-blue-400 mr-2" />
                <span className="text-xl font-bold">AttendNest</span>
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
            <p>&copy; {new Date().getFullYear()} AttendNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
