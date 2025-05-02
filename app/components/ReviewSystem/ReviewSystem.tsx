'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { Star, ThumbsUp, ThumbsDown, Calendar, User, X, AlertTriangle, Check, Info } from 'lucide-react'

interface Review {
  id: string;
  userId: string;
  username: string; 
  rating: number;
  comment: string;
  purchaseDate: string | null; // ISO date string
  createdAt: string; // ISO date string
  helpfulCount: number;
  isHelpful?: boolean; // Current user's vote
  userProfileImage?: string | null;
}

interface ReviewsProps {
  productId: string;
  productType: 'CONFIGURATION' | 'COMPONENT' | 'PERIPHERAL';
}

export default function ReviewSystem({ productId, productType }: ReviewsProps) {
  const t = useTranslations()
  const { user, isAuthenticated } = useAuth()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    purchaseDate: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [hasUserReviewed, setHasUserReviewed] = useState(false)
  
  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/reviews?productId=${productId}&productType=${productType}`)
        
        if (!response.ok) {
          throw new Error('Failed to load reviews')
        }
        
        const data = await response.json()
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
        setReviewCount(data.reviews?.length || 0)
        
        // Check if the current user has already reviewed this product
        if (isAuthenticated && user) {
          const userReview = data.reviews.find((review: Review) => review.userId === user.id)
          setHasUserReviewed(!!userReview)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setError('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }
    
    fetchReviews()
  }, [productId, productType, isAuthenticated, user])
  
  // Submit a new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setSubmitError('You need to be logged in to submit a review')
      return
    }
    
    if (!newReview.comment.trim()) {
      setSubmitError('Please enter a review comment')
      return
    }
    
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productType,
          rating: newReview.rating,
          comment: newReview.comment,
          purchaseDate: newReview.purchaseDate ? new Date(newReview.purchaseDate).toISOString() : null
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to submit review')
      }
      
      // Refresh reviews after submission
      const data = await response.json()
      
      // Add the new review to the list
      const reviewWithUserData = {
        ...data,
        username: user?.name || 'Anonymous',
        userProfileImage: user?.profileImageUrl,
        helpfulCount: 0
      }
      
      setReviews([reviewWithUserData, ...reviews])
      setAverageRating((averageRating * reviewCount + newReview.rating) / (reviewCount + 1))
      setReviewCount(reviewCount + 1)
      setHasUserReviewed(true)
      
      // Reset the form
      setNewReview({
        rating: 5,
        comment: '',
        purchaseDate: ''
      })
      setSubmitSuccess('Your review has been submitted successfully!')
      
      // Hide the form after a delay
      setTimeout(() => {
        setShowReviewForm(false)
        setSubmitSuccess(null)
      }, 3000)
    } catch (error) {
      console.error('Error submitting review:', error)
      setSubmitError((error as Error).message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Handle helpful/unhelpful votes
  const handleHelpfulVote = async (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated) {
      return
    }
    
    try {
      const response = await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          isHelpful
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to vote')
      }
      
      // Update the review in the UI
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          // If the user already voted in the same way, remove the vote
          if (review.isHelpful === isHelpful) {
            return {
              ...review,
              helpfulCount: isHelpful ? review.helpfulCount - 1 : review.helpfulCount,
              isHelpful: undefined
            }
          }
          // If the user is changing their vote
          else if (review.isHelpful !== undefined) {
            return {
              ...review,
              helpfulCount: isHelpful ? review.helpfulCount + 1 : review.helpfulCount - 1,
              isHelpful
            }
          }
          // If the user is voting for the first time
          else {
            return {
              ...review,
              helpfulCount: isHelpful ? review.helpfulCount + 1 : review.helpfulCount,
              isHelpful
            }
          }
        }
        return review
      }))
    } catch (error) {
      console.error('Error voting on review:', error)
    }
  }
  
  // Format a date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Customer Reviews
          </h3>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={18} 
                  className={i < Math.floor(averageRating) 
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-gray-300 dark:text-gray-600"
                  }
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {averageRating.toFixed(1)} out of 5 ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        {isAuthenticated && (
          !hasUserReviewed ? (
            <button 
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Write a Review
            </button>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Check size={16} className="mr-1 text-green-500" />
              You've reviewed this product
            </span>
          )
        )}

        {!isAuthenticated && (
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <Info size={16} className="mr-1" />
            Sign in to write a review
          </div>
        )}
      </div>
      
      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Write Your Review</h4>
            <button 
              onClick={() => setShowReviewForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-md p-3 mb-4">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-md p-3 mb-4 flex items-center">
              <Check size={18} className="mr-2 text-green-500" />
              {submitSuccess}
            </div>
          )}
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating
              </label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({...newReview, rating: star})}
                    className="p-1"
                  >
                    <Star 
                      size={24} 
                      className={star <= newReview.rating
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Date (optional)
              </label>
              <input
                type="date"
                value={newReview.purchaseDate}
                onChange={(e) => setNewReview({...newReview, purchaseDate: e.target.value})}
                max={new Date().toISOString().split('T')[0]} // Ensure date is not in the future
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review
              </label>
              <textarea
                required
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                rows={4}
                placeholder="Share your experience with this product..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !newReview.comment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {review.userProfileImage ? (
                    <img 
                      src={review.userProfileImage} 
                      alt={review.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {review.username}
                    </h4>
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(review.createdAt)}
                    </time>
                  </div>
                  
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          size={14} 
                          className={i < review.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  
                  {review.purchaseDate && (
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      Purchased: {formatDate(review.purchaseDate)}
                    </div>
                  )}
                  
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {review.comment}
                  </p>
                  
                  {/* Helpful buttons */}
                  {isAuthenticated && review.userId !== user?.id && (
                    <div className="mt-3 flex items-center space-x-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Was this review helpful?
                      </span>
                      <button
                        onClick={() => handleHelpfulVote(review.id, true)}
                        className={`flex items-center text-xs ${
                          review.isHelpful === true
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                        }`}
                      >
                        <ThumbsUp size={14} className="mr-1" />
                        Yes {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                      </button>
                      <button
                        onClick={() => handleHelpfulVote(review.id, false)}
                        className={`flex items-center text-xs ${
                          review.isHelpful === false
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                        }`}
                      >
                        <ThumbsDown size={14} className="mr-1" />
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {reviewCount > 3 && (
            <div className="text-center pt-4">
              <button className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium">
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}