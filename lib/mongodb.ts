import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

// Validate URI format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  throw new Error(
    `Invalid MONGODB_URI format. Must start with "mongodb://" or "mongodb+srv://". Got: ${MONGODB_URI.substring(0, 50)}...`
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  // Check if already connected
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    // Validate URI format
    if (!MONGODB_URI || (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://'))) {
      throw new Error(
        `Invalid MONGODB_URI format. Got: ${MONGODB_URI?.substring(0, 50) || 'undefined'}...`
      )
    }

    // Optimized connection options for production with 100k+ articles
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for better reliability
      socketTimeoutMS: 45000, // Increased to 45 seconds for build stability
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      family: 4, // Use IPv4, skip trying IPv6
      // Read preference for better performance
      readPreference: 'primary', // Use primary for single database setup - faster reads
      // Retry options
      retryWrites: true,
      retryReads: true,
    }

    // Only add TLS options if using mongodb+srv (Atlas)
    if (MONGODB_URI.startsWith('mongodb+srv://')) {
      opts.tls = true
      opts.tlsAllowInvalidCertificates = false
      opts.tlsAllowInvalidHostnames = false
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance
    }).catch((error: unknown) => {
      // Clear promise on error to allow retry
      cached.promise = null
      
      // Provide helpful error messages for common issues
      if (error && typeof error === 'object' && ('code' in error || 'syscall' in error)) {
        const mongoError = error as { code?: string; syscall?: string; hostname?: string; name?: string }
        if (mongoError.code === 'ECONNREFUSED' || mongoError.code === 'ENOTFOUND' || mongoError.syscall === 'querySrv') {
          const hostname = mongoError.hostname || MONGODB_URI.match(/@([^/]+)/)?.[1] || 'unknown'
          const enhancedError = new Error(
            `MongoDB connection failed: Cannot connect to ${hostname}\n\n` +
            `Possible causes:\n` +
            `1. MongoDB Atlas cluster is paused or deleted\n` +
            `2. Network connectivity issues or DNS resolution failure\n` +
            `3. Incorrect connection string in .env.local\n` +
            `4. IP address not whitelisted in MongoDB Atlas Network Access\n\n` +
            `To fix:\n` +
            `- Check your MongoDB Atlas dashboard to ensure the cluster is running\n` +
            `- Verify your MONGODB_URI in .env.local is correct\n` +
            `- Ensure your IP address is whitelisted in MongoDB Atlas Network Access\n` +
            `- Try restarting your development server after fixing the connection string`
          )
          enhancedError.name = mongoError.name || 'MongoConnectionError'
          throw enhancedError
        }
      }
      
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
    if (!cached.conn) {
      throw new Error('Failed to establish database connection')
    }
  } catch (e: unknown) {
    // Clear cache on error to allow retry
    cached.promise = null
    cached.conn = null
    
    // Re-throw with enhanced error message if it's a connection error
    if (e && typeof e === 'object' && ('code' in e || 'syscall' in e)) {
      const mongoError = e as { code?: string; syscall?: string }
      if (mongoError.code === 'ECONNREFUSED' || mongoError.code === 'ENOTFOUND' || mongoError.syscall === 'querySrv') {
        throw e // Already enhanced in the promise catch block
      }
    }
    
    throw e
  }

  return cached.conn
}

export default connectDB

declare global {
  var mongoose: MongooseCache | undefined
}
