import React from 'react';

const EnvironmentBanner = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isStaging = hostname.includes('staging');
  
  const version = import.meta.env.VITE_APP_VERSION || 'dev';
  const db = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'unknown';

  const formatVersion = (v) => {
    if (v.startsWith('v')) return v;
    return v.substring(0, 7);
  };

  const Banner = ({ type, children }) => {
    const colors = {
      localhost: 'bg-yellow-500',
      staging: 'bg-orange-500',
      production: 'bg-blue-600'
    };
    return (
      <div className={`${colors[type]} text-center p-2 text-white font-medium fixed w-full bottom-0 z-[100]`}>
        {children}
      </div>
    );
  };

  if (isLocalhost) {
    return (
      <Banner type="localhost">
        LOCALHOST | DB: {db} | v{formatVersion(version)}
      </Banner>
    );
  }

  if (isStaging) {
    return (
      <Banner type="staging">
        STAGING | DB: {db} | v{formatVersion(version)}
      </Banner>
    );
  }

  return (
    <Banner type="production">
      PRODUCTION | DB: {db} | v{formatVersion(version)}
    </Banner>
  );
};

export default EnvironmentBanner;
