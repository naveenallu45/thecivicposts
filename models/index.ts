// Import all models to ensure they are registered with Mongoose
// This must be imported before any model operations that use populate()

import Author from './Author'
import Article from './Article'
import Publisher from './Publisher'
import Settings from './Settings'

// Export models for convenience
export { Author, Article, Publisher, Settings }
export default { Author, Article, Publisher, Settings }
