# Glitz & Glamour Studio

A minimal, elegant nail salon website for **Glitz & Glamour Studio** by Jolany Lavalle, located in Oceanside, CA.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## 🌟 Features

- **Modern Design**: Clean, minimal aesthetic with hot pink, black, and white color palette
- **Mobile-First**: Fully responsive design optimized for all devices
- **7 Pages**: Home, Services, Gallery, Booking, Reviews, Policy, Contact
- **Email Notifications**: Booking and contact form submissions via Resend
- **Review System**: File-based review storage (easy to upgrade to database)
- **SEO Optimized**: Full meta tags, Open Graph, and structured data
- **Accessible**: ARIA labels, keyboard navigation, focus management
- **Fast**: Optimized for Core Web Vitals and Lighthouse scores

## 📁 Project Structure

```
glitzandglamourmvp/
├── data/
│   └── reviews.json          # File-based review storage
├── public/
│   └── gallery/              # Gallery images (add your images here)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── bookings/     # POST: Booking submissions
│   │   │   ├── contact/      # POST: Contact form
│   │   │   ├── gallery/      # GET: Gallery images
│   │   │   └── reviews/      # GET/POST: Reviews
│   │   ├── book/             # Booking page
│   │   ├── contact/          # Contact page
│   │   ├── gallery/          # Gallery page
│   │   ├── policy/           # Policy page
│   │   ├── reviews/          # Reviews page
│   │   ├── services/         # Services page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   └── ...               # Feature components
│   ├── data/
│   │   └── services.ts       # Service pricing data
│   ├── lib/
│   │   └── email.ts          # Email service abstraction
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── .env.example              # Environment variables template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glitzandglamourmvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   - `PINGRAM_FROM_EMAIL`: Sender email address shown on all transactional emails (e.g. `info@glitzandglamours.com`)
   - `CONTACT_EMAIL`: Email to receive notifications
   - `NEXT_PUBLIC_SITE_URL`: Your production URL

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📧 Email Configuration

Transactional email is delivered via **Pingram** (same plan and API key used for SMS — no separate provider needed).

### Development Mode
- Email sending is skipped when `PINGRAM_API_KEY` is not set (logs `[EMAIL SKIPPED]` to console).

### Production Mode
1. Verify your domain under Pingram → Domains (SPF + DKIM).
2. Set `PINGRAM_FROM_EMAIL` and `PINGRAM_FROM_NAME` in your environment.
3. Test from Admin → Notifications → Diagnostics → Email tab.

## 📸 Adding Gallery Images

1. Add images to `public/gallery/` directory
2. Update the gallery API in `src/app/api/gallery/route.ts`
3. Or connect to a CMS for dynamic image management

## 🎨 Customization

### Colors
Edit `src/app/globals.css`:
```css
:root {
  --color-primary: #FF69B4;    /* Hot Pink */
  --color-primary-dark: #E5559A;
}
```

### Services & Pricing
Edit `src/data/services.ts` to update service names, prices, and descriptions.

### Business Information
- Update contact info in `src/components/Footer.tsx`
- Update business hours in the Footer and Contact page
- Replace logo placeholder in `src/components/Logo.tsx`

## 🔄 Upgrading to Database

The codebase is structured to easily migrate from file-based storage to a database:

### Reviews (Current: JSON file)
```typescript
// In src/app/api/reviews/route.ts
// Replace file operations with Prisma queries:
// const reviews = await prisma.review.findMany();
// await prisma.review.create({ data: reviewData });
```

### Bookings (Current: Email only)
```typescript
// In src/app/api/bookings/route.ts
// Add database storage:
// const booking = await prisma.booking.create({ data: bookingData });
```

### Recommended Stack
- **Prisma** + **PostgreSQL** for production
- **MongoDB** as an alternative
- **Supabase** for a managed solution

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production
```
PINGRAM_FROM_EMAIL=info@glitzandglamours.com
PINGRAM_FROM_NAME=Glitz & Glamour
CONTACT_EMAIL=glitzandglamourstudio@email.com
NEXT_PUBLIC_SITE_URL=https://glitzandglamourstudio.com
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | POST | Submit booking request |
| `/api/reviews` | GET | Fetch paginated reviews |
| `/api/reviews` | POST | Submit new review |
| `/api/contact` | POST | Submit contact form |
| `/api/gallery` | GET | Fetch gallery images |

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📄 License

This project is licensed for use by Glitz & Glamour Studio.

---

**Built with ❤️ for Glitz & Glamour Studio by Jolany Lavalle**
