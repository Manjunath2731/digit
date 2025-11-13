import { 
  LoginCredentials, 
  RegisterData, 
  OtpVerificationData, 
  ForgotPasswordData, 
  ResetPasswordData,
  User
} from '../../types/user';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/digit-service/api';

// Mock users for development with different roles
const mockUsers = [
  {
    id: 1,
    email_id: 'admin@gmail.com',
    password: 'admin123',
    phone_no: 9999999999,
    user_id: 101,
    premium: true,
    confirmation_code: 0,
    registered: true,
    fcmtoken: '',
    user_type: 1,
    house_type: 1,
    noofsecuser: 5,
    user_name: 'Admin User',
    dp: '',
    address: '123 Admin Street',
    pin_code: 123456,
    created_by: 1,
    social_type: '',
    oauth_token: '',
    created_at: new Date().toISOString(),
    status: 1,
    city: 'Admin City',
    country_code: 91,
    History: '',
    inactive_device_status: false,
    tank_status_check: null,
    water_level: 0,
    daily_borewell_stats: null,
    role: 'admin' as const
  },
  {
    id: 2,
    email_id: 'neel@gmail.com',
    password: 'neel123',
    phone_no: 8888888888,
    user_id: 102,
    premium: true,
    confirmation_code: 0,
    registered: true,
    fcmtoken: '',
    user_type: 2,
    house_type: 2,
    noofsecuser: 6,
    user_name: 'Regular User',
    dp: '',
    address: '456 User Avenue',
    pin_code: 234567,
    created_by: 1,
    social_type: '',
    oauth_token: '',
    created_at: new Date().toISOString(),
    status: 1,
    city: 'User City',
    country_code: 91,
    History: '',
    inactive_device_status: false,
    tank_status_check: null,
    water_level: 0,
    daily_borewell_stats: null,
    role: 'user' as const
  },
  {
    id: 3,
    email_id: 'secondary@viewpro.com',
    password: 'secondary123',
    phone_no: 7777777777,
    user_id: 103,
    premium: false,
    confirmation_code: 0,
    registered: true,
    fcmtoken: '',
    user_type: 3,
    house_type: 3,
    noofsecuser: 0,
    user_name: 'Secondary User',
    dp: '',
    address: '789 Secondary Lane',
    pin_code: 345678,
    created_by: 2,
    social_type: '',
    oauth_token: '',
    created_at: new Date().toISOString(),
    status: 1,
    city: 'Secondary City',
    country_code: 91,
    History: '',
    inactive_device_status: false,
    tank_status_check: null,
    water_level: 0,
    daily_borewell_stats: null,
    role: 'secondary_user' as const
  }
];

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Call real API
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userData.user_name,
        email: userData.email_id,
        phone: userData.phone_no.toString(),
        password: userData.password || 'defaultPassword123', // You may need to add password field to RegisterData
        role: 'user'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed'
      };
    }
    
    if (data.success && data.user) {
      // Transform backend user to frontend User type
      const newUser: User = {
        id: data.user.id,
        email_id: data.user.email,
        password: '',
        phone_no: parseInt(data.user.phone),
        user_id: data.user.id,
        premium: false,
        confirmation_code: 0,
        registered: true,
        fcmtoken: '',
        user_type: 2,
        house_type: 1,
        noofsecuser: data.user.noofsecuser || 0,
        user_name: data.user.name,
        dp: '',
        address: data.user.address || '',
        pin_code: 0,
        created_by: 1,
        social_type: '',
        oauth_token: '',
        created_at: data.user.created_at,
        status: 1,
        city: '',
        country_code: 91,
        History: '',
        inactive_device_status: false,
        tank_status_check: null,
        water_level: 0,
        daily_borewell_stats: null,
        role: 'user' as const
      };
      
      return {
        success: true,
        message: 'Registration successful. Please verify your phone number.',
        user: newUser
      };
    }
    
    return {
      success: false,
      message: data.message || 'Registration failed'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed. Please check your connection.'
    };
  }
};

/**
 * Verify OTP for phone number verification
 */
export const verifyOtp = async (otpData: OtpVerificationData): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch(`${API_URL}/verify-otp`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(otpData)
    // });
    // const data = await response.json();
    
    // Mock response - validate OTP (for demo, we'll accept any 6-digit OTP)
    if (otpData.confirmation_code.toString().length === 6) {
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'OTP verification failed'
    };
  }
};

/**
 * Resend OTP to the user's phone
 */
export const resendOtp = async (phoneNo: number): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch(`${API_URL}/resend-otp`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phone_no: phoneNo })
    // });
    // const data = await response.json();
    
    // Mock response
    return {
      success: true,
      message: 'OTP resent successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to resend OTP'
    };
  }
};

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User; token?: string }> => {
  try {
    // Call real API
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email_id,
        password: credentials.password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Login failed'
      };
    }
    
    if (data.success && data.user && data.token) {
      // Transform backend user to frontend User type
      const userResponse: User = {
        id: data.user.id,
        email_id: data.user.email,
        password: '',
        phone_no: parseInt(data.user.phone),
        user_id: data.user.id,
        premium: data.user.role === 'admin',
        confirmation_code: 0,
        registered: true,
        fcmtoken: '',
        user_type: data.user.role === 'admin' ? 1 : data.user.role === 'user' ? 2 : 3,
        house_type: 1,
        noofsecuser: data.user.noofsecuser || 0,
        user_name: data.user.name,
        dp: '',
        address: data.user.address || '',
        pin_code: 0,
        created_by: 1,
        social_type: '',
        oauth_token: '',
        created_at: data.user.created_at,
        status: data.user.status === 'active' ? 1 : 0,
        city: '',
        country_code: 91,
        History: '',
        inactive_device_status: false,
        tank_status_check: null,
        water_level: 0,
        daily_borewell_stats: null,
        role: data.user.role as 'admin' | 'user' | 'secondary_user'
      };
      
      return {
        success: true,
        message: 'Login successful',
        user: userResponse,
        token: data.token
      };
    }
    
    return {
      success: false,
      message: data.message || 'Invalid email or password'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed. Please check your connection.'
    };
  }
};

/**
 * Request password reset (forgot password)
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email_id })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to process password reset'
      };
    }
    
    return {
      success: result.success,
      message: result.message || 'Password reset instructions sent to your email'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process password reset'
    };
  }
};

/**
 * Reset password with OTP verification
 */
export const resetPassword = async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email_id,
        otp: data.confirmation_code,
        newPassword: data.new_password
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to reset password'
      };
    }
    
    return {
      success: result.success,
      message: result.message || 'Password reset successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed'
    };
  }
};

/**
 * Logout user
 */
export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Get demo users for testing (development only)
 */
export const getDemoUsers = () => {
  return mockUsers.map(user => ({
    email: user.email_id,
    password: user.password,
    role: user.role,
    name: user.user_name
  }));
};
