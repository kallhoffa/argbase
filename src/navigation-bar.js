import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavigationBar = ({ navigate: navigationOverride }) => {
  const defaultNavigate = useNavigate();
  const navigate = navigationOverride || defaultNavigate;
  const [searchQuery, setSearchQuery] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Navigate to answer page with search query as parameter
        navigate(`/question?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    };
  
    return (
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-900">
                Arg<span className="text-blue-600">Base</span>
              </h1>
            </a>
  
            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What would you like to know?"
                  className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-full 
                           focus:outline-none focus:border-blue-400 
                           placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5
                           text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
  
            {/* Right side menu/buttons if needed */}
            <div className="flex items-center space-x-4">
              <a href="/about" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                About
              </a>
              <button className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                Log In
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  export default NavigationBar;