import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface Tank {
  id: number;
  device_id: string;
  saviour_name: string;
  saviour_id: number;
  saviour_capacity: number;
  upper_threshold: number;
  lower_threshold: number;
  saviour_height: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTankData {
  device_id: string;
  saviour_name: string;
  saviour_capacity: number;
  upper_threshold: number;
  lower_threshold: number;
  saviour_height: number;
}

export interface UpdateTankData {
  saviour_name?: string;
  saviour_capacity?: number;
  upper_threshold?: number;
  lower_threshold?: number;
  saviour_height?: number;
}

/**
 * Get all tanks for the current user
 */
export const getTanks = async (): Promise<Tank[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.TANKS, {
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
    
    throw new Error(result.message || 'Failed to fetch tanks');
  } catch (error) {
    console.error('Error fetching tanks:', error);
    throw error;
  }
};

/**
 * Get a single tank by ID
 */
export const getTankById = async (tankId: number): Promise<Tank> => {
  try {
    const response = await fetch(API_ENDPOINTS.TANK_BY_ID(tankId), {
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
    
    throw new Error(result.message || 'Failed to fetch tank');
  } catch (error) {
    console.error('Error fetching tank:', error);
    throw error;
  }
};

/**
 * Create a new tank
 */
export const createTank = async (tankData: CreateTankData): Promise<Tank> => {
  try {
    const response = await fetch(API_ENDPOINTS.TANKS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tankData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to create tank');
  } catch (error) {
    console.error('Error creating tank:', error);
    throw error;
  }
};

/**
 * Update a tank
 */
export const updateTank = async (tankId: number, tankData: UpdateTankData): Promise<Tank> => {
  try {
    const response = await fetch(API_ENDPOINTS.TANK_BY_ID(tankId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(tankData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to update tank');
  } catch (error) {
    console.error('Error updating tank:', error);
    throw error;
  }
};

/**
 * Delete a tank
 */
export const deleteTank = async (tankId: number): Promise<void> => {
  try {
    const response = await fetch(API_ENDPOINTS.TANK_BY_ID(tankId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete tank');
    }
  } catch (error) {
    console.error('Error deleting tank:', error);
    throw error;
  }
};
