import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { FiCheckCircle, FiMapPin, FiClock, FiUsers, FiCalendar, FiFileText, FiShield, FiLock, FiBarChart2, FiSmartphone, FiWifi, FiAlertCircle } from 'react-icons/fi';

const features = [
  { icon: FiMapPin,      color: 'bg-[#2563EB]/10 text-[#2563EB]',   title: 'GPS Attendance Tracking',          desc: 'Verify employee location with GPS-based attendance validation. Configure accuracy thresholds and location boundaries.', benefits: ['Real-time location verification','Configurable accuracy thresholds','Prevent proxy attendance','Support for multiple office locations'] },
  { icon: FiClock,       color: 'bg-emerald-50 text-emerald-600',    title: 'Automated Check-In & Check-Out',   desc: 'Streamlined attendance marking with automatic timestamp recording. Track working hours automatically.', benefits: ['One-tap attendance marking','Automatic working hours calculation','Late arrival detection','Auto-checkout at end of day'] },
  { icon: FiUsers,       color: 'bg-purple-50 text-purple-600',      title: 'Employee Management',              desc: 'Comprehensive employee management with profiles, departments, roles, and contact information.', benefits: ['Complete employee profiles','Department organization','Role-based access control','Bulk employee operations'] },
  { icon: FiCalendar,    color: 'bg-amber-50 text-amber-600',        title: 'Holiday Management',               desc: 'Configure government and office holidays with automatic attendance rule adjustments and holiday reports.', benefits: ['Government holiday calendar','Custom office holidays','Automatic attendance rules','Holiday included in reports'] },
  { icon: FiFileText,    color: 'bg-indigo-50 text-indigo-600',      title: 'Reports & Analytics',              desc: 'Generate detailed attendance reports with holidays. Export in PDF and Excel with monthly matrix view.', benefits: ['Monthly attendance matrix','PDF & Excel export with holidays','Employee-wise reports','Attendance statistics'] },
  { icon: FiShield,      color: 'bg-red-50 text-red-500',            title: 'Trusted Device Management',        desc: 'Admin approval system for employee devices. Block unauthorized devices and approve trusted ones.', benefits: ['Device approval workflow','Admin device control','Block unauthorized access','Security notifications'] },
  { icon: FiLock,        color: 'bg-pink-50 text-pink-600',          title: 'OTP Authentication',               desc: 'Secure password reset with OTP verification via email. Configurable validity and rate limiting.', benefits: ['Email-based OTP','Configurable OTP validity','Rate limiting protection','Secure password reset'] },
  { icon: FiBarChart2,   color: 'bg-teal-50 text-teal-600',          title: 'Real-Time Dashboard',              desc: "Monitor attendance in real-time with intuitive dashboards showing current status and statistics.", benefits: ['Real-time attendance stats','Currently working employees','Late arrivals tracking','Visual analytics'] },
  { icon: FiWifi,        color: 'bg-cyan-50 text-cyan-600',          title: 'Network Validation',               desc: 'Additional security with IP-based network validation. Restrict attendance to office networks.', benefits: ['Office network detection','IP whitelist support','Network-based restrictions','Flexible validation rules'] },
  { icon: FiSmartphone,  color: 'bg-orange-50 text-orange-600',      title: 'Mobile Responsive',                desc: 'Fully responsive design works seamlessly on all devices — smartphones, tablets, and desktops.', benefits: ['Mobile-first design','Touch-optimized interface','Works on all screen sizes','Native app experience'] },
  { icon: FiAlertCircle, color: 'bg-rose-50 text-rose-600',          title: 'Admin Activity Logs',              desc: 'Track all admin actions with comprehensive audit logging including settings changes and approvals.', benefits: ['Complete admin activity tracking','Settings change history','Device approval logs','PDF export of logs'] },
  { icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-600',    title: 'Work From Home Support',           desc: 'Dedicated WFH attendance tracking with flexible validation rules for hybrid work models.', benefits: ['WFH attendance marking','Flexible validation rules','Hybrid work support','Remote work analytics'] },
];

const FeaturesPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'Features - AttendNest | GPS Tracking & Reporting';
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute('content', 'Discover AttendNest features: GPS attendance tracking, employee management, automated reports, holiday management, OTP security, device fingerprinting, and WFH support.');
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] mb-4">Powerful Features for<br /><span className="text-[#2563EB]">Modern Attendance Management</span></h1>
          <p className="text-lg text-[#475569]">Everything you need to manage employee attendance efficiently, securely, and accurately</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc, benefits }) => (
            <div key={title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 hover:shadow-clay hover:-translate-y-1 transition-all duration-200 clay-card-hover">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}><Icon size={22} /></div>
              <h3 className="text-base font-bold text-[#0F172A] mb-2">{title}</h3>
              <p className="text-sm text-[#475569] mb-4 leading-relaxed">{desc}</p>
              <ul className="space-y-1.5">
                {benefits.map(b => (
                  <li key={b} className="flex items-center gap-2 text-xs text-[#475569]">
                    <FiCheckCircle size={12} className="text-emerald-500 flex-shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* For Admin / For Employee */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#0F172A] mb-10 text-center">Why Organizations Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'For Administrators', items: ['Complete employee management dashboard','Real-time attendance monitoring','Trusted device approval system','Admin activity audit logs','Comprehensive reporting with holidays','Security logs and audit trails','Data cleanup tools for storage management'] },
              { title: 'For Employees',      items: ['Simple one-tap check-in and check-out','View attendance history and statistics','Mobile-friendly interface','Profile management and password reset','Clear feedback on attendance status','WFH attendance support'] },
            ].map(({ title, items }) => (
              <div key={title} className="bg-white border border-[#E2E8F0] rounded-2xl p-7 shadow-clay">
                <h3 className="text-lg font-bold text-[#0F172A] mb-5">{title}</h3>
                <ul className="space-y-3">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#475569]">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0"><FiCheckCircle size={11} className="text-emerald-600" /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#2563EB] to-[#7C3AED]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Experience All Features Today</h2>
          <p className="text-blue-200 mb-8">Start using our comprehensive attendance management system</p>
          <button onClick={() => navigate('/employee/login')} className="px-8 py-3.5 bg-white text-[#2563EB] font-bold rounded-2xl hover:bg-blue-50 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all">Get Started</button>
        </div>
      </section>
    </PublicLayout>
  );
};
export default FeaturesPage;
