const { getSettingsFromDB } = require('./settingsHelper');
const { validateLocation, validateGPSAccuracy } = require('./locationValidator');
const { validateNetwork } = require('../services/networkValidationService');

/**
 * Validate attendance based on configured mode
 */
const validateAttendance = async (req, latitude, longitude, accuracy, isWFH = false) => {
  try {
    // If WFH is enabled, skip all validation
    if (isWFH) {
      console.log('WFH enabled - skipping all validation');
      return {
        valid: true,
        method: 'wfh',
        message: 'WFH enabled - validation skipped'
      };
    }

    const settings = await getSettingsFromDB();
    const validationMode = settings.validation.attendanceValidationMode;

    console.log('=== ATTENDANCE VALIDATION ===');
    console.log('Validation Mode:', validationMode);
    console.log('GPS Accuracy Threshold:', settings.companyLocation.gpsAccuracyThreshold, 'meters');

    // Perform location validation
    let locationValid = false;
    let locationMessage = '';
    let locationDistance = null;

    // Check GPS accuracy first
    const accuracyCheck = await validateGPSAccuracy(accuracy);
    if (!accuracyCheck.valid) {
      console.log('❌ GPS accuracy too low:', accuracy, 'meters (threshold:', settings.companyLocation.gpsAccuracyThreshold, 'meters)');
      locationValid = false;
      locationMessage = accuracyCheck.message;
    } else {
      // GPS accuracy is acceptable, check location
      const locationCheck = await validateLocation(
        parseFloat(latitude),
        parseFloat(longitude),
        false
      );
      locationValid = locationCheck.valid;
      locationMessage = locationCheck.message;
      locationDistance = locationCheck.distance;
    }

    // Perform network validation
    const networkCheck = await validateNetwork(req);
    const networkValid = networkCheck.valid;
    const networkMessage = networkCheck.message;

    console.log('Location Valid:', locationValid);
    console.log('Network Valid:', networkValid);

    // Apply validation mode
    switch (validationMode) {
      case 'location_only':
        if (locationValid) {
          return {
            valid: true,
            method: 'location',
            message: 'Location validation passed',
            distance: locationDistance
          };
        } else {
          return {
            valid: false,
            method: 'location',
            message: locationMessage,
            distance: locationDistance
          };
        }

      case 'network_only':
        if (networkValid) {
          return {
            valid: true,
            method: 'network',
            message: 'Network validation passed'
          };
        } else {
          return {
            valid: false,
            method: 'network',
            message: networkMessage
          };
        }

      case 'location_or_network':
        // Pass if EITHER location OR network is valid
        if (locationValid || networkValid) {
          const method = locationValid ? 'location' : 'network';
          const message = locationValid ? 
            `Location validation passed${networkValid ? ' (network also valid)' : ''}` :
            'Network validation passed (location failed but not required)';
          
          return {
            valid: true,
            method: locationValid && networkValid ? 'location_and_network' : method,
            message,
            distance: locationDistance
          };
        } else {
          return {
            valid: false,
            method: 'location_or_network',
            message: `Both validations failed. Location: ${locationMessage}. Network: ${networkMessage}`,
            distance: locationDistance
          };
        }

      case 'location_and_network':
        // Pass only if BOTH location AND network are valid
        if (locationValid && networkValid) {
          return {
            valid: true,
            method: 'location_and_network',
            message: 'Both location and network validation passed',
            distance: locationDistance
          };
        } else {
          const failedChecks = [];
          if (!locationValid) failedChecks.push(`Location: ${locationMessage}`);
          if (!networkValid) failedChecks.push(`Network: ${networkMessage}`);
          
          return {
            valid: false,
            method: 'location_and_network',
            message: `Validation failed. ${failedChecks.join('. ')}`,
            distance: locationDistance
          };
        }

      default:
        // Default to location_or_network
        if (locationValid || networkValid) {
          const method = locationValid ? 'location' : 'network';
          return {
            valid: true,
            method,
            message: `${method.charAt(0).toUpperCase() + method.slice(1)} validation passed`,
            distance: locationDistance
          };
        } else {
          return {
            valid: false,
            method: 'location_or_network',
            message: `Validation failed. Location: ${locationMessage}. Network: ${networkMessage}`,
            distance: locationDistance
          };
        }
    }
  } catch (error) {
    console.error('Attendance validation error:', error);
    return {
      valid: false,
      method: 'error',
      message: 'Validation error occurred'
    };
  }
};

/**
 * Calculate attendance status based on time (backend only - never trust frontend)
 */
const calculateAttendanceStatus = async (isWFH) => {
  const settings = await getSettingsFromDB();
  
  // Get current time in IST (UTC+5:30)
  const currentTime = new Date();
  const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
  const localTime = new Date(currentTime.getTime() + (istOffset * 60 * 1000));
  const currentHour = localTime.getUTCHours();
  const currentMinute = localTime.getUTCMinutes();

  const [lateHour, lateMinute] = settings.workingHours.lateAfterTime.split(':').map(Number);
  
  let attendanceStatus = 'Present';
  
  // Check if late (applies to ALL employees, both office and WFH)
  if (currentHour > lateHour || (currentHour === lateHour && currentMinute > lateMinute)) {
    attendanceStatus = 'Late';
  }

  // Override with WFH status if employee has WFH permission and NOT late
  if (isWFH && attendanceStatus !== 'Late') {
    attendanceStatus = 'Work From Home';
  }

  return attendanceStatus;
};

module.exports = {
  validateAttendance,
  calculateAttendanceStatus
};
