// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8088/digit-service/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id: number) => `${API_BASE_URL}/users/${id}`,
  USER_STATUS: (id: number) => `${API_BASE_URL}/users/${id}/status`,
  
  // Devices
  USER_DEVICES: (userId: number) => `${API_BASE_URL}/users/${userId}/devices`,
  USER_DEVICE: (userId: number, deviceId: string) => `${API_BASE_URL}/users/${userId}/devices/${deviceId}`,
  
  // Plans
  PLANS: `${API_BASE_URL}/plans`,
  PLAN_BY_ID: (id: number) => `${API_BASE_URL}/plans/${id}`,
  PLANS_BY_PROFILE: (profile: string) => `${API_BASE_URL}/plans/profile/${profile}`,
  
  // Cities
  CITIES: `${API_BASE_URL}/cities`,
  CITY_BY_ID: (id: number) => `${API_BASE_URL}/cities/${id}`,
  CITIES_BY_STATE: (state: string) => `${API_BASE_URL}/cities/state/${state}`,
  
  // Subscriptions
  SUBSCRIPTIONS: `${API_BASE_URL}/subscriptions`,
  SUBSCRIPTION_BY_ID: (id: number) => `${API_BASE_URL}/subscriptions/${id}`,
  SUBSCRIPTION_STATUS: (id: number) => `${API_BASE_URL}/subscriptions/${id}/status`,
  SUBSCRIPTIONS_BY_DEVICE: (deviceId: string) => `${API_BASE_URL}/subscriptions/device/${deviceId}`,
  
  // Tanks
  TANKS: `${API_BASE_URL}/tanks`,
  TANK_BY_ID: (id: number) => `${API_BASE_URL}/tanks/${id}`,
  TANK_BY_DEVICE: (deviceId: string) => `${API_BASE_URL}/tanks/device/${deviceId}`,
  
  // Complaints
  COMPLAINTS: `${API_BASE_URL}/complaints`,
  COMPLAINT_BY_ID: (id: number) => `${API_BASE_URL}/complaints/${id}`,
  COMPLAINTS_BY_STATUS: (status: string) => `${API_BASE_URL}/complaints/status/${status}`,
  
  // Service Engineers
  SERVICE_ENGINEERS: `${API_BASE_URL}/service-engineers`,
  SERVICE_ENGINEER_BY_ID: (id: number) => `${API_BASE_URL}/service-engineers/${id}`,
  SERVICE_ENGINEERS_BY_PINCODE: (pincode: string) => `${API_BASE_URL}/service-engineers/pincode/${pincode}`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
