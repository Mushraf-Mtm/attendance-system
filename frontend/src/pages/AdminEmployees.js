import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import { 
  getAllEmployees, 
  getAllDepartments, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee,
  enableWFH,
  disableWFH,
  toggleEarlyCheckout
} from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiHome, FiClock, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [formData, setFormData] = useState({
    id: '',
    employee_id: '',
    name: '',
    department_id: '',
    job_role: '',
    mobile: '',
    email: '',
    password: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        getAllEmployees(),
        getAllDepartments()
      ]);

      if (empRes.data.success) {
        setEmployees(empRes.data.employees);
      }

      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        const response = await updateEmployee(formData.id, formData);
        if (response.data.success) {
          setAlertDialog({
            isOpen: true,
            title: 'Success',
            message: 'Employee updated successfully!',
            type: 'success'
          });
          fetchData();
          closeModal();
        }
      } else {
        const response = await addEmployee(formData);
        if (response.data.success) {
          setAlertDialog({
            isOpen: true,
            title: 'Success',
            message: 'Employee added successfully!',
            type: 'success'
          });
          fetchData();
          closeModal();
        }
      }
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.message || 'Operation failed. Please try again.',
        type: 'error'
      });
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      id: employee.id,
      employee_id: employee.employee_id,
      name: employee.name,
      department_id: employee.department_id,
      job_role: employee.job_role,
      mobile: employee.mobile,
      email: employee.email,
      password: '',
      status: employee.status
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (employee) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Employee',
      message: `Are you sure you want to delete "${employee.name}"? This action cannot be undone and will remove all attendance records associated with this employee.`,
      onConfirm: async () => {
        try {
          const response = await deleteEmployee(employee.id);
          if (response.data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'Employee deleted successfully!',
              type: 'success'
            });
            fetchData();
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

  const handleWFHToggle = (employee) => {
    const action = employee.wfh_enabled ? 'disable' : 'enable';
    const actionText = employee.wfh_enabled ? 'Disable' : 'Enable';
    
    setConfirmDialog({
      isOpen: true,
      title: `${actionText} Work From Home`,
      message: `Are you sure you want to ${action} WFH access for "${employee.name}"? ${
        employee.wfh_enabled 
          ? 'They will need to be within office radius to check in.' 
          : 'They will be able to check in from any location.'
      }`,
      onConfirm: async () => {
        try {
          if (employee.wfh_enabled) {
            await disableWFH(employee.employee_id); // Use employee_id (code) instead of id
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'WFH access disabled successfully!',
              type: 'success'
            });
          } else {
            await enableWFH(employee.employee_id); // Use employee_id (code) instead of id
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'WFH access enabled successfully!',
              type: 'success'
            });
          }
          fetchData();
        } catch (error) {
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: error.response?.data?.message || 'Operation failed. Please try again.',
            type: 'error'
          });
        }
      },
      type: employee.wfh_enabled ? 'warning' : 'info'
    });
  };

  const handleEarlyCheckoutToggle = async (employee) => {
    const action = employee.early_checkout_enabled ? 'disable' : 'enable';
    const actionText = employee.early_checkout_enabled ? 'Disable' : 'Enable';
    
    setConfirmDialog({
      isOpen: true,
      title: `${actionText} Early Checkout Permission`,
      message: `Are you sure you want to ${action} early checkout for "${employee.name}"? ${
        employee.early_checkout_enabled 
          ? 'They will not be able to check out before office end time.' 
          : 'They will be able to check out before office end time.'
      }`,
      onConfirm: async () => {
        try {
          const response = await toggleEarlyCheckout(
            employee.employee_id, // Use employee_id (code) instead of id
            !employee.early_checkout_enabled
          );

          if (response.data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: response.data.message,
              type: 'success'
            });
            fetchData();
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
      type: employee.early_checkout_enabled ? 'warning' : 'info'
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setShowPassword(false);
    setFormData({
      id: '',
      employee_id: '',
      name: '',
      department_id: '',
      job_role: '',
      mobile: '',
      email: '',
      password: '',
      status: 'Active'
    });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
              <p className="text-gray-600 mt-1">Manage your employees</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Employee</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Job Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mobile</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">WFH</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Early Out</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{employee.employee_id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{employee.name}</td>
                      <td className="px-4 py-3 text-sm">{employee.department_name}</td>
                      <td className="px-4 py-3 text-sm">{employee.job_role}</td>
                      <td className="px-4 py-3 text-sm">{employee.mobile}</td>
                      <td className="px-4 py-3 text-sm">{employee.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleWFHToggle(employee)}
                          className={`p-2 rounded transition-all ${
                            employee.wfh_enabled 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={employee.wfh_enabled ? 'WFH Enabled - Click to disable' : 'WFH Disabled - Click to enable'}
                        >
                          <FiHome className="text-lg" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleEarlyCheckoutToggle(employee)}
                          className={`p-2 rounded transition-all ${
                            employee.early_checkout_enabled 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={employee.early_checkout_enabled ? 'Early Checkout Enabled - Click to disable' : 'Early Checkout Disabled - Click to enable'}
                        >
                          <FiClock className="text-lg" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(employee)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editMode ? 'Edit Employee' : 'Add Employee'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleInputChange}
                      disabled={editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Role
                    </label>
                    <input
                      type="text"
                      name="job_role"
                      value={formData.job_role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {editMode && '(leave blank to keep current)'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editMode}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editMode ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
