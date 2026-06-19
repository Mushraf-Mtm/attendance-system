import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DetailsDialog from '../components/DetailsDialog';
import { Spinner } from '../components/Loader';
import { FiShield, FiEye, FiEdit2, FiSave, FiX, FiRefreshCw, FiMonitor, FiList, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { updateDeviceAlias } from '../services/api';

const TABS = [
  { id: 'audit',     label: 'Audit Logs',          icon: FiList        },
  { id: 'devices',   label: 'Device Fingerprints',  icon: FiMonitor     },
  { id: 'rateLimit', label: 'Rate Limits',           icon: FiAlertCircle },
];

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{children}</th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-slate-700 ${className}`}>{children}</td>
);

const EmptyState = ({ message }) => (
  <tr>
    <td colSpan="99" className="text-center py-12 text-sm text-slate-400">{message}</td>
  </tr>
);

const StatusPill = ({ status }) => {
  const map = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    failed:  'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
      {status}
    </span>
  );
};

const DeviceTypePill = ({ type }) => {
  const map = {
    Desktop: 'bg-blue-50 text-blue-700 border border-blue-200',
    Laptop:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Mobile:  'bg-purple-50 text-purple-700 border border-purple-200',
    Tablet:  'bg-orange-50 text-orange-700 border border-orange-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[type] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
      {type || 'Unknown'}
    </span>
  );
};

const AdminSecurityLogs = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editAlias, setEditAlias] = useState('');
  const [savingAlias, setSavingAlias] = useState(false);
  const [aliasError, setAliasError] = useState('');
  const [detailsDialog, setDetailsDialog] = useState({ isOpen: false, title: '', details: null });

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpointMap = { audit: '/security/audit-logs', devices: '/security/device-fingerprints', rateLimit: '/security/rate-limits' };
      const response = await axios.get(`${process.env.REACT_APP_API_URL}${endpointMap[activeTab] || endpointMap.audit}`, config);
      if (response.data.success) {
        const fetchedData = activeTab === 'audit' ? response.data.logs || []
          : activeTab === 'devices' ? response.data.devices || []
          : response.data.data || [];
        setData(fetchedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleEditAlias = (device) => { setEditingDevice(device.id); setEditAlias(device.device_alias || ''); setAliasError(''); };
  const handleCancelEdit = () => { setEditingDevice(null); setEditAlias(''); setAliasError(''); };

  const handleSaveAlias = async (deviceId) => {
    if (!editAlias.trim()) { setAliasError('Device alias cannot be empty'); return; }
    if (editAlias.trim().length > 255) { setAliasError('Device alias must be 255 characters or less'); return; }
    setSavingAlias(true); setAliasError('');
    try {
      const response = await updateDeviceAlias(deviceId, editAlias.trim());
      if (response.data.success) {
        setData(data.map(d => d.id === deviceId ? { ...d, device_alias: editAlias.trim(), updated_at: new Date().toISOString() } : d));
        setEditingDevice(null); setEditAlias('');
      } else { setAliasError(response.data.message || 'Failed to update alias'); }
    } catch (error) {
      console.error('Error updating alias:', error);
      setAliasError(error.response?.data?.message || 'Failed to update device alias');
    } finally { setSavingAlias(false); }
  };

  const activeRateCount = activeTab === 'rateLimit'
    ? data.filter(r => (new Date() - new Date(r.window_start)) < 60000).length
    : null;

  const renderAuditLogs = () => (
    <table className="min-w-full">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr><Th>Time</Th><Th>User ID</Th><Th>Type</Th><Th>Action</Th><Th>Status</Th><Th>IP Address</Th><Th>Device</Th><Th>Details</Th></tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.length === 0 ? <EmptyState message="No audit logs found" /> : data.map((log, i) => (
          <tr key={i} className="hover:bg-slate-50/70 transition-colors">
            <Td className="whitespace-nowrap text-slate-500">{formatDate(log.created_at)}</Td>
            <Td className="font-medium text-slate-900">{log.user_id}</Td>
            <Td>{log.user_type}</Td>
            <Td>{log.action}</Td>
            <Td><StatusPill status={log.status} /></Td>
            <Td>{log.ip_address || 'N/A'}</Td>
            <Td className="font-mono text-xs">{log.device_fingerprint ? log.device_fingerprint.substring(0, 8) + '…' : 'N/A'}</Td>
            <Td>
              {log.details ? (
                <button onClick={() => setDetailsDialog({ isOpen: true, title: `${log.action} — Details`, details: log.details })} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                  <FiEye size={13} /> View
                </button>
              ) : <span className="text-slate-400">—</span>}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDeviceFingerprints = () => (
    <table className="min-w-full">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr><Th>Employee</Th><Th>Device Alias</Th><Th>Type</Th><Th>Browser</Th><Th>OS</Th><Th>Screen</Th><Th>First Seen</Th><Th>Last Seen</Th><Th></Th></tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.length === 0 ? <EmptyState message="No device fingerprints found" /> : data.map((device, i) => (
          <tr key={i} className="hover:bg-slate-50/70 transition-colors">
            <Td>
              <span className="font-medium text-slate-900 block">{device.employee_id}</span>
              {device.employee_name && <span className="text-xs text-slate-500">{device.employee_name}</span>}
            </Td>
            <Td>
              {editingDevice === device.id ? (
                <div>
                  <input type="text" value={editAlias} onChange={(e) => setEditAlias(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Reception PC" maxLength="255" autoFocus />
                  {aliasError && <p className="text-xs text-red-600 mt-1">{aliasError}</p>}
                </div>
              ) : (
                <div>
                  <span className="block font-medium text-slate-800">{device.device_alias || <span className="text-slate-400 italic font-normal">No alias</span>}</span>
                  <span className="text-xs text-slate-400 font-mono">{device.device_fingerprint ? device.device_fingerprint.substring(0, 8) + '…' : 'N/A'}</span>
                </div>
              )}
            </Td>
            <Td><DeviceTypePill type={device.device_type} /></Td>
            <Td>
              <span className="block">{device.browser || 'N/A'}</span>
              {device.browser_version && <span className="text-xs text-slate-400">v{device.browser_version}</span>}
            </Td>
            <Td>{device.operating_system || 'N/A'}</Td>
            <Td>{device.screen_resolution || 'N/A'}</Td>
            <Td className="whitespace-nowrap text-slate-500">{formatDate(device.first_seen_at)}</Td>
            <Td className="whitespace-nowrap text-slate-500">{formatDate(device.last_seen_at)}</Td>
            <Td>
              {editingDevice === device.id ? (
                <div className="flex gap-2">
                  <button onClick={() => handleSaveAlias(device.id)} disabled={savingAlias} className="text-emerald-600 hover:text-emerald-800 disabled:opacity-40">
                    {savingAlias ? <Spinner size="sm" /> : <FiSave size={15} />}
                  </button>
                  <button onClick={handleCancelEdit} disabled={savingAlias} className="text-red-500 hover:text-red-700 disabled:opacity-40">
                    <FiX size={15} />
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEditAlias(device)} className="text-indigo-500 hover:text-indigo-700">
                  <FiEdit2 size={14} />
                </button>
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderRateLimits = () => (
    <table className="min-w-full">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr><Th>Employee ID</Th><Th>IP Address</Th><Th>Request Count</Th><Th>Window Start</Th><Th>Status</Th><Th>Created</Th></tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.length === 0 ? <EmptyState message="No rate limit records found" /> : data.map((limit, i) => {
          const isActive = (new Date() - new Date(limit.window_start)) < 60000;
          return (
            <tr key={i} className="hover:bg-slate-50/70 transition-colors">
              <Td className="font-medium text-slate-900">{limit.employee_id}</Td>
              <Td>{limit.ip_address}</Td>
              <Td><span className="font-semibold text-slate-900">{limit.request_count}</span></Td>
              <Td className="whitespace-nowrap text-slate-500">{formatDate(limit.window_start)}</Td>
              <Td>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${isActive ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {isActive ? 'Active' : 'Expired'}
                </span>
              </Td>
              <Td className="whitespace-nowrap text-slate-500">{formatDate(limit.created_at)}</Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">Security Logs</h1>
            <p className="text-sm text-slate-500 mt-0.5">Monitor attendance security events, devices, and rate limiting</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Records',    value: data.length },
              { label: activeTab === 'devices' ? 'Unique Devices' : activeTab === 'audit' ? 'Audit Events' : 'Rate Limit Records', value: data.length },
              { label: 'Active Rate Limits', value: activeRateCount ?? '—' },
            ].map(({ label, value }, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Main table card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center border-b border-slate-200 px-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
              <div className="ml-auto pr-3 pb-1">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
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

      <DetailsDialog
        isOpen={detailsDialog.isOpen}
        onClose={() => setDetailsDialog({ isOpen: false, title: '', details: null })}
        title={detailsDialog.title}
        details={detailsDialog.details}
      />
    </div>
  );
};

export default AdminSecurityLogs;
