import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
    const apiKey = process.env.RESET_VIEWS_API_KEY
    const response = await fetch(`${request.nextUrl.origin}/api/shop/product/view?apiKey=${apiKey}`, {
      method: 'PUT',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to reset view counts: ${error.error || 'Unknown error'}`)
    }
    
    const result = await response.json()
  
    console.log(`[CRON] Monthly view counts reset - ${new Date().toISOString()}:`, result.resetCounts)
    
    return NextResponse.json({
      success: true,
      message: 'View counts reset successfully for the new month',
      details: result.resetCounts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in reset-views cron job:', error)
    return NextResponse.json(
      { error: 'Failed to reset view counts' },
      { status: 500 }
    )
  }
}