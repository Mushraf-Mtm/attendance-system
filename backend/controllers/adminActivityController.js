const { getAdminActivityLogs, getActivityStats } = require('../services/adminActivityService');
const pool = require('../config/database');
const PDFDocument = require('pdfkit');

/**
 * Get admin activity logs with filters
 */
const getActivityLogs = async (req, res) => {
  try {
    const filters = {
      adminId: req.query.adminId,
      actionType: req.query.actionType,
      moduleName: req.query.moduleName,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 50,
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await getAdminActivityLogs(filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch activity logs'
      });
    }

    res.json({
      success: true,
      logs: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get activity statistics
 */
const getStats = async (req, res) => {
  try {
    const result = await getActivityStats();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }

    res.json({
      success: true,
      stats: result.stats
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get single activity log by ID
 */
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM admin_activity_logs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found'
      });
    }

    res.json({
      success: true,
      log: result.rows[0]
    });
  } catch (error) {
    console.error('Get activity by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Export activity logs to PDF
 */
const exportActivityLogs = async (req, res) => {
  try {
    const filters = {
      adminId: req.query.adminId,
      actionType: req.query.actionType,
      moduleName: req.query.moduleName,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: 10000,
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await getAdminActivityLogs(filters);

    if (!result.success || result.logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No logs to export'
      });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=admin_activity_logs_${Date.now()}.pdf`);
    
    doc.pipe(res);

    const primaryColor = '#3B82F6';
    const secondaryColor = '#64748B';
    const successColor = '#10B981';
    const headerBg = '#1E293B';

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill('#0F172A');
    doc.fontSize(24).fillColor('#FFFFFF').text('Admin Activity Logs', 50, 25);
    doc.fontSize(10).fillColor('#94A3B8').text(`Generated on ${new Date().toLocaleString()}`, 50, 55);
    doc.fontSize(10).text(`Total Records: ${result.logs.length}`, doc.page.width - 200, 55);

    let y = 100;
    const tableTop = y;
    const colWidths = {
      date: 90,
      admin: 120,
      action: 110,
      module: 80,
      description: 300
    };

    // Header background
    doc.rect(50, tableTop, doc.page.width - 100, 25).fill(headerBg);

    // Header text
    doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
    let x = 55;
    doc.text('Date & Time', x, tableTop + 8);
    x += colWidths.date;
    doc.text('Admin', x, tableTop + 8);
    x += colWidths.admin;
    doc.text('Action Type', x, tableTop + 8);
    x += colWidths.action;
    doc.text('Module', x, tableTop + 8);
    x += colWidths.module;
    doc.text('Description', x, tableTop + 8);

    doc.font('Helvetica');
    y = tableTop + 30;

    result.logs.forEach((log, index) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
        
        doc.rect(50, y, doc.page.width - 100, 25).fill(headerBg);
        doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold');
        let headerX = 55;
        doc.text('Date & Time', headerX, y + 8);
        headerX += colWidths.date;
        doc.text('Admin', headerX, y + 8);
        headerX += colWidths.admin;
        doc.text('Action Type', headerX, y + 8);
        headerX += colWidths.action;
        doc.text('Module', headerX, y + 8);
        headerX += colWidths.module;
        doc.text('Description', headerX, y + 8);
        
        doc.font('Helvetica');
        y += 30;
      }

      if (index % 2 === 0) {
        doc.rect(50, y - 5, doc.page.width - 100, 25).fill('#F8FAFC');
      }

      doc.fontSize(8).fillColor('#1E293B');
      let rowX = 55;
      
      doc.text(new Date(log.created_at).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      }), rowX, y, { width: colWidths.date - 5 });
      rowX += colWidths.date;
      
      doc.text(log.admin_name || 'N/A', rowX, y, { width: colWidths.admin - 5, ellipsis: true });
      rowX += colWidths.admin;
      
      doc.fillColor(primaryColor).text(log.action_type, rowX, y, { width: colWidths.action - 5, ellipsis: true });
      rowX += colWidths.action;
      
      doc.fillColor(successColor).text(log.module_name, rowX, y, { width: colWidths.module - 5 });
      rowX += colWidths.module;
      
      doc.fillColor(secondaryColor).text(log.description || '', rowX, y, { width: colWidths.description - 5, ellipsis: true });

      y += 25;
    });

    // IMPORTANT: Finalize the document BEFORE adding footers
    doc.on('end', () => {
      // Document is finalized, stream is closed
    });

    // End the document first
    doc.end();

  } catch (error) {
    console.error('Export activity logs error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Export failed'
      });
    }
  }
};

/**
 * Get unique action types
 */
const getActionTypes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT action_type FROM admin_activity_logs ORDER BY action_type'
    );

    res.json({
      success: true,
      actionTypes: result.rows.map(row => row.action_type)
    });
  } catch (error) {
    console.error('Get action types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get unique module names
 */
const getModuleNames = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT module_name FROM admin_activity_logs ORDER BY module_name'
    );

    res.json({
      success: true,
      moduleNames: result.rows.map(row => row.module_name)
    });
  } catch (error) {
    console.error('Get module names error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getActivityLogs,
  getStats,
  getActivityById,
  exportActivityLogs,
  getActionTypes,
  getModuleNames
};
