const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Function to make a user an admin
exports.makeUserAdmin = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can make admin requests'
    );
  }

  // Check if the requester is already an admin
  const adminUid = context.auth.uid;
  const adminDoc = await admin.firestore().collection('users').doc(adminUid).get();

  // Only allow existing admins to create other admins
  // First admin must be created manually in the Firebase console or using Firebase CLI
  if (!adminDoc.exists || !adminDoc.data().isAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can create other admins'
    );
  }

  // Get the user ID from the request
  const uid = data.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID is required'
    );
  }

  try {
    // Update the user in Firestore
    await admin.firestore().collection('users').doc(uid).update({
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: `User ${uid} is now an admin` };
  } catch (error) {
    console.error('Error making user admin:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to make user admin'
    );
  }
});
