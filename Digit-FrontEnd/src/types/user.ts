export interface User {
  id: number;
  email_id: string;
  password: string;
  phone_no: number;
  user_id: number;
  premium: boolean;
  confirmation_code: number;
  registered: boolean;
  fcmtoken: string;
  user_type: number;
  house_type: number;
  noofsecuser: number;
  user_name: string;
  dp: string;
  address: string;
  pin_code: number;
  created_by: number;
  social_type: string;
  oauth_token: string;
  created_at: string;
  status: number;
  city: string;
  country_code: number;
  History: string;
  inactive_device_status: boolean;
  tank_status_check: boolean | null;
  water_level: number;
  daily_borewell_stats: boolean | null;
  role?: 'admin' | 'user' | 'secondary_user'; // Optional role property for role-based access
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email_id: string;
  password: string;
}

export interface RegisterData {
  email_id: string;
  password: string;
  phone_no: number;
  user_name: string;
  country_code: number;
}

export interface OtpVerificationData {
  phone_no: number;
  confirmation_code: number;
}

export interface ForgotPasswordData {
  email_id: string;
}

export interface ResetPasswordData {
  email_id: string;
  confirmation_code: number;
  new_password: string;
}
