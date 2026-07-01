import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { getEmployeesForManualAttendance, createManualAttendance, updateManualAttendance, deleteManualAttendance, getAllDepartments } from '../services/api';
import { FiCheckSquare, FiSquare, FiEdit, FiSearch, FiCalendar, FiFilter, FiSave, FiX, FiLayers, FiPlus, FiTrash2 } from 'react-icons/fi';

const AdminManualAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentId, setDepartmentId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [targetAttendanceId, setTargetAttendanceId] = useState(null);
  
  const [formData, setFormData] = useState({
    login_time: '',
    logout_time: '',
    attendance_status: 'Present',
    is_wfh: false,
    remarks: '',
    reason: ''
  });
  
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', type: 'warning', confirmText: 'Confirm', onConfirm: null });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchData();
  }, [date, departmentId, statusFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await getAllDepartments();
      if (res.data.success) setDepartments(res.data.departments.filter(d => d.status === 'Active'));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getEmployeesForManualAttendance({ date, department_id: departmentId, status: statusFilter });
      if (res.data.success) {
        setEmployees(res.data.employees);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (empId) => {
    setSelectedIds(prev => prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredEmployees.length) setSelectedIds([]);
    else setSelectedIds(filteredEmployees.map(e => e.employee_id));
  };

  const isFutureDate = () => {
    const today = new Date().toISOString().split('T')[0];
    return date > today;
  };

  const handleDelete = (emp) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Manual Attendance',
      message: `Delete manual attendance for ${emp.name} on ${date}? This cannot be undone.`,
      type: 'danger',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        try {
          const res = await deleteManualAttendance(emp.attendance_id);
          if (res.data.success) {
            setAlertDialog({ isOpen: true, title: 'Deleted', message: res.data.message, type: 'success' });
            fetchData();
          }
        } catch (error) {
          setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to delete.', type: 'error' });
        }
      }
    });
  };

  const openBulkModal = () => {
    if (isFutureDate()) {
      setAlertDialog({ isOpen: true, title: 'Invalid Date', message: 'Cannot create manual attendance for future dates.', type: 'error' });
      return;
    }

    if (selectedIds.length === 0) {
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Please select at least one employee', type: 'error' });
      return;
    }
    
    // Check if any selected employee already has attendance
    const hasExisting = employees.find(e => selectedIds.includes(e.employee_id) && e.attendance_id);
    if (hasExisting) {
      setAlertDialog({ isOpen: true, title: 'Error', message: `Attendance already exists for ${hasExisting.name}. Do NOT overwrite. Use individual Edit instead.`, type: 'error' });
      return;
    }

    setFormData({ login_time: '09:30', logout_time: '17:30', attendance_status: 'Present', is_wfh: false, remarks: '', reason: '' });
    setEditMode(false);
    setTargetAttendanceId(null);
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    if (isFutureDate()) {
      setAlertDialog({ isOpen: true, title: 'Invalid Date', message: 'Cannot edit manual attendance for future dates.', type: 'error' });
      return;
    }

    if (emp.validation_method !== 'Manual') {
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Only manually created attendance records can be edited from this module.', type: 'error' });
      return;
    }
    
    const login = emp.login_time ? new Date(emp.login_time).toTimeString().substring(0,5) : '';
    const logout = emp.logout_time ? new Date(emp.logout_time).toTimeString().substring(0,5) : '';
    
    setFormData({ login_time: login, logout_time: logout, attendance_status: emp.attendance_status || 'Present', is_wfh: false, remarks: '', reason: '' });
    setEditMode(true);
    setTargetAttendanceId(emp.attendance_id);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(f => ({ ...f, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      setAlertDialog({
        isOpen: true,
        title: 'Invalid Date',
        message: 'Cannot create manual attendance for future dates.',
        type: 'error'
      });
      return;
    }
    executeSubmit();
  };

  const executeSubmit = async () => {
    try {
      if (editMode) {
        const payload = {
          login_time: formData.login_time ? `${date}T${formData.login_time}:00` : null,
          logout_time: formData.logout_time ? `${date}T${formData.logout_time}:00` : null,
          attendance_status: formData.attendance_status,
          is_wfh: formData.is_wfh,
          reason: formData.reason
        };
        const res = await updateManualAttendance(targetAttendanceId, payload);
        if (res.data.success) {
          setAlertDialog({ isOpen: true, title: 'Success', message: res.data.message, type: 'success' });
          setShowModal(false);
          fetchData();
        }
      } else {
        const records = selectedIds.map(empId => ({
          employee_id: empId,
          attendance_date: date,
          login_time: formData.login_time ? `${date}T${formData.login_time}:00` : null,
          logout_time: formData.logout_time ? `${date}T${formData.logout_time}:00` : null,
          attendance_status: formData.attendance_status,
          is_wfh: formData.is_wfh,
          remarks: formData.remarks
        }));
        const payload = { records, reason: formData.reason };
        const res = await createManualAttendance(payload);
        if (res.data.success) {
          setAlertDialog({ isOpen: true, title: 'Success', message: res.data.message, type: 'success' });
          setShowModal(false);
          fetchData();
        }
      }
    } catch (error) {
      setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Operation failed', type: 'error' });
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0 dark-scroll">
        <div className="px-5 py-6 lg:px-8 lg:py-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-14 lg:pt-0">
            <div>
              <h1 className="text-xl font-bold text-white">Manual Attendance</h1>
              <p className="text-sm text-slate-400 mt-0.5">Emergency Attendance Management</p>
            </div>
            <button onClick={openBulkModal} disabled={selectedIds.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedIds.length > 0 ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-glow-amber-sm' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
              <FiEdit size={16} /> Add for Selected ({selectedIds.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Date</label>
              <div className="relative">
                <FiCalendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#3B82F6]" />
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Department</label>
              <div className="relative">
                <FiFilter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                  className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#3B82F6] appearance-none">
                  <option value="" className="bg-[#1C2540]">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id} className="bg-[#1C2540]">{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#3B82F6] appearance-none">
                <option value="" className="bg-[#1C2540]">All</option>
                <option value="No Record" className="bg-[#1C2540]">No Record</option>
                <option value="Present" className="bg-[#1C2540]">Present</option>
                <option value="Absent" className="bg-[#1C2540]">Absent</option>
                <option value="Late" className="bg-[#1C2540]">Late</option>
                <option value="Half Day" className="bg-[#1C2540]">Half Day</option>
                <option value="Leave" className="bg-[#1C2540]">Leave</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Search</label>
              <div className="relative">
                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
                <input type="text" placeholder="Name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#3B82F6]" />
              </div>
            </div>
          </div>

          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
            <div className="overflow-x-auto dark-scroll">
              <table className="min-w-full divide-y divide-white/[0.04]">
                <thead className="bg-[#0E1320]/50">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <button onClick={toggleAll} className="text-slate-400 hover:text-white">
                        {selectedIds.length > 0 && selectedIds.length === filteredEmployees.length ? <FiCheckSquare size={18} className="text-blue-400" /> : <FiSquare size={18} />}
                      </button>
                    </th>
                    {['Emp ID', 'Name', 'Department', 'Status', 'Check-In', 'Check-Out', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#64748B] uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center"><Spinner size={32} /></td></tr>
                  ) : filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                    <tr key={emp.employee_id} className={`admin-table-row ${selectedIds.includes(emp.employee_id) ? 'bg-blue-500/5' : ''}`}>
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleSelection(emp.employee_id)} className="text-slate-400 hover:text-white">
                          {selectedIds.includes(emp.employee_id) ? <FiCheckSquare size={18} className="text-blue-400" /> : <FiSquare size={18} />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-400 font-mono whitespace-nowrap">{emp.employee_id}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-white whitespace-nowrap">{emp.name}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-400 whitespace-nowrap">{emp.department_name || '-'}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {emp.attendance_status ? <StatusBadge status={emp.attendance_status} dark /> : <span className="text-xs text-slate-500 font-medium px-2.5 py-1 bg-white/5 rounded-full border border-white/10">No Record</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                        {emp.login_time ? new Date(emp.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                        {emp.logout_time ? new Date(emp.logout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {emp.attendance_id ? (
                          emp.validation_method === 'Manual' ? (
                            <div className="flex items-center gap-3">
                              <button onClick={() => openEditModal(emp)} className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-1.5"><FiEdit size={14} /> Edit</button>
                              <button onClick={() => handleDelete(emp)} className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium flex items-center gap-1.5"><FiTrash2 size={14} /> Delete</button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">System Generated</span>
                          )
                        ) : (
                          <button onClick={() => { setSelectedIds([emp.employee_id]); setTimeout(openBulkModal, 50); }} className="text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium flex items-center gap-1.5"><FiPlus size={14} /> Add</button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3"><FiLayers size={28} className="text-[#475569]" /><p className="text-sm font-medium text-[#64748B]">No employees found</p></div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen} 
        onClose={() => setConfirmDialog(d => ({ ...d, isOpen: false }))} 
        onConfirm={() => {
          confirmDialog.onConfirm && confirmDialog.onConfirm();
          setConfirmDialog(d => ({ ...d, isOpen: false }));
        }} 
        title={confirmDialog.title || 'Confirm'}
        message={confirmDialog.message || ''}
        type={confirmDialog.type || 'warning'}
        confirmText={confirmDialog.confirmText || 'Confirm'}
      />
      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog(d => ({ ...d, isOpen: false }))} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-[#1C2540] border border-white/10 rounded-2xl shadow-clay-admin-modal w-full max-w-xl flex flex-col animate-scale-in max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-base font-bold text-white">{editMode ? 'Edit Manual Attendance' : 'Add Manual Attendance'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{editMode ? 'Modify emergency entry' : `Creating entry for ${selectedIds.length} employee(s) on ${date}`}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white/5 transition-colors"><FiX size={18} /></button>
            </div>
            
            <div className="px-6 py-5 overflow-y-auto dark-scroll space-y-4">
              <form id="manual-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Check-In Time</label>
                    <input type="time" name="login_time" value={formData.login_time} onChange={handleInputChange} className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#3B82F6]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Check-Out Time</label>
                    <input type="time" name="logout_time" value={formData.logout_time} onChange={handleInputChange} className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#3B82F6]" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Status *</label>
                    <select name="attendance_status" value={formData.attendance_status} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#3B82F6] appearance-none">
                      <option value="Present" className="bg-[#1C2540]">Present</option>
                      <option value="Absent" className="bg-[#1C2540]">Absent</option>
                      <option value="Late" className="bg-[#1C2540]">Late</option>
                      <option value="Half Day" className="bg-[#1C2540]">Half Day</option>
                      <option value="Leave" className="bg-[#1C2540]">Leave</option>
                      <option value="Holiday" className="bg-[#1C2540]">Holiday</option>
                      <option value="Weekend" className="bg-[#1C2540]">Weekend</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="is_wfh" checked={formData.is_wfh} onChange={handleInputChange} className="hidden" />
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.is_wfh ? 'bg-blue-500 border-blue-500' : 'border-slate-500 bg-transparent'}`}>
                        {formData.is_wfh && <FiCheckSquare size={12} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium text-slate-300">Work From Home</span>
                    </label>
                  </div>
                </div>

                {!editMode && (
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Remarks (Optional)</label>
                    <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} placeholder="e.g. Field work" className="w-full bg-white/5 border border-white/[0.06] text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#3B82F6]" />
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Admin Reason *</label>
                  <p className="text-xs text-slate-400 mb-2">Required for audit logging (e.g. Server Down, Biometric Failure, Management Approval)</p>
                  <input type="text" name="reason" value={formData.reason} onChange={handleInputChange} required placeholder="Why is this being added manually?" className="w-full bg-amber-500/10 border border-amber-500/30 text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-amber-500/50" />
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0E1320]/60 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" form="manual-form" className="px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white rounded-xl shadow-glow-amber-sm transition-all duration-200 flex items-center gap-2">
                <FiSave size={16} /> {editMode ? 'Save Changes' : 'Create Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManualAttendance;
