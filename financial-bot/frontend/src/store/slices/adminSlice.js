import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/admin/users');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/admin/users', userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const generateActivationCode = createAsyncThunk(
  'admin/generateActivationCode',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/admin/activation-codes', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate activation code');
    }
  }
);

export const fetchActivationCodes = createAsyncThunk(
  'admin/fetchActivationCodes',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/admin/activation-codes', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activation codes');
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'admin/fetchSystemStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/admin/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system stats');
    }
  }
);

export const getWhatsAppStatus = createAsyncThunk(
  'admin/getWhatsAppStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/admin/whatsapp/status');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get WhatsApp status');
    }
  }
);

export const restartWhatsApp = createAsyncThunk(
  'admin/restartWhatsApp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/admin/whatsapp/restart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to restart WhatsApp');
    }
  }
);

export const createBackup = createAsyncThunk(
  'admin/createBackup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/admin/backup');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create backup');
    }
  }
);

export const restoreBackup = createAsyncThunk(
  'admin/restoreBackup',
  async (backupFile, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/v1/admin/restore', { backupFile });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to restore backup');
    }
  }
);

// Initial state
const initialState = {
  users: [],
  activationCodes: [],
  systemStats: null,
  whatsappStatus: {
    isReady: false,
    sessionPath: null,
  },
  isLoading: false,
  error: null,
};

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetAdmin: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
        toast.success('User created successfully');
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Generate Activation Code
      .addCase(generateActivationCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateActivationCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activationCodes.unshift(action.payload);
        toast.success('Activation code generated successfully');
      })
      .addCase(generateActivationCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Fetch Activation Codes
      .addCase(fetchActivationCodes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivationCodes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activationCodes = action.payload;
      })
      .addCase(fetchActivationCodes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Fetch System Stats
      .addCase(fetchSystemStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get WhatsApp Status
      .addCase(getWhatsAppStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWhatsAppStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.whatsappStatus = action.payload;
      })
      .addCase(getWhatsAppStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Restart WhatsApp
      .addCase(restartWhatsApp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restartWhatsApp.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('WhatsApp bot restarted successfully');
      })
      .addCase(restartWhatsApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Create Backup
      .addCase(createBackup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBackup.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Backup created successfully');
      })
      .addCase(createBackup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Restore Backup
      .addCase(restoreBackup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreBackup.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Backup restored successfully');
      })
      .addCase(restoreBackup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetAdmin } = adminSlice.actions;

export default adminSlice.reducer;
