import Card from '@/components/ui/Card';
import StarRating from '@/components/StarRating';
import { ReviewData } from '@/types';

interface ReviewCardProps {
    review: ReviewData;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Card>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FF1493] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {review.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <h4 className="font-semibold text-white">{review.name}</h4>
                        <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    <StarRating rating={review.rating} readonly size="sm" />
                    <p className="mt-3 text-gray-400 italic">&ldquo;{review.reviewText}&rdquo;</p>
                </div>
            </div>
        </Card>
    );
}
