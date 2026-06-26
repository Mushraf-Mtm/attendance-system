import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import DetailsDialog from '../components/DetailsDialog';
import ClearDataDialog from '../components/ClearDataDialog';
import AlertDialog from '../components/AlertDialog';
import { Spinner } from '../components/Loader';
import { FiShield, FiEye, FiEdit2, FiSave, FiX, FiRefreshCw, FiMonitor, FiList, FiAlertCircle, FiTrash2, FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import { updateDeviceAlias, clearEmployeeAuditLogs } from '../services/api';
import { formatDate } from '../utils/formatTime';

const TABS = [
  { id:'audit',     label:'Audit Logs',          icon:FiList        },
  { id:'devices',   label:'Device Fingerprints', icon:FiMonitor     },
  { id:'rateLimit', label:'Rate Limits',         icon:FiAlertCircle },
];

const AdminTh = ({ children }) => (
  <th className="px-5 py-4 text-left text-[10px] font-bold text-[#64748B] uppercase tracking-widest whitespace-nowrap bg-[#0E1320]/80 sticky top-0 backdrop-blur-md z-10">{children}</th>
);

const AdminTd = ({ children, className = '' }) => (
  <td className={`px-5 py-4 text-sm text-[#CBD5E1] border-b border-white/[0.04] group-hover:bg-[#0B1120]/[0.02] transition-colors ${className}`}>{children}</td>
);

const EmptyState = ({ message }) => (
  <tr><td colSpan="99" className="text-center py-16">
    <div className="flex flex-col items-center justify-center text-[#64748B]">
      <div className="w-16 h-16 rounded-2xl bg-[#0B1120]/[0.02] flex items-center justify-center mb-4">
        <FiShield size={32} className="opacity-20" />
      </div>
      <p className="text-sm font-bold">{message}</p>
    </div>
  </td></tr>
);

const StatusPill = ({ status }) => {
  const map = {
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    failed:  'bg-red-500/15 text-red-400 border border-red-500/25',
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status?.toLowerCase()] || 'bg-[#0B1120]/5 text-[#94A3B8] border border-white/10'}`}>{status}</span>;
};

const DeviceTypePill = ({ type }) => {
  const map = {
    Desktop: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
    Laptop:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    Mobile:  'bg-purple-500/15 text-purple-400 border border-purple-500/25',
    Tablet:  'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[type] || 'bg-[#0B1120]/5 text-[#94A3B8] border border-white/10'}`}>{type || 'Unknown'}</span>;
};

