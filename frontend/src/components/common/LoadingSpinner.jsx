import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 text-sm">{message}</p>
  </div>
);

export default LoadingSpinner;
