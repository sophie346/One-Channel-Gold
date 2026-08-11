import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  confirmResetPassword,
  getSelectedCompanyId,
  getStoredAuthUser,
  getStoredCompanies,
  loginWithEmail,
  logout as logoutApi,
  refreshAuthFromFirebase,
  refreshUserDetailsFromApi,
  registerWithEmail,
  resetPassword,
} from '@/services/authService';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { AuthUser, B2BCompany } from '@/types/api';
import type { RootState } from './index';

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isB2b: boolean;
  companies: B2BCompany[];
  selectedCompanyId: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'authenticated';
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isB2b: false,
  companies: [],
  selectedCompanyId: '',
  status: 'idle',
  initialized: false,
  error: null,
};

function friendlyAuthError(e: unknown, fallback: string) {
  const raw = e instanceof Error ? e.message : String(e || fallback);
  if (/email-already-in-use|EMAIL_EXISTS|already.*exist/i.test(raw)) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (/wrong-password|invalid-credential|user-not-found/i.test(raw)) {
    return 'Invalid email or password.';
  }
  if (/weak-password/i.test(raw)) {
    return 'Password should be at least 6 characters.';
  }
  if (/expired-action-code|invalid-action-code/i.test(raw)) {
    return 'This reset link is invalid or has expired. Please request a new one.';
  }
  if (/too-many-requests/i.test(raw)) {
    return 'Too many attempts. Please try again later.';
  }
  return raw || fallback;
}

export const initAuth = createAsyncThunk('auth/init', async () => {
  return refreshAuthFromFirebase();
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await loginWithEmail(email, password);
    } catch (e) {
      return rejectWithValue(friendlyAuthError(e, 'Login failed'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { email, password }: { name?: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      return await registerWithEmail(email, password);
    } catch (e) {
      return rejectWithValue(friendlyAuthError(e, 'Registration failed'));
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await logoutApi();
});

export const refreshUserDetails = createAsyncThunk(
  'auth/refreshUserDetails',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.user?.token;
      const result = await refreshUserDetailsFromApi(token);
      if (!result) return rejectWithValue('Could not refresh account');
      return result;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Could not refresh account');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const trimmed = email.trim();
      if (!trimmed) return rejectWithValue('Please enter your email address.');
      await resetPassword(trimmed);
      return trimmed;
    } catch (e) {
      return rejectWithValue(friendlyAuthError(e, 'Could not send reset email'));
    }
  }
);

export const confirmPasswordResetThunk = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (
    { oobCode, newPassword }: { oobCode: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      if (!oobCode) return rejectWithValue('Invalid or missing reset link.');
      if (!newPassword || newPassword.length < 6) {
        return rejectWithValue('Password should be at least 6 characters.');
      }
      await confirmResetPassword(oobCode, newPassword);
      return true;
    } catch (e) {
      return rejectWithValue(friendlyAuthError(e, 'Could not reset password'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
      state.initialized = true;
      state.error = null;
      state.status = action.payload ? 'authenticated' : 'idle';
    },
    clearAuthError(state) {
      state.error = null;
    },
    hydrateAuthFromStorage(state) {
      const cached = getStoredAuthUser();
      if (cached?.email || cached?.emailId) {
        state.user = cached;
        state.isLoggedIn = true;
        state.status = 'authenticated';
        state.isB2b = storage.getString(STORAGE_KEYS.isB2b) === 'true';
        state.companies = getStoredCompanies();
        state.selectedCompanyId = getSelectedCompanyId();
      }
    },
  },
  extraReducers: (builder) => {
    const applySession = (
      state: AuthState,
      payload: { authUser: AuthUser | null; isB2b?: boolean; companies?: B2BCompany[] }
    ) => {
      state.user = payload.authUser;
      state.isLoggedIn = !!payload.authUser;
      state.isB2b = Boolean(payload.isB2b);
      state.companies = payload.companies || [];
      state.selectedCompanyId = getSelectedCompanyId();
      state.status = payload.authUser ? 'authenticated' : 'idle';
      state.error = null;
    };

    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.initialized = true;
        applySession(state, action.payload);
      })
      .addCase(initAuth.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.initialized = true;
        applySession(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = String(action.payload || 'Login failed');
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.initialized = true;
        applySession(state, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = String(action.payload || 'Registration failed');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.isB2b = false;
        state.companies = [];
        state.selectedCompanyId = '';
        state.status = 'idle';
        state.error = null;
      })
      .addCase(refreshUserDetails.fulfilled, (state, action) => {
        state.isB2b = action.payload.isB2b;
        state.companies = action.payload.companies;
        state.selectedCompanyId = getSelectedCompanyId();
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = String(action.payload || 'Could not send reset email');
      });
  },
});

export const { setUser, clearAuthError, hydrateAuthFromStorage } = authSlice.actions;
export const login = loginUser;
export const register = registerUser;
export const logout = logoutUser;
export default authSlice.reducer;
