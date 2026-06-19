import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { Spinner } from '../components/Loader';
import { FiUmbrella, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import { getAllHolidays, addHoliday, updateHoliday, deleteHoliday, toggleHolidayStatus } from '../services/api';

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
    <input {...props} className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
  </div>
);

const AdminHolidays = () => {
  const [holidays,        setHolidays]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [formData, setFormData] = useState({ holiday_date: '', holiday_type: 'Government Holiday', holiday_title: '', holiday_note: '', is_enabled: true });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });
  const [alertDialog,   setAlertDialog]   = useState({ isOpen: false, title: '', message: '', type: 'success' });

  useEffect(() => { fetchHolidays(); }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const r = await getAllHolidays();
      if (r.data.success) setHolidays(r.data.holidays);
    } catch (e) {
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Failed to load holidays', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleInput = e => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(f => ({ ...f, [e.target.name]: v }));
  };

  const resetForm = () => setFormData({ holiday_date: '', holiday_type: 'Government Holiday', holiday_title: '', holiday_note: '', is_enabled: true });

  const handleAdd = async () => {
    try {
      const r = await addHoliday(formData);
      if (r.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Holiday added!', type: 'success' });
        setShowAddModal(false); resetForm(); fetchHolidays();
      }
    } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to add holiday', type: 'error' }); }
  };

  const handleEdit = async () => {
    try {
      const r = await updateHoliday(selectedHoliday.id, formData);
      if (r.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Holiday updated!', type: 'success' });
        setShowEditModal(false); resetForm(); setSelectedHoliday(null); fetchHolidays();
      }
    } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to update', type: 'error' }); }
  };

  const handleToggle = async holiday => {
    try {
      const r = await toggleHolidayStatus(holiday.id, !holiday.is_enabled);
      if (r.data.success) { setAlertDialog({ isOpen: true, title: 'Success', message: `Holiday ${!holiday.is_enabled ? 'enabled' : 'disabled'}!`, type: 'success' }); fetchHolidays(); }
    } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: 'Failed to toggle status', type: 'error' }); }
  };

  const handleDelete = holiday => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Holiday', type: 'danger',
      message: `Delete "${holiday.holiday_title}" on ${formatDate(holiday.holiday_date)}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const r = await deleteHoliday(holiday.id);
          if (r.data.success) { setAlertDialog({ isOpen: true, title: 'Success', message: 'Holiday deleted!', type: 'success' }); fetchHolidays(); }
        } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: 'Failed to delete', type: 'error' }); }
      },
    });
  };

  const openEdit = holiday => {
    setSelectedHoliday(holiday);
    setFormData({ holiday_date: holiday.holiday_date.split('T')[0], holiday_type: holiday.holiday_type, holiday_title: holiday.holiday_title, holiday_note: holiday.holiday_note || '', is_enabled: holiday.is_enabled });
    setShowEditModal(true);
  };

  const formatDate = ds => new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const HolidayModal = ({ show, onClose, onSave, title }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-scale-in">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><FiX size={18} /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <InputField label="Date" type="date" name="holiday_date" value={formData.holiday_date} onChange={handleInput} required />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Type</label>
              <select name="holiday_type" value={formData.holiday_type} onChange={handleInput}
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                <option value="Government Holiday">Government Holiday</option>
                <option value="Office Holiday">Office Holiday</option>
              </select>
            </div>
            <InputField label="Title" type="text" name="holiday_title" value={formData.holiday_title} onChange={handleInput} required placeholder="e.g. Independence Day" />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Note <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea name="holiday_note" value={formData.holiday_note} onChange={handleInput} rows={2} placeholder="Additional note…"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="is_enabled" checked={formData.is_enabled} onChange={handleInput} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span className="text-sm text-slate-700 font-medium">Enable this holiday</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={onSave} className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save Holiday</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Holiday Management</h1>
              <p className="text-sm text-slate-500 mt-0.5">{holidays.length} holidays configured</p>
            </div>
            <button onClick={() => { resetForm(); setShowAddModal(true); }} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              <FiPlus size={16} /> Add Holiday
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16"><Spinner size={32} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Date','Type','Title','Note','Status','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {holidays.length > 0 ? holidays.map(h => (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatDate(h.holiday_date)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={h.holiday_type} />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{h.holiday_title}</td>
                        <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{h.holiday_note || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => handleToggle(h)} className={`text-3xl transition-colors ${h.is_enabled ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-400'}`}>
                            {h.is_enabled ? <FiToggleRight /> : <FiToggleLeft />}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(h)} className="w-7 h-7 rounded-md flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"><FiEdit2 size={13} /></button>
                            <button onClick={() => handleDelete(h)} className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><FiTrash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-4 py-14 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <FiUmbrella size={28} />
                          <p className="text-sm font-medium">No holidays configured yet</p>
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

      <HolidayModal show={showAddModal}  onClose={() => setShowAddModal(false)}  onSave={handleAdd}  title="Add Holiday" />
      <HolidayModal show={showEditModal} onClose={() => setShowEditModal(false)} onSave={handleEdit} title="Edit Holiday" />
      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(d => ({ ...d, isOpen: false }))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} confirmText="Delete" />
      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog(d => ({ ...d, isOpen: false }))} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
};

export default AdminHolidays;
