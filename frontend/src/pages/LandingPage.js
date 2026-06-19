import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMapPin, FiHome, FiUsers, FiCalendar, FiFileText, FiShield, FiBarChart2, FiLock } from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiCheckCircle className="text-4xl text-blue-600" />,
      title: 'Employee Attendance Tracking',
      description: 'Track employee attendance in real-time with automated check-in and check-out system'
    },
    {
      icon: <FiClock className="text-4xl text-green-600" />,
      title: 'Check-In & Check-Out',
      description: 'Easy and secure employee check-in/check-out with timestamp recording'
    },
    {
      icon: <FiMapPin className="text-4xl text-red-600" />,
      title: 'GPS Attendance Verification',
      description: 'Verify employee location with GPS-based attendance validation'
    },
    {
      icon: <FiHome className="text-4xl text-purple-600" />,
      title: 'Work From Home Attendance',
      description: 'Support for remote work with WFH attendance tracking and management'
    },
    {
      icon: <FiUsers className="text-4xl text-indigo-600" />,
      title: 'Employee Management',
      description: 'Complete employee management with profiles, departments, and roles'
    },
    {
      icon: <FiCalendar className="text-4xl text-yellow-600" />,
      title: 'Holiday Management',
      description: 'Manage government and office holidays with automatic attendance rules'
    },
    {
      icon: <FiFileText className="text-4xl text-teal-600" />,
      title: 'Attendance Reports',
      description: 'Generate detailed attendance reports with PDF and Excel export'
    },
    {
      icon: <FiLock className="text-4xl text-pink-600" />,
      title: 'OTP Verification',
      description: 'Secure password reset and authentication with OTP verification'
    },
    {
      icon: <FiShield className="text-4xl text-orange-600" />,
      title: 'Security Monitoring',
      description: 'Advanced security with device fingerprinting and audit logs'
    },
    {
      icon: <FiBarChart2 className="text-4xl text-cyan-600" />,
      title: 'Attendance Analytics',
      description: 'Real-time analytics and insights for attendance data'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* SEO Meta Tags (will be added via React Helmet) */}
      
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <FiCheckCircle className="text-3xl text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">AttendNest</span>
            </div>
            <div className="flex items-center space-x-4">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AttendNest - Employee Attendance Management System
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Manage employee attendance efficiently with secure check-in, check-out, GPS attendance tracking, 
            work-from-home support, attendance reports, and employee management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/employee/login')}
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
            >
              Login
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-lg border-2 border-blue-600"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage employee attendance effectively
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                About Our System
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                AttendNest is a comprehensive solution designed to streamline 
                employee attendance tracking and management. Built with modern technology and security 
                best practices, it provides organizations with powerful tools to monitor and manage 
                workforce attendance efficiently.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                The system supports both office-based and remote work scenarios, with GPS verification, 
                network validation, and flexible attendance policies. Administrators can manage employees, 
                generate reports, and monitor attendance patterns in real-time.
              </p>
              <p className="text-lg text-gray-700">
                With features like automatic late marking, holiday management, OTP-based security, and 
                detailed audit logs, our system ensures accuracy, security, and compliance in attendance 
                management.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                  <span className="text-gray-700">Real-time attendance tracking and monitoring</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                  <span className="text-gray-700">GPS and network-based validation</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                  <span className="text-gray-700">Automated reports and analytics</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                  <span className="text-gray-700">Secure authentication with OTP</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                  <span className="text-gray-700">Work from home support</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="text-green-600 text-xl mr-3 mt-1" />
                  <span className="text-gray-700">Mobile responsive design</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              System Screenshots
            </h2>
            <p className="text-xl text-gray-600">
              Get a glimpse of our powerful attendance management interface
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Screenshot Images */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/screenshots/employee-dashboard.png" 
                alt="Employee Dashboard - Check-in, check-out, and attendance history" 
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-8 h-64 flex-col items-center justify-center hidden">
                <FiUsers className="text-6xl text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Employee Dashboard</h3>
                <p className="text-gray-600 text-center mt-2">Check-in, check-out, and view attendance history</p>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/screenshots/admin-dashboard.png" 
                alt="Admin Dashboard - Monitor attendance and manage employees" 
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-8 h-64 flex-col items-center justify-center hidden">
                <FiBarChart2 className="text-6xl text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Admin Dashboard</h3>
                <p className="text-gray-600 text-center mt-2">Monitor attendance, manage employees, and view analytics</p>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/screenshots/attendance-reports.png" 
                alt="Attendance Reports - Generate detailed reports with export" 
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-8 h-64 flex-col items-center justify-center hidden">
                <FiFileText className="text-6xl text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Attendance Reports</h3>
                <p className="text-gray-600 text-center mt-2">Generate detailed reports with PDF and Excel export</p>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/screenshots/security-logs.png" 
                alt="Security Logs - Track device fingerprints and audit logs" 
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="bg-gradient-to-br from-red-100 to-red-200 p-8 h-64 flex-col items-center justify-center hidden">
                <FiShield className="text-6xl text-red-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Security Logs</h3>
                <p className="text-gray-600 text-center mt-2">Track device fingerprints, audit logs, and security events</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start managing your employee attendance efficiently today
          </p>
          <button
            onClick={() => navigate('/employee/login')}
            className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
          >
            Login Now
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

export default LandingPage;
