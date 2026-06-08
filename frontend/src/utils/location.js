// Get current location using browser Geolocation API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location. Please check if GPS is enabled on your device.';
        let errorType = 'unavailable';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'You have denied location access. Please enable location permission in your browser settings to use attendance features.';
            errorType = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Unable to retrieve your location. Please check if GPS is enabled on your device.';
            errorType = 'unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            errorType = 'timeout';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
            errorType = 'unknown';
        }
        
        const err = new Error(errorMessage);
        err.type = errorType;
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// Get device and browser info
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let deviceType = 'Desktop';

  // Detect browser
  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
    browserName = 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
  }

  // Detect device type
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'Tablet';
  }

  return {
    browser_info: `${browserName} - ${userAgent}`,
    device_info: `${deviceType} - ${navigator.platform}`,
  };
};

// Get IP address (simplified - in production use a proper IP detection service)
export const getIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'Unknown';
  }
};
