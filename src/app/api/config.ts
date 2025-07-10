const ENV = process.env.ENVIRONMENT;
export const API =
  ENV == "production"
    ? process.env.VITE_BACKEND_PROD_URL
    : ENV == "development"
    ? process.env.VITE_BACKEND_DEV_URL
    : process.env.VITE_BACKEND_LOCAL_URL;
