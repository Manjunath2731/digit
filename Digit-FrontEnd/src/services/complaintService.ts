import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export interface Complaint {
  id: number;
  user_id: number;
  user_name?: string;
  comment: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at?: string;
}

export interface CreateComplaintData {
  comment: string;
}

export interface UpdateComplaintData {
  comment?: string;
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
}

/**
 * Get all complaints for the current user
 */
export const getComplaints = async (): Promise<Complaint[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPLAINTS, {
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
    
    throw new Error(result.message || 'Failed to fetch complaints');
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

/**
 * Get a single complaint by ID
 */
export const getComplaintById = async (complaintId: number): Promise<Complaint> => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPLAINT_BY_ID(complaintId), {
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
    
    throw new Error(result.message || 'Failed to fetch complaint');
  } catch (error) {
    console.error('Error fetching complaint:', error);
    throw error;
  }
};

/**
 * Create a new complaint
 */
export const createComplaint = async (complaintData: CreateComplaintData): Promise<Complaint> => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPLAINTS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to create complaint');
  } catch (error) {
    console.error('Error creating complaint:', error);
    throw error;
  }
};

/**
 * Update a complaint
 */
export const updateComplaint = async (complaintId: number, complaintData: UpdateComplaintData): Promise<Complaint> => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPLAINT_BY_ID(complaintId), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to update complaint');
  } catch (error) {
    console.error('Error updating complaint:', error);
    throw error;
  }
};

/**
 * Delete a complaint
 */
export const deleteComplaint = async (complaintId: number): Promise<void> => {
  try {
    const response = await fetch(API_ENDPOINTS.COMPLAINT_BY_ID(complaintId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete complaint');
    }
  } catch (error) {
    console.error('Error deleting complaint:', error);
    throw error;
  }
};
