export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
      <div className="max-w-md w-full p-8 bg-[#1E1E1E] rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-6">Page not found</p>
        <a 
          href="/"
          className="inline-block px-4 py-2 bg-[#E63946] text-white rounded-md hover:bg-[#FF4D5A] transition-colors"
        >
          Back
        </a>
      </div>
    </div>
  );
}