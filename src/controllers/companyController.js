const Company = require('../models/Company');
const User = require('../models/User');
const Role = require('../models/Role');

const Plan = require('../models/Plan');

// @desc    Register a new company and create its Admin user
// @route   POST /api/companies/register
// @access  Private/SuperAdmin
const registerCompany = async (req, res, next) => {
  const { 
    companyName, name,
    code,
    companyEmail, email,
    companyPhone, phone,
    companyAddress, address,
    city, state, gstin, website,
    adminName, adminEmail, adminPhone, adminPassword,
    subscriptionPlan, planId,
    billingCycle,
    subscriptionExpiry,
    maxUsers, maxBranches
  } = req.body;

  const finalCompanyName = (name || companyName || '').trim();
  const finalEmail = (email || companyEmail || '').trim().toLowerCase();
  const finalPhone = (phone || companyPhone || '').trim();
  const finalAddress = (address || companyAddress || '').trim();
  const finalAdminEmail = (adminEmail || '').trim().toLowerCase();
  const finalAdminPassword = (adminPassword || '').trim() || 'Admin@123';
  const finalPlanId = subscriptionPlan || planId;

  if (!finalCompanyName) {
    res.status(400);
    return next(new Error('Company Name is required'));
  }

  if (!finalAdminEmail) {
    res.status(400);
    return next(new Error('Primary Admin Email is required'));
  }

  try {
    // 1. Check if company with this email exists
    if (finalEmail) {
      const companyExists = await Company.findOne({ email: finalEmail });
      if (companyExists) {
        res.status(400);
        return next(new Error(`A company with email "${finalEmail}" already exists`));
      }
    }

    // 2. Check if admin user already exists
    const userExists = await User.findOne({ email: finalAdminEmail });
    if (userExists) {
      res.status(400);
      return next(new Error(`User with email "${finalAdminEmail}" already exists in the system`));
    }

    // 3. Resolve Subscription Plan
    let resolvedPlan = null;
    if (finalPlanId) {
      const isValidObjectId = require('mongoose').Types.ObjectId.isValid(finalPlanId);
      if (isValidObjectId) {
        resolvedPlan = await Plan.findById(finalPlanId);
      }
      if (!resolvedPlan) {
        resolvedPlan = await Plan.findOne({ name: new RegExp(`^${finalPlanId}$`, 'i') });
      }
    }

    // Fallback to first available active plan in DB if none matched
    if (!resolvedPlan) {
      resolvedPlan = await Plan.findOne({ isActive: true });
    }

    // 4. Calculate Subscription Expiry
    const cycle = billingCycle || 'monthly';
    let calculatedExpiry = subscriptionExpiry ? new Date(subscriptionExpiry) : null;
    if (!calculatedExpiry || isNaN(calculatedExpiry.getTime())) {
      const now = new Date();
      if (cycle === 'yearly') {
        now.setFullYear(now.getFullYear() + 1);
      } else if (cycle === 'lifetime') {
        now.setFullYear(now.getFullYear() + 10);
      } else {
        // default 30 days
        now.setDate(now.getDate() + 30);
      }
      calculatedExpiry = now;
    }

    // 5. Generate Company Code if not provided
    const compCode = (code || finalCompanyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900)).trim();

    // 6. Create the Company Document
    const company = await Company.create({
      name: finalCompanyName,
      code: compCode,
      email: finalEmail || finalAdminEmail,
      phone: finalPhone,
      address: finalAddress,
      city: city || '',
      state: state || '',
      gstin: gstin || '',
      website: website || '',
      billingCycle: cycle,
      maxUsers: maxUsers || (resolvedPlan ? resolvedPlan.maxUsers : 10),
      maxBranches: maxBranches || (resolvedPlan ? resolvedPlan.maxBranches : 2),
      subscriptionPlan: resolvedPlan ? resolvedPlan._id : null,
      subscriptionStatus: 'Active',
      subscriptionExpiry: calculatedExpiry,
      isActive: true,
      createdBy: req.user?._id,
      creatorRole: 'SuperAdmin'
    });

    // 7. Ensure Admin Role exists
    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        description: 'Company Admin with full management permissions',
        roleType: 'System',
        permissions: ['manage_all_company_data', 'manage_users', 'manage_roles', 'manage_sales', 'manage_inventory', 'manage_accounts']
      });
    }

    // 8. Generate unique username for Admin
    let baseUsername = (finalAdminEmail.split('@')[0] || 'admin').toLowerCase().replace(/[^a-z0-9]/g, '');
    let finalUsername = baseUsername;
    let usernameCounter = 1;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${baseUsername}${usernameCounter++}`;
    }

    // 9. Create Primary Company Admin User
    const adminUser = await User.create({
      username: finalUsername,
      email: finalAdminEmail,
      password: finalAdminPassword, // Mongoose pre-save hook handles bcrypt hash
      role: adminRole._id,
      company: company._id,
      phone: adminPhone || finalPhone,
      isActive: true
    });

    // 10. Automated Default Setup (Head Office Branch + Main Godown + Cash Account)
    try {
      const { Branch } = require('../models/Branch');
      const { Warehouse } = require('../models/Warehouse');
      const AccountLedger = require('../models/AccountLedger');

      let defaultBranch = await Branch.create({
        id: `BR-${compCode}-HO`,
        code: 'HO',
        name: 'Head Office',
        company: company._id,
        city: company.city || 'Lucknow',
        state: company.state || 'Uttar Pradesh',
        status: 'Active'
      });

      if (defaultBranch) {
        await Warehouse.create({
          name: 'Main Godown',
          code: 'WH-01',
          branch: defaultBranch._id,
          company: company._id,
          status: true
        });
      }

      await AccountLedger.create({
        accountName: 'Cash in Hand',
        groupType: 'Asset',
        openingBalance: 0,
        balanceType: 'Dr',
        description: 'Default Cash Account',
        company: company._id
      });
    } catch (setupErr) {
      console.warn('Auto-setup notice:', setupErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Company and primary Admin created successfully!',
      company: {
        ...company._doc,
        subscriptionPlan: resolvedPlan
      },
      adminUser: {
        _id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        initialPassword: finalAdminPassword, // Returned for Super Admin copy modal
        role: 'Admin'
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/SuperAdmin
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({}).populate('subscriptionPlan').sort({ createdAt: -1 });
    
    // Attach admin info to each company
    const companiesWithAdmin = await Promise.all(companies.map(async (company) => {
      const admin = await User.findOne({ company: company._id, role: await Role.findOne({name: 'Admin'}) }).select('username email');
      return {
        ...company._doc,
        adminUser: admin
      };
    }));

    res.json(companiesWithAdmin);
  } catch (error) {
    next(error);
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private/SuperAdmin
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('subscriptionPlan');
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }
    const admin = await User.findOne({ company: company._id, role: await Role.findOne({ name: 'Admin' }) }).select('username email phone');
    res.json({
      ...company._doc,
      adminUser: admin
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Update company subscription
// @route   PUT /api/companies/:id/subscription
// @access  Private/SuperAdmin
const updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionPlan, subscriptionExpiry, subscriptionStatus } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    if (subscriptionPlan !== undefined) company.subscriptionPlan = subscriptionPlan;
    if (subscriptionExpiry !== undefined) company.subscriptionExpiry = new Date(subscriptionExpiry);
    if (subscriptionStatus !== undefined) company.subscriptionStatus = subscriptionStatus;

    await company.save();
    res.json({ message: 'Subscription updated successfully', company });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the active company profile based on active context
// @route   GET /api/companies/profile
// @access  Private (Admins or any user)
const getMyCompanyProfile = async (req, res, next) => {
  try {
    let company = null;
    const targetCompId = req.user?.companyId || req.user?.company;
    if (targetCompId) {
      company = await Company.findById(targetCompId).populate('subscriptionPlan');
    }
    if (!company) {
      // Fallback to first existing active company in database
      company = await Company.findOne({ isActive: true }).populate('subscriptionPlan');
    }
    if (!company) {
      company = await Company.findOne().populate('subscriptionPlan');
    }
    if (!company) {
      // If no company exists at all, create a default one
      company = await Company.create({
        name: 'Apex Pharma Distributors',
        code: 'APD',
        email: req.user?.email || 'admin@apexpharma.com',
        phone: '1800-000-000',
        currency: 'INR (₹)',
        financialYear: '2024-2025',
        dateFormat: 'YYYY-MM-DD'
      });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
};

// @desc    Update the active company profile (including logo, banking, pharma licences)
// @route   PUT /api/companies/profile
// @access  Private (Admins only)
const updateCompanyProfile = async (req, res, next) => {
  try {
    const { 
      name, code, email, phone, whatsapp, website, address, city, state, pincode,
      gstin, gstNumber, pan, panNumber, cin, tan, logoUrl, themeColor,
      financialYear, currency, dateFormat, invoicePrefix, terms, signature,
      ownerName, constitution, businessType,
      drugLicenceNo, dl20b, dl21b, fssaiNo, drugLicenceValidity,
      bankName, accountNumber, ifscCode, branchName, upiId,
      valuationMethod, dispatchMethod, negativeStockAllowed
    } = req.body;
    
    let company = null;
    const targetCompId = req.user?.companyId || req.user?.company;
    if (targetCompId) {
      company = await Company.findById(targetCompId);
    }
    if (!company) {
      company = await Company.findOne();
    }
    if (!company) {
      company = new Company();
    }

    // भाग A: कानूनी व बेसिक
    if (name) company.name = name;
    if (code !== undefined) company.code = code;
    if (constitution !== undefined) company.constitution = constitution;
    if (ownerName !== undefined) company.ownerName = ownerName;
    if (businessType !== undefined) company.businessType = businessType;

    // भाग B: टैक्स व ड्रग लाइसेंस
    if (gstin !== undefined) company.gstin = gstin;
    else if (gstNumber !== undefined) company.gstin = gstNumber;
    if (panNumber !== undefined) company.panNumber = panNumber;
    else if (pan !== undefined) company.panNumber = pan;
    if (drugLicenceNo !== undefined) company.drugLicenceNo = drugLicenceNo;
    if (dl20b !== undefined) company.dl20b = dl20b;
    if (dl21b !== undefined) company.dl21b = dl21b;
    if (fssaiNo !== undefined) company.fssaiNo = fssaiNo;
    if (drugLicenceValidity !== undefined) company.drugLicenceValidity = drugLicenceValidity;

    // भाग C: पता व संपर्क
    if (address !== undefined) company.address = address;
    if (city !== undefined) company.city = city;
    if (state !== undefined) company.state = state;
    if (pincode !== undefined) company.pincode = pincode;
    if (phone !== undefined) company.phone = phone;
    if (whatsapp !== undefined) company.whatsapp = whatsapp;
    if (email !== undefined) company.email = email;
    if (website !== undefined) company.website = website;

    // भाग D: बैंक व बिल प्रिंटिंग
    if (logoUrl !== undefined) company.logoUrl = logoUrl;
    if (themeColor !== undefined) company.themeColor = themeColor;
    if (bankName !== undefined) company.bankName = bankName;
    if (accountNumber !== undefined) company.accountNumber = accountNumber;
    if (ifscCode !== undefined) company.ifscCode = ifscCode;
    if (branchName !== undefined) company.branchName = branchName;
    if (upiId !== undefined) company.upiId = upiId;
    if (invoicePrefix !== undefined) company.invoicePrefix = invoicePrefix;
    if (terms !== undefined) company.terms = terms;
    if (signature !== undefined) company.signature = signature;

    // Operational
    if (financialYear !== undefined) company.financialYear = financialYear;
    if (currency !== undefined) company.currency = currency;
    if (dateFormat !== undefined) company.dateFormat = dateFormat;
    if (valuationMethod !== undefined) company.valuationMethod = valuationMethod;
    if (dispatchMethod !== undefined) company.dispatchMethod = dispatchMethod;
    if (negativeStockAllowed !== undefined) company.negativeStockAllowed = Boolean(negativeStockAllowed);

    const updatedCompany = await company.save();

    // If logged-in user did not have company linked, link it now
    if (req.user && !req.user.company) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { company: updatedCompany._id });
    }

    res.json({
      success: true,
      message: 'Company profile updated successfully!',
      company: updatedCompany
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create company directly from Admin Panel Company Master
// @route   POST /api/companies/create-master
// @access  Private (Admins or SuperAdmin)
const createCompanyMaster = async (req, res, next) => {
  try {
    const {
      name, code, constitution, ownerName, businessType,
      gstin, panNumber, drugLicenceNo, dl20b, dl21b, fssaiNo, drugLicenceValidity,
      address, city, state, pincode, phone, whatsapp, email, website,
      logoUrl, bankName, accountNumber, ifscCode, branchName, upiId,
      invoicePrefix, terms, signature, themeColor,
      billingCycle, financialYear, currency
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const compCode = (code || name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase()).trim();

    const company = await Company.create({
      name: name.trim(),
      code: compCode,
      constitution: constitution || 'Proprietorship',
      ownerName: ownerName || '',
      businessType: businessType || 'Pharmaceutical wholesale and distribution',
      gstin: gstin || '',
      panNumber: panNumber || '',
      drugLicenceNo: drugLicenceNo || dl20b || '',
      dl20b: dl20b || '',
      dl21b: dl21b || '',
      fssaiNo: fssaiNo || '',
      drugLicenceValidity: drugLicenceValidity || '',
      address: address || '',
      city: city || 'Lucknow',
      state: state || 'Uttar Pradesh',
      pincode: pincode || '',
      phone: phone || '',
      whatsapp: whatsapp || '',
      email: email || '',
      website: website || '',
      logoUrl: logoUrl || '',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || '',
      branchName: branchName || '',
      upiId: upiId || '',
      invoicePrefix: invoicePrefix || (compCode ? `${compCode}-` : 'INV/'),
      terms: terms || 'Payment is due within credit period.',
      signature: signature || `For ${name} - Authorized Signatory`,
      themeColor: themeColor || '#1e293b',
      billingCycle: billingCycle || 'yearly',
      financialYear: financialYear || '2024-2025',
      currency: currency || 'INR (₹)',
      isActive: true,
      subscriptionStatus: 'Active',
      createdBy: req.user?._id,
      creatorRole: req.user?.role?.name === 'SuperAdmin' ? 'SuperAdmin' : 'Admin'
    });

    // Auto-setup: Branch, Warehouse, Cash Ledger
    try {
      const { Branch } = require('../models/Branch');
      const { Warehouse } = require('../models/Warehouse');
      const AccountLedger = require('../models/AccountLedger');

      let branch = await Branch.create({
        id: `BR-${compCode}-HO`,
        code: 'HO',
        name: 'Head Office',
        company: company._id,
        city: company.city || 'Lucknow',
        state: company.state || 'Uttar Pradesh',
        status: 'Active'
      });

      if (branch) {
        await Warehouse.create({
          name: 'Main Godown',
          code: 'WH-01',
          branch: branch._id,
          company: company._id,
          status: true
        });
      }

      await AccountLedger.create({
        accountName: 'Cash in Hand',
        groupType: 'Asset',
        openingBalance: 0,
        balanceType: 'Dr',
        description: 'Default Cash Account',
        company: company._id
      });
    } catch (e) {
      console.warn('Auto Setup notice for Company Master:', e.message);
    }

    res.status(201).json({
      success: true,
      message: `Company "${company.name}" created successfully with automated Godown and Cash accounts!`,
      company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get switchable companies list for Header Dropdown
// @route   GET /api/companies/switch-options
// @access  Private
const getCompanySwitchOptions = async (req, res, next) => {
  try {
    const companies = await Company.find({ isActive: true })
      .select('_id name code logoUrl gstin city state invoicePrefix drugLicenceNo dl20b dl21b fssaiNo bankName accountNumber ifscCode upiId address phone creatorRole')
      .sort({ createdAt: 1 });
    res.json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a company and its users
// @route   DELETE /api/companies/:id
// @access  Private/SuperAdmin
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    // Delete users associated with this company
    await User.deleteMany({ company: company._id });
    await Company.findByIdAndDelete(company._id);

    res.json({ success: true, message: `Company "${company.name}" deleted successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle company active / suspended status
