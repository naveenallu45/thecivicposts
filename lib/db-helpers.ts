import connectDB from './mongodb'

/**
 * Helper function to ensure database connection before operations
 */
export async function withDB<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    await connectDB()
    return await operation()
  } catch (error) {
    console.error('Database operation error:', error)
    throw error
  }
}

/**
 * Check if database is connected
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const mongooseInstance = await connectDB()
    if (!mongooseInstance) {
      return false
    }
    return mongooseInstance.connection.readyState === 1
  } catch {
    return false
  }
}
