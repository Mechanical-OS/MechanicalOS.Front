// src/app/constants/app-urls.ts

export const CUSTOMER_URL = 'https://localhost:5001/api/customer';
export const VEHICLE_URL = 'https://localhost:5001/api/Vehicle';
export const SERVICES_URL = 'https://localhost:5001/api/Service';
export const TOOLS_URL = 'https://localhost:5001/api/Bootstrap';
export const ORDERS_URL = 'https://localhost:5001/api/orders';
export const SERVICE_ORDER_URL = 'https://localhost:5001/api/ServiceOrder';
export const AUTH_URL = 'https://localhost:5001/api/auth';
export const VIA_CEP_URL = 'https://viacep.com.br/ws';
export const COLOR_URL = 'https://localhost:5001/api/Color';
export const BRAND_URL = 'https://localhost:5001/api/Brand';
export const VEHICLE_MODEL_URL = 'https://localhost:5001/api/VehicleModel';

export const MODULE_URLS = {
  customers: CUSTOMER_URL,
  vehicles: VEHICLE_URL,
  services: SERVICES_URL,
  tools: TOOLS_URL,
  orders: ORDERS_URL,
  serviceOrders: SERVICE_ORDER_URL,
  auth: AUTH_URL,
  cep: VIA_CEP_URL,
  colors: COLOR_URL,
  brands: BRAND_URL,
  vehicleModels: VEHICLE_MODEL_URL
};
