const pool = require('../config/database');
const { clearSettingsCache } = require('../utils/settingsHelper');

// Get current settings from database
const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY id LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found. Please run migration first.'
      });
    }

    const dbSettings = result.rows[0];
    
    // Format response to match frontend expectations
    const settings = {
      companyLocation: {
        name: dbSettings.company_name,
        latitude: parseFloat(dbSettings.latitude),
        longitude: parseFloat(dbSettings.longitude),
        allowedRadius: dbSettings.allowed_radius,
        gpsAccuracyThreshold: dbSettings.gps_accuracy_threshold
      },
      workingHours: {
        lateAfterTime: dbSettings.late_after_time.substring(0, 5),  // Format: HH:MM
        halfDayThreshold: parseFloat(dbSettings.half_day_threshold),
        officeStartTime: dbSettings.office_start_time.substring(0, 5),  // Format: HH:MM
        officeEndTime: dbSettings.office_end_time.substring(0, 5),  // Format: HH:MM
        autoCheckoutTime: dbSettings.auto_checkout_time ? dbSettings.auto_checkout_time.substring(0, 5) : '18:32',  // Format: HH:MM
        checkInEnabled: dbSettings.check_in_enabled,
        checkOutEnabled: dbSettings.check_out_enabled
      },
      messages: {
        locationPermissionTitle: "Location Permission Required",
        locationPermissionMessage: "This app needs access to your location to verify your attendance. Please allow location access to continue.",
        locationDeniedTitle: "Location Access Denied",
        locationDeniedMessage: "You have denied location access. Please enable location permission in your browser settings to use attendance features.",
        locationUnavailableTitle: "Location Unavailable",
        locationUnavailableMessage: "Unable to retrieve your location. Please check if GPS is enabled on your device.",
        locationTimeoutTitle: "Location Timeout",
        locationTimeoutMessage: "Location request timed out. Please try again.",
        outsideRadiusTitle: "Outside Office Area",
        outsideRadiusMessage: "You are outside the allowed office area. Please move closer to the office to check in.",
        lowAccuracyTitle: "Low GPS Accuracy",
        lowAccuracyMessage: "GPS accuracy is too low. Please enable high accuracy mode in your device settings."
      }
    };

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

// Update settings in database
const updateSettings = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      allowedRadius, 
      lateAfterTime,
      officeStartTime,
      officeEndTime,
      autoCheckoutTime,
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

    if (autoCheckoutTime && !timeRegex.test(autoCheckoutTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid auto-checkout time format. Use HH:MM (24-hour format)'
      });
    }

    // Update settings in database
    const updateQuery = `
      UPDATE settings SET
        latitude = $1,
        longitude = $2,
        allowed_radius = $3,
        late_after_time = $4,
        office_start_time = $5,
        office_end_time = $6,
        auto_checkout_time = $7,
        check_in_enabled = $8,
        check_out_enabled = $9,
        half_day_threshold = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM settings ORDER BY id LIMIT 1)
      RETURNING *
    `;

    const values = [
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(allowedRadius),
      lateAfterTime,
      officeStartTime || '09:00',
      officeEndTime || '18:00',
      autoCheckoutTime || '18:32',
      checkInEnabled !== undefined ? checkInEnabled : true,
      checkOutEnabled !== undefined ? checkOutEnabled : true,
      halfDayThreshold ? parseFloat(halfDayThreshold) : 4.0
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found. Please run migration first.'
      });
    }

    // Clear settings cache so next request gets fresh data
    clearSettingsCache();

    res.json({
      success: true,
      message: 'Settings updated successfully! Changes apply immediately - no restart needed.',
      settings: {
        companyLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          allowedRadius: parseInt(allowedRadius)
        },
        workingHours: {
          lateAfterTime,
          officeStartTime,
          officeEndTime,
          autoCheckoutTime,
          checkInEnabled,
          checkOutEnabled,
          halfDayThreshold
        }
      }
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
