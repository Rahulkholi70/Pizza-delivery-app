import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create context
const OrderContext = createContext();

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null
};

// Action types
const ORDER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  SET_CURRENT_ORDER: 'SET_CURRENT_ORDER',
  CLEAR_CURRENT_ORDER: 'CLEAR_CURRENT_ORDER'
};

// Reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    case ORDER_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ORDER_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ORDER_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ORDER_ACTIONS.SET_ORDERS:
      return { ...state, orders: action.payload, loading: false };
    case ORDER_ACTIONS.ADD_ORDER:
      return { ...state, orders: [action.payload, ...state.orders] };
    case ORDER_ACTIONS.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id 
          ? action.payload 
          : state.currentOrder
      };
    case ORDER_ACTIONS.SET_CURRENT_ORDER:
      return { ...state, currentOrder: action.payload };
    case ORDER_ACTIONS.CLEAR_CURRENT_ORDER:
      return { ...state, currentOrder: null };
    default:
      return state;
  }
};

// Order Provider Component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch user orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders();
    }
  }, [isAuthenticated]);

  // Fetch user orders
  const fetchUserOrders = async () => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });

      const response = await axios.get('/api/order/my-orders');
      dispatch({ type: ORDER_ACTIONS.SET_ORDERS, payload: response.data.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: message });
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });

      const response = await axios.post('/api/order/create', orderData);
      
      dispatch({ type: ORDER_ACTIONS.ADD_ORDER, payload: response.data.order });
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
      
      return {
        success: true,
        order: response.data.order,
        razorpayOrderId: response.data.razorpayOrderId,
        key: response.data.key
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create order';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Verify payment
  const verifyPayment = async (paymentData) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });

      const response = await axios.post('/api/order/payment/verify', paymentData);
      
      dispatch({ type: ORDER_ACTIONS.UPDATE_ORDER, payload: response.data.order });
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
      
      return { success: true, order: response.data.order };
    } catch (error) {
      const message = error.response?.data?.message || 'Payment verification failed';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Get order by ID
  const getOrderById = async (orderId) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });

      const response = await axios.get(`/api/order/${orderId}`);
      
      dispatch({ type: ORDER_ACTIONS.SET_CURRENT_ORDER, payload: response.data.data });
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
      
      return { success: true, order: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch order';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });

      const response = await axios.put(`/api/order/${orderId}/cancel`);
      
      dispatch({ type: ORDER_ACTIONS.UPDATE_ORDER, payload: response.data.order });
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
      
      return { success: true, order: response.data.order };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Update order status (Admin only)
  const updateOrderStatus = async (orderId, status) => {
    try {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });

      const response = await axios.put(`/api/order/${orderId}/status`, { orderStatus: status });
      
      dispatch({ type: ORDER_ACTIONS.UPDATE_ORDER, payload: response.data.order });
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: false });
      
      return { success: true, order: response.data.order };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update order status';
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  // Clear current order
  const clearCurrentOrder = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_CURRENT_ORDER });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });
  };

  // Get order by status
  const getOrdersByStatus = (status) => {
    if (status === 'all') {
      return state.orders;
    }
    return state.orders.filter(order => order.orderStatus === status);
  };

  // Get order statistics
  const getOrderStats = () => {
    const total = state.orders.length;
    const pending = state.orders.filter(order => 
      ['Processing', 'Order Received', 'In the Kitchen'].includes(order.orderStatus)
    ).length;
    const delivered = state.orders.filter(order => 
      order.orderStatus === 'Delivered'
    ).length;
    const cancelled = state.orders.filter(order => 
      order.orderStatus === 'Cancelled'
    ).length;

    return { total, pending, delivered, cancelled };
  };

  // Context value
  const value = {
    // State
    orders: state.orders,
    currentOrder: state.currentOrder,
    loading: state.loading,
    error: state.error,
    
    // Actions
    fetchUserOrders,
    createOrder,
    verifyPayment,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    clearCurrentOrder,
    clearError,
    getOrdersByStatus,
    getOrderStats
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
