// User management service
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface Device {
  device_id: string;
  saviour?: string;
  device_sim_no?: string;
  house_type?: string;
  sensor_type?: string;
  last_login_device?: string;
  os?: string;
  browser?: string;
  is_primary: boolean;
  device_status: 'active' | 'inactive';
}

export interface SecondaryUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'secondary_user';
  access_level: 'full' | 'limited' | 'view_only';
  status: 'active' | 'inactive';
  noofsecuser: number;
  address?: string;
  addressDetails?: any;
  last_login_date?: string;
  created_at: string;
  updated_at?: string;
  devices?: Device[];
  // Backward compatibility
  created_by?: 'admin' | 'user';
  device?: 'mobile' | 'tablet' | 'desktop' | 'all';
  last_login_device?: string;
  os?: string;
  browser?: string;
}

// Mock data removed - now using real API

/**
 * Get all secondary users for the current primary user
 * @param userType - 'admin' or 'user' to determine which mock data to return
 */
export const getSecondaryUsers = async (userType: 'admin' | 'user' = 'admin'): Promise<SecondaryUser[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // Transform backend response to match frontend interface
      return result.data.map((user: any) => ({
        ...user,
        created_by: user.role === 'secondary_user' ? 'user' : 'admin',
        // Map first device info to top level for backward compatibility
        device: user.devices?.[0]?.device_id ? 'all' : undefined,
        last_login_device: user.devices?.[0]?.last_login_device,
        os: user.devices?.[0]?.os,
        browser: user.devices?.[0]?.browser,
      }));
    }
    
    throw new Error(result.message || 'Failed to fetch users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Add a new secondary user
 */
export const addSecondaryUser = async (userData: any): Promise<SecondaryUser> => {
  try {
    // Transform frontend data to backend format
    const payload = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      device: userData.device || userData.deviceId,
      noOfSecUsers: parseInt(userData.noOfSecUsers) || userData.noofsecuser || 0,
      saviour: userData.saviour || null,
      deviceSimNo: userData.deviceSimNo || null,
      houseType: userData.houseType || null,
      sensorType: userData.sensorType || null,
      address: userData.address || null,
      addressDetails: userData.addressDetails || null
    };

    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        ...result.data,
        created_by: result.data.role === 'secondary_user' ? 'user' : 'admin',
      };
    }
    
    throw new Error(result.message || 'Failed to create user');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a secondary user's status
 */
export const updateSecondaryUserStatus = async (
  userId: number, 
  status: 'active' | 'inactive'
): Promise<SecondaryUser> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_STATUS(userId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        ...result.data,
        created_by: result.data.role === 'secondary_user' ? 'user' : 'admin',
      };
    }
    
    throw new Error(result.message || 'Failed to update user status');
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Delete a secondary user
 */
export const deleteSecondaryUser = async (userId: number): Promise<void> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_BY_ID(userId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Get all devices for a user
 */
export const getUserDevices = async (userId: number): Promise<Device[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_DEVICES(userId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to fetch devices');
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

/**
 * Add a new device to a user
 */
export const addUserDevice = async (userId: number, deviceData: any): Promise<Device> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_DEVICES(userId), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to add device');
  } catch (error) {
    console.error('Error adding device:', error);
    throw error;
  }
};

/**
 * Update a device for a user
 */
export const updateUserDevice = async (
  userId: number, 
  deviceId: string, 
  deviceData: any
): Promise<Device> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_DEVICE(userId, deviceId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to update device');
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};

/**
 * Delete a device from a user
 */
export const deleteUserDevice = async (userId: number, deviceId: string): Promise<void> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_DEVICE(userId, deviceId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete device');
    }
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
};
