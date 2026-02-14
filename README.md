# The Civic Posts

A production-ready Next.js application built with TypeScript, Tailwind CSS, MongoDB, and Cloudinary.

## Features

- ⚡ **Next.js 15** - Latest version with App Router
- 🔷 **TypeScript** - Type-safe development
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔤 **Google Fonts** - Optimized font loading with Inter, Roboto, and Playfair Display
- 🗄️ **MongoDB** - Database integration with Mongoose
- ☁️ **Cloudinary** - Image storage and optimization
- ✅ **ESLint** - Code linting and quality checks
- 🚀 **Production Ready** - Optimized for performance

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory and add the following:

```env
# MongoDB Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Authentication
ADMIN_EMAIL=admin@thecivicposts.com
ADMIN_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_key_here

# Site URL (for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Getting Your Credentials

#### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with your database name

#### Cloudinary Setup:
1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Go to Dashboard
4. Copy your:
   - Cloud Name
   - API Key
   - API Secret

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
thecivicposts/
├── app/                 # App Router directory
│   ├── api/            # API routes
│   │   └── upload/     # Image upload endpoint
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   └── HeaderNav.tsx
├── lib/                # Utility functions
│   ├── mongodb.ts      # MongoDB connection
│   ├── cloudinary.ts   # Cloudinary configuration
│   └── db-helpers.ts   # Database helpers
├── public/             # Static assets
├── next.config.js      # Next.js configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies
```

## Environment Variables

### Required Variables:

- `MONGODB_URI` - MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Optional Variables:

- `NEXT_PUBLIC_SITE_URL` - Site URL for metadata (defaults to localhost:3000)

## Database Connection

The MongoDB connection is handled automatically using a cached connection pattern to prevent multiple connections during development.

## Image Upload

Images can be uploaded via the `/api/upload` endpoint:

```typescript
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

const { url, public_id } = await response.json()
```

## Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add your environment variables in Vercel dashboard
4. Vercel will automatically detect Next.js and configure the build

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)