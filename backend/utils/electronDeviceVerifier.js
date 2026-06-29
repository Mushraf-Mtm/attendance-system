const crypto = require('crypto');

/**
 * Checks if the request is coming from the Electron Desktop App.
 * @param {Object} req - Express request object
 * @returns {boolean}
 */
const isElectronRequest = (req) => {
  return req.headers['x-desktop-app'] === 'true' && 
         req.headers['x-device-source'] === 'electron-desktop';
};

/**
 * Extracts Electron headers from the request.
 * @param {Object} req - Express request object
 * @returns {Object} Extracted headers
 */
const getElectronHeaders = (req) => {
  return {
    publicKeyBase64: req.headers['x-desktop-public-key'],
    publicKeyHash: req.headers['x-desktop-public-key-hash'],
    signature: req.headers['x-desktop-signature'],
    timestamp: req.headers['x-desktop-timestamp'],
    hostname: req.headers['x-desktop-hostname'],
    platform: req.headers['x-desktop-platform'],
    appVersion: req.headers['x-electron-app-version']
  };
};

/**
 * Validates if the timestamp is within a 5-minute window.
 * @param {string} timestamp - ISO timestamp string
 * @returns {boolean}
 */
const isFreshTimestamp = (timestamp) => {
  if (!timestamp) return false;
  
  const reqTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  
  // 5 minutes in milliseconds
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  return Math.abs(now - reqTime) <= FIVE_MINUTES;
};

/**
 * Verifies the Electron request signature.
 * @param {Object} req - Express request object
 * @returns {Object} Verification result object
 */
const verifyElectronSignature = (req) => {
  if (!isElectronRequest(req)) {
    return {
      isElectron: false,
      valid: false,
      message: 'Not an Electron request'
    };
  }

  const headers = getElectronHeaders(req);

  // Check required headers
  if (!headers.publicKeyBase64 || !headers.publicKeyHash || !headers.signature || !headers.timestamp) {
    return {
      isElectron: true,
      valid: false,
      message: 'Missing required Electron security headers'
    };
  }

  // Check timestamp freshness
  if (!isFreshTimestamp(headers.timestamp)) {
    return {
      isElectron: true,
      valid: false,
      message: 'Request timestamp is expired or invalid'
    };
  }

  try {
    const publicKey = Buffer.from(headers.publicKeyBase64, 'base64').toString('utf8');
    
    // Verify hash matches the provided public key
    const calculatedHash = crypto.createHash('sha256').update(publicKey).digest('hex');
    if (calculatedHash !== headers.publicKeyHash) {
      return {
        isElectron: true,
        valid: false,
        message: 'Public key hash mismatch'
      };
    }

    // Rebuild payload: timestamp + \n + METHOD + \n + URL_PATH_WITH_QUERY + \n + publicKeyHash
    const urlPath = req.originalUrl;
    const method = req.method.toUpperCase();
    const payload = `${headers.timestamp}\n${method}\n${urlPath}\n${headers.publicKeyHash}`;

    // Verify signature
    const verify = crypto.createVerify('sha256');
    verify.update(payload);
    verify.end();
    
    const isValidSignature = verify.verify(publicKey, headers.signature, 'base64');

    if (!isValidSignature) {
      return {
        isElectron: true,
        valid: false,
        message: 'Invalid signature'
      };
    }

    return {
      isElectron: true,
      valid: true,
      publicKey: publicKey,
      publicKeyHash: headers.publicKeyHash,
      hostname: headers.hostname || 'Unknown',
      platform: headers.platform || 'Unknown',
      appVersion: headers.appVersion || 'Unknown',
      source: 'electron-desktop'
    };
  } catch (error) {
    console.error('Electron verification error:', error);
    return {
      isElectron: true,
      valid: false,
      message: 'Signature verification error'
    };
  }
};

module.exports = {
  isElectronRequest,
  getElectronHeaders,
  isFreshTimestamp,
  verifyElectronSignature
};
