
// Temporary in-memory store for settings
let settingsStore = {
  'general-settings': {
    companyName: 'AllCore Solutions Private Limited',
    currency: 'INR (₹)',
    timeZone: 'IST (UTC+05:30)',
    defaultGstSlab: '18%',
    invoicePrefix: 'INV-2024-',
    startInvNo: '1001',
    lowStockAlert: true,
    emailAlerts: true,
    twoFactorAuth: false,
    sessionTimeout: '60 minutes'
  },
  'tax-finance': {
    fiscalYearStart: 'April 1st',
    baseCurrency: 'INR (Indian Rupee)',
    defaultTaxSystem: 'GST (India)',
    defaultGstRate: '18%',
    hsnSacMandatory: true,
    roundOffInvoices: true,
    autoEInvoicing: false,
    tcsApplicability: true
  },
  'inventory-settings': {
    defaultWarehouse: 'Main Hub - Mumbai',
    valuationMethod: 'FIFO (First In First Out)',
    lowStockThreshold: 15,
    enableBatchTracking: true,
    enableExpiryAlerts: true,
    barcodeFormat: 'Code-128',
    negativeStockBilling: false,
    autoGenerateSkus: true
  },
  'notification-settings': {
    emailNotifications: true,
    smsAlerts: true,
    inAppPopups: true,
    dailySummary: true,
    lowStockWarning: true,
    paymentFailureAlert: true,
    loginActivityAlert: false,
    staffTaskAssignment: true
  },
  'email-sms-settings': {
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'alerts@allcoresolutions.com',
    smtpPass: '*********',
    smsProvider: 'Twilio',
    smsApiKey: 'sk_live_83928493849',
    smsSenderId: 'ALLCORE'
  },
  'payment-gateways': {
    razorpayEnabled: true,
    razorpayKeyId: 'rzp_test_12345',
    razorpaySecret: '***********',
    stripeEnabled: false,
    stripeKey: '',
    stripeSecret: '',
    upiUpa: 'merchant@upi'
  },
  'database-api': {
    dbBackupFrequency: 'Daily (2:00 AM)',
    retentionPeriod: '30 Days',
    autoCleanLogs: true,
    enableApiAccess: true,
    apiKey: 'pk_live_ab325983758345793485798345',
    webhookUrl: 'https://webhook.site/abc'
  }
};

// @desc    Get settings by category
// @route   GET /api/settings/:category
// @access  Private
const getSettings = async (req, res) => {
  try {
    const category = req.params.category;
    const settings = settingsStore[category];
    
    if (!settings) {
      return res.status(404).json({ message: 'Settings category not found' });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching settings', error: error.message });
  }
};

// @desc    Update settings by category
// @route   PUT /api/settings/:category
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const category = req.params.category;
    
    if (!settingsStore[category]) {
      return res.status(404).json({ message: 'Settings category not found' });
    }
    
    settingsStore[category] = { ...settingsStore[category], ...req.body };
    
    res.json({ message: 'Settings updated successfully', data: settingsStore[category] });
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating settings', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
