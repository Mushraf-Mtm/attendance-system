import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { getDashboardStats, getAllAttendance } from '../services/api';
import { formatTime, formatWorkingHours } from '../utils/formatTime';
import { FiUsers, FiCheckCircle, FiClock, FiHome, FiXCircle, FiActivity } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalEmployees:0, presentToday:0, lateEmployees:0, wfhEmployees:0, absentEmployees:0, currentlyWorking:0 });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const [statsRes, attendanceRes] = await Promise.all([getDashboardStats(), getAllAttendance({ date: localDate })]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (attendanceRes.data.success) setRecentAttendance(attendanceRes.data.attendance.slice(0, 10));
    } catch (e) { console.error('Error fetching dashboard data:', e); }
    finally { setLoading(false); }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  if (loading) return (
    <div className="flex h-screen bg-[#0E1320]">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Spinner size={36} /></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0 dark-scroll">
        <div className="px-6 py-6 lg:px-8 lg:py-8">

          {/* Header */}
          <div className="mb-8 pt-14 lg:pt-0">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-sm text-[#94A3B8] mt-1">{dateStr}</p>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-[#1C2540] border border-white/[0.07] rounded-xl px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                <span className="text-xs text-[#94A3B8] font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard title="Total Employees"   value={stats.totalEmployees}   icon={FiUsers}       color="indigo" />
            <StatCard title="Present Today"     value={stats.presentToday}     icon={FiCheckCircle} color="green"  />
            <StatCard title="Late Arrivals"     value={stats.lateEmployees}    icon={FiClock}       color="yellow" />
            <StatCard title="Work From Home"    value={stats.wfhEmployees}     icon={FiHome}        color="blue"   />
            <StatCard title="Absent Today"      value={stats.absentEmployees}  icon={FiXCircle}     color="red"    />
            <StatCard title="Currently Working" value={stats.currentlyWorking} icon={FiActivity}    color="purple" />
          </div>

          {/* Today's attendance table */}
          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-sm">Today's Attendance</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Live employee attendance records</p>
              </div>
              <span className="text-xs text-[#64748B] bg-white/[0.04] border border-white/[0.06] px-3 py-1 rounded-full">
                {recentAttendance.length} records
              </span>
            </div>
            <div className="overflow-x-auto dark-scroll">
              <table className="min-w-full divide-y divide-white/[0.04]">
                <thead className="bg-[#0E1320]/50">
                  <tr>
                    {['Emp ID','Name','Department','Login','Logout','Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentAttendance.length > 0 ? recentAttendance.map(record => (
                    <tr key={record.id} className="admin-table-row">
                      <td className="px-4 py-3.5 text-sm text-[#94A3B8] font-mono whitespace-nowrap">{record.emp_id}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-white whitespace-nowrap">{record.name}</td>
                      <td className="hidden md:table-cell px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{record.department}</td>
                      <td className="px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{formatTime(record.login_time)}</td>
                      <td className="hidden sm:table-cell px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{formatTime(record.logout_time)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={record.attendance_status} dark /></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#475569]">
                        <FiActivity size={28} className="opacity-50" />
                        <p className="text-sm font-medium text-[#64748B]">No attendance records for today</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
