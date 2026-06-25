import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DetailsDialog from '../components/DetailsDialog';
import ClearDataDialog from '../components/ClearDataDialog';
import AlertDialog from '../components/AlertDialog';
import { Spinner } from '../components/Loader';
import { FiShield, FiEye, FiEdit2, FiSave, FiX, FiRefreshCw, FiMonitor, FiList, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { updateDeviceAlias, clearEmployeeAuditLogs } from '../services/api';

const TABS = [
  { id:'audit',     label:'Audit Logs',         icon:FiList        },
  { id:'devices',   label:'Device Fingerprints', icon:FiMonitor     },
  { id:'rateLimit', label:'Rate Limits',          icon:FiAlertCircle },
];

const AdminTh = ({ children }) => (
  <th className="px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">{children}</th>
);
const AdminTd = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-[#CBD5E1] ${className}`}>{children}</td>
);
const EmptyState = ({ message }) => (
  <tr><td colSpan="99" className="text-center py-14 text-sm text-[#64748B]">{message}</td></tr>
);

const StatusPill = ({ status }) => {
  const map = {
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    failed:  'bg-red-500/15 text-red-400 border border-red-500/25',
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-white/5 text-[#94A3B8] border border-white/10'}`}>{status}</span>;
};

const DeviceTypePill = ({ type }) => {
  const map = {
    Desktop: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    Laptop:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    Mobile:  'bg-purple-500/15 text-purple-400 border border-purple-500/25',
    Tablet:  'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[type] || 'bg-white/5 text-[#94A3B8] border border-white/10'}`}>{type || 'Unknown'}</span>;
};

const AdminSecurityLogs = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editAlias, setEditAlias] = useState('');
  const [savingAlias, setSavingAlias] = useState(false);
  const [aliasError, setAliasError] = useState('');
  const [detailsDialog, setDetailsDialog] = useState({ isOpen:false, title:'', details:null });
  const [clearDialog, setClearDialog] = useState({ isOpen: false });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => { fetchData(); }, [activeTab]); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpointMap = { audit:'/security/audit-logs', devices:'/security/device-fingerprints', rateLimit:'/security/rate-limits' };
      const response = await axios.get(`${process.env.REACT_APP_API_URL}${endpointMap[activeTab]}`, config);
      if (response.data.success) {
        setData(activeTab === 'audit' ? response.data.logs || [] : activeTab === 'devices' ? response.data.devices || [] : response.data.data || []);
      }
    } catch (error) { console.error(error); setData([]); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : 'N/A';
  const handleEditAlias = (device) => { setEditingDevice(device.id); setEditAlias(device.device_alias || ''); setAliasError(''); };
  const handleCancelEdit = () => { setEditingDevice(null); setEditAlias(''); setAliasError(''); };

  const handleSaveAlias = async (deviceId) => {
    if (!editAlias.trim()) { setAliasError('Device alias cannot be empty'); return; }
    if (editAlias.trim().length > 255) { setAliasError('Max 255 characters'); return; }
    setSavingAlias(true); setAliasError('');
    try {
      const response = await updateDeviceAlias(deviceId, editAlias.trim());
      if (response.data.success) {
        setData(data.map(d => d.id === deviceId ? { ...d, device_alias: editAlias.trim(), updated_at: new Date().toISOString() } : d));
        setEditingDevice(null); setEditAlias('');
      } else { setAliasError(response.data.message || 'Failed to update alias'); }
    } catch (error) { setAliasError(error.response?.data?.message || 'Failed to update device alias'); }
    finally { setSavingAlias(false); }
  };

  const handleClearAuditLogs = async () => {
    try {
      const response = await clearEmployeeAuditLogs();
      if (response.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Employee audit logs cleared successfully', type: 'success' });
        fetchData();
      } else {
        setAlertDialog({ isOpen: true, title: 'Error', message: response.data.message || 'Failed to clear logs', type: 'error' });
      }
    } catch (error) {
      setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to clear audit logs', type: 'error' });
    }
  };

  const activeRateCount = activeTab === 'rateLimit' ? data.filter(r => (new Date() - new Date(r.window_start)) < 60000).length : null;

  const renderAuditLogs = () => (
    <table className="min-w-full">
      <thead className="bg-[#0E1320]/50"><tr><AdminTh>Time</AdminTh><AdminTh>User ID</AdminTh><AdminTh>Type</AdminTh><AdminTh>Action</AdminTh><AdminTh>Status</AdminTh><AdminTh>IP Address</AdminTh><AdminTh>Device</AdminTh><AdminTh>Details</AdminTh></tr></thead>
      <tbody className="divide-y divide-white/[0.04]">
        {data.length === 0 ? <EmptyState message="No audit logs found" /> : data.map((log, i) => (
          <tr key={i} className="admin-table-row">
            <AdminTd className="whitespace-nowrap text-[#64748B]">{formatDate(log.created_at)}</AdminTd>
            <AdminTd className="font-semibold text-white">{log.user_id}</AdminTd>
            <AdminTd>{log.user_type}</AdminTd>
            <AdminTd>{log.action}</AdminTd>
            <AdminTd><StatusPill status={log.status} /></AdminTd>
            <AdminTd>{log.ip_address || 'N/A'}</AdminTd>
            <AdminTd className="font-mono text-xs">{log.device_fingerprint ? log.device_fingerprint.substring(0,8)+'…' : 'N/A'}</AdminTd>
            <AdminTd>
              {log.details
                ? <button onClick={() => setDetailsDialog({ isOpen:true, title:`${log.action} — Details`, details:log.details })} className="flex items-center gap-1 text-[#60A5FA] hover:text-blue-400 text-xs font-semibold"><FiEye size={13} /> View</button>
                : <span className="text-[#334155]">—</span>}
            </AdminTd>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDeviceFingerprints = () => (
    <table className="min-w-full">
      <thead className="bg-[#0E1320]/50"><tr><AdminTh>Employee</AdminTh><AdminTh>Device Alias</AdminTh><AdminTh>Type</AdminTh><AdminTh>Browser</AdminTh><AdminTh>OS</AdminTh><AdminTh>Screen</AdminTh><AdminTh>First Seen</AdminTh><AdminTh>Last Seen</AdminTh><AdminTh></AdminTh></tr></thead>
      <tbody className="divide-y divide-white/[0.04]">
        {data.length === 0 ? <EmptyState message="No device fingerprints found" /> : data.map((device, i) => (
          <tr key={i} className="admin-table-row">
            <AdminTd><span className="font-semibold text-white block">{device.employee_id}</span>{device.employee_name && <span className="text-xs text-[#64748B]">{device.employee_name}</span>}</AdminTd>
            <AdminTd>
              {editingDevice === device.id ? (
                <div>
                  <input type="text" value={editAlias} onChange={(e) => setEditAlias(e.target.value)} className="admin-input text-sm" placeholder="e.g., Reception PC" maxLength="255" autoFocus />
                  {aliasError && <p className="text-xs text-red-400 mt-1">{aliasError}</p>}
                </div>
              ) : (
                <div>
                  <span className="block font-semibold text-white">{device.device_alias || <span className="text-[#475569] italic font-normal">No alias</span>}</span>
                  <span className="text-xs text-[#475569] font-mono">{device.device_fingerprint ? device.device_fingerprint.substring(0,8)+'…' : 'N/A'}</span>
                </div>
              )}
            </AdminTd>
            <AdminTd><DeviceTypePill type={device.device_type} /></AdminTd>
            <AdminTd><span className="block">{device.browser || 'N/A'}</span>{device.browser_version && <span className="text-xs text-[#475569]">v{device.browser_version}</span>}</AdminTd>
            <AdminTd>{device.operating_system || 'N/A'}</AdminTd>
            <AdminTd>{device.screen_resolution || 'N/A'}</AdminTd>
            <AdminTd className="whitespace-nowrap text-[#64748B]">{formatDate(device.first_seen_at)}</AdminTd>
            <AdminTd className="whitespace-nowrap text-[#64748B]">{formatDate(device.last_seen_at)}</AdminTd>
            <AdminTd>
              {editingDevice === device.id ? (
                <div className="flex gap-2">
                  <button onClick={() => handleSaveAlias(device.id)} disabled={savingAlias} className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40">{savingAlias ? <Spinner size="sm" /> : <FiSave size={15} />}</button>
                  <button onClick={handleCancelEdit} disabled={savingAlias} className="text-red-400 hover:text-red-300 disabled:opacity-40"><FiX size={15} /></button>
                </div>
              ) : (
                <button onClick={() => handleEditAlias(device)} className="text-[#60A5FA] hover:text-blue-400"><FiEdit2 size={14} /></button>
              )}
            </AdminTd>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderRateLimits = () => (
    <table className="min-w-full">
      <thead className="bg-[#0E1320]/50"><tr><AdminTh>Employee ID</AdminTh><AdminTh>IP Address</AdminTh><AdminTh>Request Count</AdminTh><AdminTh>Window Start</AdminTh><AdminTh>Status</AdminTh><AdminTh>Created</AdminTh></tr></thead>
      <tbody className="divide-y divide-white/[0.04]">
        {data.length === 0 ? <EmptyState message="No rate limit records found" /> : data.map((limit, i) => {
          const isActive = (new Date() - new Date(limit.window_start)) < 60000;
          return (
            <tr key={i} className="admin-table-row">
              <AdminTd className="font-semibold text-white">{limit.employee_id}</AdminTd>
              <AdminTd>{limit.ip_address}</AdminTd>
              <AdminTd><span className="font-bold text-white">{limit.request_count}</span></AdminTd>
              <AdminTd className="whitespace-nowrap text-[#64748B]">{formatDate(limit.window_start)}</AdminTd>
              <AdminTd>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${isActive ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'bg-white/5 text-[#64748B] border-white/10'}`}>
                  {isActive ? 'Active' : 'Expired'}
                </span>
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-[#64748B]">{formatDate(limit.created_at)}</AdminTd>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto dark-scroll">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Security Logs</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">Monitor attendance security events, devices, and rate limiting</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label:'Total Records', value: data.length },
              { label: activeTab === 'devices' ? 'Unique Devices' : activeTab === 'audit' ? 'Audit Events' : 'Rate Limit Records', value: data.length },
              { label:'Active Rate Limits', value: activeRateCount ?? '—' },
            ].map(({ label, value }, i) => (
              <div key={i} className="bg-[#161D2E] border border-white/[0.07] rounded-2xl p-4 shadow-clay-admin">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Main table card */}
          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
            {/* Tab bar */}
            <div className="flex items-center border-b border-white/[0.06] px-2">
              {TABS.map(({ id, label, icon:Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === id ? 'border-[#3B82F6] text-[#60A5FA]' : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'}`}>
                  <Icon size={14} /> {label}
                </button>
              ))}
              <div className="ml-auto pr-3 flex gap-2">
                {activeTab === 'audit' && data.length > 0 && (
                  <button onClick={() => setClearDialog({ isOpen: true })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
                    <FiTrash2 size={12} />
                    Clear Table
                  </button>
                )}
                <button onClick={fetchData} disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#94A3B8] bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-50 transition-colors">
                  <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Loading…' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
              ) : (
                <>
                  {activeTab === 'audit'     && renderAuditLogs()}
                  {activeTab === 'devices'   && renderDeviceFingerprints()}
                  {activeTab === 'rateLimit' && renderRateLimits()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <DetailsDialog isOpen={detailsDialog.isOpen} onClose={() => setDetailsDialog({ isOpen:false, title:'', details:null })} title={detailsDialog.title} details={detailsDialog.details} />
      
      <ClearDataDialog
        isOpen={clearDialog.isOpen}
        onClose={() => setClearDialog({ isOpen: false })}
        onConfirm={handleClearAuditLogs}
        title="Clear Employee Audit Logs"
        message="⚠️ WARNING: This will permanently delete ALL employee audit log records from the database. This action cannot be undone and will free up storage space."
        confirmText="delete"
        type="audit"
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};

export default AdminSecurityLogs;
