import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchSummaryReport = createAsyncThunk(
  'reports/fetchSummaryReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/reports/summary', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary report');
    }
  }
);

export const fetchTrendsReport = createAsyncThunk(
  'reports/fetchTrendsReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/reports/trends', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trends report');
    }
  }
);

export const fetchAnalysisReport = createAsyncThunk(
  'reports/fetchAnalysisReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/reports/analysis', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analysis report');
    }
  }
);

// Initial state
const initialState = {
  summary: {
    data: null,
    isLoading: false,
    error: null,
  },
  trends: {
    data: null,
    isLoading: false,
    error: null,
  },
  analysis: {
    data: null,
    isLoading: false,
    error: null,
  },
  filters: {
    period: 'month',
    startDate: '',
    endDate: '',
    months: 12,
  },
};

// Slice
const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetReports: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Summary Report
      .addCase(fetchSummaryReport.pending, (state) => {
        state.summary.isLoading = true;
        state.summary.error = null;
      })
      .addCase(fetchSummaryReport.fulfilled, (state, action) => {
        state.summary.isLoading = false;
        state.summary.data = action.payload;
      })
      .addCase(fetchSummaryReport.rejected, (state, action) => {
        state.summary.isLoading = false;
        state.summary.error = action.payload;
        toast.error(action.payload);
      })

      // Trends Report
      .addCase(fetchTrendsReport.pending, (state) => {
        state.trends.isLoading = true;
        state.trends.error = null;
      })
      .addCase(fetchTrendsReport.fulfilled, (state, action) => {
        state.trends.isLoading = false;
        state.trends.data = action.payload;
      })
      .addCase(fetchTrendsReport.rejected, (state, action) => {
        state.trends.isLoading = false;
        state.trends.error = action.payload;
        toast.error(action.payload);
      })

      // Analysis Report
      .addCase(fetchAnalysisReport.pending, (state) => {
        state.analysis.isLoading = true;
        state.analysis.error = null;
      })
      .addCase(fetchAnalysisReport.fulfilled, (state, action) => {
        state.analysis.isLoading = false;
        state.analysis.data = action.payload;
      })
      .addCase(fetchAnalysisReport.rejected, (state, action) => {
        state.analysis.isLoading = false;
        state.analysis.error = action.payload;
        toast.error(action.payload);
      });
  },
});

// Selectors
export const selectSummaryData = (state) => state.reports.summary.data;
export const selectTrendsData = (state) => state.reports.trends.data;
export const selectAnalysisData = (state) => state.reports.analysis.data;

export const selectIncomeVsExpense = (state) => {
  const summary = state.reports.summary.data;
  if (!summary) return null;

  return {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [summary.totals.income, summary.totals.expense],
        backgroundColor: ['#10B981', '#EF4444'],
      },
    ],
  };
};

export const selectMonthlyTrends = (state) => {
  const trends = state.reports.trends.data;
  if (!trends?.monthly) return null;

  return {
    labels: trends.monthly.map(m => m.date),
    datasets: [
      {
        label: 'Income',
        data: trends.monthly.map(m => m.income),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
      {
        label: 'Expense',
        data: trends.monthly.map(m => m.expense),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
    ],
  };
};

export const { setFilters, clearFilters, resetReports } = reportSlice.actions;

export default reportSlice.reducer;
