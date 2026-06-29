const { contextBridge } = require('electron');

// Expose minimal safe flag to window object
contextBridge.exposeInMainWorld('attendanceDesktop', {
  isDesktopApp: true,
  // DO NOT expose getDeviceId, privateKey, raw secrets, etc.
});
