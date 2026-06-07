import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { 
  getAllHolidays, 
  addHoliday, 
  updateHoliday, 
  deleteHoliday, 
  toggleHolidayStatus 
} from '../services/api';

const AdminHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [formData, setFormData] = useState({
    holiday_date: '',
    holiday_type: 'Government Holiday',
    holiday_title: '',
    holiday_note: '',
    is_enabled: true
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'info'
  });
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await getAllHolidays();

      if (response.data.success) {
        setHolidays(response.data.holidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load holidays',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      holiday_date: '',
      holiday_type: 'Government Holiday',
      holiday_title: '',
      holiday_note: '',
      is_enabled: true
    });
  };

  const handleAddHoliday = async () => {
    try {
      const response = await addHoliday(formData);

      if (response.data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Holiday added successfully!',
          type: 'success'
        });
        setShowAddModal(false);
        resetForm();
        fetchHolidays();
      }
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to add holiday',
        type: 'error'
      });
    }
  };

  const handleEditHoliday = async () => {
    try {
      const response = await updateHoliday(selectedHoliday.id, formData);

      if (response.data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Holiday updated successfully!',
          type: 'success'
        });
        setShowEditModal(false);
        resetForm();
        setSelectedHoliday(null);
        fetchHolidays();
      }
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update holiday',
        type: 'error'
      });
    }
  };

  const handleToggleStatus = async (holiday) => {
    try {
      const response = await toggleHolidayStatus(holiday.id, !holiday.is_enabled);

      if (response.data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: `Holiday ${!holiday.is_enabled ? 'enabled' : 'disabled'} successfully!`,
          type: 'success'
        });
        fetchHolidays();
      }
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to toggle holiday status',
        type: 'error'
      });
    }
  };

  const handleDeleteHoliday = (holiday) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Holiday',
      message: `Are you sure you want to delete "${holiday.holiday_title}" on ${formatDate(holiday.holiday_date)}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await deleteHoliday(holiday.id);

          if (response.data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'Holiday deleted successfully!',
              type: 'success'
            });
            fetchHolidays();
          }
        } catch (error) {
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: 'Failed to delete holiday',
            type: 'error'
          });
        }
      },
      type: 'danger'
    });
  };

  const openEditModal = (holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      holiday_date: holiday.holiday_date.split('T')[0],
      holiday_type: holiday.holiday_type,
      holiday_title: holiday.holiday_title,
      holiday_note: holiday.holiday_note || '',
      is_enabled: holiday.is_enabled
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getHolidayTypeColor = (type) => {
    return type === 'Government Holiday' 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Holiday Management</h1>
              <p className="text-gray-600 mt-1">Manage government and office holidays</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Holiday</span>
            </button>
          </div>

          {/* Holidays Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Note</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.length > 0 ? (
                      holidays.map((holiday) => (
                        <tr key={holiday.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDate(holiday.holiday_date)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getHolidayTypeColor(holiday.holiday_type)}`}>
                              {holiday.holiday_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{holiday.holiday_title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {holiday.holiday_note || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleToggleStatus(holiday)}
                              className={`text-3xl transition-colors ${
                                holiday.is_enabled ? 'text-green-600' : 'text-gray-400'
                              }`}
                            >
                              {holiday.is_enabled ? <FiToggleRight /> : <FiToggleLeft />}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(holiday)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                title="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteHoliday(holiday)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No holidays configured. Click "Add Holiday" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Holiday</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Date
                </label>
                <input
                  type="date"
                  name="holiday_date"
                  value={formData.holiday_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Type
                </label>
                <select
                  name="holiday_type"
                  value={formData.holiday_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Government Holiday">Government Holiday</option>
                  <option value="Office Holiday">Office Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Title
                </label>
                <input
                  type="text"
                  name="holiday_title"
                  value={formData.holiday_title}
                  onChange={handleInputChange}
                  placeholder="e.g., Independence Day"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Note / Reason
                </label>
                <textarea
                  name="holiday_note"
                  value={formData.holiday_note}
                  onChange={handleInputChange}
                  placeholder="Additional details (optional)"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_enabled"
                  checked={formData.is_enabled}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable this holiday
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHoliday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Holiday
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Holiday Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Holiday</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Date
                </label>
                <input
                  type="date"
                  value={formData.holiday_date}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Date cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Type
                </label>
                <select
                  name="holiday_type"
                  value={formData.holiday_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Government Holiday">Government Holiday</option>
                  <option value="Office Holiday">Office Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Title
                </label>
                <input
                  type="text"
                  name="holiday_title"
                  value={formData.holiday_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Note / Reason
                </label>
                <textarea
                  name="holiday_note"
                  value={formData.holiday_note}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_enabled"
                  checked={formData.is_enabled}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable this holiday
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedHoliday(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditHoliday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Holiday
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
      />

      {/* Alert Dialog */}
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

export default AdminHolidays;
