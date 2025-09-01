import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/order/my-orders');
        setOrders(response.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up polling to check for order status updates every 30 seconds
    const pollingInterval = setInterval(fetchOrders, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(pollingInterval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Received':
        return 'bg-blue-100 text-blue-800';
      case 'In the Kitchen':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sent to Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalItems = (orderItems) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📋 Order History
          </h1>
          <p className="text-lg text-gray-600">
            View your past pizza orders and their current status
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🍕</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start building your perfect pizza!
            </p>
            <a
              href="/build-pizza"
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Build Your Pizza
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.createdAt), 'PPP p')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{order.totalPrice}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items ({calculateTotalItems(order.orderItems)})</h4>
                  <div className="grid gap-2">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                        </span>
                        <span className="text-gray-600">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Shipping Info</h5>
                      <p className="text-gray-600">{order.shippingInfo.address}</p>
                      <p className="text-gray-600">
                        {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pinCode}
                      </p>
                      <p className="text-gray-600">Phone: {order.shippingInfo.phoneNo}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Payment Info</h5>
                      <p className="text-gray-600">
                        Status: {order.paymentInfo?.status === 'completed' ? 'Paid' : 'Pending'}
                      </p>
                      {order.paidAt && (
                        <p className="text-gray-600">
                          Paid on: {format(new Date(order.paidAt), 'PPP')}
                        </p>
                      )}
                      {order.deliveredAt && (
                        <p className="text-gray-600">
                          Delivered on: {format(new Date(order.deliveredAt), 'PPP')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to cancel this order?')) {
                          try {
                            const response = await axios.put(`/api/order/${order._id}/cancel`);
                            if (response.data.success) {
                              // Update the local orders state to reflect the cancellation
                              setOrders(prevOrders => 
                                prevOrders.map(prevOrder => 
                                  prevOrder._id === order._id 
                                    ? { ...prevOrder, orderStatus: 'Cancelled' }
                                    : prevOrder
                                )
                              );
                              alert('Order cancelled successfully!');
                            }
                          } catch (error) {
                            console.error('Error cancelling order:', error);
                            alert('Failed to cancel order. Please try again.');
                          }
                        }
                      }}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
