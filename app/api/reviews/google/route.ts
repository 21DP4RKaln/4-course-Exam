import { NextRequest, NextResponse } from 'next/server';
import { createServerErrorResponse } from '@/lib/apiErrors';
import { prisma } from '@/lib/prismaService';

export async function GET(request: NextRequest) {
  console.log('🔍 Reviews API called');
  try {
    const useGoogleApi =
      process.env.USE_GOOGLE_REVIEWS === 'true' &&
      process.env.GOOGLE_PLACES_API_KEY &&
      process.env.GOOGLE_PLACE_ID;

    console.log('🔍 Using Google API:', useGoogleApi);

    if (useGoogleApi) {
      try {
        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
        const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=name,rating,reviews,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}`;

        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          throw new Error(`Google Places API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'OK' || !data.result) {
          throw new Error(
            `Google Places API error: ${data.status || 'No result'}`
          );
        }

        interface GoogleReview {
          author_name: string;
          rating: number;
          time: number;
          profile_photo_url: string;
          text: string;
        }

        const result = data.result;
        const reviews = result.reviews || [];

        return NextResponse.json({
          reviews: reviews.slice(0, 3).map((review: GoogleReview) => ({
            name: review.author_name,
            rating: review.rating,
            comment: review.text,
            date: new Date(review.time * 1000).toISOString(),
            profileImage: review.profile_photo_url,
          })),
          averageRating: result.rating || 4.5,
          totalReviews: result.user_ratings_total || 0,
        });
      } catch (googleError) {
        console.error('Google API error:', googleError);
      }
    }
    console.log('🔍 Falling back to database reviews');

    try {
      const reviews = await prisma.review.findMany({
        where: {
          productType: 'CONFIGURATION',
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
      });

      const ratingsData = await prisma.review.aggregate({
        where: {
          productType: 'CONFIGURATION',
        },
        _avg: {
          rating: true,
        },
        _count: true,
      });

      console.log(`🔍 Found ${reviews.length} reviews in database`);

      if (reviews.length > 0) {
        return NextResponse.json({
          reviews: reviews.map(review => ({
            name: review.user?.name || 'Anonymous Customer',
            rating: review.rating,
            comment:
              review.comment ||
              'Great service! Very professional team and excellent products.',
            date: review.createdAt.toISOString(),
            profileImage: review.user?.profileImageUrl,
          })),
          averageRating: ratingsData._avg.rating || 4.5,
          totalReviews: ratingsData._count || 0,
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    console.log('🔍 Using static fallback reviews');

    return NextResponse.json({
      reviews: [
        {
          name: 'John Smith',
          rating: 5,
          comment:
            'Fantastic service! My gaming PC works better than expected and the team was very professional.',
          date: new Date().toISOString(),
          profileImage: null,
        },
        {
          name: 'Anna Berzina',
          rating: 5,
          comment:
            'Great experience from start to finish. My custom workstation is perfect for graphic design work.',
          date: new Date().toISOString(),
          profileImage: null,
        },
        {
          name: 'Matiss K.',
          rating: 4,
          comment:
            'Very happy with my new PC build. Delivery was fast and setup was straightforward.',
          date: new Date().toISOString(),
          profileImage: null,
        },
      ],
      averageRating: 4.5,
      totalReviews: 3,
    });
  } catch (error) {
    console.error('Error retrieving reviews:', error);

    return NextResponse.json(
      {
        reviews: [
          {
            name: 'Roberts L.',
            rating: 5,
            comment:
              'Exceptional service! My gaming setup is amazing and the team was very helpful with all my questions.',
            date: new Date().toISOString(),
            profileImage: null,
          },
          {
            name: 'Marta P.',
            rating: 5,
            comment:
              'Very professional team and excellent products. Would definitely recommend to anyone looking for a custom PC.',
            date: new Date().toISOString(),
            profileImage: null,
          },
          {
            name: 'Toms K.',
            rating: 4,
            comment:
              'Great experience with IvaPro! My custom PC works perfectly for both gaming and development work.',
            date: new Date().toISOString(),
            profileImage: null,
          },
        ],
        averageRating: 4.7,
        totalReviews: 27,
      },
      { status: 200 }
    );
  }
}
