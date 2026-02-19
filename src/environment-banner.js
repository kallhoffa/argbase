import React from 'react';

const EnvironmentBanner = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isStaging = hostname.includes('staging');

  if (!isLocalhost && !isStaging) return null;

  if (isLocalhost) {
    return (
      <div className="bg-yellow-500 text-center p-2 text-white font-medium fixed w-full bottom-0 z-[100]">
        Running on localhost - Development Environment
      </div>
    );
  }

  if (isStaging) {
    return (
      <div className="bg-orange-500 text-center p-2 text-white font-medium fixed w-full top-0 z-[100]">
        STAGING ENVIRONMENT - Not Production
      </div>
    );
  }

  return null;
};

export default EnvironmentBanner;