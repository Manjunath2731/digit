import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the feedback data interface
interface FeedbackData {
  name: string;
  rating: number;
}

// Define the state interface
interface FeedbackState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Initial state
const initialState: FeedbackState = {
  loading: false,
  success: false,
  error: null
};

// Create async thunk for submitting feedback
export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async (feedbackData: FeedbackData, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://urbanai-api.viewprogis.com/api/feedback', feedbackData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create the feedback slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearFeedbackState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearFeedbackState } = feedbackSlice.actions;
export default feedbackSlice.reducer;
