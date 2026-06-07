import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiDownload, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('admins');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  
  // Alert and Confirm Dialog States
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Admin Form States
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Password Change Form States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Logs Filter States
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    } else if (activeTab === 'logs') {
      fetchLoginLogs();
    }
  }, [activeTab]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins');
      setAdmins(response.data.admins);
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to fetch admins'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;
      
      const response = await api.get('/admins/login-logs', { params });
      setLoginLogs(response.data.logs);
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to fetch login logs'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setAdminForm({ username: '', email: '', password: '' });
    setShowAdminForm(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminForm({ username: admin.username, email: admin.email, password: '' });
    setShowAdminForm(true);
  };

  const handleSaveAdmin = async () => {
    if (!adminForm.username || !adminForm.email) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Username and email are required'
      });
      return;
    }

    if (!editingAdmin && !adminForm.password) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Password is required for new admin'
      });
      return;
    }

    try {
      setLoading(true);
      if (editingAdmin) {
        await api.put(`/admins/${editingAdmin.id}`, {
          username: adminForm.username,
          email: adminForm.email
        });
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Admin updated successfully'
        });
      } else {
        await api.post('/admins', adminForm);
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Admin added successfully'
        });
      }
      setShowAdminForm(false);
      fetchAdmins();
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = (admin) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Admin',
      message: `Are you sure you want to delete admin "${admin.username}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await api.delete(`/admins/${admin.id}`);
          setAlertDialog({
            isOpen: true,
            title: 'Success',
            message: 'Admin deleted successfully'
          });
          fetchAdmins();
        } catch (error) {
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: error.response?.data?.message || 'Failed to delete admin'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'All fields are required'
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'New password and confirm password do not match'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setAlertDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    try {
      setLoading(true);
      await api.post('/admins/change-password', {
        adminId: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setAlertDialog({
        isOpen: true,
        title: 'Success',
        message: 'Password changed successfully'
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;

      const response = await api.get('/pdf/admin-logs', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_login_logs_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setAlertDialog({
        isOpen: true,
        title: 'Success',
        message: 'PDF downloaded successfully'
      });
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to download PDF'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Management</h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'admins'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Manage Admins
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'password'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'logs'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Login Logs
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'admins' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Admin Users</h2>
                <button
                  onClick={handleAddAdmin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiPlus /> Add Admin
                </button>
              </div>

              {loading ? (
                <Loader />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {admins.map((admin) => (
                        <tr key={admin.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{admin.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{admin.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{admin.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEditAdmin(admin)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Admin Form Modal */}
              {showAdminForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-xl font-semibold mb-4">
                      {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {!editingAdmin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input
                            type="password"
                            value={adminForm.password}
                            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowAdminForm(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAdmin}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        {editingAdmin ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="bg-white rounded-lg shadow p-6 max-w-md">
              <h2 className="text-xl font-semibold mb-6">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Admin Login Logs</h2>
                <button
                  onClick={handleDownloadLogs}
                  disabled={loginLogs.length === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400"
                >
                  <FiDownload /> Download PDF
                </button>
              </div>

              {/* Date Filters */}
              <div className="flex gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchLoginLogs}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {loading ? (
                <Loader />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Browser</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{log.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{log.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(log.login_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{log.ip_address}</td>
                          <td className="px-6 py-4 text-sm max-w-xs truncate">{log.browser_info}</td>
                          <td className="px-6 py-4 text-sm max-w-xs truncate">{log.device_info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {loginLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No login logs found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '' })}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
};

export default AdminManagement;
