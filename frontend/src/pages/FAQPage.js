import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    document.title = 'FAQ - AttendNest | Frequently Asked Questions';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find answers to frequently asked questions about AttendNest. Learn about GPS tracking, check-in process, password reset, security features, and troubleshooting.');
    }
  }, []);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is the Attendance Management System?',
          answer: 'Our Attendance Management System is a comprehensive solution for tracking employee attendance with GPS verification, automated check-in/check-out, real-time reporting, and advanced security features. It supports both office-based and remote work scenarios.'
        },
        {
          question: 'Who can use this system?',
          answer: 'The system is designed for organizations of all sizes. It has two user roles: Administrators who manage employees, configure settings, and generate reports; and Employees who mark their attendance and view their attendance history.'
        },
        {
          question: 'Is the system mobile-friendly?',
          answer: 'Yes! The system is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Employees can mark attendance from any device with internet access.'
        }
      ]
    },
    {
      category: 'Attendance Process',
      questions: [
        {
          question: 'How do I mark my attendance?',
          answer: 'Simply log in to your employee account, allow location permissions when prompted, and tap the "Check In" button. The system will verify your location and device, then record your attendance with a timestamp. When leaving, tap "Check Out" to complete your attendance for the day.'
        },
        {
          question: 'What happens if I forget to check out?',
          answer: 'The system has an automatic checkout feature that runs at the end of the day. If you forget to check out manually, the system will automatically mark your checkout at the configured time (typically at midnight or end of business hours).'
        },
        {
          question: 'Can I check in before office hours?',
          answer: 'The system allows check-in based on administrator-configured time windows. Typically, you can check in a certain time before office hours start. Check with your administrator for specific timing policies.'
        },
        {
          question: 'What if I arrive late to the office?',
          answer: 'You can still check in after office hours start. The system will automatically mark you as "Late" based on the configured grace period. Your attendance will be recorded with the actual check-in time.'
        }
      ]
    },
    {
      category: 'GPS & Location',
      questions: [
        {
          question: 'Why does the system need my location?',
          answer: 'GPS location verification ensures that employees are checking in from the correct office location. This prevents proxy attendance and ensures accuracy. The system only accesses your location when you mark attendance, not continuously.'
        },
        {
          question: 'What if my GPS accuracy is low?',
          answer: 'The system has configurable GPS accuracy thresholds. If your GPS accuracy is too low (e.g., 500m), you may need to move to a location with better GPS signal, such as near a window or outdoors. The required accuracy is typically set between 50-300 meters.'
        },
        {
          question: 'Can I mark attendance without GPS?',
          answer: 'GPS verification can be configured by administrators. Some organizations may allow attendance marking based on network validation (office IP address) instead of GPS, or may have less strict requirements for work-from-home employees.'
        },
        {
          question: 'How accurate is the GPS tracking?',
          answer: 'GPS accuracy depends on your device and environment. Modern smartphones typically provide accuracy between 5-50 meters in open areas. The system shows you the current accuracy before you check in, so you know if it meets requirements.'
        }
      ]
    },
    {
      category: 'Work From Home',
      questions: [
        {
          question: 'Can I mark attendance while working from home?',
          answer: 'Yes! The system supports work-from-home attendance. Administrators can configure separate validation rules for WFH attendance, which may have more flexible location requirements than office attendance.'
        },
        {
          question: 'How does WFH attendance differ from office attendance?',
          answer: 'WFH attendance may have different validation rules, such as relaxed GPS requirements or network-based validation. The system tracks WFH days separately for reporting purposes.'
        }
      ]
    },
    {
      category: 'Security & Privacy',
      questions: [
        {
          question: 'Is my location data secure?',
          answer: 'Yes. Your location data is encrypted and stored securely. It is only used for attendance verification and is only accessible to authorized administrators. The system does not track your location continuously - only when you mark attendance.'
        },
        {
          question: 'What is device fingerprinting?',
          answer: 'Device fingerprinting creates a unique identifier for your device based on browser and system characteristics. This helps prevent unauthorized access and ensures that attendance is marked from recognized devices.'
        },
        {
          question: 'How does OTP authentication work?',
          answer: 'For password reset and sensitive operations, the system sends a one-time password (OTP) to your registered email address. Enter this OTP to verify your identity and complete the operation. OTPs are valid for a limited time (typically 10 minutes).'
        },
        {
          question: 'Can someone else mark my attendance?',
          answer: 'No. The system uses multiple security measures including GPS verification, device fingerprinting, and rate limiting to prevent proxy attendance. Each device is tracked, and suspicious activities are logged.'
        }
      ]
    },
    {
      category: 'Password & Account',
      questions: [
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your Employee ID and registered email address. You\'ll receive an OTP via email. Enter the OTP, then create a new password. Make sure to use a strong password with at least 8 characters.'
        },
        {
          question: 'What if I don\'t receive the OTP email?',
          answer: 'Check your spam/junk folder first. If you still don\'t see it, ensure you entered the correct email address registered with your account. OTP emails are typically delivered within 1-2 minutes. If issues persist, contact your administrator.'
        },
        {
          question: 'Can I change my password?',
          answer: 'Yes. After logging in, go to your profile settings and select "Change Password". You\'ll need to enter your current password, then create a new one.'
        }
      ]
    },
    {
      category: 'Reports & History',
      questions: [
        {
          question: 'How can I view my attendance history?',
          answer: 'Log in to your employee dashboard and navigate to the "Attendance" section. You can view your complete attendance history with dates, check-in/check-out times, and status (Present, Late, Absent, WFH).'
        },
        {
          question: 'Can I download my attendance report?',
          answer: 'Administrators can generate and export attendance reports in PDF and Excel formats. Employees can view their attendance history online. For personal reports, request your administrator to generate one for you.'
        }
      ]
    },
    {
      category: 'Troubleshooting',
      questions: [
        {
          question: 'Why can\'t I check in?',
          answer: 'Common reasons: 1) You\'re not at the office location (GPS verification failed), 2) Your GPS accuracy is too low, 3) You\'re not connected to the office network (if network validation is required), 4) Today is a holiday, or 5) You\'ve already checked in. Check the error message for specific details.'
        },
        {
          question: 'The system says "Location too far from office". What should I do?',
          answer: 'This means your GPS location is outside the allowed radius from the office. Ensure you\'re physically at the office location. If you are at the office but getting this error, your GPS may be inaccurate - try moving near a window or outdoors for better GPS signal.'
        },
        {
          question: 'What if the system is not working properly?',
          answer: 'First, try refreshing your browser or clearing cache. Ensure you have a stable internet connection and location permissions are granted. If the problem persists, contact your system administrator or IT support team with details about the error.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

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
              <button onClick={() => navigate('/features')} className="text-gray-700 hover:text-blue-600 font-medium">Features</button>
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
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our Attendance Management System
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const index = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === index;
                  return (
                    <div key={questionIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                        {isOpen ? (
                          <FiChevronUp className="text-2xl text-blue-600 flex-shrink-0" />
                        ) : (
                          <FiChevronDown className="text-2xl text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find the answer you're looking for? Contact our support team.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
          >
            Contact Support
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

export default FAQPage;
