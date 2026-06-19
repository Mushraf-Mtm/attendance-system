import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { getEmployeeMonthlyAttendance } from '../services/api';
import { formatTime, formatDate, formatWorkingHours } from '../utils/formatTime';
import { FiCalendar, FiInfo } from 'react-icons/fi';

const EmployeeAttendance = () => {
  const [attendance,    setAttendance]    = useState([]);
  const [holidays,      setHolidays]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeMonthlyAttendance(selectedMonth, selectedYear);
      if (response.data.success) {
        setAttendance(response.data.attendance);
        setHolidays(response.data.holidays || []);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const isSunday = dateString => new Date(dateString).getDay() === 0;

  const getHolidayInfo = dateString => holidays.find(h => {
    const hd = new Date(h.holiday_date).toISOString().split('T')[0];
    const rd = new Date(dateString).toISOString().split('T')[0];
    return hd === rd;
  });

  const getDisplayStatus = record => {
    if (record.login_time) return { status: record.attendance_status, type: 'attendance', holiday: null };
    const holiday = getHolidayInfo(record.attendance_date);
    if (holiday) return { status: holiday.holiday_type === 'Government Holiday' ? 'Government Holiday' : 'Office Holiday', type: 'holiday', holiday };
    if (isSunday(record.attendance_date)) return { status: 'Sunday', type: 'sunday', holiday: null };
    return { status: 'Absent', type: 'absent', holiday: null };
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">My Attendance</h1>
            <p className="text-sm text-slate-500 mt-0.5">View your monthly attendance history</p>
          </div>

          {/* Period selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <FiCalendar size={15} className="text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Select Period</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Month</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                  {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Year</label>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                  {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Spinner size={32} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Date','Login','Logout','Working Hours','Status','WFH'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendance.length > 0 ? attendance.map(record => {
                      const d = getDisplayStatus(record);
                      const isWeekendOrHoliday = d.type !== 'attendance' && d.type !== 'absent';
                      return (
                        <tr key={record.id} className={`hover:bg-slate-50/70 transition-colors ${isWeekendOrHoliday ? 'bg-slate-50/40' : ''}`}>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatDate(record.attendance_date)}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{d.type === 'attendance' ? formatTime(record.login_time) : '—'}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                            <div>
                              {d.type === 'attendance' ? formatTime(record.logout_time) : '—'}
                              {record.is_auto_checkout && record.logout_time && (
                                <span className="block text-xs text-amber-600">(Auto checkout)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                            {d.type === 'attendance' ? formatWorkingHours(parseFloat(record.total_working_hours)) : '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={d.status} />
                              {d.holiday && (
                                <div className="relative group">
                                  <FiInfo size={13} className="text-indigo-400 cursor-help" />
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg p-3 w-56 z-10 shadow-lg">
                                    <p className="font-semibold mb-0.5">{d.holiday.holiday_title}</p>
                                    {d.holiday.holiday_note && <p className="text-slate-300">{d.holiday.holiday_note}</p>}
                                    <div className="absolute left-3 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {record.is_wfh
                              ? <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">WFH</span>
                              : <span className="text-xs text-slate-400">—</span>
                            }
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-14 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <FiCalendar size={28} />
                            <p className="text-sm font-medium">No records for this period</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
