import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us - Attendance Management System | Get Support';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Contact our Attendance Management System support team. Get help with employee attendance tracking, GPS validation, technical issues, or general inquiries. We\'re here to help you.');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the form data to a backend API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or need support? We're here to help you with your attendance management needs
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <FiCheckCircle className="text-5xl text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Message Sent!</h3>
                  <p className="text-green-700">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                  >
                    <FiSend className="mr-2" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FiMail className="text-2xl text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Support</h3>
                    <p className="text-gray-600">support@attendancesystem.com</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FiPhone className="text-2xl text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone Support</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FiMapPin className="text-2xl text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Office Location</h3>
                    <p className="text-gray-600">123 Business Avenue</p>
                    <p className="text-gray-600">Tech District, City 12345</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <button onClick={() => navigate('/support')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      <FiCheckCircle className="mr-2" />
                      Help Center & Documentation
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/faq')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      <FiCheckCircle className="mr-2" />
                      Frequently Asked Questions
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/employee/login')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      <FiCheckCircle className="mr-2" />
                      Employee Login
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/forgot-password')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      <FiCheckCircle className="mr-2" />
                      Reset Password
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Hours */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Support Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-700">24/7 Available</p>
              <p className="text-sm text-gray-600 mt-2">Response within 24 hours</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-700">Monday - Friday</p>
              <p className="text-sm text-gray-600 mt-2">9:00 AM - 6:00 PM EST</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-700">Monday - Friday</p>
              <p className="text-sm text-gray-600 mt-2">9:00 AM - 6:00 PM EST</p>
            </div>
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

export default ContactPage;
