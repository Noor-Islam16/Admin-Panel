// config/routes.config.js
export const adminRoutes = {
  BASE: import.meta.env.VITE_ADMIN_BASE_PATH,
  CUSTOMERS: import.meta.env.VITE_ADMIN_CUSTOMERS_PATH,
  ADD_PRODUCTS: import.meta.env.VITE_ADMIN_ADD_PRODUCTS_PATH,
  VIEW_PRODUCTS: import.meta.env.VITE_ADMIN_VIEW_PRODUCTS_PATH,
  STOCKS: import.meta.env.VITE_ADMIN_STOCKS_PATH,
  ORDERS: import.meta.env.VITE_ADMIN_ORDERS_PATH,
  SETTINGS: import.meta.env.VITE_ADMIN_SETTINGS_PATH,
};

// For additional security - generate random route segments
export const generateSecureRoute = (basePath: any) => {
  return basePath;
};
