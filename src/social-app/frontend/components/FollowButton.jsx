import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';
import { useFollow } from '../contexts/FollowContext';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import '../styles/FollowButton.css';

function FollowButton({ targetUserId, targetUsername }) {
  const { currentUser, userProfile } = useAuth();
  const { createNotification } = useNotifications();
  const { getFollowStatus, updateFollowStatus, updateFollowersCount, updateFollowingCount } = useFollow();
  const [loading, setLoading] = useState(false);
  const hasCheckedStatus = useRef(false);

  // Get follow status from context
  const isFollowing = getFollowStatus(targetUserId);

  // Check initial follow status ONCE
  useEffect(() => {
    if (!currentUser || !targetUserId || currentUser.uid === targetUserId || hasCheckedStatus.current) {
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (currentUserDoc.exists()) {
          const userData = currentUserDoc.data();
          const following = userData.following || [];
          const isCurrentlyFollowing = following.includes(targetUserId);
          
          // Update context with current status
          updateFollowStatus(targetUserId, isCurrentlyFollowing);
          hasCheckedStatus.current = true;
        }

      } catch (error) {
        console.error('💥 Error checking follow status:', error);
        hasCheckedStatus.current = true;
      }
    };

    checkFollowStatus();
  }, [currentUser?.uid, targetUserId]); // Simple dependencies only

  const handleFollowToggle = async () => {
    if (!currentUser || !targetUserId || currentUser.uid === targetUserId || loading) {
      return;
    }

    setLoading(true);

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      if (isFollowing) {
        // Unfollow
        
        await updateDoc(currentUserRef, {
          following: arrayRemove(targetUserId)
        });

        await updateDoc(targetUserRef, {
          followers: arrayRemove(currentUser.uid)
        });

        // Update context - use simple increment/decrement
        updateFollowStatus(targetUserId, false);
        updateFollowersCount(targetUserId, -1);
        updateFollowingCount(currentUser.uid, -1);
        
        // Créer une notification pour informer que l'utilisateur a arrêté de suivre
        if (userProfile?.username) {
          await createNotification({
            recipientId: targetUserId,
            type: 'unfollow',
            message: `${userProfile.username} ne vous suit plus`,
            senderName: userProfile.username,
            senderAvatar: userProfile.profilePicture
          });
        }
        
      } else {
        // Follow
        
        await updateDoc(currentUserRef, {
          following: arrayUnion(targetUserId)
        });

        await updateDoc(targetUserRef, {
          followers: arrayUnion(currentUser.uid)
        });

        // Update context - use simple increment/decrement
        updateFollowStatus(targetUserId, true);
        updateFollowersCount(targetUserId, 1);
        updateFollowingCount(currentUser.uid, 1);
        
        // Créer une notification pour l'utilisateur suivi
        if (userProfile?.username) {
          await createNotification({
            recipientId: targetUserId,
            type: 'follow',
            message: `${userProfile.username} a commencé à vous suivre`,
            senderName: userProfile.username,
            senderAvatar: userProfile.profilePicture
          });
        }
      }
        
    } catch (error) {
      console.error('💥 Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for current user's own profile
  if (!currentUser || currentUser.uid === targetUserId) {
    return null;
  }

  return (
    <div className="follow-button-container">
      <button
        className={`follow-button ${isFollowing ? 'following' : 'not-following'}`}
        onClick={handleFollowToggle}
        disabled={loading}
      >
        {loading ? (
          <span>⏳</span>
        ) : (
          <>
            {isFollowing ? (
              <>
                <FaUserCheck className="follow-icon" />
                <span>Suivi(e)</span>
              </>
            ) : (
              <>
                <FaUserPlus className="follow-icon" />
                <span>Suivre</span>
              </>
            )}
          </>
        )}
      </button>
    </div>
  );
}

export default FollowButton;
