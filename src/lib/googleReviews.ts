export async function getGoogleReviews() {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA1dTHJlk5kx7_kRg8pPb-Tv54eKkXUU6o';
    const placeId = 'ChIJ3RFOSkV33IARbgQMG_K-XHY';
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=reviews&key=${apiKey}`;

    try {
        const res = await fetch(url, {
            next: { revalidate: 86400 } // Cache for 24 hours (86400 seconds) - maximum 1 request per day
        });
        
        if (!res.ok) {
            console.error('Failed to fetch Google Reviews:', await res.text());
            return [];
        }

        const data = await res.json();
        
        if (!data.reviews) return [];

        return data.reviews.map((r: any) => ({
            id: r.name,
            rating: r.rating,
            text: r.text?.text || r.originalText?.text || '',
            source: 'google',
            authorName: r.authorAttribution?.displayName || 'Google User',
            createdAt: r.publishTime,
            user: {
                name: r.authorAttribution?.displayName || 'Google User',
                image: r.authorAttribution?.photoUri || null,
            }
        }));
    } catch (error) {
        console.error('Error fetching Google Reviews:', error);
        return [];
    }
}
