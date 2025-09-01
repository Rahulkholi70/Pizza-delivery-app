import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-6">
            🍕 Welcome to Pizza Builder
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create your perfect pizza with our custom builder! Choose from our selection of 
            fresh ingredients and build the pizza of your dreams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🍕</div>
              <h3 className="text-xl font-semibold mb-2">Custom Pizzas</h3>
              <p className="text-gray-600">
                Build your pizza from scratch with our wide selection of ingredients
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your custom pizza delivered to your doorstep in no time
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">
                Safe and secure payment processing with Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
