import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface ServiceEngineer {
  id: number;
  name: string;
  email: string;
  contact_number: string;
  pincode: string;
  address: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceEngineerData {
  name: string;
  email: string;
  contact_number: string;
  pincode: string;
  address: string;
}

export interface UpdateServiceEngineerData {
  name?: string;
  email?: string;
  contact_number?: string;
  pincode?: string;
  address?: string;
  status?: 'active' | 'inactive';
}

/**
 * Get all service engineers
 */
export const getServiceEngineers = async (): Promise<ServiceEngineer[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.SERVICE_ENGINEERS, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to fetch service engineers');
  } catch (error) {
    console.error('Error fetching service engineers:', error);
    throw error;
  }
};

/**
 * Get a single service engineer by ID
 */
export const getServiceEngineerById = async (engineerId: number): Promise<ServiceEngineer> => {
  try {
    const response = await fetch(API_ENDPOINTS.SERVICE_ENGINEER_BY_ID(engineerId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to fetch service engineer');
  } catch (error) {
    console.error('Error fetching service engineer:', error);
    throw error;
  }
};

/**
 * Create a new service engineer
 */
export const createServiceEngineer = async (engineerData: CreateServiceEngineerData): Promise<ServiceEngineer> => {
  try {
    const response = await fetch(API_ENDPOINTS.SERVICE_ENGINEERS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(engineerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to create service engineer');
  } catch (error) {
    console.error('Error creating service engineer:', error);
    throw error;
  }
};

/**
 * Update a service engineer
 */
export const updateServiceEngineer = async (engineerId: number, engineerData: UpdateServiceEngineerData): Promise<ServiceEngineer> => {
  try {
    const response = await fetch(API_ENDPOINTS.SERVICE_ENGINEER_BY_ID(engineerId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(engineerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to update service engineer');
  } catch (error) {
    console.error('Error updating service engineer:', error);
    throw error;
  }
};

/**
 * Delete a service engineer
 */
export const deleteServiceEngineer = async (engineerId: number): Promise<void> => {
  try {
    const response = await fetch(API_ENDPOINTS.SERVICE_ENGINEER_BY_ID(engineerId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete service engineer');
    }
  } catch (error) {
    console.error('Error deleting service engineer:', error);
    throw error;
  }
};
