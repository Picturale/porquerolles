import express from 'express';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase-admin/firestore';
import { db } from '../firebase.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    // Get query parameters
    const { userId, page = 1, limit: postLimit = 10 } = req.query;
    const offset = (page - 1) * postLimit;
    
    let postsQuery;
    
    if (userId) {
      // Get posts by specific user
      postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(parseInt(postLimit))
      );
    } else {
      // Get all posts
      postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(parseInt(postLimit))
      );
    }
    
    const postsSnapshot = await getDocs(postsQuery);
    const posts = [];
    postsSnapshot.forEach(doc => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', req.params.id));
    if (!postDoc.exists()) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.status(200).json({ id: postDoc.id, ...postDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { userId, caption, imageUrl } = req.body;
    
    if (!userId || !imageUrl) {
      return res.status(400).json({ message: 'User ID and image URL are required' });
    }
    
    const postDocRef = await addDoc(collection(db, 'posts'), {
      userId,
      caption,
      imageUrl,
      likes: [],
      comments: 0,
      createdAt: new Date()
    });
    
    res.status(201).json({
      message: 'Post created successfully',
      postId: postDocRef.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update post
router.put('/:id', async (req, res) => {
  try {
    const postDocRef = doc(db, 'posts', req.params.id);
    const postDoc = await getDoc(postDocRef);
    
    if (!postDoc.exists()) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post (in a real app, verify user auth)
    // const post = postDoc.data();
    // if (post.userId !== req.user.id) {
    //   return res.status(403).json({ message: 'Unauthorized' });
    // }
    
    await updateDoc(postDocRef, {
      caption: req.body.caption
      // Only allow updating caption
    });
    
    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const postDocRef = doc(db, 'posts', req.params.id);
    const postDoc = await getDoc(postDocRef);
    
    if (!postDoc.exists()) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post (in a real app, verify user auth)
    // const post = postDoc.data();
    // if (post.userId !== req.user.id) {
    //   return res.status(403).json({ message: 'Unauthorized' });
    // }
    
    await deleteDoc(postDocRef);
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like or unlike a post
router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const postDocRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postDocRef);
    
    if (!postDoc.exists()) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const post = postDoc.data();
    const likes = post.likes || [];
    
    // Check if user already liked the post
    const userLikedIndex = likes.indexOf(userId);
    
    if (userLikedIndex === -1) {
      // Add like
      likes.push(userId);
      await updateDoc(postDocRef, { likes });
      res.status(200).json({ message: 'Post liked successfully' });
    } else {
      // Remove like
      likes.splice(userLikedIndex, 1);
      await updateDoc(postDocRef, { likes });
      res.status(200).json({ message: 'Post unliked successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
