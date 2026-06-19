import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FiEdit2, FiTrash2, FiPlus, FiDownload, FiEye, FiEyeOff,
  FiShield, FiLock, FiList, FiX,
} from 'react-icons/fi';

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
    <input {...props} className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
  </div>
);

const PasswordField = ({ label, show, onToggle, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
    <div className="relative">
      <input type={show ? 'text' : 'password'} {...props}
        className="w-full px-3 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  </div>
);

const TABS = [
  { id: 'admins',   label: 'Manage Admins',   Icon: FiShield },
  { id: 'password', label: 'Change Password',  Icon: FiLock   },
  { id: 'logs',     label: 'Login Logs',       Icon: FiList   },
];

const AdminManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('admins');
  const [loading,   setLoading]   = useState(false);
  const [admins,    setAdmins]    = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [alertDialog,   setAlertDialog]   = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingAdmin,  setEditingAdmin]  = useState(null);
  const [adminForm, setAdminForm] = useState({ username: '', email: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (activeTab === 'admins') fetchAdmins();
    else if (activeTab === 'logs') fetchLoginLogs();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAdmins = async () => {
    try { setLoading(true); const r = await api.get('/admins'); setAdmins(r.data.admins); }
    catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to fetch admins', type: 'error' }); }
    finally { setLoading(false); }
  };

  const fetchLoginLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate)   params.endDate   = dateFilter.endDate;
      const r = await api.get('/admins/login-logs', { params });
      setLoginLogs(r.data.logs);
    } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to fetch logs', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleSaveAdmin = async () => {
    if (!adminForm.username || !adminForm.email) { setAlertDialog({ isOpen: true, title: 'Validation Error', message: 'Username and email are required', type: 'error' }); return; }
    if (!editingAdmin && !adminForm.password)    { setAlertDialog({ isOpen: true, title: 'Validation Error', message: 'Password is required for new admin', type: 'error' }); return; }
    try {
      setLoading(true);
      editingAdmin
        ? await api.put(`/admins/${editingAdmin.id}`, { username: adminForm.username, email: adminForm.email })
        : await api.post('/admins', adminForm);
      setAlertDialog({ isOpen: true, title: 'Success', message: editingAdmin ? 'Admin updated!' : 'Admin added!', type: 'success' });
      setShowAdminForm(false); fetchAdmins();
    } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to save admin', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleDeleteAdmin = admin => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Admin', type: 'danger',
      message: `Delete admin "${admin.username}"? This cannot be undone.`,
      onConfirm: async () => {
        try { setLoading(true); await api.delete(`/admins/${admin.id}`); setAlertDialog({ isOpen: true, title: 'Success', message: 'Admin deleted!', type: 'success' }); fetchAdmins(); }
        catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to delete', type: 'error' }); }
        finally { setLoading(false); }
      },
    });
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) { setAlertDialog({ isOpen: true, title: 'Validation Error', message: 'All fields are required', type: 'error' }); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setAlertDialog({ isOpen: true, title: 'Validation Error', message: 'Passwords do not match', type: 'error' }); return; }
    if (passwordForm.newPassword.length < 6) { setAlertDialog({ isOpen: true, title: 'Validation Error', message: 'Password must be at least 6 characters', type: 'error' }); return; }
    try {
      setLoading(true);
      await api.post('/admins/change-password', { adminId: user.id, currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setAlertDialog({ isOpen: true, title: 'Success', message: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to change password', type: 'error' }); }
    finally { setLoading(false); }
  };

  const handleDownloadLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate)   params.endDate   = dateFilter.endDate;
      const response = await api.get('/pdf/admin-logs', { params, responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', `admin_login_logs_${Date.now()}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      setAlertDialog({ isOpen: true, title: 'Success', message: 'PDF downloaded!', type: 'success' });
    } catch (e) { setAlertDialog({ isOpen: true, title: 'Error', message: e.response?.data?.message || 'Failed to download PDF', type: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Admin Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage admin users, passwords, and login logs</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 mb-5">
            <div className="flex border-b border-slate-200 px-1 pt-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors mr-1 ${
                    activeTab === t.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  <t.Icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Admins ── */}
          {activeTab === 'admins' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">Admin Users</h2>
                <button onClick={() => { setEditingAdmin(null); setAdminForm({ username: '', email: '', password: '' }); setShowAdminForm(true); }}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  <FiPlus size={15} /> Add Admin
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16"><Spinner size={32} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>{['ID','Username','Email','Created','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {admins.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-500 font-mono">{a.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{a.username}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.email}</td>
                          <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingAdmin(a); setAdminForm({ username: a.username, email: a.email, password: '' }); setShowAdminForm(true); }}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"><FiEdit2 size={13} /></button>
                              <button onClick={() => handleDeleteAdmin(a)}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><FiTrash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {admins.length === 0 && <p className="text-center py-10 text-sm text-slate-400">No admin users found.</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Password ── */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md">
              <h2 className="font-semibold text-slate-900 mb-5">Change Admin Password</h2>
              <div className="space-y-4">
                <PasswordField label="Current Password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} show={showPw.current} onToggle={() => setShowPw(p => ({ ...p, current: !p.current }))} />
                <PasswordField label="New Password"     value={passwordForm.newPassword}     onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}     show={showPw.new}     onToggle={() => setShowPw(p => ({ ...p, new: !p.new }))} />
                <PasswordField label="Confirm Password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} show={showPw.confirm} onToggle={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} />
              </div>
              <button onClick={handleChangePassword} disabled={loading}
                className="w-full mt-5 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-sm">
                {loading ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          )}

          {/* ── Logs ── */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                    <input type="date" value={dateFilter.startDate} onChange={e => setDateFilter(f => ({ ...f, startDate: e.target.value }))}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                    <input type="date" value={dateFilter.endDate} onChange={e => setDateFilter(f => ({ ...f, endDate: e.target.value }))}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={fetchLoginLogs} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Apply</button>
                  </div>
                </div>
                <button onClick={handleDownloadLogs} disabled={loginLogs.length === 0}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:bg-slate-300 transition-colors shadow-sm">
                  <FiDownload size={14} /> Download PDF
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16"><Spinner size={32} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>{['ID','Username','Login Time','IP Address','Browser','Device'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loginLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-500 font-mono">{log.id}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{log.username}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{new Date(log.login_time).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap font-mono">{log.ip_address}</td>
                          <td className="px-4 py-3 text-sm text-slate-500 max-w-[160px] truncate">{log.browser_info}</td>
                          <td className="px-4 py-3 text-sm text-slate-500 max-w-[160px] truncate">{log.device_info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {loginLogs.length === 0 && <p className="text-center py-10 text-sm text-slate-400">No login logs found.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Form Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
              <button onClick={() => setShowAdminForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"><FiX size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <InputField label="Username" type="text" value={adminForm.username} onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))} required />
              <InputField label="Email"    type="email" value={adminForm.email}    onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}    required />
              {!editingAdmin && <InputField label="Password" type="password" value={adminForm.password} onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))} required />}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setShowAdminForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={handleSaveAdmin} className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">{editingAdmin ? 'Update' : 'Add Admin'}</button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog   isOpen={alertDialog.isOpen}   onClose={() => setAlertDialog(d => ({ ...d, isOpen: false }))}   title={alertDialog.title}   message={alertDialog.message}   type={alertDialog.type} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(d => ({ ...d, isOpen: false }))} onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(d => ({ ...d, isOpen: false })); }} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} confirmText="Delete" />
    </div>
  );
};

export default AdminManagement;
