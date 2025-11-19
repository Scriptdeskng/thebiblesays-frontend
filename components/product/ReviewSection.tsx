'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Review } from '@/types/product.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDate, getInitials } from '@/utils/format';
import { cn } from '@/utils/cn';

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export const ReviewSection = ({ productId, reviews, rating, reviewCount }: ReviewSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/shop/${productId}`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmitReview = () => {
    setIsModalOpen(false);
    setNewReview({ rating: 5, comment: '' });
  };

  const loadMoreReviews = () => {
    setVisibleReviews(prev => prev + 3);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">Reviews</h3>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={cn(
                  "text-lg",
                  i < Math.floor(rating) ? "text-yellow-500" : "text-accent-2"
                )}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-grey">
              {rating} ({reviewCount} reviews)
            </span>
          </div>
        </div>
        <Button onClick={handleWriteReview} variant="outline">
          Write a Review
        </Button>
      </div>

      <div className="space-y-6">
        {reviews.slice(0, visibleReviews).map((review) => (
          <div key={review.id} className="border-b border-accent-2 pb-6 last:border-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">
                {review.userImage ? (
                  <img src={review.userImage} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(review.userName.split(' ')[0], review.userName.split(' ')[1] || '')
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-primary">{review.userName}</h4>
                  <span className="text-sm text-grey">{formatDate(review.createdAt)}</span>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={cn(
                      "text-sm",
                      i < review.rating ? "text-yellow-500" : "text-accent-2"
                    )}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-grey">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleReviews < reviews.length && (
        <div className="mt-6 text-center">
          <Button onClick={loadMoreReviews} variant="outline">
            Load More Reviews
          </Button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Write a Review"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={user ? `${user.firstName} ${user.lastName}` : ''}
            disabled
          />
          
          <div>
            <label className="block text-sm font-medium text-grey mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="text-3xl transition-colors"
                >
                  <span className={star <= newReview.rating ? "text-yellow-500" : "text-accent-2"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-grey mb-2">Your Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full px-4 py-2.5 border border-accent-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={4}
              placeholder="Share your thoughts about this product..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              className="flex-1"
              disabled={!newReview.comment.trim()}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};