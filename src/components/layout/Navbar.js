import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, X } from "lucide-react"; // install: npm install lucide-react
// import {AdminOrders} from "../admin/AdminOrders";
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold flex items-center gap-2">
            🍕 <span className="hidden sm:inline">Pizza Builder</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <> {user.role === "user" && (
                <>
                <Link to="/dashboard" className="hover:text-yellow-200 transition">
                  Dashboard
                </Link>
                <Link to="/pizza-builder" className="hover:text-yellow-200 transition">
                  Build Pizza
                </Link>
                <Link to="/orders" className="hover:text-yellow-200 transition">
                  My Orders
                </Link>
              </>
              )}
              {user.role === "admin" && (
                <>
                  {/* <Link to="/admin" className="hover:text-yellow-200 transition">
                    Admin Panel
                  </Link> */}
                    <Link to="/admin/inventory" className="hover:text-yellow-200 transition">
                      Inventory
                    </Link>
                    <Link to="/admin/orders" className="hover:text-yellow-200 transition">
                      Orders
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-white text-red-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-200 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-yellow-400 text-red-800 font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-300 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-red-600 px-4 pb-4 space-y-2">
          {user ? (
            <>
              <Link to="/dashboard" className="block hover:text-yellow-200 transition">
                Dashboard
              </Link>
                {user.role === "admin" && (
                  <>
                    <Link to="/admin" className="block hover:text-yellow-200 transition">
                      Admin Panel
                    </Link>
                    <Link to="/admin/inventory" className="block hover:text-yellow-200 transition">
                      Inventory
                    </Link>
                    <Link to="/admin/orders" className="block hover:text-yellow-200 transition">
                      Orders
                    </Link>
                  </>
                )}
              <Link to="/pizza-builder" className="block hover:text-yellow-200 transition">
                Build Pizza
              </Link>
              {/* <Link to="/admin/AdminOrders" className="block hover:text-yellow-200 transition">
                My Orders
              </Link> */}
              <button
                onClick={handleLogout}
                className="w-full text-left bg-white text-red-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block hover:text-yellow-200 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="block bg-yellow-400 text-red-800 font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-300 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
