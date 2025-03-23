'use client';

import { useCart } from '../../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function CartIcon() {
  const { totalItems } = useCart();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  
  return (
    <button 
      onClick={() => router.push(`/${locale}/cart`)}
      className="relative text-gray-300 hover:text-white"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#E63946] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}