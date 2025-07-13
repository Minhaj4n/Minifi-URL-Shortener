import React from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand Name */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <span className="text-2xl font-bold text-blue-600">Minifi</span>
          </div>
          
          {/* Home Button - Updated Style */}
          <div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-md text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar; 