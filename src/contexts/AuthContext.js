import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: response.data.user, token: state.token }
          });
        } catch (error) {
          console.error('Authentication check failed:', error);
          if (error.response?.status === 401) {
            console.log('Token is invalid or expired, logging out user');
          }
          localStorage.removeItem('token');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.post('/api/auth/login', { email, password });
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.post('/api/auth/register', userData);
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.post('/api/auth/forgot-password', { email });
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.put(`/api/auth/reset-password/${token}`, { password });
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Update user profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.put('/api/user/profile', profileData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.data
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.put('/api/user/change-password', {
        currentPassword,
        newPassword
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await axios.get(`/api/auth/verify-email/${token}`);

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
