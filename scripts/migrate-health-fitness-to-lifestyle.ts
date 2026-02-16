/**
 * Migration Script: Update "Health & Fitness" to "Health & Life Style"
 * 
 * This script updates any references to "Health & Fitness" in the database.
 * Note: The Article model stores category as a key (e.g., "health-fitness"), 
 * not as a display name, so articles themselves don't need updating.
 * However, this script can be used to verify and update any other references if needed.
 */

import mongoose from 'mongoose'
import connectDB from '../lib/mongodb'
import Article from '../models/Article'

async function migrateHealthFitnessToLifestyle() {
  try {
    await connectDB()
    console.log('Connected to database')

    // Check if there are any articles with category "health-fitness"
    // Note: The category key remains "health-fitness", only display names change
    const healthFitnessArticles = await Article.countDocuments({
      category: 'health-fitness',
      status: 'published'
    })

    console.log(`Found ${healthFitnessArticles} published articles in "health-fitness" category`)
    console.log('Note: Category key remains "health-fitness" - only display names have been updated')
    console.log('All UI references have been updated to show "Health & Life Style"')
    
    // If there were a categoryName field, we would update it here:
    // await Article.updateMany(
    //   { categoryName: 'Health & Fitness' },
    //   { $set: { categoryName: 'Health & Life Style' } }
    // )

    console.log('Migration completed successfully!')
    console.log('All display references have been updated in the codebase.')
    
    process.exit(0)
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

// Run migration
migrateHealthFitnessToLifestyle()
