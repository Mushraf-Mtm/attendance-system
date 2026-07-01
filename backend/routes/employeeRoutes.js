const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getAllDepartments
} = require('../controllers/employeeController');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Get all employees
router.get('/', getAllEmployees);

// Get all departments
router.get('/departments', getAllDepartments);

// Get single employee
router.get('/:id', getEmployeeById);

// Add employee
router.post('/', addEmployee);

// Update employee
router.put('/:id', updateEmployee);

// Delete employee
router.delete('/:id', deleteEmployee);

module.exports = router;
