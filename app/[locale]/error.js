'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
      <div className="max-w-md w-full p-8 bg-[#1E1E1E] rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Kļūda</h1>
        <p className="text-gray-400 mb-6">{error?.message || 'Kaut kas nogāja greizi'}</p>
        <button
          onClick={reset}
          className="inline-block px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
        >
          Mēģināt vēlreiz
        </button>
      </div>
    </div>
  );
}