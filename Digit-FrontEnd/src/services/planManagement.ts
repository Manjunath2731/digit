// Plan management service
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface Plan {
  id: number;
  plan: string;
  profile: 'Saviour' | 'Ni-Sensu' | 'Smart Jar';
  period: 'Yearly' | 'Half Yearly' | 'Quarterly' | 'Monthly';
  amount: number;
  created_at?: string;
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
 * Get all plans
 */
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.PLANS, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Plan[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch plans');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

/**
 * Add a new plan
 */
export const addPlan = async (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> => {
  try {
    const response = await fetch(API_ENDPOINTS.PLANS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData)
    });

    const result: ApiResponse<Plan> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to add plan');
    }

    return result.data;
  } catch (error) {
    console.error('Error adding plan:', error);
    throw error;
  }
};

/**
 * Delete a plan
 */
export const deletePlan = async (planId: number): Promise<void> => {
  try {
    const response = await fetch(API_ENDPOINTS.PLAN_BY_ID(planId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const result: ApiResponse<void> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete plan');
    }
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
};

/**
 * Get plan by ID
 */
export const getPlanById = async (planId: number): Promise<Plan> => {
  try {
    const response = await fetch(API_ENDPOINTS.PLAN_BY_ID(planId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Plan> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch plan');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching plan:', error);
    throw error;
  }
};

/**
 * Get plans by profile
 */
export const getPlansByProfile = async (profile: 'Saviour' | 'Ni-Sensu' | 'Smart Jar'): Promise<Plan[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.PLANS_BY_PROFILE(profile), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Plan[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch plans');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching plans by profile:', error);
    throw error;
  }
};
