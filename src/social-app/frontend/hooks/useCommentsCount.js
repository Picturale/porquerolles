import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

// Hook personnalisé pour compter les commentaires d'un post
// Utilise la même logique que CommentsPreview pour garantir la cohérence
function useCommentsCount(postId) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentsCount = async () => {
      if (!postId) {
        setCount(0);
        setLoading(false);
        return;
      }

      try {
        // Même requête que CommentsPreview pour la cohérence
        const commentsQuery = query(
          collection(db, 'comments'),
          where('postId', '==', postId)
        );
        
        const querySnapshot = await getDocs(commentsQuery);
        const commentsCount = querySnapshot.size;
        
        // Debug temporaire pour diagnostiquer le problème
        if (process.env.NODE_ENV === 'development') {
        }
        
        setCount(commentsCount);
      } catch (error) {
        console.error('Error fetching comments count for post', postId, ':', error);
        // En cas d'erreur, garder le compte précédent plutôt que de le remettre à 0
        // setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCommentsCount();
  }, [postId]);

  return { count, loading };
}

export default useCommentsCount;
