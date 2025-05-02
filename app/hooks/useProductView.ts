import { useEffect } from 'react'

/**
 * Hook to increment product view count
 * This will track views and increment the count in the database
 * 
 * @param productId ID of the product
 * @param productType Type of the product ('configuration', 'component', 'peripheral')
 */
export function useProductView(productId: string | undefined, productType: string | undefined) {
  useEffect(() => {
    // Skip if no product ID or type
    if (!productId || !productType) return
    
    // Only track views from client-side
    if (typeof window === 'undefined') return
    
    // To prevent duplicate counts from rapid page refreshes,
    // we'll use sessionStorage to track recently viewed items
    const viewedKey = `viewed_${productType}_${productId}`
    const lastViewed = sessionStorage.getItem(viewedKey)
    const now = Date.now()
    
    // If the product was viewed less than 30 minutes ago, don't count it as a new view
    if (lastViewed && now - parseInt(lastViewed, 10) < 30 * 60 * 1000) {
      return
    }
    
    // Record this view in session storage
    sessionStorage.setItem(viewedKey, now.toString())
    
    // Send the view to the server
    const incrementView = async () => {
      try {
        const response = await fetch('/api/shop/product/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, productType }),
        })
        
        if (!response.ok) {
          console.error('Failed to record view:', await response.text())
        }
      } catch (error) {
        console.error('Failed to record product view:', error)
      }
    }
    
    incrementView()
  }, [productId, productType])
}