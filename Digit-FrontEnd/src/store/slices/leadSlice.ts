import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define types
interface LeadData {
  name: string;
  email: string;
  organization: string;
}

interface LeadResponse {
  success: boolean;
  message: string;
}

interface LeadState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Initial state
const initialState: LeadState = {
  loading: false,
  success: false,
  error: null
};

// Create async thunk for API call
export const submitLeadData = createAsyncThunk(
  'lead/submitLeadData',
  async (leadData: LeadData, { rejectWithValue }) => {
    try {
      console.log('Submitting lead data:', leadData);
      
      // Create the request payload
      const requestPayload = {
        name: leadData.name,
        email: leadData.email,
        organization: leadData.organization
      };
      
      console.log('Sending to API:', requestPayload);
      
      const response = await axios.post<LeadResponse>('https://urbanai-api.viewprogis.com/api/leads', requestPayload);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting lead data:', error);
      return rejectWithValue('Error submitting lead data. Please try again later.');
    }
  }
);

// Create the slice
const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    clearLeadData: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitLeadData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitLeadData.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitLeadData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearLeadData } = leadSlice.actions;
export default leadSlice.reducer;
