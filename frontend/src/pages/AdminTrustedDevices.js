import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DetailsDialog from '../components/DetailsDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import { Spinner } from '../components/Loader';
import { FiSmartphone, FiCheck, FiX, FiEdit2, FiSave, FiRefreshCw, FiEye, FiTrash2, FiSearch, FiMonitor, FiTablet, FiAlertTriangle } from 'react-icons/fi';
import { getAllTrustedDevices, approveTrustedDevice, rejectTrustedDevice, updateTrustedDeviceAlias, removeTrustedDeviceApproval, deleteTrustedDevice } from '../services/api';

const TABS = [
  { id: 'pending',  label: 'Pending',  icon: FiAlertTriangle },
  { id: 'approved', label: 'Approved', icon: FiCheck },
  { id: 'rejected', label: 'Rejected', icon: FiX },
];

const DeviceTypePill = ({ type }) => {
  const map = {
    Desktop: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: FiMonitor },
    Laptop:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: FiMonitor },
    Mobile:  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: FiSmartphone },
    Tablet:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: FiTablet },
  };
  const style = map[type] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: FiMonitor };
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <Icon size={11} /> {type || 'Unknown'}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    Pending:  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    Approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    Rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };
  const style = map[status] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
};

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wide whitespace-nowrap">{children}</th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-[#CBD5E1] ${className}`}>{children}</td>
);

const EmptyState = ({ message }) => (
  <tr>
    <td colSpan="99" className="text-center py-12 text-sm text-[#475569]">{message}</td>
  </tr>
);

