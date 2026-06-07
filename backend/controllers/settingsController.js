const fs = require('fs');
const path = require('path');

// Get current settings
const getSettings = async (req, res) => {
  try {
    const settingsPath = path.join(__dirname, '../config/settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading settings'
    });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      allowedRadius, 
      lateAfterTime,
      officeStartTime,
      officeEndTime,
      checkInEnabled,
      checkOutEnabled,
      halfDayThreshold
    } = req.body;

    // Validation
    if (!latitude || !longitude || !allowedRadius || !lateAfterTime) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Validate latitude (-90 to 90)
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90'
      });
    }

    // Validate longitude (-180 to 180)
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(lateAfterTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid late time format. Use HH:MM (24-hour format)'
      });
    }

    if (officeStartTime && !timeRegex.test(officeStartTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid office start time format. Use HH:MM (24-hour format)'
      });
    }

    if (officeEndTime && !timeRegex.test(officeEndTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid office end time format. Use HH:MM (24-hour format)'
      });
    }

    // Update backend settings.json
    const backendSettingsPath = path.join(__dirname, '../config/settings.json');
    const backendSettings = JSON.parse(fs.readFileSync(backendSettingsPath, 'utf8'));

    backendSettings.companyLocation.latitude = parseFloat(latitude);
    backendSettings.companyLocation.longitude = parseFloat(longitude);
    backendSettings.companyLocation.allowedRadius = parseInt(allowedRadius);
    backendSettings.workingHours.lateAfterTime = lateAfterTime;
    
    if (officeStartTime) backendSettings.workingHours.officeStartTime = officeStartTime;
    if (officeEndTime) backendSettings.workingHours.officeEndTime = officeEndTime;
    if (checkInEnabled !== undefined) backendSettings.workingHours.checkInEnabled = checkInEnabled;
    if (checkOutEnabled !== undefined) backendSettings.workingHours.checkOutEnabled = checkOutEnabled;
    if (halfDayThreshold) backendSettings.workingHours.halfDayThreshold = parseFloat(halfDayThreshold);

    fs.writeFileSync(backendSettingsPath, JSON.stringify(backendSettings, null, 2));

    // Update frontend settings.json
    const frontendSettingsPath = path.join(__dirname, '../../frontend/src/config/settings.json');
    const frontendSettings = JSON.parse(fs.readFileSync(frontendSettingsPath, 'utf8'));

    frontendSettings.companyLocation.latitude = parseFloat(latitude);
    frontendSettings.companyLocation.longitude = parseFloat(longitude);
    frontendSettings.companyLocation.allowedRadius = parseInt(allowedRadius);
    frontendSettings.workingHours.lateAfterTime = lateAfterTime;
    
    if (officeStartTime) frontendSettings.workingHours.officeStartTime = officeStartTime;
    if (officeEndTime) frontendSettings.workingHours.officeEndTime = officeEndTime;
    if (checkInEnabled !== undefined) frontendSettings.workingHours.checkInEnabled = checkInEnabled;
    if (checkOutEnabled !== undefined) frontendSettings.workingHours.checkOutEnabled = checkOutEnabled;
    if (halfDayThreshold) frontendSettings.workingHours.halfDayThreshold = parseFloat(halfDayThreshold);

    fs.writeFileSync(frontendSettingsPath, JSON.stringify(frontendSettings, null, 2));

    res.json({
      success: true,
      message: 'Settings updated successfully. Please restart the backend server for changes to take effect.',
      settings: backendSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
