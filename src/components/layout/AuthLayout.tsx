import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"></div>
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="h-16 w-16 mb-4">
                <img 
                  src="/logo_hogarperu.png" 
                  alt="HogarPeru" 
                  className="h-full w-full object-contain drop-shadow-lg"
                />
              </div>
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 text-center">
                HogarPeru
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Tu hogar, tu elección
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};