const AdminTrustedDevices = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDevice, setEditingDevice] = useState(null);
  const [editAlias, setEditAlias] = useState('');
  const [savingAlias, setSavingAlias] = useState(false);
  const [aliasError, setAliasError] = useState('');
  const [detailsDialog, setDetailsDialog] = useState({ isOpen: false, title: '', details: null });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  useEffect(() => { fetchDevices(); }, [activeTab]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await getAllTrustedDevices({ 
        status: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
        search: searchTerm 
      });
      if (response.data.success) {
        setDevices(response.data.devices || []);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDevices();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const handleApprove = async (deviceId) => {
    try {
      const response = await approveTrustedDevice(deviceId);
      if (response.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Device approved successfully', type: 'success' });
        fetchDevices();
      }
    } catch (error) {
      setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to approve device', type: 'error' });
    }
  };

  const handleReject = (device) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Device',
      message: `Are you sure you want to reject ${device.device_alias || device.employee_name}'s device?`,
      onConfirm: async () => {
        try {
          const remarks = prompt('Optional: Enter reason for rejection');
          const response = await rejectTrustedDevice(device.id, remarks);
          if (response.data.success) {
            setAlertDialog({ isOpen: true, title: 'Success', message: 'Device rejected successfully', type: 'success' });
            fetchDevices();
          }
        } catch (error) {
          setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to reject device', type: 'error' });
        }
      }
    });
  };

  const handleEditAlias = (device) => {
    setEditingDevice(device.id);
    setEditAlias(device.device_alias || '');
    setAliasError('');
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
    setEditAlias('');
    setAliasError('');
  };

  const handleSaveAlias = async (deviceId) => {
    if (!editAlias.trim()) {
      setAliasError('Device alias cannot be empty');
      return;
    }
    if (editAlias.trim().length > 255) {
      setAliasError('Device alias must be 255 characters or less');
      return;
    }

    setSavingAlias(true);
    setAliasError('');
    try {
      const response = await updateTrustedDeviceAlias(deviceId, editAlias.trim());
      if (response.data.success) {
        setDevices(devices.map(d => d.id === deviceId ? { ...d, device_alias: editAlias.trim() } : d));
        setEditingDevice(null);
        setEditAlias('');
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Device alias updated successfully', type: 'success' });
      }
    } catch (error) {
      setAliasError(error.response?.data?.message || 'Failed to update alias');
    } finally {
      setSavingAlias(false);
    }
  };

  const handleRemoveApproval = (device) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Approval',
      message: `Are you sure you want to remove approval for ${device.device_alias || device.employee_name}'s device? It will be set to Pending status.`,
      onConfirm: async () => {
        try {
          const response = await removeTrustedDeviceApproval(device.id);
          if (response.data.success) {
            setAlertDialog({ isOpen: true, title: 'Success', message: 'Device approval removed successfully', type: 'success' });
            fetchDevices();
          }
        } catch (error) {
          setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to remove approval', type: 'error' });
        }
      }
    });
  };

  const handleDelete = (device) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Device',
      message: `Are you sure you want to delete ${device.device_alias || device.employee_name}'s device? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await deleteTrustedDevice(device.id);
          if (response.data.success) {
            setAlertDialog({ isOpen: true, title: 'Success', message: 'Device deleted successfully', type: 'success' });
            fetchDevices();
          }
        } catch (error) {
          setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to delete device', type: 'error' });
        }
      }
    });
  };

  const handleViewDetails = (device) => {
    const details = {
      'Employee ID': device.employee_id,
      'Employee Name': device.employee_name,
      'Job Role': device.job_role || 'N/A',
      'Department': device.department || 'N/A',
      'Device Alias': device.device_alias || 'No alias set',
      'Device Type': device.device_type,
      'Browser': `${device.browser_name || 'Unknown'} ${device.browser_version || ''}`,
      'Operating System': device.operating_system || 'Unknown',
      'Screen Resolution': device.screen_resolution || 'Unknown',
      'Platform': device.platform || 'Unknown',
      'Device Fingerprint': device.device_fingerprint || 'N/A',
      'First Seen': formatDate(device.first_seen),
      'Last Used': formatDate(device.last_used),
      'Approval Status': device.approved_status,
      'Approved By': device.approved_by ? `Admin ID: ${device.approved_by}` : 'N/A',
      'Approved At': formatDate(device.approved_at),
      'Rejected By': device.rejected_by ? `Admin ID: ${device.rejected_by}` : 'N/A',
      'Rejected At': formatDate(device.rejected_at),
      'Remarks': device.remarks || 'None'
    };

    setDetailsDialog({
      isOpen: true,
      title: `Device Details - ${device.device_alias || device.employee_name}`,
      details
    });
  };

  const filteredDevices = devices.filter(device =>
    device.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.device_alias?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto dark-scroll">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">Trusted Device Management</h1>
            <p className="text-sm text-[#94A3B8] mt-0.5">Approve or reject employee devices for attendance</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
              <input
                type="text"
                placeholder="Search by employee name, ID, or device alias…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-12 pr-4 text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/15 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-[#3B82F6] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <FiSearch size={16} />
            </button>
          </div>

          {/* Main card */}
          <div className="bg-[#161D2E] rounded-2xl border border-white/[0.07] overflow-hidden shadow-clay-admin">
            {/* Tab bar */}
            <div className="flex items-center border-b border-white/[0.06] px-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-[#3B82F6] text-[#60A5FA]'
                      : 'border-transparent text-[#94A3B8] hover:text-[#CBD5E1]'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
              <div className="ml-auto pr-3 pb-1">
                <button
                  onClick={fetchDevices}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#94A3B8] bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
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
                <table className="min-w-full">
                  <thead className="bg-white/[0.02] border-b border-white/[0.04]">
                    <tr>
                      <Th>Employee</Th>
                      <Th>Device Alias</Th>
                      <Th>Type</Th>
                      <Th>Browser</Th>
                      <Th>OS</Th>
                      {activeTab === 'pending' && <Th>First Seen</Th>}
                      {activeTab === 'approved' && <Th>Last Used</Th>}
                      {activeTab === 'approved' && <Th>Approved</Th>}
                      {activeTab === 'rejected' && <Th>Rejected</Th>}
                      {activeTab === 'rejected' && <Th>Remarks</Th>}
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredDevices.length === 0 ? (
                      <EmptyState message={`No ${activeTab} devices found`} />
                    ) : (
                      filteredDevices.map((device) => (
                        <tr key={device.id} className="admin-table-row">
                          <Td>
                            <span className="block font-medium text-white">{device.employee_name}</span>
                            <span className="text-xs text-[#64748B]">{device.employee_id}</span>
                          </Td>
                          <Td>
                            {editingDevice === device.id ? (
                              <div>
                                <input
                                  type="text"
                                  value={editAlias}
                                  onChange={(e) => setEditAlias(e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm bg-white/5 border border-[#3B82F6] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                                  placeholder="e.g., Reception PC"
                                  maxLength="255"
                                  autoFocus
                                />
                                {aliasError && <p className="text-xs text-red-400 mt-1">{aliasError}</p>}
                              </div>
                            ) : (
                              <div>
                                <span className="block font-medium text-white">
                                  {device.device_alias || <span className="text-[#64748B] italic font-normal">No alias</span>}
                                </span>
                                <span className="text-xs text-[#64748B] font-mono">
                                  {device.device_fingerprint ? device.device_fingerprint.substring(0, 8) + '…' : 'N/A'}
                                </span>
                              </div>
                            )}
                          </Td>
                          <Td><DeviceTypePill type={device.device_type} /></Td>
                          <Td>
                            <span className="block text-white">{device.browser_name || 'N/A'}</span>
                            {device.browser_version && <span className="text-xs text-[#64748B]">v{device.browser_version}</span>}
                          </Td>
                          <Td className="text-white">{device.operating_system || 'N/A'}</Td>
                          {activeTab === 'pending' && <Td className="text-[#94A3B8]">{formatDate(device.first_seen)}</Td>}
                          {activeTab === 'approved' && <Td className="text-[#94A3B8]">{formatDate(device.last_used)}</Td>}
                          {activeTab === 'approved' && <Td className="text-[#94A3B8]">{formatDate(device.approved_at)}</Td>}
                          {activeTab === 'rejected' && <Td className="text-[#94A3B8]">{formatDate(device.rejected_at)}</Td>}
                          {activeTab === 'rejected' && <Td className="text-[#94A3B8]">{device.remarks || '—'}</Td>}
                          <Td>
                            <div className="flex items-center gap-2">
                              {editingDevice === device.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveAlias(device.id)}
                                    disabled={savingAlias}
                                    className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                                    title="Save"
                                  >
                                    {savingAlias ? <Spinner size="sm" /> : <FiSave size={15} />}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={savingAlias}
                                    className="text-red-400 hover:text-red-300 disabled:opacity-40"
                                    title="Cancel"
                                  >
                                    <FiX size={15} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {activeTab === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(device.id)}
                                        className="text-emerald-400 hover:text-emerald-300"
                                        title="Approve"
                                      >
                                        <FiCheck size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleReject(device)}
                                        className="text-red-400 hover:text-red-300"
                                        title="Reject"
                                      >
                                        <FiX size={16} />
                                      </button>
                                    </>
                                  )}
                                  {activeTab === 'approved' && (
                                    <button
                                      onClick={() => handleRemoveApproval(device)}
                                      className="text-amber-400 hover:text-amber-300"
                                      title="Remove Approval"
                                    >
                                      <FiX size={16} />
                                    </button>
                                  )}
                                  {activeTab === 'rejected' && (
                                    <button
                                      onClick={() => handleApprove(device.id)}
                                      className="text-emerald-400 hover:text-emerald-300"
                                      title="Approve"
                                    >
                                      <FiCheck size={16} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleEditAlias(device)}
                                    className="text-[#60A5FA] hover:text-[#3B82F6]"
                                    title="Edit Alias"
                                  >
                                    <FiEdit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleViewDetails(device)}
                                    className="text-[#94A3B8] hover:text-[#CBD5E1]"
                                    title="View Details"
                                  >
                                    <FiEye size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(device)}
                                    className="text-red-400 hover:text-red-300"
                                    title="Delete"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
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

export default AdminTrustedDevices;
