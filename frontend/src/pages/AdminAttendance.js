import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import ClearDataDialog from '../components/ClearDataDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { getAllAttendance, downloadMonthlyMatrixPDF, downloadMonthlyMatrixExcel, resetAttendance, deleteAttendance, clearMonthlyAttendance } from '../services/api';
import { formatTime, formatDate, formatWorkingHours } from '../utils/formatTime';
import { FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiRotateCcw, FiX, FiCalendar } from 'react-icons/fi';

const getLocalDateString = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; };

const AdminAttendance = () => {
  const [attendance,   setAttendance]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filters,      setFilters]      = useState({ date: getLocalDateString(), status:'', employee_id:'' });
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [downloadData,   setDownloadData]   = useState({ month:'', year:'' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen:false, title:'', message:'', onConfirm:null, type:'info' });
  const [alertDialog,   setAlertDialog]   = useState({ isOpen:false, title:'', message:'', type:'success' });
  const [clearDialog, setClearDialog] = useState({ isOpen: false });

  const fetchAttendance = async () => {
    try { setLoading(true); const r = await getAllAttendance(filters); if (r.data.success) setAttendance(r.data.attendance); }
    catch (e) { setAlertDialog({ isOpen:true, title:'Error', message:'Error loading attendance data', type:'error' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAttendance(); }, [filters]); // eslint-disable-line

  const handleFilterChange = e => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleDownloadPDF = format => {
    setDownloadFormat(format);
    const now = new Date(); setDownloadData({ month: String(now.getMonth()+1), year: String(now.getFullYear()) });
    setShowDownloadDialog(true);
  };

  const downloadMatrix = async () => {
    const { month, year } = downloadData;
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) { setAlertDialog({ isOpen:true, title:'Error', message:'Please enter a valid month (1–12) and year.', type:'error' }); return; }
    setShowDownloadDialog(false);
    try {
      let response, fileName;
      if (downloadFormat === 'pdf') { response = await downloadMonthlyMatrixPDF(month, year); fileName = `attendance_matrix_${month}_${year}.pdf`; }
      else { response = await downloadMonthlyMatrixExcel(month, year); fileName = `attendance_matrix_${month}_${year}.xlsx`; }
      const blob = new Blob([response.data], { type: downloadFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = fileName;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url);
      setAlertDialog({ isOpen:true, title:'Success', message:`${downloadFormat.toUpperCase()} downloaded successfully!`, type:'success' });
    } catch (e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Error downloading file.', type:'error' }); }
  };

  const handleResetAttendance = (record, resetType) => {
    const resetText = resetType === 'check-in' ? 'Check-In' : 'Check-Out';
    setConfirmDialog({ isOpen:true, title:`Reset ${resetText}`, type:'warning', message:`Reset ${resetText} for "${record.name}" on ${formatDate(record.attendance_date)}?`,
      onConfirm: async () => {
        try { const r = await resetAttendance(record.id, resetType); if (r.data.success) { setAlertDialog({ isOpen:true, title:'Success', message:`${resetText} reset successfully!`, type:'success' }); fetchAttendance(); } else throw new Error(r.data.message); }
        catch (e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Operation failed.', type:'error' }); }
      },
    });
  };

  const handleDeleteAttendance = record => setConfirmDialog({
    isOpen:true, title:'Delete Attendance Record', type:'danger',
    message:`Permanently delete the attendance record for "${record.name}" on ${formatDate(record.attendance_date)}?`,
    onConfirm: async () => {
      try { const r = await deleteAttendance(record.id); if (r.data.success) { setAlertDialog({ isOpen:true, title:'Success', message:'Record deleted successfully!', type:'success' }); fetchAttendance(); } else throw new Error(r.data.message); }
      catch (e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Delete failed.', type:'error' }); }
    },
  });

  const handleClearMonthlyAttendance = async (year, month) => {
    try {
      const response = await clearMonthlyAttendance(year, month);
      if (response.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: `Attendance records for ${month}/${year} cleared successfully`, type: 'success' });
        fetchAttendance();
      } else {
        setAlertDialog({ isOpen: true, title: 'Error', message: response.data.message || 'Failed to clear attendance', type: 'error' });
      }
    } catch (error) {
      setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to clear attendance records', type: 'error' });
    }
  };

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0 dark-scroll">
        <div className="px-5 py-6 lg:px-8 lg:py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-14 lg:pt-0">
            <div>
              <h1 className="text-xl font-bold text-white">Attendance Monitoring</h1>
              <p className="text-sm text-[#94A3B8] mt-0.5">View and manage employee attendance</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setClearDialog({ isOpen: true })} className="inline-flex items-center gap-2 bg-red-600/90 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:-translate-y-0.5">
                <FiTrash2 size={15} /> Clear Attendance
              </button>
              <button onClick={() => handleDownloadPDF('pdf')} className="inline-flex items-center gap-2 bg-red-600/90 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:-translate-y-0.5">
                <FiDownload size={15} /> PDF
              </button>
              <button onClick={() => handleDownloadPDF('excel')} className="inline-flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:-translate-y-0.5">
                <FiDownload size={15} /> Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl p-5 mb-5 shadow-clay-admin">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter size={14} className="text-[#64748B]" />
              <h2 className="text-sm font-semibold text-[#94A3B8]">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Date</label>
                <input type="date" name="date" value={filters.date} onChange={handleFilterChange} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="admin-select">
                  <option value="">All Statuses</option>
                  <option value="Currently Working">Currently Working</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Employee ID</label>
                <input type="text" name="employee_id" value={filters.employee_id} onChange={handleFilterChange} placeholder="Search by Employee ID" className="admin-input" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Spinner size={32} /></div>
            ) : (
              <div className="overflow-x-auto dark-scroll">
                <table className="min-w-full divide-y divide-white/[0.04]">
                  <thead className="bg-[#0E1320]/50">
                    <tr>{['Date','Emp ID','Name','Dept','Login','Logout','Hours','Status','WFH','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {attendance.length > 0 ? attendance.map(record => (
                      <tr key={record.id} className="admin-table-row">
                        <td className="px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{formatDate(record.attendance_date)}</td>
                        <td className="px-4 py-3.5 text-sm text-[#94A3B8] font-mono whitespace-nowrap">{record.emp_id}</td>
                        <td className="hidden sm:table-cell px-4 py-3.5 text-sm font-semibold text-white whitespace-nowrap">{record.name}</td>
                        <td className="hidden md:table-cell px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{record.department}</td>
                        <td className="px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{formatTime(record.login_time)}</td>
                        <td className="hidden lg:table-cell px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">
                          {formatTime(record.logout_time)}
                          {record.is_auto_checkout && record.logout_time && <span className="block text-xs text-amber-400">(Auto)</span>}
                        </td>
                        <td className="hidden xl:table-cell px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{formatWorkingHours(parseFloat(record.total_working_hours))}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={record.attendance_status} dark /></td>
                        <td className="hidden sm:table-cell px-4 py-3.5 whitespace-nowrap">
                          {record.is_wfh
                            ? <span className="inline-flex items-center text-xs font-semibold text-blue-400 bg-blue-500/15 border border-blue-500/25 px-2 py-0.5 rounded-full">WFH</span>
                            : <span className="text-xs text-[#475569]">Office</span>
                          }
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {record.login_time && <button onClick={() => handleResetAttendance(record, 'check-in')} title="Reset Check-In" className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-colors"><FiRotateCcw size={13} /></button>}
                            {record.logout_time && <button onClick={() => handleResetAttendance(record, 'check-out')} title="Reset Check-Out" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#60A5FA] hover:bg-blue-500/10 transition-colors"><FiRefreshCw size={13} /></button>}
                            <button onClick={() => handleDeleteAttendance(record)} title="Delete" className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={10} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3"><FiCalendar size={28} className="text-[#475569]" /><p className="text-sm font-medium text-[#64748B]">No attendance records found</p></div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Dialog */}
      {showDownloadDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C2540] border border-white/[0.08] rounded-2xl shadow-clay-admin-modal w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white">Download Attendance Matrix</h2>
              <button onClick={() => setShowDownloadDialog(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] transition-colors"><FiX size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-[#94A3B8]">Select month and year for the {downloadFormat.toUpperCase()} report.</p>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Month (1–12)</label>
                <input type="number" min="1" max="12" value={downloadData.month} onChange={e => setDownloadData(d => ({ ...d, month: e.target.value }))} placeholder="1–12" className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Year</label>
                <input type="number" min="2020" max="2030" value={downloadData.year} onChange={e => setDownloadData(d => ({ ...d, year: e.target.value }))} placeholder="e.g. 2026" className="admin-input" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-[#161D2E]/60 rounded-b-2xl">
              <button onClick={() => setShowDownloadDialog(false)} className="px-4 py-2 text-sm font-semibold text-[#94A3B8] border border-white/10 rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={downloadMatrix} className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all duration-200 ${downloadFormat === 'pdf' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                Download {downloadFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(d => ({ ...d, isOpen:false }))} onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(d => ({ ...d, isOpen:false })); }} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} confirmText={confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'} />
      <AlertDialog   isOpen={alertDialog.isOpen}   onClose={() => setAlertDialog(d => ({ ...d, isOpen:false }))}   title={alertDialog.title}   message={alertDialog.message}   type={alertDialog.type} />
      
      {/* Clear Data Dialog */}
      <ClearDataDialog
        isOpen={clearDialog.isOpen}
        onClose={() => setClearDialog({ isOpen: false })}
        onConfirm={handleClearMonthlyAttendance}
        title="Clear Monthly Attendance"
        message="⚠️ WARNING: This will permanently delete ALL attendance records for the selected month and year. This action cannot be undone and will free up storage space."
        confirmText="delete this month attendance"
        type="attendance"
      />
    </div>
  );
};
export default AdminAttendance;
