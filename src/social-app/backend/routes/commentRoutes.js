import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();

// Get all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const commentsQuery = db.collection('comments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'desc');
    
    const commentsSnapshot = await commentsQuery.get();
    const comments = [];
    commentsSnapshot.forEach(doc => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a post
router.post('/', async (req, res) => {
  try {
    const { postId, userId, text } = req.body;
    
    if (!postId || !userId || !text) {
      return res.status(400).json({ message: 'Post ID, user ID, and comment text are required' });
    }
    
    // Check if post exists
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (!postDoc.exists()) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create comment
    const commentDocRef = await addDoc(collection(db, 'comments'), {
      postId,
      userId,
      text,
      createdAt: new Date()
    });
    
    // Update comment count on post
    const postData = postDoc.data();
    const commentCount = (postData.comments || 0) + 1;
    await postDoc.ref.update({ comments: commentCount });
    
    res.status(201).json({
      message: 'Comment added successfully',
      commentId: commentDocRef.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const commentId = req.params.id;
    const commentDocRef = doc(db, 'comments', commentId);
    
    const commentDoc = await getDoc(commentDocRef);
    if (!commentDoc.exists()) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const commentData = commentDoc.data();
    
    // Check if user owns the comment (in a real app, verify user auth)
    // if (commentData.userId !== req.user.id) {
    //   return res.status(403).json({ message: 'Unauthorized' });
    // }
    
    // Get post to update comment count
    const postDocRef = doc(db, 'posts', commentData.postId);
    const postDoc = await getDoc(postDocRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const commentCount = Math.max((postData.comments || 0) - 1, 0);
      await postDoc.ref.update({ comments: commentCount });
    }
    
    // Delete the comment
    await deleteDoc(commentDocRef);
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
