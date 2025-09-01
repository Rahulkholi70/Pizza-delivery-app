import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data.data);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.put(`/api/admin/orders/${orderId}/status`, {
        orderStatus: status
      });

      if (response.data.success) {
        // Update the local orders state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: status }
              : order
          )
        );
        setSuccess(`Order status updated to ${status} successfully`);
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

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

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            📋 Admin Orders Management
          </h1>
          <button
            onClick={fetchOrders}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Refresh Orders
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🍕</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600">
              There are no orders in the system yet.
            </p>
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
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.name || 'Unknown'} ({order.user?.email || 'No email'})
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

                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => openStatusModal(order)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Update Order #{selectedOrder._id.slice(-6).toUpperCase()} Status
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Status
                  </label>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Order Received">Order Received</option>
                    <option value="In the Kitchen">In the Kitchen</option>
                    <option value="Sent to Delivery">Sent to Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, newStatus)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setNewStatus('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
