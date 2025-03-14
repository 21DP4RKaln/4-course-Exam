'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1A1A1A]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E63946]"></div>
    </div>
  );
}