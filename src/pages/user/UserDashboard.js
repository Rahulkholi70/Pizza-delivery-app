import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const [ingredients, setIngredients] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    veggies: [],
    meats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('/api/pizza/all-options');
        setIngredients(response.data.data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        if (error.response?.status === 401) {
          console.log('Authentication error - token may be invalid or expired');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍕 Welcome to Your Pizza Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Explore our ingredients and start building your perfect pizza!
          </p>
        </div>

        <div className="mb-8">
          <Link
            to="/pizza-builder"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            🚀 Start Building Pizza
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pizza Bases */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🍕 Pizza Bases</h3>
            <div className="space-y-2">
              {ingredients.bases?.map((base) => (
                <div key={base._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{base.name}</span>
                  <span className="text-green-600 font-medium">₹{base.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sauces */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🥫 Sauces</h3>
            <div className="space-y-2">
              {ingredients.sauces?.map((sauce) => (
                <div key={sauce._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{sauce.name}</span>
                  <span className="text-green-600 font-medium">₹{sauce.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cheeses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🧀 Cheeses</h3>
            <div className="space-y-2">
              {ingredients.cheeses?.map((cheese) => (
                <div key={cheese._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{cheese.name}</span>
                  <span className="text-green-600 font-medium">₹{cheese.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Veggies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🥬 Veggies</h3>
            <div className="space-y-2">
              {ingredients.veggies?.slice(0, 5).map((veggie) => (
                <div key={veggie._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{veggie.name}</span>
                  <span className="text-green-600 font-medium">₹{veggie.price}</span>
                </div>
              ))}
              {ingredients.veggies?.length > 5 && (
                <div className="text-sm text-gray-500 text-center">
                  +{ingredients.veggies.length - 5} more options
                </div>
              )}
            </div>
          </div>

          {/* Meats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🥩 Meats</h3>
            <div className="space-y-2">
              {ingredients.meats?.map((meat) => (
                <div key={meat._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{meat.name}</span>
                  <span className="text-green-600 font-medium">₹{meat.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/pizza-builder"
                className="block w-full text-center bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Build New Pizza
              </Link>
              <Link
                to="/orders"
                className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
