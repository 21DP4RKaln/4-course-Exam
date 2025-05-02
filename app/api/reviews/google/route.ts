import { NextRequest, NextResponse } from 'next/server'
import { createServerErrorResponse } from '@/lib/apiErrors'

export async function GET(request: NextRequest) {
  try {
    // Google Places API integration
    // This would use your Google Places API key and place ID
    
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
    const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID
    
    if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
      throw new Error('Google Places API credentials are not configured')
    }
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=name,rating,reviews,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok || data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status || 'Unknown error'}`)
    }
    
    const googlePlaceResult = data.result
    
    interface GoogleReview {
      author_name: string;
      rating: number;
      time: number;
      profile_photo_url: string;
    }

    interface GooglePlaceResult {
      reviews: GoogleReview[];
      rating: number;
      user_ratings_total: number;
    }

    const result: GooglePlaceResult = googlePlaceResult;

    return NextResponse.json({
      reviews: result.reviews.slice(0, 3).map(review => ({
      name: review.author_name,
      rating: review.rating,
      //comment: review.text,
      date: new Date(review.time * 1000).toISOString(),
      profileImage: review.profile_photo_url
      })),
      averageRating: result.rating,
      totalReviews: result.user_ratings_total
    });
    
    // For demonstration purposes, fetch recent reviews from our database
    const { prisma } = await import('@/lib/prismaService')
    
    const reviews = await prisma.review.findMany({
      where: {
        productType: 'CONFIGURATION'
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    })
    
    // Calculate average rating from all configuration reviews
    const ratingsData = await prisma.review.aggregate({
      where: {
        productType: 'CONFIGURATION'
      },
      _avg: {
        rating: true
      },
      _count: true
    })
    
    return NextResponse.json({
      reviews: reviews.map(review => ({
        name: review.user.name || 'Anonymous Customer',
        rating: review.rating,
        comment: review.comment || 'Great service!',
        date: review.createdAt.toISOString(),
        profileImage: review.user.profileImageUrl
      })),
      averageRating: ratingsData._avg.rating || 4.5,
      totalReviews: ratingsData._count || 0
    })
    
  } catch (error) {
    console.error('Error retrieving Google reviews:', error)
    
    // Include fallback data for development/testing
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        reviews: [
          {
            name: 'Development User',
            rating: 5,
            comment: 'This is fallback data since Google API is not connected in development.',
            date: new Date().toISOString(),
            profileImage: null
          }
        ],
        averageRating: 5,
        totalReviews: 1
      })
    }
    
    return createServerErrorResponse('Failed to retrieve Google reviews')
  }
}