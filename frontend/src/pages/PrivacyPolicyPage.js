import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiLock, FiMapPin, FiDatabase } from 'react-icons/fi';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy - Attendance Management System | Data Protection';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read our Privacy Policy to understand how we collect, use, and protect your data in our Attendance Management System. Learn about location data, security measures, and your rights.');
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
        <div className="max-w-4xl mx-auto text-center">
          <FiShield className="text-6xl text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            Your privacy and data security are our top priorities
          </p>
          <p className="text-sm text-gray-500 mt-4">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          
          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Privacy Policy describes how our Attendance Management System ("we," "us," or "our") collects, 
              uses, and protects the personal information of employees and administrators who use our system. 
              By using our system, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <FiDatabase className="text-3xl text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">1. Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect the following personal information when your organization registers you as an employee:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Employee ID, name, email address, and phone number</li>
              <li>Department and job role information</li>
              <li>Login credentials (passwords are encrypted and never stored in plain text)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2. Location Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you mark attendance, we collect your GPS location data including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Latitude and longitude coordinates</li>
              <li>GPS accuracy measurements</li>
              <li>Timestamp of location capture</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Important:</strong> Location data is only collected when you actively mark attendance 
              (check-in or check-out). We do not track your location continuously or in the background.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3. Device Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              For security purposes, we collect device fingerprint information including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Screen resolution</li>
              <li>Device characteristics (for creating a unique device identifier)</li>
              <li>IP address</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4. Attendance Records</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We maintain records of your attendance including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Check-in and check-out timestamps</li>
              <li>Attendance status (Present, Late, Absent, WFH)</li>
              <li>Working hours calculations</li>
              <li>Attendance history and statistics</li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <FiLock className="text-3xl text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Attendance Tracking:</strong> To record and verify employee attendance</li>
              <li><strong>Location Verification:</strong> To ensure employees are at the correct work location when marking attendance</li>
              <li><strong>Security:</strong> To prevent unauthorized access and fraudulent attendance marking</li>
              <li><strong>Reporting:</strong> To generate attendance reports and analytics for management</li>
              <li><strong>Communication:</strong> To send notifications, password reset OTPs, and system updates</li>
              <li><strong>Compliance:</strong> To comply with organizational attendance policies and labor regulations</li>
            </ul>
          </div>

          {/* Data Protection */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <FiShield className="text-3xl text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Data Protection and Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Encryption:</strong> All passwords are hashed using bcrypt encryption</li>
              <li><strong>Secure Communication:</strong> Data transmitted between your device and our servers is encrypted using HTTPS</li>
              <li><strong>Access Control:</strong> Role-based access ensures only authorized personnel can view your information</li>
              <li><strong>Audit Logs:</strong> All system activities are logged for security monitoring</li>
              <li><strong>Rate Limiting:</strong> Protection against brute-force attacks and abuse</li>
              <li><strong>Device Fingerprinting:</strong> Prevents unauthorized device access</li>
            </ul>
          </div>

          {/* Location Data Usage */}
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <FiMapPin className="text-3xl text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Location Data Usage Policy</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our use of location data is strictly limited and transparent:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Location data is only accessed when you actively click the check-in or check-out button</li>
              <li>We do not track your location continuously or when the app is not in use</li>
              <li>Location data is used solely for verifying you are at the correct work location</li>
              <li>Your location data is only accessible to authorized administrators within your organization</li>
              <li>Location data is retained as part of attendance records for reporting and compliance purposes</li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. Your data may be shared only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Within Your Organization:</strong> Authorized administrators and HR personnel can access your attendance data</li>
              <li><strong>Legal Compliance:</strong> If required by law, court order, or government regulations</li>
              <li><strong>Security:</strong> To investigate or prevent security incidents or fraudulent activities</li>
            </ul>
          </div>

          {/* Data Retention */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your data for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Active employee data is retained while you are employed by the organization</li>
              <li>Attendance records are retained according to organizational policies and legal requirements</li>
              <li>Audit logs and security records are retained for security monitoring purposes</li>
              <li>Upon account deactivation, your data may be archived or deleted according to organizational data retention policies</li>
            </ul>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> You can view your attendance history and profile information through your employee dashboard</li>
              <li><strong>Correction:</strong> You can update your profile information (contact administrators for other changes)</li>
              <li><strong>Password Management:</strong> You can change your password or reset it using the forgot password feature</li>
              <li><strong>Data Deletion:</strong> Contact your organization's administrator to request data deletion (subject to legal retention requirements)</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use session cookies to maintain your login state and improve system functionality. These cookies are essential 
              for the system to work properly. We do not use third-party tracking cookies or analytics that track your behavior 
              across other websites.
            </p>
          </div>

          {/* Changes to Policy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify users of any material changes by updating 
              the "Last Updated" date at the top of this policy. Continued use of the system after changes constitutes 
              acceptance of the updated policy.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions or Concerns?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or how we handle your data, please contact:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Your Organization's Administrator</strong> for data access or correction requests</li>
              <li><strong>Email:</strong> privacy@attendancesystem.com</li>
              <li><button onClick={() => navigate('/contact')} className="text-blue-600 hover:text-blue-700 font-semibold">Contact Support</button></li>
            </ul>
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

export default PrivacyPolicyPage;
