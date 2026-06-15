import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { FiShield, FiFilter, FiDownload, FiEye, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import axios from 'axios';
import { updateDeviceAlias } from '../services/api';

const AdminSecurityLogs = () => {
  const [activeTab, setActiveTab] = useState('audit'); // audit, devices, rateLimit
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editAlias, setEditAlias] = useState('');
  const [savingAlias, setSavingAlias] = useState(false);
  const [aliasError, setAliasError] = useState('');
  const [filters, setFilters] = useState({
    employeeId: '',
    action: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let endpoint = '';
      switch (activeTab) {
        case 'audit':
          endpoint = '/security/audit-logs';
          break;
        case 'devices':
          endpoint = '/security/device-fingerprints';
          break;
        case 'rateLimit':
          endpoint = '/security/rate-limits';
          break;
        default:
          endpoint = '/security/audit-logs';
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        config
      );

      console.log('Security API response:', response.data);

      if (response.data.success) {
        // Handle different response structures
        let fetchedData = [];
        if (activeTab === 'audit') {
          fetchedData = response.data.logs || [];
        } else if (activeTab === 'devices') {
          fetchedData = response.data.devices || [];
        } else if (activeTab === 'rateLimit') {
          fetchedData = response.data.data || [];
        }
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
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      const response = await updateDeviceAlias(deviceId, editAlias.trim());

      if (response.data.success) {
        // Update local data
        setData(data.map(device => 
          device.id === deviceId 
            ? { ...device, device_alias: editAlias.trim(), updated_at: new Date().toISOString() }
            : device
        ));
        setEditingDevice(null);
        setEditAlias('');
      } else {
        setAliasError(response.data.message || 'Failed to update alias');
      }
    } catch (error) {
      console.error('Error updating alias:', error);
      setAliasError(error.response?.data?.message || 'Failed to update device alias');
    } finally {
      setSavingAlias(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderAuditLogs = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((log, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                {formatDate(log.created_at)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {log.user_id}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {log.user_type}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {log.action}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                  {log.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {log.ip_address || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {log.device_fingerprint ? log.device_fingerprint.substring(0, 8) + '...' : 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {log.details ? (
                  <button
                    onClick={() => alert(JSON.stringify(log.details, null, 2))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiEye />
                  </button>
                ) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No audit logs found
        </div>
      )}
    </div>
  );

  const renderDeviceFingerprints = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Alias</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Browser</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OS</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screen</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Seen</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((device, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {device.employee_id}
                <div className="text-xs text-gray-500">{device.employee_name || ''}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {editingDevice === device.id ? (
                  <div>
                    <input
                      type="text"
                      value={editAlias}
                      onChange={(e) => setEditAlias(e.target.value)}
                      className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Reception PC, HR Laptop"
                      maxLength="255"
                      autoFocus
                    />
                    {aliasError && (
                      <p className="text-xs text-red-600 mt-1">{aliasError}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-gray-900">
                      {device.device_alias || <span className="text-gray-400 italic">No alias set</span>}
                    </div>
                    <div className="text-xs text-gray-500 font-mono" title={device.device_fingerprint || 'N/A'}>
                      ID: {device.device_fingerprint ? device.device_fingerprint.substring(0, 8) + '...' : 'N/A'}
                    </div>
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  device.device_type === 'Desktop' ? 'bg-blue-100 text-blue-800' :
                  device.device_type === 'Laptop' ? 'bg-green-100 text-green-800' :
                  device.device_type === 'Mobile' ? 'bg-purple-100 text-purple-800' :
                  device.device_type === 'Tablet' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {device.device_type || 'Unknown'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {device.browser || 'N/A'}
                {device.browser_version && (
                  <div className="text-xs text-gray-500">v{device.browser_version}</div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {device.operating_system || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {device.screen_resolution || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {formatDate(device.first_seen_at)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {formatDate(device.last_seen_at)}
              </td>
              <td className="px-4 py-3 text-sm">
                {editingDevice === device.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveAlias(device.id)}
                      disabled={savingAlias}
                      className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                      title="Save"
                    >
                      <FiSave className="text-lg" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={savingAlias}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                      title="Cancel"
                    >
                      <FiX className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditAlias(device)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit Alias"
                  >
                    <FiEdit2 className="text-lg" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No device fingerprints found
        </div>
      )}
    </div>
  );

  const renderRateLimits = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Count</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Window Start</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((limit, index) => {
            const windowStart = new Date(limit.window_start);
            const now = new Date();
            const isActive = (now - windowStart) < 60000; // Within 1 minute
            
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {limit.employee_id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {limit.ip_address}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                  {limit.request_count}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(limit.window_start)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isActive ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(limit.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No rate limit records found
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <FiShield className="text-3xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Security Logs</h1>
            </div>
            <p className="text-gray-600">Monitor attendance security events, devices, and rate limiting</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'audit'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Audit Logs
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'devices'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Device Fingerprints
                </button>
                <button
                  onClick={() => setActiveTab('rateLimit')}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === 'rateLimit'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Rate Limits
                </button>
              </nav>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              
              <div className="text-sm text-gray-600">
                Total Records: <span className="font-semibold">{data.length}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'audit' && renderAuditLogs()}
                  {activeTab === 'devices' && renderDeviceFingerprints()}
                  {activeTab === 'rateLimit' && renderRateLimits()}
                </>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Audit Logs</h3>
              <p className="text-2xl font-bold text-gray-900">
                {activeTab === 'audit' ? data.length : '-'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Unique Devices</h3>
              <p className="text-2xl font-bold text-gray-900">
                {activeTab === 'devices' ? data.length : '-'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Active Rate Limits</h3>
              <p className="text-2xl font-bold text-gray-900">
                {activeTab === 'rateLimit' ? data.filter(r => {
                  const windowStart = new Date(r.window_start);
                  const now = new Date();
                  return (now - windowStart) < 60000;
                }).length : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityLogs;
