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
    const isLatvia = address.country.toLowerCase() === 'latvia' || address.country.toLowerCase() === 'lv'
    
    const shippingRates: ShippingRate[] = []
 
    // Kurjerpiegāde tikai Latvijai
    if (isLatvia) {
      const courierRate = isRiga ? 0 : 20 // Rīgā bezmaksas, ārpus Rīgas 20 EUR
      shippingRates.push({
        rate: courierRate,
        method: 'COURIER',
        estimatedDays: isRiga ? '1-2' : '2-3',
      })
    }

    // Pasta piegāde visām valstīm
    const postRate = isLatvia ? 10 : 30 // Latvijā 10 EUR, Lietuvā un Igaunijā 30 EUR
    shippingRates.push({
      rate: postRate,
      method: 'POST',
      estimatedDays: isLatvia ? '2-3' : '3-5',
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