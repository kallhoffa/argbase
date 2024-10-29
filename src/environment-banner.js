import React from 'react';

const EnvironmentBanner = () => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

  if (!isLocalhost) return null;

  return (
    <div className="bg-yellow-500 text-center p-2 text-white font-medium fixed w-full top-0 z-[100]">
      Running on localhost - Development Environment
    </div>
  );
};

export default EnvironmentBanner;