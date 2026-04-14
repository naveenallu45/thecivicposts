import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IArticle extends Document {
  title: string
  subtitle?: string
  content: string[]
  author: mongoose.Types.ObjectId
  authorName?: string
  publisher?: mongoose.Types.ObjectId
  publishedDate: Date
  publishedAt?: Date
  mainImage?: {
    url: string
    public_id: string
    alt?: string
  }
  mainImages?: Array<{
    url: string
    public_id: string
    alt?: string
  }>
  miniImage?: {
    url: string
    public_id: string
    alt?: string
  }
  miniImages?: Array<{
    url: string
    public_id: string
    alt?: string
  }>
  youtubeLink?: string
  youtubeLinks?: string[]
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
    publisher: {
      type: Schema.Types.ObjectId,
      ref: 'Publisher',
      // Optional - articles can be created by admin or publisher
    },
    publishedDate: {
      type: Date,
      required: [true, 'Published date is required'],
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    mainImage: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
      alt: {
        type: String,
      },
    },
    mainImages: [
      {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
        alt: {
          type: String,
        },
      },
    ],
    miniImage: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
      alt: {
        type: String,
      },
    },
    miniImages: [
      {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
        alt: {
          type: String,
        },
      },
    ],
    youtubeLink: {
      type: String,
      trim: true,
    },
    youtubeLinks: {
      type: [String],
      default: [],
      validate: {
        validator: (links: string[]) => Array.isArray(links) && links.every(link => typeof link === 'string'),
        message: 'YouTube links must be an array of strings',
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
ArticleSchema.index({ status: 1, publisher: 1, publishedDate: -1 }) // Publisher statistics

// Generate slug from title before saving - includes full title
ArticleSchema.pre('save', async function (this: IArticle) {
  // Keep legacy and new YouTube fields in sync.
  const normalizedLinks = (this.youtubeLinks || [])
    .map(link => String(link || '').trim())
    .filter(Boolean)
  if (normalizedLinks.length > 0) {
    this.youtubeLinks = normalizedLinks
    this.youtubeLink = normalizedLinks[0]
  } else {
    const singleLink = String(this.youtubeLink || '').trim()
    this.youtubeLinks = singleLink ? [singleLink] : []
    this.youtubeLink = singleLink || undefined
  }

  // Keep single and multiple mini image fields in sync.
  const normalizedMiniImages = (this.miniImages || [])
    .filter(img => img && img.url && img.public_id)
    .slice(0, 4)
  if (normalizedMiniImages.length > 0) {
    this.miniImages = normalizedMiniImages
    this.miniImage = normalizedMiniImages[0]
  } else if (this.miniImage?.url && this.miniImage?.public_id) {
    this.miniImages = [this.miniImage]
  } else {
    this.miniImages = []
    this.miniImage = undefined
  }

  // Keep single and multiple main image fields in sync.
  const normalizedMainImages = (this.mainImages || [])
    .filter(img => img && img.url && img.public_id)
    .slice(0, 4)
  if (normalizedMainImages.length > 0) {
    this.mainImages = normalizedMainImages
    this.mainImage = normalizedMainImages[0]
  } else if (this.mainImage?.url && this.mainImage?.public_id) {
    this.mainImages = [this.mainImage]
  } else {
    this.mainImages = []
    this.mainImage = undefined
  }

  // Preserve actual publish timestamp for draft -> publish transitions.
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  if (this.status === 'draft') {
    this.publishedAt = undefined
  }

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
