import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiFileText, FiAlertCircle } from 'react-icons/fi';

const TermsAndConditionsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms and Conditions - Attendance Management System | Usage Terms';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Read our Terms and Conditions for using the Attendance Management System. Understand user responsibilities, system usage guidelines, and acceptable use policies.');
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
              <span className="text-xl font-bold text-gray-800">AttendNest</span>
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
          <FiFileText className="text-6xl text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Terms and Conditions
          </h1>
          <p className="text-xl text-gray-600">
            Please read these terms carefully before using our system
          </p>
          <p className="text-sm text-gray-500 mt-4">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          
          {/* Acceptance */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using the Attendance Management System ("the System"), you accept and agree to be bound 
              by these Terms and Conditions. If you do not agree to these terms, you must not use the System.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These terms apply to all users of the System, including employees and administrators, and govern your 
              access to and use of the System.
            </p>
          </div>

          {/* User Accounts */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2. User Accounts and Responsibilities</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              User accounts are created by your organization's administrators. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying your administrator immediately of any unauthorized access</li>
              <li>Creating a strong, secure password and changing it regularly</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Account Security</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must NOT:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Share your login credentials with anyone</li>
              <li>Allow others to mark attendance on your behalf</li>
              <li>Use another person's account</li>
              <li>Attempt to access accounts you are not authorized to use</li>
            </ul>
          </div>

          {/* Acceptable Use */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Acceptable Use Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Permitted Use</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The System is provided for legitimate attendance tracking purposes only. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mark your attendance accurately and honestly</li>
              <li>Check in only when physically present at the authorized location (or as per WFH policies)</li>
              <li>Provide accurate location data when required</li>
              <li>Use the System in accordance with your organization's attendance policies</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Prohibited Activities</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must NOT:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Attempt to mark fraudulent or false attendance</li>
              <li>Use location spoofing, VPNs, or other tools to manipulate your location data</li>
              <li>Attempt to bypass security measures or validation checks</li>
              <li>Use automated scripts, bots, or tools to interact with the System</li>
              <li>Attempt to hack, reverse engineer, or exploit the System</li>
              <li>Disrupt or interfere with the System's operation</li>
              <li>Access or attempt to access data you are not authorized to view</li>
              <li>Transmit viruses, malware, or malicious code</li>
            </ul>
          </div>

          {/* Attendance Marking */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Attendance Marking Rules</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Check-In Requirements</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You must be physically present at the authorized work location when marking attendance (unless WFH is approved)</li>
              <li>You must allow location permissions for GPS verification</li>
              <li>Your device must meet GPS accuracy requirements</li>
              <li>You may be required to be on the office network (depending on configuration)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Late Arrival</h3>
            <p className="text-gray-700 leading-relaxed">
              Late arrivals are automatically marked based on configured grace periods. Repeated late arrivals may 
              be subject to your organization's disciplinary policies.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Absences</h3>
            <p className="text-gray-700 leading-relaxed">
              If you do not mark attendance on a working day, the System will automatically mark you as absent. 
              Absences are subject to your organization's leave and attendance policies.
            </p>
          </div>

          {/* Location Data */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Location Data and Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using the System, you:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Consent to the collection of your GPS location data when marking attendance</li>
              <li>Understand that location data is used solely for attendance verification</li>
              <li>Acknowledge that location data may be accessed by authorized administrators</li>
              <li>Agree to the terms outlined in our Privacy Policy</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              For more information on how we handle your data, please review our{' '}
              <button onClick={() => navigate('/privacy-policy')} className="text-blue-600 hover:text-blue-700 font-semibold">
                Privacy Policy
              </button>.
            </p>
          </div>

          {/* Device Fingerprinting */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Device Security and Fingerprinting</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The System uses device fingerprinting for security purposes. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Your device will be identified using browser and system characteristics</li>
              <li>Administrators may monitor device changes and suspicious activities</li>
              <li>Using multiple devices or unrecognized devices may trigger security alerts</li>
              <li>Attempting to manipulate device fingerprints is prohibited</li>
            </ul>
          </div>

          {/* Data Accuracy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Data Accuracy and Disputes</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for ensuring the accuracy of your attendance records. If you notice any discrepancies:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Contact your administrator or HR department immediately</li>
              <li>Provide necessary documentation or evidence to support your claim</li>
              <li>Follow your organization's attendance dispute resolution process</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              The System records are considered official attendance records unless proven otherwise through 
              your organization's dispute resolution process.
            </p>
          </div>

          {/* System Availability */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8. System Availability and Maintenance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to provide uninterrupted service:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>We do not guarantee 100% uptime or availability</li>
              <li>The System may be temporarily unavailable for maintenance or updates</li>
              <li>We are not liable for any inability to mark attendance due to system downtime</li>
              <li>Contact your administrator if the System is unavailable when you need to mark attendance</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The System, including all software, designs, text, graphics, and other content, is owned by us or 
              our licensors and is protected by intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Copy, modify, or create derivative works of the System</li>
              <li>Reverse engineer or decompile any part of the System</li>
              <li>Remove or alter any copyright, trademark, or other proprietary notices</li>
              <li>Use the System's name, logo, or branding without permission</li>
            </ul>
          </div>

          {/* Liability */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>The System is provided "as is" without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>We are not responsible for decisions made by your organization based on attendance data</li>
              <li>You use the System at your own risk</li>
            </ul>
          </div>

          {/* Termination */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your organization's administrators may suspend or terminate your account:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>If you violate these Terms and Conditions</li>
              <li>If you engage in fraudulent or unauthorized activities</li>
              <li>When your employment with the organization ends</li>
              <li>For any other reason at their discretion</li>
            </ul>
          </div>

          {/* Changes to Terms */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms and Conditions at any time. We will notify users of 
              material changes by updating the "Last Updated" date. Continued use of the System after changes 
              constitutes acceptance of the updated terms.
            </p>
          </div>

          {/* Governing Law */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions are governed by applicable laws in your jurisdiction. Any disputes 
              should be resolved through your organization's internal dispute resolution process.
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
            <div className="flex items-start">
              <FiAlertCircle className="text-2xl text-yellow-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h3>
                <p className="text-yellow-800">
                  Violation of these Terms and Conditions, particularly fraudulent attendance marking or 
                  security breaches, may result in disciplinary action by your organization, including 
                  termination of employment. All activities are logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms and Conditions, please contact:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li><strong>Your Organization's Administrator</strong> for account or policy questions</li>
              <li><strong>Email:</strong> legal@attendancesystem.com</li>
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

export default TermsAndConditionsPage;
