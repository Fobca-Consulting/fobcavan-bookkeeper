
import React, { useState, useEffect } from 'react';

const Index = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/fobca-logo.png';
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <img 
          src="/fobca-logo.png" 
          alt="Fobca Logo" 
          className="mx-auto mb-4 h-24 w-24"
          onError={(e) => {
            console.error('Image load error:', e);
            setImageError(true);
          }}
        />
        {imageError && (
          <div className="text-red-500 mb-4">
            Logo image failed to load. Please check the file.
          </div>
        )}
        <h1 className="text-4xl font-bold mb-4">Welcome to Fobca Bookkeeper</h1>
        <p className="text-xl text-gray-600">Manage your finances with ease</p>
      </div>
    </div>
  );
};

export default Index;
