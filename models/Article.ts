import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IArticle extends Document {
  title: string
  subtitle?: string
  content: string[]
  author: mongoose.Types.ObjectId
  authorName?: string
  publishedDate: Date
  mainImage: {
    url: string
    public_id: string
    alt?: string
  }
  miniImage?: {
    url: string
    public_id: string
    alt?: string
  }
  subImages: Array<{
    url: string
    public_id: string
    alt?: string
    order: number
  }>
  status: 'draft' | 'published'
  category: 'news' | 'entertainment' | 'sports' | 'health-fitness' | 'editorial' | 'technology' | 'automobiles'
  slug: string
  views?: number
  isTopStory?: boolean
  isMiniTopStory?: boolean
  isLatest?: boolean
  isTrending?: boolean
  createdAt: Date
  updatedAt: Date
}

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      index: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    content: {
      type: [String],
      required: [true, 'Article content is required'],
      validate: {
        validator: (v: string[]) => v.length >= 2 && v.every(p => p && p.trim().length > 0),
        message: 'Article must have exactly 2 paragraphs',
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Author is required'],
      // No cascade delete - articles preserve authorName even if author is deleted
    },
    authorName: {
      type: String,
      trim: true,
      // Always store author name - required for new articles, preserved for existing ones
      // This ensures articles remain intact even if author is deleted
    },
    publishedDate: {
      type: Date,
      required: [true, 'Published date is required'],
    },
    mainImage: {
      url: {
        type: String,
        required: [true, 'Main image is required'],
      },
      public_id: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
      },
    },
    miniImage: {
      url: {
        type: String,
        required: [true, 'Mini image is required'],
      },
      public_id: {
        type: String,
        required: [true, 'Mini image public_id is required'],
      },
      alt: {
        type: String,
      },
    },
    subImages: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    category: {
      type: String,
      enum: ['news', 'entertainment', 'sports', 'health-fitness', 'editorial', 'technology', 'automobiles'],
      required: [true, 'Category is required'],
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isTopStory: {
      type: Boolean,
      default: false,
      index: true,
    },
    isMiniTopStory: {
      type: Boolean,
      default: false,
      index: true,
    },
    isLatest: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for optimized queries with 100k+ articles
// These indexes significantly improve query performance for common query patterns
ArticleSchema.index({ status: 1, category: 1, createdAt: -1 }) // Category pages
ArticleSchema.index({ status: 1, isTopStory: 1, createdAt: -1 }) // Top stories
ArticleSchema.index({ status: 1, isMiniTopStory: 1, createdAt: -1 }) // Mini top stories
ArticleSchema.index({ status: 1, isTrending: 1, createdAt: -1 }) // Trending articles
ArticleSchema.index({ status: 1, isLatest: 1, category: 1, createdAt: -1 }) // Latest by category
ArticleSchema.index({ slug: 1, status: 1 }) // Article lookup by slug
ArticleSchema.index({ createdAt: -1 }) // General sorting by creation date

// Generate slug from title before saving - includes full title
ArticleSchema.pre('save', async function (this: IArticle) {
  // Ensure authorName is always stored when saving
  if (!this.authorName && this.author) {
    try {
      const Author = mongoose.model('Author')
      const authorDoc = await Author.findById(this.author)
      if (authorDoc) {
        this.authorName = authorDoc.name
      }
    } catch (error) {
      // If author doesn't exist (was deleted), keep existing authorName
      // This ensures articles remain intact even if author is deleted
      console.warn('Author not found when saving article, preserving existing authorName')
    }
  }
  
  if (this.isModified('title') && !this.slug) {
    const title = String(this.title || '')
    // Convert to lowercase, replace spaces and special chars with hyphens
    // Keep the full title (limit to 200 chars for URL length)
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
    
    // Limit length but keep full title words (max 200 chars)
    if (slug.length > 200) {
      slug = slug.substring(0, 200).replace(/-+$/, '') // Remove trailing hyphen if cut mid-word
    }
    
    this.slug = slug
  }
})

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)

export default Article
