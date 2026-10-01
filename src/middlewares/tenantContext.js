const { AsyncLocalStorage } = require('node:async_hooks');

const tenantContext = new AsyncLocalStorage();

// Middleware to initialize the context for each request
const tenantContextMiddleware = (req, res, next) => {
  tenantContext.run(new Map(), () => {
    next();
  });
};

const setContext = (key, value) => {
  const store = tenantContext.getStore();
  if (store) {
    store.set(key, value);
  }
};

const getContext = (key) => {
  const store = tenantContext.getStore();
  return store ? store.get(key) : undefined;
};

module.exports = {
  tenantContextMiddleware,
  setContext,
  getContext,
};
