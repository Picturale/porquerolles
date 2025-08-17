import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaComment } from 'react-icons/fa';
import { db } from '../firebase';

function CommentsCountDisplay({ postId }) {
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (!postId) return;

    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('postId', '==', postId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCommentCount(snapshot.size);
    }, (error) => {
      console.error('Erreur lors de la récupération des commentaires:', error);
    });

    return () => unsubscribe();
  }, [postId]);

  return (
    <div className="comments-indicator">
      <FaComment className="comments-icon" />
      <span className="comments-number">{commentCount}</span>
      <span className="comments-label">commentaire{commentCount > 1 ? 's' : ''}</span>
    </div>
  );
}

export default CommentsCountDisplay;
