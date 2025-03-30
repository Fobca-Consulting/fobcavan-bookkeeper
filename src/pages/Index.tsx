
import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <img 
          src="/fobca-logo.png" 
          alt="Fobca Logo" 
          className="mx-auto mb-4 h-24 w-24"
        />
        <h1 className="text-4xl font-bold mb-4">Welcome to Fobca Bookkeeper</h1>
        <p className="text-xl text-gray-600">Manage your finances with ease</p>
      </div>
    </div>
  );
};

export default Index;
