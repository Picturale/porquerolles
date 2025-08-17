import express from 'express';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase-admin/firestore';
import { auth, db } from '../firebase.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', req.params.id));
    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (registration)
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;
    
    // Check if username already exists
    const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
    const usernameSnapshot = await getDocs(usernameQuery);
    if (!usernameSnapshot.empty) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName
    });
    
    // Create user document in Firestore
    const userDocRef = await addDoc(collection(db, 'users'), {
      uid: userRecord.uid,
      email,
      username,
      fullName,
      profilePicture: '',
      bio: '',
      followers: [],
      following: [],
      createdAt: new Date()
    });
    
    res.status(201).json({
      message: 'User created successfully',
      userId: userDocRef.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  // Firebase Auth is handled on client side
  // This endpoint can be used for additional server-side validation if needed
  res.status(200).json({ message: 'Authentication is handled client-side with Firebase Auth' });
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const userDocRef = doc(db, 'users', req.params.id);
    await updateDoc(userDocRef, req.body);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await deleteDoc(doc(db, 'users', req.params.id));
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
