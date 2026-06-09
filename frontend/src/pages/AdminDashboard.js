import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { getDashboardStats, getAllAttendance } from '../services/api';
import { formatTime, formatWorkingHours } from '../utils/formatTime';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiHome, 
  FiXCircle,
  FiActivity
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateEmployees: 0,
    wfhEmployees: 0,
    absentEmployees: 0,
    currentlyWorking: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, attendanceRes] = await Promise.all([
        getDashboardStats(),
        getAllAttendance({ date: new Date().toISOString().split('T')[0] })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (attendanceRes.data.success) {
        setRecentAttendance(attendanceRes.data.attendance.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-green-100 text-green-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Half Day': 'bg-orange-100 text-orange-800',
      'Absent': 'bg-red-100 text-red-800',
      'Work From Home': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 pt-16 lg:pt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome to Admin Panel</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={FiUsers}
              color="blue"
            />
            <StatCard
              title="Present Today"
              value={stats.presentToday}
              icon={FiCheckCircle}
              color="green"
            />
            <StatCard
              title="Late Employees"
              value={stats.lateEmployees}
              icon={FiClock}
              color="yellow"
            />
            <StatCard
              title="WFH Employees"
              value={stats.wfhEmployees}
              icon={FiHome}
              color="purple"
            />
            <StatCard
              title="Absent Employees"
              value={stats.absentEmployees}
              icon={FiXCircle}
              color="red"
            />
            <StatCard
              title="Currently Working"
              value={stats.currentlyWorking}
              icon={FiActivity}
              color="orange"
            />
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
              Today's Attendance
            </h2>
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Emp ID
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Name
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Department
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Login
                      </th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Logout
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.length > 0 ? (
                      recentAttendance.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{record.emp_id}</td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap">{record.name}</td>
                          <td className="hidden md:table-cell px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{record.department}</td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{formatTime(record.login_time)}</td>
                          <td className="hidden sm:table-cell px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{formatTime(record.logout_time)}</td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(record.attendance_status)}`}>
                              {record.attendance_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm">
                          No attendance records for today
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
    </div>
  );
};

export default AdminDashboard;
