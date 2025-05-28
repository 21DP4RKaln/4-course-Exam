'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/app/contexts/AuthContext'
import { Star, ThumbsUp, ThumbsDown, Calendar, User, X, AlertTriangle, Check, Flag, Image as ImageIcon } from 'lucide-react'
import Loading from '@/app/components/ui/Loading'
import { useLoading, LoadingSpinner, FullPageLoading, ButtonLoading } from '@/app/hooks/useLoading'

interface Review {
  id: string;
  userId: string;
  username: string; 
  rating: number;
  comment: string;
  purchaseDate: string | null;
  createdAt: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote: 'helpful' | 'not-helpful' | null;
  userProfileImage?: string | null;
  isHelpful?: boolean;
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
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0])
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
  const [canWriteReview, setCanWriteReview] = useState(false)

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!isAuthenticated || !user) return

      try {
        const response = await fetch(`/api/reviews/check-purchase?productId=${productId}&productType=${productType}`)
        const data = await response.json()
        setCanWriteReview(data.hasPurchased)
      } catch (error) {
        console.error('Error checking purchase status:', error)
      }
    }

    checkPurchaseStatus()
  }, [isAuthenticated, user, productId, productType])

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
        setRatingDistribution(data.distribution || [0, 0, 0, 0, 0])

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
 
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setSubmitError(t('reviewErrors.notAuthenticated'))
      return
    }
    
    if (!newReview.comment.trim()) {
      setSubmitError(t('reviewErrors.emptyComment'))
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
        throw new Error(errorData.error?.message || t('reviewErrors.submitFailed'))
      }
      
      const data = await response.json()
    
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
      
      setNewReview({
        rating: 5,
        comment: '',
        purchaseDate: ''
      })
      setSubmitSuccess(t('reviewComponents.submitSuccess'))
     
      setTimeout(() => {
        setShowReviewForm(false)
        setSubmitSuccess(null)
      }, 3000)
    } catch (error) {
      console.error('Error submitting review:', error)
      setSubmitError((error as Error).message || t('reviewErrors.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }
  
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
        throw new Error(t('reviewErrors.voteFailed'))
      }
      
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          if (review.isHelpful === isHelpful) {
            return {
              ...review,
              helpfulCount: isHelpful ? review.helpfulCount - 1 : review.helpfulCount,
              isHelpful: undefined
            }
          }
          else if (review.isHelpful !== undefined) {
            return {
              ...review,
              helpfulCount: isHelpful ? review.helpfulCount + 1 : review.helpfulCount - 1,
              isHelpful
            }
          }
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }
  
  return (
    <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md overflow-hidden transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('reviewComponents.customerReviews')}
            </h3>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    size={18} 
                    className={i < Math.floor(averageRating) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-neutral-300 dark:text-neutral-600"
                    }
                  />
                ))}
              </div>
              <span className="ml-2 text-neutral-600 dark:text-neutral-400">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'} {t('reviewComponents.outOf5')} ({t('reviewComponents.reviewCount', { count: reviewCount })})
              </span>
            </div>
          </div>
        
         {/* Show review button only if user has purchased and hasn't reviewed */}
          {isAuthenticated && canWriteReview && (
            !hasUserReviewed ? (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                {t('reviewComponents.writeReview')}
              </button>
            ) : (
              <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center">
                <Check size={16} className="mr-1 text-green-500" />
                {t('reviewComponents.hasReviewed')}
              </span>
            )
          )}

          {isAuthenticated && !canWriteReview && (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('reviewErrors.requirePurchase')}
            </span>
          )}

          {!isAuthenticated && (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('auth.loginTitle')}
            </span>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white dark:bg-stone-950 rounded-lg shadow-md p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('reviewComponents.writeReviewTitle')}</h4>
              <button 
                onClick={() => setShowReviewForm(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors duration-200"
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
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('reviewComponents.ratingLabel')}
                </label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    >
                      <Star 
                        size={24} 
                        className={star <= newReview.rating
                          ? "text-yellow-400 fill-yellow-400 transition-all duration-200" 
                          : "text-neutral-300 dark:text-neutral-600 transition-all duration-200"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('reviewComponents.purchaseDateLabel')}
              </label>
              <input
                type="date"
                value={newReview.purchaseDate}
                onChange={(e) => setNewReview({...newReview, purchaseDate: e.target.value})}
                max={new Date().toISOString().split('T')[0]} 
                className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('reviewComponents.reviewTextLabel')}
              </label>
              <textarea
                required
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                rows={4}
                placeholder={t('reviewComponents.reviewPlaceholder')}
                className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="mr-3 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
              >
                {t('reviewComponents.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || !newReview.comment}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {submitting ? t('reviewComponents.submitting') : t('reviewComponents.submitReview')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">
            {t('reviewComponents.noReviewsText')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-t border-neutral-200 dark:border-neutral-700 pt-6 transition-all duration-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {review.userProfileImage ? (
                    <img 
                      src={review.userProfileImage} 
                      alt={review.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center transition-all duration-200">
                      <User size={20} className="text-neutral-500 dark:text-neutral-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {review.username}
                    </h4>
                    <time className="text-xs text-neutral-500 dark:text-neutral-400">
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
                            : "text-neutral-300 dark:text-neutral-600"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  
                  {review.purchaseDate && (
                    <div className="flex items-center mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <Calendar size={12} className="mr-1" />
                      {t('reviewComponents.purchased')} {formatDate(review.purchaseDate)}
                    </div>
                  )}
                  
                  <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                    {review.comment}
                  </p>
                  
                  {/* Helpful buttons */}
                  {isAuthenticated && review.userId !== user?.id && (
                    <div className="mt-3 flex items-center space-x-4">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('reviewComponents.helpfulVote')}
                      </span>
                      <button
                        onClick={() => handleHelpfulVote(review.id, true)}
                        className={`flex items-center text-xs ${
                          review.isHelpful === true
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-green-600 dark:hover:text-green-400'
                        } transition-colors duration-200`}
                      >
                        <ThumbsUp size={14} className="mr-1" />
                        {t('reviewComponents.yes')} {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                      </button>
                      <button
                        onClick={() => handleHelpfulVote(review.id, false)}
                        className={`flex items-center text-xs ${
                          review.isHelpful === false
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400'
                        } transition-colors duration-200`}
                      >
                        <ThumbsDown size={14} className="mr-1" />
                        {t('reviewComponents.no')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {reviewCount > 3 && (
            <div className="text-center pt-4">
              <button className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium transition-all duration-200">
                {t('reviewComponents.loadMoreReviews')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  )
}