import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { Spinner } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiEye, FiEyeOff, FiShield, FiLock, FiList, FiX } from 'react-icons/fi';

const TABS = [
  { id:'admins',   label:'Manage Admins',  Icon:FiShield },
  { id:'password', label:'Change Password', Icon:FiLock   },
  { id:'logs',     label:'Login Logs',      Icon:FiList   },
];

const AdminManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('admins');
  const [loading,   setLoading]   = useState(false);
  const [admins,    setAdmins]    = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [alertDialog,   setAlertDialog]   = useState({ isOpen:false, title:'', message:'', type:'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen:false, title:'', message:'', onConfirm:null, type:'danger' });
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingAdmin,  setEditingAdmin]  = useState(null);
  const [adminForm,   setAdminForm]   = useState({ username:'', email:'', password:'' });
  const [passwordForm,setPasswordForm]= useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [showPw, setShowPw] = useState({ current:false, new:false, confirm:false });
  const [dateFilter, setDateFilter] = useState({ startDate:'', endDate:'' });

  useEffect(() => {
    if (activeTab === 'admins') fetchAdmins();
    else if (activeTab === 'logs') fetchLoginLogs();
  }, [activeTab]); // eslint-disable-line

  const fetchAdmins = async () => { try { setLoading(true); const r = await api.get('/admins'); setAdmins(r.data.admins); } catch(e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to fetch admins', type:'error' }); } finally { setLoading(false); } };
  const fetchLoginLogs = async () => {
    try { setLoading(true); const params = {}; if (dateFilter.startDate) params.startDate = dateFilter.startDate; if (dateFilter.endDate) params.endDate = dateFilter.endDate; const r = await api.get('/admins/login-logs', { params }); setLoginLogs(r.data.logs); }
    catch(e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to fetch logs', type:'error' }); }
    finally { setLoading(false); }
  };

  const handleSaveAdmin = async () => {
    if (!adminForm.username || !adminForm.email) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'Username and email are required', type:'error' }); return; }
    if (!editingAdmin && !adminForm.password) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'Password is required for new admin', type:'error' }); return; }
    try { setLoading(true); editingAdmin ? await api.put(`/admins/${editingAdmin.id}`, { username:adminForm.username, email:adminForm.email }) : await api.post('/admins', adminForm); setAlertDialog({ isOpen:true, title:'Success', message: editingAdmin ? 'Admin updated!' : 'Admin added!', type:'success' }); setShowAdminForm(false); fetchAdmins(); }
    catch(e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to save admin', type:'error' }); }
    finally { setLoading(false); }
  };

  const handleDeleteAdmin = admin => setConfirmDialog({
    isOpen:true, title:'Delete Admin', type:'danger', message:`Delete admin "${admin.username}"? This cannot be undone.`,
    onConfirm: async () => { try { setLoading(true); await api.delete(`/admins/${admin.id}`); setAlertDialog({ isOpen:true, title:'Success', message:'Admin deleted!', type:'success' }); fetchAdmins(); } catch(e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to delete', type:'error' }); } finally { setLoading(false); } },
  });

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'All fields are required', type:'error' }); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'Passwords do not match', type:'error' }); return; }
    if (passwordForm.newPassword.length < 6) { setAlertDialog({ isOpen:true, title:'Validation Error', message:'Password must be at least 6 characters', type:'error' }); return; }
    try { setLoading(true); await api.post('/admins/change-password', { adminId:user.id, currentPassword:passwordForm.currentPassword, newPassword:passwordForm.newPassword }); setAlertDialog({ isOpen:true, title:'Success', message:'Password changed successfully!', type:'success' }); setPasswordForm({ currentPassword:'', newPassword:'', confirmPassword:'' }); }
    catch(e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to change password', type:'error' }); }
    finally { setLoading(false); }
  };

  const handleDownloadLogs = async () => {
    try { setLoading(true); const params = {}; if (dateFilter.startDate) params.startDate = dateFilter.startDate; if (dateFilter.endDate) params.endDate = dateFilter.endDate;
      const response = await api.get('/pdf/admin-logs', { params, responseType:'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data])); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `admin_login_logs_${Date.now()}.pdf`); document.body.appendChild(link); link.click(); link.remove();
      setAlertDialog({ isOpen:true, title:'Success', message:'PDF downloaded!', type:'success' }); }
    catch(e) { setAlertDialog({ isOpen:true, title:'Error', message: e.response?.data?.message || 'Failed to download PDF', type:'error' }); }
    finally { setLoading(false); }
  };

  const PwField = ({ label, field, pwKey }) => (
    <div>
      <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <input type={showPw[pwKey] ? 'text' : 'password'} value={passwordForm[field]} onChange={e => setPasswordForm(f => ({ ...f, [field]: e.target.value }))} className="admin-input pr-10" />
        <button type="button" onClick={() => setShowPw(p => ({ ...p, [pwKey]: !p[pwKey] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]">
          {showPw[pwKey] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0 dark-scroll">
        <div className="px-5 py-6 lg:px-8 lg:py-8 pt-16 lg:pt-8">
          <div className="mb-6"><h1 className="text-xl font-bold text-white">Admin Management</h1><p className="text-sm text-[#94A3B8] mt-0.5">Manage admin users, passwords, and login logs</p></div>

          {/* Tabs */}
          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl mb-5 shadow-clay-admin">
            <div className="flex border-b border-white/[0.06] px-2 pt-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 mr-1 ${
                    activeTab === t.id ? 'border-[#3B82F6] text-[#60A5FA]' : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
                  }`}>
                  <t.Icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Admins ── */}
          {activeTab === 'admins' && (
            <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="font-bold text-white text-sm">Admin Users</h2>
                <button onClick={() => { setEditingAdmin(null); setAdminForm({ username:'', email:'', password:'' }); setShowAdminForm(true); }}
                  className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-glow-blue-sm">
                  <FiPlus size={15} /> Add Admin
                </button>
              </div>
              {loading ? <div className="flex items-center justify-center py-16"><Spinner size={32} /></div> : (
                <div className="overflow-x-auto dark-scroll">
                  <table className="min-w-full divide-y divide-white/[0.04]">
                    <thead className="bg-[#0E1320]/50">
                      <tr>{['ID','Username','Email','Created','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {admins.map(a => (
                        <tr key={a.id} className="admin-table-row">
                          <td className="px-4 py-3.5 text-sm text-[#94A3B8] font-mono">{a.id}</td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-white whitespace-nowrap">{a.username}</td>
                          <td className="px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{a.email}</td>
                          <td className="px-4 py-3.5 text-sm text-[#94A3B8] whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingAdmin(a); setAdminForm({ username:a.username, email:a.email, password:'' }); setShowAdminForm(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#60A5FA] hover:bg-blue-500/10 transition-colors"><FiEdit2 size={13} /></button>
                              <button onClick={() => handleDeleteAdmin(a)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"><FiTrash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {admins.length === 0 && <p className="text-center py-10 text-sm text-[#64748B]">No admin users found.</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Password ── */}
          {activeTab === 'password' && (
            <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl p-6 max-w-md shadow-clay-admin">
              <h2 className="font-bold text-white mb-5">Change Admin Password</h2>
              <div className="space-y-4">
                <PwField label="Current Password" field="currentPassword" pwKey="current" />
                <PwField label="New Password"     field="newPassword"     pwKey="new"     />
                <PwField label="Confirm Password" field="confirmPassword" pwKey="confirm" />
              </div>
              <button onClick={handleChangePassword} disabled={loading} className="w-full mt-5 bg-[#3B82F6] hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all duration-200 shadow-glow-blue-sm">
                {loading ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          )}

          {/* ── Logs ── */}
          {activeTab === 'logs' && (
            <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.06]">
                <div className="flex flex-wrap gap-3">
                  {['startDate','endDate'].map(f => (
                    <div key={f}>
                      <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">{f === 'startDate' ? 'Start Date' : 'End Date'}</label>
                      <input type="date" value={dateFilter[f]} onChange={e => setDateFilter(d => ({ ...d, [f]: e.target.value }))} className="admin-input" style={{ width: 'auto' }} />
                    </div>
                  ))}
                  <div className="flex items-end">
                    <button onClick={fetchLoginLogs} className="px-4 py-2.5 bg-[#3B82F6] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-glow-blue-sm">Apply</button>
                  </div>
                </div>
                <button onClick={handleDownloadLogs} disabled={loginLogs.length === 0}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all duration-200 shadow-sm">
                  <FiDownload size={14} /> Download PDF
                </button>
              </div>
              {loading ? <div className="flex items-center justify-center py-16"><Spinner size={32} /></div> : (
                <div className="overflow-x-auto dark-scroll">
                  <table className="min-w-full divide-y divide-white/[0.04]">
                    <thead className="bg-[#0E1320]/50">
                      <tr>{['ID','Username','Login Time','IP Address','Browser','Device'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {loginLogs.map(log => (
                        <tr key={log.id} className="admin-table-row">
                          <td className="px-4 py-3.5 text-sm text-[#94A3B8] font-mono">{log.id}</td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-white whitespace-nowrap">{log.username}</td>
                          <td className="px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap">{new Date(log.login_time).toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-sm text-[#CBD5E1] whitespace-nowrap font-mono">{log.ip_address}</td>
                          <td className="px-4 py-3.5 text-sm text-[#94A3B8] max-w-[160px] truncate">{log.browser_info}</td>
                          <td className="px-4 py-3.5 text-sm text-[#94A3B8] max-w-[160px] truncate">{log.device_info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {loginLogs.length === 0 && <p className="text-center py-10 text-sm text-[#64748B]">No login logs found.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Form Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C2540] border border-white/[0.08] rounded-2xl shadow-clay-admin-modal w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <h2 className="text-base font-bold text-white">{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
              <button onClick={() => setShowAdminForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white/5 hover:text-[#94A3B8] transition-colors"><FiX size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[['Username','username','text'],['Email','email','email'],...(!editingAdmin?[['Password','password','password']]:[])] .map(([label,field,type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">{label}</label>
                  <input type={type} value={adminForm[field]} onChange={e => setAdminForm(f => ({ ...f, [field]: e.target.value }))} required className="admin-input" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-[#161D2E]/60 rounded-b-2xl">
              <button onClick={() => setShowAdminForm(false)} className="px-4 py-2 text-sm font-semibold text-[#94A3B8] border border-white/10 rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSaveAdmin} className="px-5 py-2 text-sm font-semibold bg-[#3B82F6] hover:bg-blue-500 text-white rounded-xl shadow-glow-blue-sm transition-all duration-200">{editingAdmin ? 'Update' : 'Add Admin'}</button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog   isOpen={alertDialog.isOpen}   onClose={() => setAlertDialog(d => ({ ...d, isOpen:false }))}   title={alertDialog.title}   message={alertDialog.message}   type={alertDialog.type} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(d => ({ ...d, isOpen:false }))} onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(d => ({ ...d, isOpen:false })); }} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} confirmText="Delete" />
    </div>
  );
};
export default AdminManagement;
