import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



function Home() {
  
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to answer page with search query as parameter
      navigate(`/question?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
    {/* Main container */}
    <div className="max-w-4xl w-full text-center space-y-12">
      {/* Logo and Title */}
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-blue-900">
          Arg<span className="text-blue-600">Base</span>
        </h1>
        <p className="text-xl text-gray-600">
          Every question answered.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What would you like to know?"
            className="w-full px-6 py-4 text-lg border-2 border-blue-200 rounded-full 
                       shadow-lg focus:outline-none focus:border-blue-400 
                       placeholder-gray-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2
                       text-blue-500 hover:text-blue-700 transition-colors"
          >
            <Search size={24} />
          </button>
        </div>
      </form>

      {/* Additional Info */}
      <div className="mt-12 text-gray-600 text-sm space-y-2">
        <p>Join us in building the world's knowledge base</p>
        <p>Explore arguments, evidence, and conclusions for any question</p>
      </div>
    </div>
  </div>
  );
}

export default Home;
