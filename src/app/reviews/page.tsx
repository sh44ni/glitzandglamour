'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import ReviewCard from '@/components/ReviewCard';
import StarRating from '@/components/StarRating';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ReviewData, PaginatedReviews } from '@/types';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        reviewText: '',
    });
    const [errors, setErrors] = useState<{ name?: string; reviewText?: string }>({});

    // Fetch reviews
    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/reviews?page=${page}&limit=10`);
            const data: PaginatedReviews = await response.json();
            setReviews(data.reviews);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleRatingChange = (rating: number) => {
        setFormData((prev) => ({ ...prev, rating }));
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.reviewText.trim()) {
            newErrors.reviewText = 'Review is required';
        } else if (formData.reviewText.length < 10) {
            newErrors.reviewText = 'Review must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    date: new Date().toISOString().split('T')[0],
                    timestamp: new Date().toISOString(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            setIsSuccess(true);
            setFormData({ name: '', rating: 5, reviewText: '' });
            fetchReviews(); // Refresh reviews
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : 'Something went wrong. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in bg-[#0A0A0A] min-h-screen">
            {/* Hero Section */}
            <section className="py-16 relative overflow-hidden">
                {/* Decorative bow */}
                <div className="absolute top-10 right-10 opacity-10">
                    <svg width="60" height="36" viewBox="0 0 40 24" fill="#FF1493">
                        <ellipse cx="10" cy="12" rx="10" ry="8" />
                        <ellipse cx="30" cy="12" rx="10" ry="8" />
                        <circle cx="20" cy="12" r="5" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Client </span>
                        <span className="text-[#FF1493]">Reviews</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        See what our clients are saying about their experience at Glitz & Glamour Studio
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Reviews List */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                What Our Clients Say
                            </h2>

                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : reviews.length === 0 ? (
                                <Card>
                                    <p className="text-center text-gray-500 py-8">
                                        No reviews yet. Be the first to leave a review!
                                    </p>
                                </Card>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-4 mt-8">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-gray-400">
                                                Page {page} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Review Form */}
                        <div>
                            <Card padding="lg" hover={false}>
                                <h2 className="text-xl font-bold text-white mb-6">
                                    Leave a Review
                                </h2>

                                {isSuccess ? (
                                    <div className="text-center py-6">
                                        <div className="w-14 h-14 bg-[#FF1493]/20 border-2 border-[#FF1493] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-7 w-7 text-[#FF1493]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-white font-semibold mb-2">Thank you!</p>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Your review has been submitted.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsSuccess(false)}
                                        >
                                            Write Another Review
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {submitError && (
                                            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                                {submitError}
                                            </div>
                                        )}

                                        <Input
                                            label="Your Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            error={errors.name}
                                            placeholder="Your name"
                                            required
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Your Rating
                                            </label>
                                            <StarRating
                                                rating={formData.rating}
                                                onChange={handleRatingChange}
                                                size="lg"
                                            />
                                        </div>

                                        <Textarea
                                            label="Your Review"
                                            name="reviewText"
                                            value={formData.reviewText}
                                            onChange={handleChange}
                                            error={errors.reviewText}
                                            placeholder="Share your experience..."
                                            maxLength={500}
                                            showCharCount
                                            required
                                        />

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            fullWidth
                                            isLoading={isSubmitting}
                                        >
                                            Submit Review
                                        </Button>
                                    </form>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
