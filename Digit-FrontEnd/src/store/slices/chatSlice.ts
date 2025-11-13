import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define types
interface PropertyData {
  area: number;
  cl: string;
  ea: string;
  ga: string;
  iv: number;
  jur: string;
  lv: number;
  own: string;
  wa: string;
  zd: string;
}

interface ChatResponse {
  data: PropertyData;
  msg: string;
  dn?: string; // Day/night indicator
  ca?: string; // Address
  rl?: string; // Report link
}

interface ChatState {
  propertyData: PropertyData | null;
  responseMessage: string;
  loading: boolean;
  error: string | null;
  dayNight: string | null;
  currentAddress: string | null;
  reportLink: string | null;
}

// Initial state
const initialState: ChatState = {
  propertyData: null,
  responseMessage: '',
  loading: false,
  error: null,
  dayNight: null,
  currentAddress: null,
  reportLink: null
};

// Define the payload type for the checkAddress thunk
interface CheckAddressPayload {
  address: string;
  option?: string; // Optional option parameter
  buildingType?: string; // Optional buildingType parameter for the BT option
}

// Create async thunk for API call
export const checkAddress = createAsyncThunk(
  'chat/checkAddress',
  async (payload: CheckAddressPayload | string, { rejectWithValue }) => {
    try {
      // Handle both string and object payloads for backward compatibility
      const address = typeof payload === 'string' ? payload : payload.address;
      const option = typeof payload === 'string' ? undefined : payload.option;
      const buildingType = typeof payload === 'string' ? undefined : payload.buildingType;
      
      console.log('API Payload:', { address, option, buildingType });
      
      // Create the request payload
      const requestPayload = {
        message: buildingType ? `Check if I can build ${buildingType} at address ${address}` : `Check address ${address}`,
        option: option, // Include the option parameter if provided
        buildingType: buildingType // Include the buildingType parameter if provided
      };
      
      console.log('Sending to API:', requestPayload);
      
      const response = await axios.post<ChatResponse>('https://urbanai-api.viewprogis.com/api/chat', requestPayload);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Error fetching property data. Please try again later.');
    }
  }
);

// Create the slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChatData: (state) => {
      state.propertyData = null;
      state.responseMessage = '';
      state.error = null;
      state.dayNight = null;
      state.currentAddress = null;
      state.reportLink = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAddress.fulfilled, (state, action: PayloadAction<ChatResponse>) => {
        state.loading = false;
        state.propertyData = action.payload.data;
        state.responseMessage = action.payload.msg;
        state.dayNight = action.payload.dn || null;
        state.currentAddress = action.payload.ca || null;
        state.reportLink = action.payload.rl || null;
      })
      .addCase(checkAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearChatData } = chatSlice.actions;
export default chatSlice.reducer;
