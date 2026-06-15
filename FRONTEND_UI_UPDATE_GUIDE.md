# Frontend UI Update Guide - Admin Settings Page

## Current Status

✅ **Backend**: Fully implemented - all new settings work via API  
⚠️ **Frontend**: New settings fields not yet added to UI  
✅ **Workaround**: Configure via SQL (works perfectly)

---

## What Needs to be Added to Frontend

### File to Update:
`frontend/src/pages/AdminSettings.js`

### Fields to Add:

1. **GPS Accuracy Threshold** (number input)
2. **Office Public IP** (text input)
3. **Allowed IPs** (textarea)
4. **Attendance Validation Mode** (dropdown/select)
5. **Attendance Rate Limit** (number input)

---

## How Frontend Currently Works

### State Structure:
```javascript
const [settings, setSettings] = useState({
  latitude: '',
  longitude: '',
  allowedRadius: '',
  lateAfterTime: '',
  // ... existing fields
  
  // ADD THESE:
  gpsAccuracyThreshold: 100,
  officePublicIP: '',
  allowedIPs: '',
  attendanceValidationMode: 'location_or_network',
  attendanceRateLimit: 5
});
```

### Fetch Settings (already supports new fields):
```javascript
const fetchSettings = async () => {
  const response = await getSettings();
  const s = response.data.settings;
  
  setSettings({
    // existing fields...
    
    // ADD THESE:
    gpsAccuracyThreshold: s.companyLocation.gpsAccuracyThreshold || 100,
    officePublicIP: s.network.officePublicIP || '',
    allowedIPs: s.network.allowedIPs || '',
    attendanceValidationMode: s.validation.attendanceValidationMode || 'location_or_network',
    attendanceRateLimit: s.security.attendanceRateLimit || 5
  });
};
```

### Submit Settings (already supports new fields):
```javascript
const handleSubmit = async (e) => {
  // No changes needed - updateSettings API already accepts all fields!
  const response = await updateSettings(settings);
};
```

---

## UI Components to Add

### 1. GPS Accuracy Threshold Field

**Add after "Allowed Radius" field:**

```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    GPS Accuracy Threshold (meters)
  </label>
  <select
    name="gpsAccuracyThreshold"
    value={settings.gpsAccuracyThreshold}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  >
    <option value={50}>50m (High accuracy - Mobile/WiFi)</option>
    <option value={100}>100m (Standard - Default)</option>
    <option value={200}>200m (Relaxed)</option>
    <option value={300}>300m (Ethernet friendly)</option>
    <option value={500}>500m (Very relaxed)</option>
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Reject check-in if GPS accuracy is worse than this value. Use 300-500m for Ethernet systems.
  </p>
</div>
```

### 2. Office Network Section

**Add after "Office Location" section:**

```jsx
{/* Network Settings */}
<div className="mb-8">
  <div className="flex items-center space-x-2 mb-4">
    <FiWifi className="text-2xl text-purple-600" />
    <h2 className="text-xl font-bold text-gray-800">Office Network</h2>
  </div>

  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Office Public IP Address
      </label>
      <input
        type="text"
        name="officePublicIP"
        value={settings.officePublicIP}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="122.165.45.100"
      />
      <p className="text-xs text-gray-500 mt-1">
        Your office public IP address. Find it at{' '}
        <a 
          href="https://www.whatismyip.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          whatismyip.com
        </a>
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Allowed IP Addresses (Optional)
      </label>
      <textarea
        name="allowedIPs"
        value={settings.allowedIPs}
        onChange={handleChange}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="122.165.45.100, 122.165.45.101, 192.168.1.0/24"
      />
      <p className="text-xs text-gray-500 mt-1">
        Comma-separated list of allowed office IPs. Supports CIDR notation (e.g., 192.168.1.0/24)
      </p>
    </div>
  </div>
</div>
```

### 3. Validation Mode Section

**Add after "Network Settings" section:**

```jsx
{/* Validation Settings */}
<div className="mb-8">
  <div className="flex items-center space-x-2 mb-4">
    <FiShield className="text-2xl text-green-600" />
    <h2 className="text-xl font-bold text-gray-800">Attendance Validation</h2>
  </div>

  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Validation Mode
      </label>
      <select
        name="attendanceValidationMode"
        value={settings.attendanceValidationMode}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="location_only">Location Only</option>
        <option value="network_only">Network Only</option>
        <option value="location_or_network">Location OR Network (Recommended)</option>
        <option value="location_and_network">Location AND Network (Strictest)</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        <strong>Location Only:</strong> GPS + Radius validation<br />
        <strong>Network Only:</strong> Office IP validation (best for Ethernet)<br />
        <strong>Location OR Network:</strong> Pass if either valid (RECOMMENDED for hybrid)<br />
        <strong>Location AND Network:</strong> Must pass both (strictest security)
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Rate Limit (requests per minute)
      </label>
      <input
        type="number"
        name="attendanceRateLimit"
        value={settings.attendanceRateLimit}
        onChange={handleChange}
        min={1}
        max={20}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        Maximum attendance API requests per minute per employee (prevents spam/abuse)
      </p>
    </div>
  </div>
</div>
```

