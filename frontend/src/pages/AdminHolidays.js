import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { FiUmbrella, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import { getAllHolidays, addHoliday, updateHoliday, deleteHoliday, toggleHolidayStatus } from '../services/api';

// Modal component outside to prevent re-creation
const HolidayModal = ({ show, onClose, onSave, title, formData, handleInput }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C2540] border border-white/[0.08] rounded-2xl shadow-clay-admin-modal w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] transition-colors"><FiX size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div><label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Date</label><input type="date" name="holiday_date" value={formData.holiday_date} onChange={handleInput} required className="admin-input" /></div>
          <div><label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Type</label>
            <select name="holiday_type" value={formData.holiday_type} onChange={handleInput} className="admin-select">
              <option value="Government Holiday">Government Holiday</option>
              <option value="Office Holiday">Office Holiday</option>
            </select>
          </div>
          <div><label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Title</label><input type="text" name="holiday_title" value={formData.holiday_title} onChange={handleInput} required placeholder="e.g. Independence Day" className="admin-input" /></div>
          <div><label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Note <span className="text-[#475569] font-normal normal-case">(optional)</span></label>
            <textarea name="holiday_note" value={formData.holiday_note} onChange={handleInput} rows={2} placeholder="Additional note…" className="admin-input resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="is_enabled" checked={formData.is_enabled} onChange={handleInput} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#3B82F6]" />
            <span className="text-sm text-[#CBD5E1] font-medium">Enable this holiday</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-[#161D2E]/60 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#94A3B8] border border-white/10 rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onSave} className="px-5 py-2 text-sm font-semibold bg-[#3B82F6] hover:bg-blue-500 text-white rounded-xl shadow-glow-blue-sm transition-all duration-200">Save Holiday</button>
        </div>
      </div>
    </div>
  );
};

const AdminHolidays = () => {
  const [holidays,        setHolidays]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [formData, setFormData] = useState({ holiday_date:'', holiday_type:'Government Holiday', holiday_title:'', holiday_note:'', is_enabled:true });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen:false, title:'', message:'', onConfirm:null, type:'danger' });
  const [alertDialog,   setAlertDialog]   = useState({ isOpen:false, title:'', message:'', type:'success' });

  useEffect(() => { fetchHolidays(); }, []);

  const fetchHolidays = async () => {
    try { setLoading(true); const r = await getAllHolidays(); if (r.data.success) setHolidays(r.data.holidays); }
    catch (e) { setAlertDialog({ isOpen:true, title:'Error', message:'Failed to load holidays', type:'error' }); }
    finally { setLoading(false); }
  };

  const handleInput = e => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setFormData(f => ({ ...f, [e.target.name]: v })); };
  const resetForm = () => setFormData({ holiday_date:'', holiday_type:'Government Holiday', holiday_title:'', holiday_note:'', is_enabled:true });

  const handleAdd = async () => {
    try { const r = await addHoliday(formData); if (r.data.success) { setAlertDialog({ isOpen:true, title:'Success', message:'Holiday added!', type:'success' }); setShowAddModal(false); resetForm(); fetchHolidays(); } }
    catch (e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to add holiday', type:'error' }); }
  };
  const handleEdit = async () => {
    try { const r = await updateHoliday(selectedHoliday.id, formData); if (r.data.success) { setAlertDialog({ isOpen:true, title:'Success', message:'Holiday updated!', type:'success' }); setShowEditModal(false); resetForm(); setSelectedHoliday(null); fetchHolidays(); } }
    catch (e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to update', type:'error' }); }
  };
  const handleToggle = async holiday => {
    try { const r = await toggleHolidayStatus(holiday.id, !holiday.is_enabled); if (r.data.success) { setAlertDialog({ isOpen:true, title:'Success', message:`Holiday ${!holiday.is_enabled ? 'enabled' : 'disabled'}!`, type:'success' }); fetchHolidays(); } }
    catch (e) { setAlertDialog({ isOpen:true, title:'Error', message:'Failed to toggle status', type:'error' }); }
  };
  const handleDelete = holiday => setConfirmDialog({
    isOpen:true, title:'Delete Holiday', type:'danger',
    message:`Delete "${holiday.holiday_title}" on ${formatDate(holiday.holiday_date)}? This cannot be undone.`,
    onConfirm: async () => {
      try { const r = await deleteHoliday(holiday.id); if (r.data.success) { setAlertDialog({ isOpen:true, title:'Success', message:'Holiday deleted!', type:'success' }); fetchHolidays(); } }
      catch (e) { setAlertDialog({ isOpen:true, title:'Error', message:'Failed to delete', type:'error' }); }
    },
  });
  const openEdit = holiday => { setSelectedHoliday(holiday); setFormData({ holiday_date: holiday.holiday_date.split('T')[0], holiday_type: holiday.holiday_type, holiday_title: holiday.holiday_title, holiday_note: holiday.holiday_note || '', is_enabled: holiday.is_enabled }); setShowEditModal(true); };
  const formatDate = ds => new Date(ds).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0 dark-scroll">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div><h1 className="text-xl font-bold text-white">Holiday Management</h1><p className="text-sm text-[#94A3B8] mt-0.5">{holidays.length} holidays configured</p></div>
            <button onClick={() => { resetForm(); setShowAddModal(true); }} className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-glow-blue-sm hover:-translate-y-0.5">
              <FiPlus size={16} /> Add Holiday
            </button>
          </div>

          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
            {loading ? <div className="flex items-center justify-center py-16"><Spinner size={32} /></div> : (
              <div className="overflow-x-auto dark-scroll">
                <table className="min-w-full divide-y divide-white/[0.04]">
                  <thead className="bg-[#0E1320]/50">
                    <tr>{['Date','Type','Title','Note','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {holidays.length > 0 ? holidays.map(h => (
                      <tr key={h.id} className="admin-table-row">
                        <td className="px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{formatDate(h.holiday_date)}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={h.holiday_type} dark /></td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-white whitespace-nowrap">{h.holiday_title}</td>
                        <td className="px-4 py-3.5 text-sm text-[#94A3B8] max-w-xs truncate">{h.holiday_note || '—'}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <button onClick={() => handleToggle(h)} className={`text-3xl transition-colors ${h.is_enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#334155] hover:text-[#475569]'}`}>
                            {h.is_enabled ? <FiToggleRight /> : <FiToggleLeft />}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(h)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#60A5FA] hover:bg-blue-500/10 transition-colors"><FiEdit2 size={13} /></button>
                            <button onClick={() => handleDelete(h)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3"><FiUmbrella size={28} className="text-[#475569]" /><p className="text-sm font-medium text-[#64748B]">No holidays configured yet</p></div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <HolidayModal key="add" show={showAddModal}  onClose={() => setShowAddModal(false)}  onSave={handleAdd}  title="Add Holiday" formData={formData} handleInput={handleInput} />
      <HolidayModal key="edit" show={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleEdit} title="Edit Holiday" formData={formData} handleInput={handleInput} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(d => ({ ...d, isOpen:false }))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} confirmText="Delete" />
      <AlertDialog   isOpen={alertDialog.isOpen}   onClose={() => setAlertDialog(d => ({ ...d, isOpen:false }))}   title={alertDialog.title}   message={alertDialog.message}   type={alertDialog.type} />
    </div>
  );
};
export default AdminHolidays;
