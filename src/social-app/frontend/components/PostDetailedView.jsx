import { useEffect, useState } from 'react';
import '../styles/PostDetailedView.css';
import PostCard from './PostCard';

function PostDetailedView({ posts, showDeleteButton = false }) {
  const [currentPosts, setCurrentPosts] = useState(posts);
  
  // Mettre à jour les posts quand la prop change
  useEffect(() => {
    setCurrentPosts(posts);
  }, [posts]);
  
  const handlePostDeleted = (deletedPostId) => {
    setCurrentPosts(prevPosts => 
      prevPosts.filter(post => post.id !== deletedPostId)
    );
  };
  
  return (
    <div className="post-detailed-view">
      {currentPosts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          showDeleteButton={showDeleteButton}
          onPostDeleted={handlePostDeleted}
        />
      ))}
    </div>
  );
}

export default PostDetailedView;
