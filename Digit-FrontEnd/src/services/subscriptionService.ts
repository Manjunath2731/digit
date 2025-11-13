// Subscription service
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface Subscription {
  id: number;
  user_id: number;
  device_id: string;
  plan_id: number;
  period: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly';
  quantity: number;
  start_date: string;
  end_date: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at?: string;
  // Joined fields from plans and devices
  plan?: string;
  profile?: string;
  plan_amount?: number;
  saviour?: string;
  device_sim_no?: string;
}

export interface CreateSubscriptionData {
  device_id: string;
  plan_id: number;
  period: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly';
  quantity?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

/**
 * Get all subscriptions for the logged-in user
 */
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTIONS, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Subscription[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch subscriptions');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = async (subscriptionId: number): Promise<Subscription> => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_BY_ID(subscriptionId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Subscription> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch subscription');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
};

/**
 * Create a new subscription (purchase plan)
 */
export const createSubscription = async (subscriptionData: CreateSubscriptionData): Promise<Subscription> => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTIONS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subscriptionData)
    });

    const result: ApiResponse<Subscription> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to create subscription');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Update subscription status
 */
export const updateSubscriptionStatus = async (
  subscriptionId: number,
  status: 'active' | 'expired' | 'cancelled'
): Promise<Subscription> => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_STATUS(subscriptionId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    const result: ApiResponse<Subscription> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to update subscription status');
    }

    return result.data;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

/**
 * Get all subscriptions for a specific device
 */
export const getSubscriptionsByDevice = async (deviceId: string): Promise<Subscription[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTIONS_BY_DEVICE(deviceId), {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<Subscription[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch device subscriptions');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching device subscriptions:', error);
    throw error;
  }
};
