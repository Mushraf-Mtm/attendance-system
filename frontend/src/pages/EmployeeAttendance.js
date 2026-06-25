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

  useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]); // eslint-disable-line

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeMonthlyAttendance(selectedMonth, selectedYear);
      if (response.data.success) { setAttendance(response.data.attendance); setHolidays(response.data.holidays || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const isSunday = dateString => new Date(dateString).getDay() === 0;
  const getHolidayInfo = dateString => holidays.find(h => {
    const hd = new Date(h.holiday_date).toISOString().split('T')[0];
    const rd = new Date(dateString).toISOString().split('T')[0];
    return hd === rd;
  });
  const getDisplayStatus = record => {
    if (record.login_time) return { status:record.attendance_status, type:'attendance', holiday:null };
    const holiday = getHolidayInfo(record.attendance_date);
    if (holiday) return { status: holiday.holiday_type === 'Government Holiday' ? 'Government Holiday' : 'Office Holiday', type:'holiday', holiday };
    if (isSunday(record.attendance_date)) return { status:'Sunday', type:'sunday', holiday:null };
    return { status:'Absent', type:'absent', holiday:null };
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">

          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#0F172A]">My Attendance</h1>
            <p className="text-sm text-[#475569] mt-0.5">View your monthly attendance history</p>
          </div>

          {/* Period selector */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-clay p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <FiCalendar size={15} className="text-[#94A3B8]" />
              <h2 className="text-sm font-bold text-[#0F172A]">Select Period</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Month</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="emp-input">
                  {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Year</label>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="emp-input">
                  {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-clay overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      {['Date','Login','Logout','Working Hours','Status','WFH'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {attendance.length > 0 ? attendance.map(record => {
                      const d = getDisplayStatus(record);
                      const isWeekendOrHoliday = d.type !== 'attendance' && d.type !== 'absent';
                      return (
                        <tr key={record.id} className={`emp-table-row ${isWeekendOrHoliday ? 'bg-[#F8FAFC]/60' : ''}`}>
                          <td className="px-4 py-3 text-sm text-[#0F172A] font-medium whitespace-nowrap">{formatDate(record.attendance_date)}</td>
                          <td className="px-4 py-3 text-sm text-[#475569] whitespace-nowrap">{d.type === 'attendance' ? formatTime(record.login_time) : '—'}</td>
                          <td className="px-4 py-3 text-sm text-[#475569] whitespace-nowrap">
                            <div>
                              {d.type === 'attendance' ? formatTime(record.logout_time) : '—'}
                              {record.is_auto_checkout && record.logout_time && <span className="block text-xs text-amber-600">(Auto checkout)</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#475569] whitespace-nowrap">
                            {d.type === 'attendance' ? formatWorkingHours(parseFloat(record.total_working_hours)) : '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={d.status} />
                              {d.holiday && (
                                <div className="relative group">
                                  <FiInfo size={13} className="text-[#2563EB] cursor-help" />
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-[#0F172A] text-white text-xs rounded-xl p-3 w-56 z-10 shadow-clay-modal">
                                    <p className="font-semibold mb-0.5">{d.holiday.holiday_title}</p>
                                    {d.holiday.holiday_note && <p className="text-[#94A3B8]">{d.holiday.holiday_note}</p>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {record.is_wfh
                              ? <span className="text-xs font-semibold text-[#2563EB] bg-[#2563EB]/10 border border-[#2563EB]/20 px-2 py-0.5 rounded-full">WFH</span>
                              : <span className="text-xs text-[#CBD5E1]">—</span>
                            }
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={6} className="px-4 py-14 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                          <FiCalendar size={28} />
                          <p className="text-sm font-semibold text-[#475569]">No records for this period</p>
                        </div>
                      </td></tr>
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
