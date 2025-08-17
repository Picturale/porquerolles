import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Create a new post
 * @param {Object} postData - Post data including title, caption, mediaType
 * @param {File} file - Image or video file to upload
 * @param {Function} setProgress - Progress callback function
 * @returns {string} - New post ID
 */
export const createPost = async (postData, file, setProgress = () => {}) => {
  try {
    let downloadURL = '';
    
    // Upload file if provided
    if (file) {
      const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Wait for upload to complete
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(Math.round(progress));
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error('Erreur lors de l\'upload du fichier'));
          },
          async () => {
            try {
              downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    }
    
    // Create post document
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      imageUrl: downloadURL,
      likes: [],
      comments: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    setProgress(100);
    return docRef.id;
    
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Update an existing post
 * @param {string} postId - Post ID to update
 * @param {Object} postData - Updated post data
 * @param {File} file - Optional new file to upload
 * @param {Function} setProgress - Progress callback function
 */
export const updatePost = async (postId, postData, file = null, setProgress = () => {}) => {
  try {
    const postRef = doc(db, 'posts', postId);
    let updateData = {
      ...postData,
      updatedAt: serverTimestamp()
    };
    
    // Upload new file if provided
    if (file) {
      const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Wait for upload to complete
      const downloadURL = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(Math.round(progress));
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error('Erreur lors de l\'upload du fichier'));
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
      
      updateData.imageUrl = downloadURL;
    }
    
    // Update post document
    await updateDoc(postRef, updateData);
    setProgress(100);
    
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Get a post by ID
 * @param {string} postId - Post ID
 * @returns {Object} - Post data
 */
export const getPostById = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      return {
        id: postSnap.id,
        ...postSnap.data()
      };
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};
