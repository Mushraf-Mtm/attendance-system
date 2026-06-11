import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import { getAllAttendance, downloadMonthlyMatrixPDF, downloadMonthlyMatrixExcel, resetAttendance, deleteAttendance } from '../services/api';
import { formatTime, formatDate, formatWorkingHours } from '../utils/formatTime';
import { FiDownload, FiFilter, FiRefreshCw, FiTrash2, FiRotateCcw } from 'react-icons/fi';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    status: '',
    employee_id: ''
  });
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [downloadData, setDownloadData] = useState({ month: '', year: '' });
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

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await getAllAttendance(filters);
      
      if (response.data.success) {
        setAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Error loading attendance data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleDownloadPDF = (format) => {
    setDownloadFormat(format);
    const now = new Date();
    setDownloadData({
      month: String(now.getMonth() + 1),
      year: String(now.getFullYear())
    });
    setShowDownloadDialog(true);
  };

  const downloadMatrix = async () => {
    const { month, year } = downloadData;

    if (!month || !year) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Month and year are required',
        type: 'error'
      });
      return;
    }

    // Validate month
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Month must be between 1 and 12',
        type: 'error'
      });
      return;
    }

    setShowDownloadDialog(false);

    try {
      let response;
      let fileName;
      
      if (downloadFormat === 'pdf') {
        response = await downloadMonthlyMatrixPDF(month, year);
        fileName = `attendance_matrix_${month}_${year}.pdf`;
      } else {
        response = await downloadMonthlyMatrixExcel(month, year);
        fileName = `attendance_matrix_${month}_${year}.xlsx`;
      }
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: downloadFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setAlertDialog({
        isOpen: true,
        title: 'Success',
        message: `${downloadFormat.toUpperCase()} downloaded successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error downloading:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Error downloading file. Please try again.',
        type: 'error'
      });
    }
  };

  const handleResetAttendance = (record, resetType) => {
    const resetText = resetType === 'check-in' ? 'Check-In' : 'Check-Out';
    
    setConfirmDialog({
      isOpen: true,
      title: `Reset ${resetText}`,
      message: `Are you sure you want to reset ${resetText} for "${record.name}"? This will allow them to ${resetType === 'check-in' ? 'check in' : 'check out'} again for ${formatDate(record.attendance_date)}.`,
      onConfirm: async () => {
        try {
          const response = await resetAttendance(record.id, resetType);

          if (response.data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: `${resetText} reset successfully!`,
              type: 'success'
            });
            fetchAttendance();
          } else {
            throw new Error(response.data.message);
          }
        } catch (error) {
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: error.response?.data?.message || 'Operation failed. Please try again.',
            type: 'error'
          });
        }
      },
      type: 'warning'
    });
  };

  const handleDeleteAttendance = (record) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Attendance Record',
      message: `Are you sure you want to permanently delete the attendance record for "${record.name}" on ${formatDate(record.attendance_date)}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await deleteAttendance(record.id);

          if (response.data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'Attendance record deleted successfully!',
              type: 'success'
            });
            fetchAttendance();
          } else {
            throw new Error(response.data.message);
          }
        } catch (error) {
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: error.response?.data?.message || 'Delete failed. Please try again.',
            type: 'error'
          });
        }
      },
      type: 'danger'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-green-100 text-green-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Half Day': 'bg-orange-100 text-orange-800',
      'Absent': 'bg-red-100 text-red-800',
      'Work From Home': 'bg-green-100 text-green-800', // Show as green like Present
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplay = (status) => {
    // Show "Work From Home" as "Present"
    return status === 'Work From Home' ? 'Present' : status;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pt-16 lg:pt-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Attendance Monitoring</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">View and manage employee attendance</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleDownloadPDF('pdf')}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <FiDownload />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => handleDownloadPDF('excel')}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <FiDownload />
                <span>Download Excel</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <FiFilter className="text-gray-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">All Status</option>
                  <option value="Currently Working">Currently Working</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={filters.employee_id}
                  onChange={handleFilterChange}
                  placeholder="Search by Employee ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Emp ID</th>
                          <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Name</th>
                          <th className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Department</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Login</th>
                          <th className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Logout</th>
                          <th className="hidden xl:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Hours</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                          <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">WFH</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.length > 0 ? (
                          attendance.map((record) => (
                            <tr key={record.id} className="border-b hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{formatDate(record.attendance_date)}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap">{record.emp_id}</td>
                              <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{record.name}</td>
                              <td className="hidden md:table-cell px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{record.department}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{formatTime(record.login_time)}</td>
                              <td className="hidden lg:table-cell px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <span>{formatTime(record.logout_time)}</span>
                                  {record.is_auto_checkout && record.logout_time && (
                                    <span className="text-xs text-orange-600 font-medium">
                                      (Auto)
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="hidden xl:table-cell px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                                {formatWorkingHours(parseFloat(record.total_working_hours))}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(record.attendance_status)}`}>
                                  {getStatusDisplay(record.attendance_status)}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  record.is_wfh ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {record.is_wfh ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                <div className="flex space-x-1">
                                  {record.login_time && (
                                    <button
                                      onClick={() => handleResetAttendance(record, 'check-in')}
                                      className="p-1.5 text-orange-600 hover:bg-orange-100 rounded"
                                      title="Reset Check-In"
                                    >
                                      <FiRotateCcw size={14} />
                                    </button>
                                  )}
                                  {record.logout_time && (
                                    <button
                                      onClick={() => handleResetAttendance(record, 'check-out')}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                      title="Reset Check-Out"
                                    >
                                      <FiRefreshCw size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAttendance(record)}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete Record"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="px-4 py-8 text-center text-gray-500 text-sm">
                              No attendance records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Download Dialog */}
      {showDownloadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Download Attendance Matrix
            </h2>
            
            <p className="text-gray-600 mb-4">
              Select month and year for the attendance report ({downloadFormat.toUpperCase()})
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month (1-12)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={downloadData.month}
                  onChange={(e) => setDownloadData({ ...downloadData, month: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter month (1-12)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={downloadData.year}
                  onChange={(e) => setDownloadData({ ...downloadData, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter year (e.g., 2026)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDownloadDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={downloadMatrix}
                className={`px-4 py-2 text-white rounded-lg ${
                  downloadFormat === 'pdf' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Download {downloadFormat.toUpperCase()}
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

export default AdminAttendance;
