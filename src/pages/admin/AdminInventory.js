import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminInventory = () => {
  const [inventory, setInventory] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    veggies: [],
    meats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: 'base',
    name: '',
    description: '',
    price: '',
    stock: '',
    threshold: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [bases, sauces, cheeses, veggies, meats] = await Promise.all([
        axios.get('/api/inventory/base'),
        axios.get('/api/inventory/sauce'),
        axios.get('/api/inventory/cheese'),
        axios.get('/api/inventory/veggie'),
        axios.get('/api/inventory/meat')
      ]);
      
      setInventory({
        bases: bases.data.data,
        sauces: sauces.data.data,
        cheeses: cheeses.data.data,
        veggies: veggies.data.data,
        meats: meats.data.data
      });
      setError('');
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (category, id, stock, threshold) => {
    try {
      const response = await axios.put(`/api/inventory/${category}/${id}`, {
        stock: parseInt(stock),
        threshold: parseInt(threshold)
      });
      
      setInventory(prev => ({
        ...prev,
        [category + 's']: prev[category + 's'].map(item => 
          item._id === id ? response.data.data : item
        )
      }));
      
      setSuccess('Stock updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating stock:', error);
      setError('Failed to update stock');
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleAvailability = async (category, id) => {
    try {
      const response = await axios.patch(`/api/inventory/${category}/${id}/toggle`);
      
      setInventory(prev => ({
        ...prev,
        [category + 's']: prev[category + 's'].map(item => 
          item._id === id ? response.data.data : item
        )
      }));
      
      setSuccess(`Item ${response.data.data.isAvailable ? 'enabled' : 'disabled'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError('Failed to toggle availability');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addNewItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/inventory/${newItem.category}`, {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        stock: parseInt(newItem.stock) || 0,
        threshold: parseInt(newItem.threshold) || (newItem.category === 'base' ? 20 : newItem.category === 'sauce' ? 15 : newItem.category === 'cheese' ? 10 : newItem.category === 'veggie' ? 25 : 15)
      });

      setInventory(prev => ({
        ...prev,
        [newItem.category + 's']: [...prev[newItem.category + 's'], response.data.data]
      }));

      setNewItem({
        category: 'base',
        name: '',
        description: '',
        price: '',
        stock: '',
        threshold: ''
      });
      setShowAddForm(false);
      setSuccess('Item added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item');
      setTimeout(() => setError(''), 3000);
    }
  };


  const getStockStatusText = (stock, threshold) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusColor = (stock, threshold) => {
    if (stock === 0) return 'text-red-600 bg-red-100';
    if (stock <= threshold) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const filteredItems = (items) => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderInventorySection = (title, items, category) => {
    const filtered = filteredItems(items);
    
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          {title} ({filtered.length})
          {filtered.some(item => item.stock <= item.threshold) && (
            <span className="ml-2 text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
              ⚠️ Low Stock
            </span>
          )}
        </h2>
        
        {filtered.length === 0 ? (
          <p className="text-gray-500 italic">No {title.toLowerCase()} found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStockStatusColor(item.stock, item.threshold)}`}>
                    {getStockStatusText(item.stock, item.threshold)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                    <span className="text-sm font-medium">₹{item.price}</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stock</label>
                    <span className="text-sm font-medium">{item.stock}</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Threshold</label>
                    <span className="text-sm font-medium">{item.threshold}</span>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <span className="text-sm font-medium">
                      {item.isAvailable ? 'Available' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAvailability(category, item._id)}
                    className={`text-xs px-2 py-1 rounded ${
                      item.isAvailable 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {item.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  
                  <button
                    onClick={() => setEditingItem({ ...item, category })}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Edit Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            📦 Admin Inventory Management
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            + Add New Item
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchInventory}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-center">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{inventory.bases.length}</div>
              <div className="text-sm text-blue-600">Bases</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-2xl font-bold text-red-600">{inventory.sauces.length}</div>
              <div className="text-sm text-red-600">Sauces</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="text-2xl font-bold text-yellow-600">{inventory.cheeses.length}</div>
              <div className="text-sm text-yellow-600">Cheeses</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{inventory.veggies.length}</div>
              <div className="text-sm text-green-600">Veggies</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-2xl font-bold text-purple-600">{inventory.meats.length}</div>
              <div className="text-sm text-purple-600">Meats</div>
            </div>
          </div>

          {renderInventorySection('Pizza Bases', inventory.bases, 'base')}
          {renderInventorySection('Sauces', inventory.sauces, 'sauce')}
          {renderInventorySection('Cheeses', inventory.cheeses, 'cheese')}
          {renderInventorySection('Veggies', inventory.veggies, 'veggie')}
          {renderInventorySection('Meats', inventory.meats, 'meat')}
        </div>

        {/* Edit Stock Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit {editingItem.name}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateStock(
                  editingItem.category,
                  editingItem._id,
                  editingItem.stock,
                  editingItem.threshold
                );
                setEditingItem(null);
              }}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingItem.stock}
                      onChange={(e) => setEditingItem({...editingItem, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingItem.threshold}
                      onChange={(e) => setEditingItem({...editingItem, threshold: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add New Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
              <form onSubmit={addNewItem}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="base">Pizza Base</option>
                      <option value="sauce">Sauce</option>
                      <option value="cheese">Cheese</option>
                      <option value="veggie">Veggie</option>
                      <option value="meat">Meat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.stock}
                      onChange={(e) => setNewItem({...newItem, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.threshold}
                      onChange={(e) => setNewItem({...newItem, threshold: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                  >
                    Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
