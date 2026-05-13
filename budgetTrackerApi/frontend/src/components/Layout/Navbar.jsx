import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiLogOut, FiPieChart, FiFolder } from 'react-icons/fi';

export const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <FiPieChart className="w-8 h-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">BudgetTracker</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiFolder className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};