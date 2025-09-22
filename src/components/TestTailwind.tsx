import React from 'react';

export const TestTailwind: React.FC = () => {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">Test Tailwind CSS</h1>
      <p className="mt-2">Si ves estilos aquí, Tailwind está funcionando correctamente.</p>
      <button className="mt-4 bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
        Botón de Prueba
      </button>
    </div>
  );
};
