import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/budgets', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budgets');
    }
  }
);

export const fetchCurrentBudget = createAsyncThunk(
  'budgets/fetchCurrentBudget',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/budgets/current');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch current budget');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/budgets', budgetData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create budget');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/v1/budgets/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/v1/budgets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete budget');
    }
  }
);

export const fetchBudgetAnalysis = createAsyncThunk(
  'budgets/fetchBudgetAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/budgets/analysis/overview');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget analysis');
    }
  }
);

// Initial state
const initialState = {
  budgets: [],
  currentBudget: null,
  analysis: null,
  filters: {
    period: '',
    startDate: '',
    endDate: '',
    active: true,
  },
  isLoading: false,
  error: null,
};

// Slice
const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetBudgets: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Fetch Current Budget
      .addCase(fetchCurrentBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBudget = action.payload;
      })
      .addCase(fetchCurrentBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Budget
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets.unshift(action.payload);
        toast.success('Budget created successfully');
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Update Budget
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.budgets.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
        if (state.currentBudget?._id === action.payload._id) {
          state.currentBudget = action.payload;
        }
        toast.success('Budget updated successfully');
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Delete Budget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.filter(b => b._id !== action.payload);
        if (state.currentBudget?._id === action.payload) {
          state.currentBudget = null;
        }
        toast.success('Budget deleted successfully');
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Fetch Budget Analysis
      .addCase(fetchBudgetAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analysis = action.payload;
      })
      .addCase(fetchBudgetAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { setFilters, clearFilters, resetBudgets } = budgetSlice.actions;

export default budgetSlice.reducer;
