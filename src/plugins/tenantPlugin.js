const { getContext } = require('../middlewares/tenantContext');

const GLOBAL_MODELS = ['Company', 'User', 'Role']; // Models to skip for tenant isolation

const tenantPlugin = (schema, options) => {
  // We only want to hook into models that actually have a company field
  if (!schema.path('company')) {
    return;
  }

  // Hook into read/update queries
  const addTenantFilter = function () {
    const modelName = this.model?.modelName || this.constructor?.modelName;
    
    // Skip if it's a global model
    if (GLOBAL_MODELS.includes(modelName)) {
      return;
    }

    const companyId = getContext('companyId');
    const roleName = getContext('roleName');

    // SuperAdmin bypasses isolation
    if (roleName === 'SuperAdmin') {
      return;
    }

    // Apply the filter if we have a companyId in context
    if (companyId && this.where) {
      this.where({ company: companyId });
    }
  };

  // Attach the hook to all common query types
  schema.pre('find', addTenantFilter);
  schema.pre('findOne', addTenantFilter);
  schema.pre('countDocuments', addTenantFilter);
  schema.pre('update', addTenantFilter);
  schema.pre('updateOne', addTenantFilter);
  schema.pre('updateMany', addTenantFilter);
  schema.pre('findOneAndUpdate', addTenantFilter);
  schema.pre('deleteMany', addTenantFilter);
  schema.pre('deleteOne', addTenantFilter);
  schema.pre('findOneAndDelete', addTenantFilter);

  // Hook into save to ensure companyId is set on creation
  schema.pre('save', function () {
    const modelName = this.constructor.modelName;

    if (GLOBAL_MODELS.includes(modelName)) {
      return;
    }

    const companyId = getContext('companyId');
    const roleName = getContext('roleName');

    if (roleName === 'SuperAdmin') {
      return;
    }

    // Auto-assign companyId if not present
    if (companyId && !this.company) {
      this.company = companyId;
    } else if (companyId && this.company && this.company.toString() !== companyId.toString()) {
      throw new Error('Cross-tenant data violation!');
    }
  });
};

module.exports = tenantPlugin;
