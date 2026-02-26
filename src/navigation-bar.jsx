import React, { useState, useEffect } from 'react';
import { Search, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './firestore-utils/auth-context';
import useFeatureFlag from './hooks/useFeatureFlag';
import { getUserPreferences } from './firestore-utils/user-preferences';
import { BANNER_VARIANTS, isBannerVariant } from './config/featureFlags';

const getBetaFromStorage = (userId) => {
  if (typeof window === 'undefined') return false;
  const key = `beta_enabled_${userId}`;
  const stored = localStorage.getItem(key);
  return stored === 'true';
};

const setBetaInStorage = (userId, enabled) => {
  if (typeof window === 'undefined') return;
  const key = `beta_enabled_${userId}`;
  localStorage.setItem(key, enabled ? 'true' : 'false');
};

const NavigationBar = ({ navigate: navigationOverride, db }) => {
  const defaultNavigate = useNavigate();
  const navigate = navigationOverride || defaultNavigate;
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { flagValue: bannerVariant, loading: bannerLoading } = useFeatureFlag('navigation_banner');
  const [userBetaEnabled, setUserBetaEnabled] = useState(() => {
    if (user) {
      return getBetaFromStorage(user.uid);
    }
    return false;
  });
  
  useEffect(() => {
    const loadUserBeta = async () => {
      if (user && db) {
        try {
          const prefs = await getUserPreferences(db, user.uid);
          const betaEnabled = prefs.beta_enabled || false;
          setUserBetaEnabled(betaEnabled);
          setBetaInStorage(user.uid, betaEnabled);
        } catch (e) {
          // ignore - user might not have preferences yet
        }
      }
    };
    loadUserBeta();
  }, [user, db]);
  
  const getBannerText = () => {
    if (bannerLoading) return BANNER_VARIANTS.control;
    const isBetaTreatment = isBannerVariant(bannerVariant) || userBetaEnabled;
    return isBetaTreatment ? BANNER_VARIANTS.beta : BANNER_VARIANTS.control;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/question?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert('Logout failed: ' + error.message);
    }
  };
  
    return (
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-900">
                {getBannerText()}
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
  
            {/* Right side menu/buttons */}
            <div className="flex items-center space-x-4">
              <a href="/about" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                About
              </a>
              {user ? (
                <>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm font-medium"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm font-medium"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  };

  export default NavigationBar;