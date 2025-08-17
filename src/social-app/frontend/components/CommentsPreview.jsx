import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import FormattedText from './FormattedText';

function CommentsPreview({ postId, onViewAllComments, onCommentCountChange, onShowCommentsModal }) {
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [userProfiles, setUserProfiles] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(new Set());

  // Stabiliser la callback pour éviter de recréer les abonnements
  const countCbRef = useRef(onCommentCountChange);
  useEffect(() => {
    countCbRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  // Fonction optimisée pour récupérer le profil utilisateur
  const fetchUserProfile = async (userId) => {
    if (!userId || userProfiles[userId] || loadingProfiles.has(userId)) return;

    // Marquer comme en cours de chargement
    setLoadingProfiles((prev) => new Set(prev).add(userId));

    try {
      const userQuery = query(collection(db, 'users'), where('uid', '==', userId));

      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setUserProfiles((prev) => ({
          ...prev,
          [userId]: userData,
        }));
      } else {
        // Marquer comme non trouvé pour éviter les tentatives répétées
        setUserProfiles((prev) => ({
          ...prev,
          [userId]: null,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      // En cas d'erreur, marquer comme null pour éviter les re-tentatives
      setUserProfiles((prev) => ({
        ...prev,
        [userId]: null,
      }));
    } finally {
      // Retirer du set de chargement
      setLoadingProfiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (!postId) return;

    // Requête pour les 5 premiers commentaires à afficher
    const commentsRef = collection(db, 'comments');
    const commentsQuery = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    // Requête pour compter tous les commentaires
    const countQuery = query(commentsRef, where('postId', '==', postId));

    const unsubscribeComments = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData);

        // Récupérer les profils utilisateur pour chaque commentaire
        commentsData.forEach((comment) => {
          if (comment.userId) {
            fetchUserProfile(comment.userId);
          }
        });
      },
      (error) => {
        console.error('Erreur lors de la récupération des commentaires:', error);
      }
    );

    const unsubscribeCount = onSnapshot(
      countQuery,
      (snapshot) => {
        const totalCount = snapshot.size;
        setCommentCount(totalCount);

        // Informer le parent du nombre total de commentaires
        if (countCbRef.current) {
          try {
            countCbRef.current(totalCount);
          } catch {}
        }
      },
      (error) => {
        console.error('Erreur lors du comptage des commentaires:', error);
      }
    );

    return () => {
      unsubscribeComments();
      unsubscribeCount();
    };
  }, [postId]);

  return (
    <div className="comments-preview">
      {comments.length > 0 ? (
        <>
          {comments.map((comment) => {
            const userProfile = userProfiles[comment.userId];
            const isProfileLoading = loadingProfiles.has(comment.userId);

            // Priorité pour le nom d'utilisateur : profil DB > commentaire > fallback
            const displayName = userProfile?.username || comment.username || 'Utilisateur';

            // Priorité pour le username : profil DB > commentaire
            const username = userProfile?.username || comment.username;

            return (
              <div key={comment.id} className="comment-preview-item comment-thread">
                <div className="comment-main-content">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="comment-author-info">
                        {username && !isProfileLoading ? (
                          <Link
                            to={`/profile/${username}`}
                            className="comment-author-link"
                            title={`Voir le profil de ${username}`}
                          >
                            {username}
                          </Link>
                        ) : (
                          <span
                            className={`comment-author-name ${isProfileLoading ? 'loading' : ''}`}
                          >
                            {displayName}
                          </span>
                        )}
                        {comment.createdAt && (
                          <span className="comment-date">
                            {new Date(comment.createdAt.seconds * 1000).toLocaleDateString(
                              'fr-FR',
                              {
                                day: 'numeric',
                                month: 'short',
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="comment-content">
                    <div className="comment-text-container">
                      <div className="comment-text">
                        <FormattedText
                          text={comment.content}
                          className="comment-text"
                          showMentionTooltip={true}
                          showHashtagTooltip={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {commentCount > 5 && onViewAllComments && (
            <button className="view-all-comments-btn" onClick={onViewAllComments}>
              Voir tous les commentaires ({commentCount})
            </button>
          )}
        </>
      ) : (
        <div className="no-comments-message">
          <p>Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
          <button
            className="view-all-comments-btn"
            onClick={onViewAllComments}
            style={{ marginTop: '8px' }}
          >
            Ajouter un commentaire
          </button>
        </div>
      )}
    </div>
  );
}

export default CommentsPreview;
