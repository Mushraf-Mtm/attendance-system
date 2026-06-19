import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { getDashboardStats, getAllAttendance } from '../services/api';
import { formatTime, formatWorkingHours } from '../utils/formatTime';
import {
  FiUsers, FiCheckCircle, FiClock, FiHome, FiXCircle, FiActivity,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0, presentToday: 0, lateEmployees: 0,
    wfhEmployees: 0, absentEmployees: 0, currentlyWorking: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const [statsRes, attendanceRes] = await Promise.all([
        getDashboardStats(),
        getAllAttendance({ date: localDate }),
      ]);
      if (statsRes.data.success)      setStats(statsRes.data.stats);
      if (attendanceRes.data.success) setRecentAttendance(attendanceRes.data.attendance.slice(0, 10));
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size={36} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-6 py-6 lg:px-8 lg:py-8">

          {/* Header */}
          <div className="mb-7 pt-14 lg:pt-0">
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">{dateStr}</p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
            <StatCard title="Total Employees"    value={stats.totalEmployees}   icon={FiUsers}       color="indigo" />
            <StatCard title="Present Today"      value={stats.presentToday}     icon={FiCheckCircle} color="green"  />
            <StatCard title="Late Arrivals"      value={stats.lateEmployees}    icon={FiClock}       color="yellow" />
            <StatCard title="Work From Home"     value={stats.wfhEmployees}     icon={FiHome}        color="blue"   />
            <StatCard title="Absent Today"       value={stats.absentEmployees}  icon={FiXCircle}     color="red"    />
            <StatCard title="Currently Working"  value={stats.currentlyWorking} icon={FiActivity}    color="purple" />
          </div>

          {/* Today's attendance table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-sm">Today's Attendance</h2>
              <span className="text-xs text-slate-400">{recentAttendance.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    {['Emp ID','Name','Department','Login','Logout','Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap last:hidden last:sm:table-cell">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAttendance.length > 0 ? (
                    recentAttendance.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono whitespace-nowrap">{record.emp_id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{record.name}</td>
                        <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{record.department}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatTime(record.login_time)}</td>
                        <td className="hidden sm:table-cell px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatTime(record.logout_time)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={record.attendance_status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-14 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <FiActivity size={28} />
                          <p className="text-sm font-medium">No attendance records for today</p>
                        </div>
                      </td>
                    </tr>
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
