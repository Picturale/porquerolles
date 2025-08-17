// Migration script: Convert likes to ratings
// Usage: Run this script once to migrate existing likes to the new rating system

import { initializeApp } from 'firebase/app';
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    limit,
    query,
    setDoc,
    updateDoc
} from 'firebase/firestore';

// Firebase config (same as your app)
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateLikesToRatings() {
  console.log('🚀 Starting migration from likes to ratings...');
  
  try {
    // Get all posts
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    let migratedPosts = 0;
    let migratedRatings = 0;
    
    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data();
      const postId = postDoc.id;
      
      if (postData.likes && Array.isArray(postData.likes) && postData.likes.length > 0) {
        console.log(`📝 Migrating post ${postId} with ${postData.likes.length} likes...`);
        
        // Convert each like to a 5-star rating (default rating for migration)
        const ratingPromises = postData.likes.map(async (userId) => {
          const ratingRef = doc(db, 'ratings', `${postId}_${userId}`);
          return setDoc(ratingRef, {
            postId,
            userId,
            rating: 5, // Default rating for existing likes
            createdAt: new Date(),
            updatedAt: new Date(),
            migratedFromLike: true // Flag to indicate this was migrated
          });
        });
        
        await Promise.all(ratingPromises);
        
        // Update post with rating stats
        const ratingCount = postData.likes.length;
        const ratingTotal = postData.likes.length * 5; // All 5-star ratings
        
        await updateDoc(doc(db, 'posts', postId), {
          ratingCount,
          ratingTotal,
          // Keep likes for now (you can remove later if needed)
          migratedToRatings: true
        });
        
        migratedPosts++;
        migratedRatings += postData.likes.length;
        
        console.log(`✅ Migrated ${postData.likes.length} likes for post ${postId}`);
      }
    }
    
    console.log('🎉 Migration completed!');
    console.log('📊 Stats:');
    console.log(`   - Posts migrated: ${migratedPosts}`);
    console.log(`   - Ratings created: ${migratedRatings}`);
    console.log(`   - Average ratings per post: ${migratedRatings / migratedPosts || 0}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Test function to verify migration
async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    const postsSnapshot = await getDocs(query(collection(db, 'posts'), limit(5)));
    const ratingsSnapshot = await getDocs(query(collection(db, 'ratings'), limit(10)));
    
    console.log('📊 Sample verification:');
    console.log(`   - Total posts in sample: ${postsSnapshot.size}`);
    console.log(`   - Total ratings in sample: ${ratingsSnapshot.size}`);
    
    postsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.ratingCount || data.ratingTotal) {
        console.log(`   - Post ${doc.id}: ${data.ratingCount} ratings, total: ${data.ratingTotal}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Uncomment the function you want to run:
// migrateLikesToRatings();
// verifyMigration();

export { migrateLikesToRatings, verifyMigration };
