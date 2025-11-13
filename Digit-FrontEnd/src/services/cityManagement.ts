// City management service
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface City {
  id: number;
  name: string;
  state: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}


/**
 * Get all cities
 */
export const getCities = async (): Promise<City[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.CITIES, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<City[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch cities');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

/**
 * Add a new city
 */
export const addCity = async (cityData: Omit<City, 'id' | 'created_at' | 'updated_at'>): Promise<City> => {
  try {
    const response = await fetch(API_ENDPOINTS.CITIES, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cityData)
    });

    const result: ApiResponse<City> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to add city');
    }

    return result.data;
  } catch (error) {
    console.error('Error adding city:', error);
    throw error;
  }
};

/**
 * Update a city's status
 */
export const updateCityStatus = async (
  cityId: number, 
  status: 'active' | 'inactive'
): Promise<City> => {
  try {
    const response = await fetch(API_ENDPOINTS.CITY_BY_ID(cityId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const result: ApiResponse<City> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to update city status');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating city status:', error);
    throw error;
  }
};

/**
 * Delete a city
 */
export const deleteCity = async (cityId: number): Promise<void> => {
  try {
    const response = await fetch(API_ENDPOINTS.CITY_BY_ID(cityId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const result: ApiResponse<void> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete city');
    }
  } catch (error) {
    console.error('Error deleting city:', error);
    throw error;
  }
};

/**
 * Get city by ID
 */
export const getCityById = async (cityId: number): Promise<City> => {
  try {
    const response = await fetch(API_ENDPOINTS.CITY_BY_ID(cityId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<City> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch city');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching city:', error);
    throw error;
  }
};

/**
 * Get cities by state
 */
export const getCitiesByState = async (state: string): Promise<City[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.CITIES_BY_STATE(state), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<City[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch cities');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching cities by state:', error);
    throw error;
  }
};
