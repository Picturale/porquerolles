import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import '../styles/SimilarPosts.css';

function SimilarPosts({ currentPostId, authorId, hashtags = [] }) {
  const [similarPosts, setSimilarPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarPosts = async () => {
      setLoading(true);
      
      try {
        let postsQuery;
        
        // Si on a des hashtags, chercher des posts avec des hashtags similaires
        if (hashtags && hashtags.length > 0) {
          postsQuery = query(
            collection(db, 'posts'),
            where('hashtags', 'array-contains-any', hashtags.slice(0, 3)), // Max 3 hashtags pour la requête
            orderBy('createdAt', 'desc'),
            limit(6)
          );
        } else {
          // Sinon, chercher d'autres posts du même auteur
          postsQuery = query(
            collection(db, 'posts'),
            where('userId', '==', authorId),
            orderBy('createdAt', 'desc'),
            limit(6)
          );
        }

        const querySnapshot = await getDocs(postsQuery);
        const posts = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(post => post.id !== currentPostId) // Exclure le post actuel
          .slice(0, 4); // Limiter à 4 posts

        setSimilarPosts(posts);
      } catch (error) {
        console.error('Erreur lors du chargement des posts similaires:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentPostId && authorId) {
      fetchSimilarPosts();
    }
  }, [currentPostId, authorId, hashtags]);

  if (loading) {
    return (
      <div className="similar-posts-section">
        <h3>Publications similaires</h3>
        <div className="similar-posts-loading">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (similarPosts.length === 0) {
    return null;
  }

  return (
    <div className="similar-posts-section">
      <h3>Publications similaires</h3>
      <div className="similar-posts-grid">
        {similarPosts.map(post => (
          <div key={post.id} className="similar-post-item">
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimilarPosts;
