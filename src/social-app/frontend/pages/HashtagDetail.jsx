import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import PostViewSwitcher from '../components/PostViewSwitcher';
import { db } from '../firebase';
import '../styles/HashtagDetail.css';

function HashtagDetail() {
  const { hashtag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsByHashtag = async () => {
      try {
        setLoading(true);
        
        // Recherche dans la collection des posts
        const postsRef = collection(db, "posts");
        const q = query(
          postsRef, 
          where("hashtags", "array-contains", hashtag.toLowerCase())
        );
        
        const querySnapshot = await getDocs(q);
        const hashtagPosts = [];
        
        querySnapshot.forEach((doc) => {
          hashtagPosts.push({ id: doc.id, ...doc.data() });
        });
        
        // Tri par date décroissante (plus récents d'abord)
        hashtagPosts.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        
        setPosts(hashtagPosts);
      } catch (error) {
        console.error('Erreur lors du chargement des posts par hashtag:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hashtag) {
      fetchPostsByHashtag();
    }
  }, [hashtag]);

  return (
    <div className="hashtag-detail">
      <div className="hashtag-header">
        <h1>#{hashtag}</h1>
        <p>{posts.length} publication{posts.length > 1 ? 's' : ''} avec ce hashtag</p>
      </div>
      <div className="hashtag-posts">
        {loading ? (
          <LoadingSpinner fullScreen={false} text="Chargement des publications..." />
        ) : posts.length > 0 ? (
          <PostViewSwitcher posts={posts} />
        ) : (
          <div className="no-posts">
            <p>Aucune publication trouvée avec le hashtag #{hashtag}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HashtagDetail;