### 4. Import New Icons

**Add at top of file:**

```javascript
import { 
  FiMapPin, 
  FiClock, 
  FiSave, 
  FiToggleLeft, 
  FiToggleRight,
  FiWifi,   // ADD THIS
  FiShield  // ADD THIS
} from 'react-icons/fi';
```

---

## Full Updated State Structure

```javascript
const [settings, setSettings] = useState({
  // Location
  latitude: '',
  longitude: '',
  allowedRadius: '',
  gpsAccuracyThreshold: 100,  // NEW
  
  // Time
  lateAfterTime: '',
  officeStartTime: '09:00',
  officeEndTime: '18:00',
  autoCheckoutTime: '18:32',
  halfDayThreshold: 4,
  
  // Controls
  checkInEnabled: true,
  checkOutEnabled: true,
  
  // Network - NEW
  officePublicIP: '',
  allowedIPs: '',
  
  // Validation - NEW
  attendanceValidationMode: 'location_or_network',
  attendanceRateLimit: 5
});
```

---

## Full Updated fetchSettings

```javascript
const fetchSettings = async () => {
  try {
    setLoading(true);
    const response = await getSettings();

    if (response.data.success) {
      const s = response.data.settings;
      setSettings({
        // Location
        latitude: s.companyLocation.latitude,
        longitude: s.companyLocation.longitude,
        allowedRadius: s.companyLocation.allowedRadius,
        gpsAccuracyThreshold: s.companyLocation.gpsAccuracyThreshold || 100,
        
        // Time
        lateAfterTime: s.workingHours.lateAfterTime,
        officeStartTime: s.workingHours.officeStartTime || '09:00',
        officeEndTime: s.workingHours.officeEndTime || '18:00',
        autoCheckoutTime: s.workingHours.autoCheckoutTime || '18:32',
        halfDayThreshold: s.workingHours.halfDayThreshold || 4,
        
        // Controls
        checkInEnabled: s.workingHours.checkInEnabled !== undefined ? s.workingHours.checkInEnabled : true,
        checkOutEnabled: s.workingHours.checkOutEnabled !== undefined ? s.workingHours.checkOutEnabled : true,
        
        // Network
        officePublicIP: s.network?.officePublicIP || '',
        allowedIPs: s.network?.allowedIPs || '',
        
        // Validation
        attendanceValidationMode: s.validation?.attendanceValidationMode || 'location_or_network',
        attendanceRateLimit: s.security?.attendanceRateLimit || 5
      });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    setAlertDialog({
      isOpen: true,
      title: 'Error',
      message: 'Failed to load settings',
      type: 'error'
    });
  } finally {
    setLoading(false);
  }
};
```

---

## Testing UI Update

### After Adding Fields:

1. **Save file**
2. **Refresh frontend** (`npm start` already running will hot-reload)
3. **Login as admin**
4. **Go to Settings**
5. **You should see new fields**
6. **Try changing GPS Accuracy Threshold**
7. **Try adding your office IP**
8. **Try changing validation mode**
9. **Click Save**
10. **Check database**: `SELECT * FROM settings;`

---

## Temporary Workaround (Current Solution)

**Until UI is updated, configure via SQL:**

```sql
-- All in one command
UPDATE settings SET 
  gps_accuracy_threshold = 300,
  office_public_ip = 'YOUR_OFFICE_IP',
  allowed_ips = 'ip1, ip2, ip3',
  attendance_validation_mode = 'location_or_network',
  attendance_rate_limit = 5;
```

**This works perfectly! Backend APIs already support these fields.**

---

## Priority

**Priority**: LOW  
**Why**: Backend fully works, SQL configuration is easy  
**When**: Update UI when you have time, not urgent  

**The system is fully functional right now using SQL configuration!**

---

## Need Help?

The UI update is straightforward:
1. Copy the JSX code above
2. Paste in appropriate sections
3. Update state and fetchSettings
4. Test!

**No backend changes needed - everything already works!**
