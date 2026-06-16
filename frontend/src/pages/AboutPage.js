import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiTarget, FiHeart, FiTrendingUp, FiShield } from 'react-icons/fi';

const AboutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'About Us - Attendance Management System | Employee Tracking Solution';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn about our comprehensive Attendance Management System. We provide secure employee attendance tracking with GPS verification, work-from-home support, and real-time reporting for modern organizations.');
    }
  }, []);

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
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About Our Attendance Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Building the future of employee attendance tracking with innovative technology and security-first approach
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-4">
                Our mission is to revolutionize employee attendance management by providing organizations 
                with a comprehensive, secure, and user-friendly solution that adapts to modern work environments.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                We believe that attendance tracking should be effortless, accurate, and transparent. Our system 
                eliminates manual processes, reduces errors, and provides real-time insights that help organizations 
                make better workforce management decisions.
              </p>
              <p className="text-lg text-gray-700">
                Whether your team works from the office, remotely, or in a hybrid model, our attendance management 
                system ensures accurate tracking while maintaining employee privacy and data security.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-12 rounded-lg">
              <FiTarget className="text-6xl text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-lg text-gray-700">
                To become the most trusted attendance management solution globally, empowering organizations 
                to manage their workforce efficiently while fostering a culture of transparency and accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <FiShield className="text-5xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Security First</h3>
              <p className="text-gray-700">
                We prioritize data security and privacy with device fingerprinting, OTP authentication, 
                and comprehensive audit trails to protect sensitive employee information.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <FiHeart className="text-5xl text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">User-Centric Design</h3>
              <p className="text-gray-700">
                Our system is designed with both employees and administrators in mind, providing 
                intuitive interfaces and seamless experiences across all devices.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <FiTrendingUp className="text-5xl text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Continuous Innovation</h3>
              <p className="text-gray-700">
                We constantly evolve our platform with new features, integrations, and improvements 
                to meet the changing needs of modern workplaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Our System?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <FiCheckCircle className="text-2xl text-green-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">GPS-Based Verification</h3>
                <p className="text-gray-700">
                  Ensure employees are at the correct location with GPS-based attendance validation 
                  and configurable accuracy thresholds for flexibility.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-2xl text-green-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Work From Home Support</h3>
                <p className="text-gray-700">
                  Seamlessly track attendance for remote workers with dedicated WFH attendance 
                  rules and flexible validation options.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-2xl text-green-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Reporting</h3>
                <p className="text-gray-700">
                  Generate comprehensive attendance reports instantly with PDF and Excel export 
                  capabilities for easy sharing and analysis.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-2xl text-green-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Processes</h3>
                <p className="text-gray-700">
                  Automatic late marking, absent record creation, and auto-checkout features 
                  reduce administrative overhead and ensure data accuracy.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-2xl text-green-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Security</h3>
                <p className="text-gray-700">
                  Device fingerprinting, OTP verification, audit logs, and rate limiting protect 
                  against unauthorized access and fraudulent attendance.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="text-2xl text-green-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Holiday Management</h3>
                <p className="text-gray-700">
                  Configure government and office holidays with automatic attendance rule adjustments 
                  to ensure accurate tracking during non-working days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Attendance Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join organizations that trust our system for accurate, secure, and efficient employee attendance tracking
          </p>
          <button
            onClick={() => navigate('/employee/login')}
            className="px-8 py-4 bg-white text-blue-600 text-lg rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
          >
            Get Started Today
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

export default AboutPage;