const AdminSecurityLogs = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [loading, setLoading] = useState(true);
  const [allLogs, setAllLogs] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [allRateLimits, setAllRateLimits] = useState([]);

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Editing Device
  const [editingDevice, setEditingDevice] = useState(null);
  const [editAlias, setEditAlias] = useState('');
  const [savingAlias, setSavingAlias] = useState(false);
  const [aliasError, setAliasError] = useState('');

  // Dialogs
  const [detailsDialog, setDetailsDialog] = useState({ isOpen:false, title:'', details:null });
  const [clearDialog, setClearDialog] = useState({ isOpen: false });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const [logsRes, devicesRes, rateRes] = await Promise.all([
        axios.get(`${baseUrl}/security/audit-logs`, config).catch(()=>({data:{}})),
        axios.get(`${baseUrl}/security/device-fingerprints`, config).catch(()=>({data:{}})),
        axios.get(`${baseUrl}/security/rate-limits`, config).catch(()=>({data:{}}))
      ]);
      
      if (logsRes.data.success) setAllLogs(logsRes.data.logs || []);
      if (devicesRes.data.success) setAllDevices(devicesRes.data.devices || []);
      if (rateRes.data.success) setAllRateLimits(rateRes.data.data || []);
    } catch (error) { console.error('Fetch error:', error); }
    finally { setLoading(false); }
  };

  /* ─── STATS CALCULATIONS ─── */
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);

    const todayLogs = allLogs.filter(l => new Date(l.created_at).toDateString() === today).length;
    const weekLogs = allLogs.filter(l => new Date(l.created_at) >= thisWeekStart).length;
    const monthLogs = allLogs.filter(l => new Date(l.created_at) >= thisMonthStart).length;
    
    let failedCheckins = 0;
    let successCheckins = 0;
    allLogs.forEach(l => {
      if (l.action?.toLowerCase().includes('check')) {
        if (l.status?.toLowerCase() === 'failed') failedCheckins++;
        if (l.status?.toLowerCase() === 'success') successCheckins++;
      }
    });

    const activeRate = allRateLimits.filter(r => (new Date() - new Date(r.window_start)) < 60000).length;
    const uniqueIPs = new Set(allLogs.map(l => l.ip_address).filter(Boolean)).size;

    return { totalLogs: allLogs.length, todayLogs, weekLogs, monthLogs, failedCheckins, successCheckins, activeRate, uniqueDevices: allDevices.length, uniqueIPs };
  }, [allLogs, allDevices, allRateLimits]);

  /* ─── HANDLERS ─── */
  const handleSaveAlias = async (deviceId) => {
    if (!editAlias.trim()) { setAliasError('Alias cannot be empty'); return; }
    setSavingAlias(true); setAliasError('');
    try {
      const response = await updateDeviceAlias(deviceId, editAlias.trim());
      if (response.data.success) {
        setAllDevices(prev => prev.map(d => d.id === deviceId ? { ...d, device_alias: editAlias.trim() } : d));
        setEditingDevice(null); setEditAlias('');
      } else { setAliasError(response.data.message || 'Update failed'); }
    } catch (error) { setAliasError('Update failed'); }
    finally { setSavingAlias(false); }
  };

  const handleClearLogs = async () => {
    try {
      const response = await clearEmployeeAuditLogs();
      if (response.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Logs cleared successfully', type: 'success' });
        fetchData();
      }
    } catch (error) { setAlertDialog({ isOpen: true, title: 'Error', message: 'Failed to clear logs', type: 'error' }); }
  };

  /* ─── FILTERING ─── */
  const filteredLogs = useMemo(() => {
    return allLogs.filter(l => {
      const matchesSearch = !searchQuery || (l.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) || l.action?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDate = !dateFilter || new Date(l.created_at).toDateString() === new Date(dateFilter).toDateString();
      return matchesSearch && matchesDate;
    });
  }, [allLogs, searchQuery, dateFilter]);

  const filteredDevices = useMemo(() => {
    return allDevices.filter(d => !searchQuery || d.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) || d.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allDevices, searchQuery]);

  const filteredRate = useMemo(() => {
    return allRateLimits.filter(r => !searchQuery || r.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) || r.ip_address?.includes(searchQuery));
  }, [allRateLimits, searchQuery]);


  /* ─── RENDERERS ─── */
  const renderAuditLogs = () => (
    <table className="min-w-full relative">
      <thead><tr><AdminTh>Time</AdminTh><AdminTh>User ID</AdminTh><AdminTh>Type</AdminTh><AdminTh>Action</AdminTh><AdminTh>Status</AdminTh><AdminTh>IP Address</AdminTh><AdminTh>Device</AdminTh><AdminTh>Details</AdminTh></tr></thead>
      <tbody>
        {filteredLogs.length === 0 ? <EmptyState message="No audit logs match criteria" /> : filteredLogs.map((log, i) => (
          <tr key={i} className="group">
            <AdminTd className="whitespace-nowrap font-mono text-xs">{formatDate(log.created_at)}</AdminTd>
            <AdminTd className="font-bold text-white">{log.user_id}</AdminTd>
            <AdminTd className="text-xs">{log.user_type}</AdminTd>
            <AdminTd className="font-semibold text-[#94A3B8]">{log.action}</AdminTd>
            <AdminTd><StatusPill status={log.status} /></AdminTd>
            <AdminTd className="font-mono text-xs">{log.ip_address || '—'}</AdminTd>
            <AdminTd className="font-mono text-[10px] text-[#64748B]">{log.device_fingerprint ? log.device_fingerprint.substring(0,12)+'…' : '—'}</AdminTd>
            <AdminTd>
              {log.details ? (
                <button onClick={() => setDetailsDialog({ isOpen:true, title:`${log.action} Details`, details:log.details })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors border border-blue-500/20"><FiEye size={14} /> View</button>
              ) : <span className="text-[#334155] pl-4">—</span>}
            </AdminTd>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDeviceFingerprints = () => (
    <table className="min-w-full relative">
      <thead><tr><AdminTh>Employee</AdminTh><AdminTh>Device Alias</AdminTh><AdminTh>Type</AdminTh><AdminTh>Browser & OS</AdminTh><AdminTh>Screen</AdminTh><AdminTh>Seen</AdminTh><AdminTh>Actions</AdminTh></tr></thead>
      <tbody>
        {filteredDevices.length === 0 ? <EmptyState message="No devices found" /> : filteredDevices.map((device, i) => (
          <tr key={i} className="group">
            <AdminTd>
              <div className="flex flex-col">
                <span className="font-bold text-white">{device.employee_name || 'Unknown'}</span>
                <span className="text-[10px] text-[#64748B] font-mono">{device.employee_id}</span>
              </div>
            </AdminTd>
            <AdminTd>
              {editingDevice === device.id ? (
                <div className="flex flex-col gap-1">
                  <input type="text" value={editAlias} onChange={(e) => setEditAlias(e.target.value)} className="admin-input text-xs py-1.5 px-2 w-32" placeholder="e.g., Reception PC" autoFocus />
                  {aliasError && <span className="text-[10px] text-red-400">{aliasError}</span>}
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="font-bold text-[#94A3B8]">{device.device_alias || <span className="text-[#475569] italic font-normal">No alias</span>}</span>
                  <span className="text-[10px] text-[#475569] font-mono mt-0.5">{device.device_fingerprint ? device.device_fingerprint.substring(0,8)+'…' : '—'}</span>
                </div>
              )}
            </AdminTd>
            <AdminTd><DeviceTypePill type={device.device_type} /></AdminTd>
            <AdminTd>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#CBD5E1]">{device.browser || '—'} {device.browser_version ? `v${device.browser_version}` : ''}</span>
                <span className="text-[10px] text-[#64748B] mt-0.5">{device.operating_system || '—'}</span>
              </div>
            </AdminTd>
            <AdminTd className="text-xs font-mono text-[#64748B]">{device.screen_resolution || '—'}</AdminTd>
            <AdminTd>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#64748B] whitespace-nowrap">First: {formatDate(device.first_seen_at)}</span>
                <span className="text-[10px] text-[#94A3B8] font-semibold whitespace-nowrap">Last: {formatDate(device.last_seen_at)}</span>
              </div>
            </AdminTd>
            <AdminTd>
              {editingDevice === device.id ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSaveAlias(device.id)} disabled={savingAlias} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center justify-center disabled:opacity-50"><FiSave size={14} /></button>
                  <button onClick={() => { setEditingDevice(null); setAliasError(''); }} disabled={savingAlias} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center disabled:opacity-50"><FiX size={14} /></button>
                </div>
              ) : (
                <button onClick={() => { setEditingDevice(device.id); setEditAlias(device.device_alias || ''); setAliasError(''); }} className="w-8 h-8 rounded-lg bg-[#1C2540] text-[#94A3B8] border border-white/5 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><FiEdit2 size={14} /></button>
              )}
            </AdminTd>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderRateLimits = () => (
    <table className="min-w-full relative">
      <thead><tr><AdminTh>Employee ID</AdminTh><AdminTh>IP Address</AdminTh><AdminTh>Requests</AdminTh><AdminTh>Window Start</AdminTh><AdminTh>Status</AdminTh></tr></thead>
      <tbody>
        {filteredRate.length === 0 ? <EmptyState message="No active rate limits" /> : filteredRate.map((limit, i) => {
          const isActive = (new Date() - new Date(limit.window_start)) < 60000;
          return (
            <tr key={i} className="group">
              <AdminTd className="font-bold text-white">{limit.employee_id}</AdminTd>
              <AdminTd className="font-mono text-xs text-[#94A3B8]">{limit.ip_address}</AdminTd>
              <AdminTd>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-extrabold ${limit.request_count > 5 ? 'text-red-400' : 'text-amber-400'}`}>{limit.request_count}</span>
                  <div className="h-1.5 w-16 bg-[#1C2540] rounded-full overflow-hidden">
                    <div className={`h-full ${limit.request_count > 5 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((limit.request_count / 10) * 100, 100)}%` }} />
                  </div>
                </div>
              </AdminTd>
              <AdminTd className="whitespace-nowrap font-mono text-xs">{formatDate(limit.window_start)}</AdminTd>
              <AdminTd>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse' : 'bg-[#0B1120]/5 text-[#64748B] border border-white/10'}`}>
                  {isActive ? 'Active Block' : 'Expired'}
                </span>
              </AdminTd>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="flex h-screen bg-[#070B1A] dark-scroll selection:bg-blue-500/30">
      <Sidebar />
      <div className="flex-1 overflow-y-auto dark-scroll pb-24">
        <div className="px-5 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto pt-16 lg:pt-8 animate-fadeIn">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Security Logs</h1>
              <p className="text-sm text-[#94A3B8] mt-1.5 font-medium">Monitor system access, device fingerprints, and active rate limits.</p>
            </div>
            <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-[#10192D] border border-white/10 hover:border-white/20 text-[#94A3B8] hover:text-white text-xs font-bold rounded-xl transition-all shadow-clay-admin">
              <FiRefreshCw size={14} className={loading ? 'animate-spin text-blue-400' : ''} />
              {loading ? 'Syncing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Stat Cards - CSS Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label:'Total Logs',     value:stats.totalLogs,       color:'text-blue-400',    bg:'from-blue-500/10 to-transparent', border:'border-blue-500/20' },
              { label:'Today Logs',     value:stats.todayLogs,       color:'text-emerald-400', bg:'from-emerald-500/10 to-transparent', border:'border-emerald-500/20' },
              { label:'This Week Logs', value:stats.weekLogs,        color:'text-purple-400',  bg:'from-purple-500/10 to-transparent', border:'border-purple-500/20' },
              { label:'This Month Logs',value:stats.monthLogs,       color:'text-amber-400',   bg:'from-amber-500/10 to-transparent', border:'border-amber-500/20' },
              { label:'Failed Check-ins',value:stats.failedCheckins, color:'text-red-400',     bg:'from-red-500/10 to-transparent', border:'border-red-500/20' },
              { label:'Successful Check-ins', value:stats.successCheckins, color:'text-cyan-400',  bg:'from-cyan-500/10 to-transparent', border:'border-cyan-500/20' },
            ].map((s, i) => (
              <div key={i} className={`bg-[#0B1120] border ${s.border} rounded-2xl p-4 shadow-clay-admin overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest">{s.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${s.color} drop-shadow-sm`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="bg-[#0B1120] border border-white/[0.06] rounded-2xl shadow-clay-admin overflow-hidden flex flex-col min-h-[500px]">
            
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.06] bg-[#10192D]/50 backdrop-blur-md p-4 gap-4">
              <div className="flex items-center gap-2 p-1 bg-[#070B1A] border border-white/5 rounded-xl w-fit">
                {TABS.map(({ id, label, icon:Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === id ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[#0B1120]/5'}`}>
                    <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={14} />
                  <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search records..." className="bg-[#070B1A] border border-white/10 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none w-48 transition-all" />
                </div>
                {activeTab === 'audit' && (
                  <>
                    <div className="relative hidden sm:block">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={14} />
                      <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className="bg-[#070B1A] border border-white/10 text-[#94A3B8] text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-blue-500/50" />
                    </div>
                    {allLogs.length > 0 && (
                      <button onClick={() => setClearDialog({ isOpen: true })} className="flex items-center justify-center w-9 h-9 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl transition-all" title="Clear Logs">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[600px] dark-scroll relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B1120]/50 backdrop-blur-sm z-20">
                  <Spinner size={40} color="blue" />
                  <p className="text-xs font-bold text-blue-400 mt-4 animate-pulse">Syncing Security Data...</p>
                </div>
              ) : null}
              
              <div className="min-w-[800px]">
                {activeTab === 'audit'     && renderAuditLogs()}
                {activeTab === 'devices'   && renderDeviceFingerprints()}
                {activeTab === 'rateLimit' && renderRateLimits()}
              </div>
            </div>
          </div>

        </div>
      </div>

      <DetailsDialog isOpen={detailsDialog.isOpen} onClose={() => setDetailsDialog({ isOpen:false, title:'', details:null })} title={detailsDialog.title} details={detailsDialog.details} />
      <ClearDataDialog isOpen={clearDialog.isOpen} onClose={() => setClearDialog({ isOpen: false })} onConfirm={handleClearLogs} title="Clear Audit Logs" message="Permanently delete ALL audit log records? This cannot be undone." confirmText="delete" type="danger" />
      <AlertDialog isOpen={alertDialog.isOpen} onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })} title={alertDialog.title} message={alertDialog.message} type={alertDialog.type} />
    </div>
  );
};

export default AdminSecurityLogs;
