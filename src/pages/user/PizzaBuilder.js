import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const PizzaBuilder = () => {
  const [ingredients, setIngredients] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    veggies: [],
    meats: []
  });
  const [selectedItems, setSelectedItems] = useState({
    base: null,
    sauce: null,
    cheeses: [],
    veggies: [],
    meats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    phoneNo: ''
  });

  const { user, updateProfile } = useAuth();

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('/api/pizza/all-options');
        setIngredients(response.data.data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        setError('Failed to load ingredients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (user && user.address) {
        setShippingInfo({
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          country: user.country || '',
          pinCode: user.pinCode || '',
          phoneNo: user.phoneNo || ''
        });
      }
    };

    fetchUserAddress();
  }, [user]);

  const calculateTotal = () => {
    let subtotal = 0;

    if (selectedItems.base) subtotal += selectedItems.base.price;
    if (selectedItems.sauce) subtotal += selectedItems.sauce.price;
    selectedItems.cheeses.forEach(cheese => subtotal += cheese.price);
    selectedItems.veggies.forEach(veggie => subtotal += veggie.price);
    selectedItems.meats.forEach(meat => subtotal += meat.price);

    const tax = subtotal * 0.18; // 18% tax
    const shipping = subtotal > 350 ? 0 : 50; // Free shipping above 350
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  };

  const handleSelectBase = (base) => {
    setSelectedItems(prev => ({ ...prev, base }));
  };

  const handleSelectSauce = (sauce) => {
    setSelectedItems(prev => ({ ...prev, sauce }));
  };

  const handleToggleCheese = (cheese) => {
    setSelectedItems(prev => ({
      ...prev,
      cheeses: prev.cheeses.some(c => c._id === cheese._id)
        ? prev.cheeses.filter(c => c._id !== cheese._id)
        : [...prev.cheeses, cheese]
    }));
  };

  const handleToggleVeggie = (veggie) => {
    setSelectedItems(prev => ({
      ...prev,
      veggies: prev.veggies.some(v => v._id === veggie._id)
        ? prev.veggies.filter(v => v._id !== veggie._id)
        : [...prev.veggies, veggie]
    }));
  };

  const handleToggleMeat = (meat) => {
    setSelectedItems(prev => ({
      ...prev,
      meats: prev.meats.some(m => m._id === meat._id)
        ? prev.meats.filter(m => m._id !== meat._id)
        : [...prev.meats, meat]
    }));
  };

  const handlePlaceOrder = () => {
    if (!selectedItems.base || !selectedItems.sauce) {
      setError('Please select at least a base and sauce for your pizza');
      return;
    }
    setError('');
    setShowAddressModal(true);
  };

  const proceedWithOrder = async () => {
    setIsBuilding(true);
    setShowAddressModal(false);

    try {
      // Save address to user profile
      const addressData = {
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: shippingInfo.country,
        pinCode: shippingInfo.pinCode,
        phoneNo: shippingInfo.phoneNo
      };

      await updateProfile(addressData);
      const orderItems = [];

      // Add base
      orderItems.push({
        name: selectedItems.base.name,
        price: selectedItems.base.price,
        quantity: 1,
        category: 'base',
        itemId: selectedItems.base._id
      });

      // Add sauce
      orderItems.push({
        name: selectedItems.sauce.name,
        price: selectedItems.sauce.price,
        quantity: 1,
        category: 'sauce',
        itemId: selectedItems.sauce._id
      });

      // Add cheeses
      selectedItems.cheeses.forEach(cheese => {
        orderItems.push({
          name: cheese.name,
          price: cheese.price,
          quantity: 1,
          category: 'cheese',
          itemId: cheese._id
        });
      });

      // Add veggies
      selectedItems.veggies.forEach(veggie => {
        orderItems.push({
          name: veggie.name,
          price: veggie.price,
          quantity: 1,
          category: 'veggie',
          itemId: veggie._id
        });
      });

      // Add meats
      selectedItems.meats.forEach(meat => {
        orderItems.push({
          name: meat.name,
          price: meat.price,
          quantity: 1,
          category: 'meat',
          itemId: meat._id
        });
      });

      const orderData = {
        orderItems,
        shippingInfo
      };

      const response = await axios.post('/api/order/create', orderData);

      if (response.data.success && response.data.razorpayOrderId) {
        const { total } = calculateTotal();
        const options = {
          key: response.data.key,
          amount: Math.round(total * 100),
          currency: 'INR',
          name: 'Pizza Ordering App',
          description: 'Pizza Order Payment',
          order_id: response.data.razorpayOrderId,
          handler: async function (paymentResponse) {
            try {
              const verifyResponse = await axios.post('/api/order/payment/verify', {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              });

              if (verifyResponse.data.success) {
                alert('Payment successful! Your pizza is being prepared.');
                setSelectedItems({
                  base: null,
                  sauce: null,
                  cheeses: [],
                  veggies: [],
                  meats: []
                });
                setShippingInfo({
                  address: '',
                  city: '',
                  state: '',
                  country: '',
                  pinCode: '',
                  phoneNo: ''
                });
              } else {
                alert('Payment verification failed. Please try again.');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: shippingInfo.phoneNo || ''
          },
          notes: {
            address: 'Pizza Ordering App'
          },
          theme: {
            color: '#F37254'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        alert('Order created successfully! Your pizza is being prepared.');
        setSelectedItems({
          base: null,
          sauce: null,
          cheeses: [],
          veggies: [],
          meats: []
        });
        setShippingInfo({
          address: '',
          city: '',
          state: '',
          country: '',
          pinCode: '',
          phoneNo: ''
        });
      }
    } catch (error) {
      console.error('Order error:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && !loading) {
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
            🍕 Build Your Perfect Pizza
          </h1>
          <p className="text-lg text-gray-600">
            Customize your pizza with fresh ingredients
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🍕 Choose Your Base</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {ingredients.bases.map((base) => (
                  <button
                    key={base._id}
                    onClick={() => handleSelectBase(base)}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      selectedItems.base?._id === base._id
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{base.name}</div>
                    <div className="text-green-600 font-semibold">₹{base.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🥫 Choose Your Sauce</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {ingredients.sauces.map((sauce) => (
                  <button
                    key={sauce._id}
                    onClick={() => handleSelectSauce(sauce)}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      selectedItems.sauce?._id === sauce._id
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{sauce.name}</div>
                    <div className="text-green-600 font-semibold">₹{sauce.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🧀 Add Cheese (Multiple)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ingredients.cheeses.map((cheese) => (
                  <button
                    key={cheese._id}
                    onClick={() => handleToggleCheese(cheese)}
                    className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                      selectedItems.cheeses.some(c => c._id === cheese._id)
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{cheese.name}</div>
                    <div className="text-green-600 font-semibold text-sm">₹{cheese.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🥬 Add Veggies (Multiple)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ingredients.veggies.map((veggie) => (
                  <button
                    key={veggie._id}
                    onClick={() => handleToggleVeggie(veggie)}
                    className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                      selectedItems.veggies.some(v => v._id === veggie._id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{veggie.name}</div>
                    <div className="text-green-600 font-semibold text-sm">₹{veggie.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🥩 Add Meats (Multiple)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ingredients.meats.map((meat) => (
                  <button
                    key={meat._id}
                    onClick={() => handleToggleMeat(meat)}
                    className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                      selectedItems.meats.some(m => m._id === meat._id)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{meat.name}</div>
                    <div className="text-green-600 font-semibold text-sm">₹{meat.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Your Pizza</h3>
              
              <div className="space-y-3 mb-6">
                {selectedItems.base && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Base: {selectedItems.base.name}</span>
                    <span className="text-green-600 font-semibold">₹{selectedItems.base.price}</span>
                  </div>
                )}
                
                {selectedItems.sauce && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Sauce: {selectedItems.sauce.name}</span>
                    <span className="text-green-600 font-semibold">₹{selectedItems.sauce.price}</span>
                  </div>
                )}
                
                {selectedItems.cheeses.map((cheese) => (
                  <div key={cheese._id} className="flex justify-between items-center">
                    <span className="text-gray-700">+ {cheese.name}</span>
                    <span className="text-green-600 font-semibold">₹{cheese.price}</span>
                  </div>
                ))}
                
                {selectedItems.veggies.map((veggie) => (
                  <div key={veggie._id} className="flex justify-between items-center">
                    <span className="text-gray-700">+ {veggie.name}</span>
                    <span className="text-green-600 font-semibold">₹{veggie.price}</span>
                  </div>
                ))}
                
                {selectedItems.meats.map((meat) => (
                  <div key={meat._id} className="flex justify-between items-center">
                    <span className="text-gray-700">+ {meat.name}</span>
                    <span className="text-green-600 font-semibold">₹{meat.price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="text-green-600">₹{calculateTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax (18%):</span>
                  <span className="text-green-600">₹{calculateTotal().tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping :</span>

                  <span className="text-green-600">₹{calculateTotal().shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">₹{calculateTotal().total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isBuilding || !selectedItems.base || !selectedItems.sauce}
                className="w-full mt-6 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isBuilding ? 'Building Your Pizza...' : 'Place Order - ₹' + calculateTotal().total.toFixed(2)}
              </button>
              <span>Free shipping after ₹350</span>
              <p>NOTE: Qr Code is not accepted</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>Select one base and one sauce (required)</li>
                <li>Add as many cheeses, veggies, and meats as you like</li>
                <li>Price updates in real-time</li>
                <li>Minimum order: Base + Sauce</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📍 Delivery Address</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.country || !shippingInfo.pinCode || !shippingInfo.phoneNo) {
                alert('Please fill in all address fields');
                return;
              }
              proceedWithOrder();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your full address"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Country"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
                    <input
                      type="text"
                      value={shippingInfo.pinCode}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, pinCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Pin Code"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={shippingInfo.phoneNo}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phoneNo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PizzaBuilder;