// @route   PATCH /api/companies/:id/status
// @access  Private/SuperAdmin
const toggleCompanyStatus = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    company.isActive = !company.isActive;
    company.subscriptionStatus = company.isActive ? 'Active' : 'Suspended';
    await company.save();

    res.json({ 
      success: true, 
      message: `Company status changed to ${company.subscriptionStatus}`, 
      company 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company details by SuperAdmin
// @route   PUT /api/companies/:id
// @access  Private/SuperAdmin
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    const {
      name, code, email, phone, website, address, city, state, gstin,
      subscriptionPlan, billingCycle, maxUsers, maxBranches, subscriptionStatus
    } = req.body;

    if (name) company.name = name;
    if (code !== undefined) company.code = code;
    if (email !== undefined) company.email = email;
    if (phone !== undefined) company.phone = phone;
    if (website !== undefined) company.website = website;
    if (address !== undefined) company.address = address;
    if (city !== undefined) company.city = city;
    if (state !== undefined) company.state = state;
    if (gstin !== undefined) company.gstin = gstin;
    if (subscriptionPlan !== undefined) company.subscriptionPlan = subscriptionPlan;
    if (billingCycle !== undefined) company.billingCycle = billingCycle;
    if (maxUsers !== undefined) company.maxUsers = maxUsers;
    if (maxBranches !== undefined) company.maxBranches = maxBranches;
    if (subscriptionStatus !== undefined) {
      company.subscriptionStatus = subscriptionStatus;
      company.isActive = subscriptionStatus === 'Active';
    }

    const updated = await company.save();
    res.json({ success: true, message: 'Company updated successfully', company: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all company subscriptions with metrics, plan details, quotas, and days left
// @route   GET /api/companies/subscriptions
// @access  Private/SuperAdmin
const getSubscriptions = async (req, res, next) => {
  try {
    const companies = await Company.find({})
      .populate('subscriptionPlan')
      .sort({ createdAt: -1 });

    const { Branch } = require('../models/Branch');

    const subscriptions = await Promise.all(companies.map(async (company) => {
      // Find admin user
      const adminRole = await Role.findOne({ name: 'Admin' });
      const admin = await User.findOne({ company: company._id, role: adminRole?._id }).select('username email phone');

      // Count actual users created for this tenant
      const usersCount = await User.countDocuments({ company: company._id });

      // Count actual branches created for this tenant
      const branchesCount = await Branch.countDocuments({ company: company._id });

      // Calculate days remaining
      let daysRemaining = 0;
      let status = company.subscriptionStatus || (company.isActive ? 'Active' : 'Suspended');

      if (company.subscriptionExpiry) {
        const now = new Date();
        const diffMs = new Date(company.subscriptionExpiry) - now;
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) {
          status = 'Expired';
        } else if (daysRemaining <= 15 && status === 'Active') {
          status = 'Expiring Soon';
        }
      }

      return {
        _id: company._id,
        companyName: company.name,
        code: company.code || 'NO-CODE',
        email: company.email,
        phone: company.phone,
        address: company.address,
        adminUser: admin,
        plan: company.subscriptionPlan,
        billingCycle: company.billingCycle || 'yearly',
        startDate: company.createdAt,
        expiryDate: company.subscriptionExpiry,
        daysRemaining,
        status,
        usersCount,
        usersMax: company.maxUsers || company.subscriptionPlan?.maxUsers || 10,
        branchesCount,
        branchesMax: company.maxBranches || company.subscriptionPlan?.maxBranches || 1,
        allowedModules: company.subscriptionPlan?.allowedModules || []
      };
    }));

    // Top-level stats
    const total = subscriptions.length;
    const active = subscriptions.filter(s => s.status === 'Active').length;
    const expiringSoon = subscriptions.filter(s => s.status === 'Expiring Soon').length;
    const expired = subscriptions.filter(s => s.status === 'Expired' || s.status === 'Suspended').length;

    res.json({
      success: true,
      stats: {
        total,
        active,
        expiringSoon,
        expired
      },
      subscriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick Renew / Extend subscription
// @route   POST /api/companies/:id/renew
// @access  Private/SuperAdmin
const renewSubscription = async (req, res, next) => {
  try {
    const { durationDays, planId, billingCycle } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404);
      return next(new Error('Company not found'));
    }

    if (planId) {
      company.subscriptionPlan = planId;
    }
    if (billingCycle) {
      company.billingCycle = billingCycle;
    }

    // Extend expiry
    const daysToAdd = Number(durationDays) || (company.billingCycle === 'yearly' ? 365 : 30);
    const baseDate = company.subscriptionExpiry && new Date(company.subscriptionExpiry) > new Date()
      ? new Date(company.subscriptionExpiry)
      : new Date();

    baseDate.setDate(baseDate.getDate() + daysToAdd);
    company.subscriptionExpiry = baseDate;
    company.subscriptionStatus = 'Active';
    company.isActive = true;

    await company.save();

    res.json({
      success: true,
      message: `Subscription extended by ${daysToAdd} days! New expiry: ${baseDate.toLocaleDateString()}`,
      company
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCompany,
  getCompanies,
  updateSubscription,
  getMyCompanyProfile,
  updateCompanyProfile,
  deleteCompany,
  toggleCompanyStatus,
  updateCompany,
  getCompanyById,
  getSubscriptions,
  renewSubscription,
  createCompanyMaster,
  getCompanySwitchOptions
};
