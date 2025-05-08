export interface ShippingAddress {
    city: string
    address: string
    postalCode: string
    country: string
  }
  
  export interface ShippingRate {
    rate: number
    method: 'COURIER' | 'POST'
    estimatedDays: string
  }
  
  export function calculateShipping(address: ShippingAddress): ShippingRate[] {
    const isRiga = address.city.toLowerCase().includes('rīga') || 
                  address.city.toLowerCase().includes('riga')
    
    const shippingRates: ShippingRate[] = []
 
    if (address.country.toLowerCase() === 'latvia' || address.country.toLowerCase() === 'lv') {
      let courierRate = 0
      
      if (isRiga) {
        courierRate = 5 
      } else {
        const baseRate = 20
        const additionalRate = calculateAdditionalDistance(address)
        courierRate = baseRate + additionalRate
      }
      
      shippingRates.push({
        rate: courierRate,
        method: 'COURIER',
        estimatedDays: isRiga ? '1-2' : '2-3',
      })
    }

    shippingRates.push({
      rate: 5, 
      method: 'POST',
      estimatedDays: '3-5',
    })
    
    return shippingRates
  }
  
  function calculateAdditionalDistance(address: ShippingAddress): number {
    const rigaPostalCodes = ['LV-1', 'LV-10', 'LV-11', 'LV-12', 'LV-13']
    const isNearRiga = rigaPostalCodes.some(code => 
      address.postalCode.startsWith(code)
    )
    
    if (isNearRiga) return 0
 
    const postalPrefix = address.postalCode.split('-')[1]?.substring(0, 2)
    const distance = parseInt(postalPrefix || '0', 10)

    const segments = Math.ceil(distance / 5)
    return segments * 5
  }