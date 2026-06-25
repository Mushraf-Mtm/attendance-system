import React, { useState, useEffect } from 'react';
import { FiActivity, FiDownload, FiFilter, FiSearch, FiX, FiEye, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import AlertDialog from '../components/AlertDialog';
import ClearDataDialog from '../components/ClearDataDialog';
import { 
  getAdminActivityLogs, 
  exportAdminActivityLogs,
  getAdminActionTypes,
  getAdminModuleNames,
  clearAdminActivityLogs 
} from '../services/api';

const Spinner = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <div className={`${sizeClasses[size]} border-3 border-white/20 border-t-white rounded-full animate-spin`} />;
};

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [detailsDialog, setDetailsDialog] = useState({ isOpen: false, log: null });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    actionType: '',
    moduleName: '',
    startDate: '',
    endDate: '',
    sortOrder: 'desc',
    page: 1,
    limit: 50
  });

  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [actionTypes, setActionTypes] = useState([]);
  const [moduleNames, setModuleNames] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [clearDialog, setClearDialog] = useState({ isOpen: false });

  useEffect(() => {
    fetchLogs();
    fetchActionTypes();
    fetchModuleNames();
  }, [filters.page, filters.sortOrder]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getAdminActivityLogs(filters);
      if (response.data.success) {
        setLogs(response.data.logs);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error(error);
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Failed to load activity logs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActionTypes = async () => {
    try {
      const response = await getAdminActionTypes();
      if (response.data.success) {
        setActionTypes(response.data.actionTypes);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchModuleNames = async () => {
    try {
      const response = await getAdminModuleNames();
      if (response.data.success) {
        setModuleNames(response.data.moduleNames);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      actionType: '',
      moduleName: '',
      startDate: '',
      endDate: '',
      sortOrder: 'desc',
      page: 1,
      limit: 50
    });
    setTimeout(() => fetchLogs(), 100);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportAdminActivityLogs(filters);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_activity_logs_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setAlertDialog({ isOpen: true, title: 'Success', message: 'Activity logs exported successfully', type: 'success' });
    } catch (error) {
      console.error(error);
      setAlertDialog({ isOpen: true, title: 'Error', message: 'Export failed', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const openDetailsDialog = (log) => {
    setDetailsDialog({ isOpen: true, log });
  };

  const handleClearActivityLogs = async () => {
    try {
      const response = await clearAdminActivityLogs();
      if (response.data.success) {
        setAlertDialog({ isOpen: true, title: 'Success', message: 'Admin activity logs cleared successfully', type: 'success' });
        fetchLogs();
      } else {
        setAlertDialog({ isOpen: true, title: 'Error', message: response.data.message || 'Failed to clear logs', type: 'error' });
      }
    } catch (error) {
      setAlertDialog({ isOpen: true, title: 'Error', message: error.response?.data?.message || 'Failed to clear activity logs', type: 'error' });
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatJSON = (jsonString) => {
    if (!jsonString) return null;
    try {
      const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return (
        <div className="space-y-1">
          {Object.entries(obj).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="text-[#94A3B8] font-medium">{key}:</span>
              <span className="text-white">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <span className="text-[#94A3B8]">{jsonString}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0E1320] dark-scroll">
      <Sidebar />
      <div className="flex-1 overflow-y-auto dark-scroll">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <FiActivity className="text-blue-400" />
                Admin Activity Logs
              </h1>
              <p className="text-sm text-[#94A3B8] mt-0.5">Track all administrator actions and changes</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border border-white/10 text-white rounded-xl hover:bg-[#2D3B52] transition-colors text-sm font-semibold"
              >
                <FiFilter size={16} />
                Filters
              </button>
              {logs.length > 0 && (
                <button
                  onClick={() => setClearDialog({ isOpen: true })}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-semibold"
                >
                  <FiTrash2 size={16} />
                  Clear Table
                </button>
              )}
              <button
                onClick={handleExport}
                disabled={exporting || logs.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? <Spinner size="sm" /> : <FiDownload size={16} />}
                Export PDF
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl p-6 mb-6 shadow-clay-admin">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search admin, email, description..."
                    className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Action Type</label>
                  <select
                    value={filters.actionType}
                    onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">All Actions</option>
                    {actionTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Module</label>
                  <select
                    value={filters.moduleName}
                    onChange={(e) => setFilters({ ...filters, moduleName: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="">All Modules</option>
                    {moduleNames.map((module) => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Sort Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0E1320] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-semibold"
                >
                  <FiSearch size={16} />
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-6 py-2 bg-[#1E293B] border border-white/10 text-white rounded-xl hover:bg-[#2D3B52] transition-colors text-sm font-semibold"
                >
                  <FiX size={16} />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Logs Table */}
          <div className="bg-[#161D2E] border border-white/[0.07] rounded-2xl overflow-hidden shadow-clay-admin">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FiActivity size={48} className="text-[#64748B] mb-3" />
                <p className="text-white font-semibold">No activity logs found</p>
                <p className="text-sm text-[#94A3B8] mt-1">No admin activities match your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0E1320] border-b border-white/[0.06]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#94A3B8] uppercase">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#94A3B8] uppercase">Admin</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#94A3B8] uppercase">Action</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#94A3B8] uppercase">Module</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#94A3B8] uppercase">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#94A3B8] uppercase">IP Address</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-[#94A3B8] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm text-white whitespace-nowrap">{formatDateTime(log.created_at)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{log.admin_name || 'N/A'}</span>
                            <span className="text-xs text-[#64748B]">{log.admin_email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {log.action_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {log.module_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#94A3B8]">{log.description}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#64748B] font-mono">{log.ip_address || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => openDetailsDialog(log)}
                              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && logs.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
                <p className="text-sm text-[#94A3B8]">
                  Showing <span className="font-semibold text-white">{((pagination.page - 1) * filters.limit) + 1}</span> to{' '}
                  <span className="font-semibold text-white">{Math.min(pagination.page * filters.limit, pagination.total)}</span> of{' '}
                  <span className="font-semibold text-white">{pagination.total}</span> results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="px-4 py-2 bg-[#1E293B] border border-white/10 text-white rounded-xl hover:bg-[#2D3B52] transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm text-white">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page >= pagination.totalPages}
                    className="px-4 py-2 bg-[#1E293B] border border-white/10 text-white rounded-xl hover:bg-[#2D3B52] transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      {detailsDialog.isOpen && detailsDialog.log && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161D2E] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-clay-admin">
            <div className="sticky top-0 bg-[#161D2E] border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Activity Details</h2>
              <button
                onClick={() => setDetailsDialog({ isOpen: false, log: null })}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <FiX size={20} className="text-[#94A3B8]" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Admin Info */}
              <div>
                <h3 className="text-sm font-bold text-[#94A3B8] uppercase mb-3">Admin Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Admin Name</span>
                    <span className="text-sm font-semibold text-white">{detailsDialog.log.admin_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Email</span>
                    <span className="text-sm font-semibold text-white">{detailsDialog.log.admin_email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Info */}
              <div>
                <h3 className="text-sm font-bold text-[#94A3B8] uppercase mb-3">Action Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Action Type</span>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {detailsDialog.log.action_type}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Module</span>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {detailsDialog.log.module_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Description</span>
                    <span className="text-sm font-semibold text-white text-right">{detailsDialog.log.description}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Timestamp</span>
                    <span className="text-sm font-semibold text-white">{formatDateTime(detailsDialog.log.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Technical Info */}
              <div>
                <h3 className="text-sm font-bold text-[#94A3B8] uppercase mb-3">Technical Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">IP Address</span>
                    <span className="text-sm font-mono text-white">{detailsDialog.log.ip_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Device</span>
                    <span className="text-sm text-white text-right">{detailsDialog.log.device_info || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#94A3B8]">Browser</span>
                    <span className="text-sm text-white text-right">{detailsDialog.log.browser_info || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Old Data */}
              {detailsDialog.log.old_data && (
                <div>
                  <h3 className="text-sm font-bold text-[#94A3B8] uppercase mb-3">Old Data</h3>
                  <div className="bg-[#0E1320] border border-white/10 rounded-xl p-4">
                    {formatJSON(detailsDialog.log.old_data)}
                  </div>
                </div>
              )}

              {/* New Data */}
              {detailsDialog.log.new_data && (
                <div>
                  <h3 className="text-sm font-bold text-[#94A3B8] uppercase mb-3">New Data</h3>
                  <div className="bg-[#0E1320] border border-white/10 rounded-xl p-4">
                    {formatJSON(detailsDialog.log.new_data)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />

      {/* Clear Data Dialog */}
      <ClearDataDialog
        isOpen={clearDialog.isOpen}
        onClose={() => setClearDialog({ isOpen: false })}
        onConfirm={handleClearActivityLogs}
        title="Clear Admin Activity Logs"
        message="⚠️ WARNING: This will permanently delete ALL admin activity log records from the database. This action cannot be undone and will free up storage space."
        confirmText="delete"
        type="activity"
      />
    </div>
  );
};

export default AdminActivityLogs;
