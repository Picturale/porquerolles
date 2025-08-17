import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EchoesService } from '../services/echoesService';
import { reportPost } from '../services/reportService';

const EchoesRating = ({ postId, postAuthorId, onRatingChange }) => {
  const { currentUser } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [ratings, setRatings] = useState({ intention: 3, composition: 3, matiere: 3, technique: 3, emotion: 3 });
  const [allRatings, setAllRatings] = useState([]);
  const [averageRatings, setAverageRatings] = useState({ intention: 0, composition: 0, matiere: 0, technique: 0, emotion: 0 });

  const isOwnPost = currentUser && currentUser.uid === postAuthorId;

  useEffect(() => {
    if (currentUser && postId) {
      if (isOwnPost) {
        (async () => {
          try {
            const postRatings = await EchoesService.getPostRatings(postId);
            setAllRatings(postRatings);
            if (postRatings.length > 0) {
              const totals = { intention: 0, composition: 0, matiere: 0, technique: 0, emotion: 0 };
              postRatings.forEach((r) => {
                totals.intention += r.intention || 0;
                totals.composition += r.composition || 0;
                totals.matiere += r.matiere || 0;
                totals.technique += r.technique || 0;
                totals.emotion += r.emotion || 0;
              });
              const avg = {
                intention: (totals.intention / postRatings.length).toFixed(1),
                composition: (totals.composition / postRatings.length).toFixed(1),
                matiere: (totals.matiere / postRatings.length).toFixed(1),
                technique: (totals.technique / postRatings.length).toFixed(1),
                emotion: (totals.emotion / postRatings.length).toFixed(1),
              };
              setAverageRatings(avg);
            }
          } catch (e) {
            console.error('Erreur chargement notations du post:', e);
          }
        })();
      } else {
        (async () => {
          try {
            const existing = await EchoesService.getRating(postId, currentUser.uid);
            if (existing) setRatings(existing);
          } catch (e) {
            console.error('Erreur chargement notation:', e);
          }
        })();
      }
    }
    setIsVisible(true);
  }, [currentUser, postId, isOwnPost]);

  const updateRating = (axis, value) => setRatings((r) => ({ ...r, [axis]: value }));

  const publishRating = async () => {
    if (!currentUser) return alert('Vous devez être connecté pour noter');
    setIsPublishing(true);
    try {
      await EchoesService.saveRating(postId, currentUser.uid, ratings);
      onRatingChange && onRatingChange(postId, ratings, true);
      setIsVisible(false);
    } catch (e) {
      console.error('❌ Erreur publication notation:', e);
      alert('Erreur lors de la publication de votre notation');
    } finally {
      setIsPublishing(false);
    }
  };

  const sendReport = async () => {
    if (!currentUser) return alert('Vous devez être connecté pour signaler');
    try {
      setReporting(true);
      await reportPost(postId, currentUser.uid);
      alert('Merci, votre signalement a été envoyé.');
      onRatingChange && onRatingChange(postId, null, true);
      setIsVisible(false);
    } catch (e) {
      console.error('report_failed', e);
      alert('Erreur lors de l\'envoi du signalement');
    } finally {
      setReporting(false);
    }
  };

  const axes = [
    { key: 'intention', label: 'Intention' },
    { key: 'composition', label: 'Composition' },
    { key: 'matiere', label: 'Matière' },
    { key: 'technique', label: 'Technique' },
    { key: 'emotion', label: 'Émotion' },
  ];

  return (
    <>
      {isVisible && (
        <div
          style={{
            position: 'relative',
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            maxHeight: '100%',
            overflow: 'auto',
            width: '100%',
          }}
        >
          {!isOwnPost && (
            <button
              onClick={sendReport}
              disabled={reporting}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: reporting ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: reporting ? 'not-allowed' : 'pointer',
              }}
            >
              {reporting ? 'Envoi…' : 'Signaler'}
            </button>
          )}

          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>ECHOES</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0' }}>
            {isOwnPost ? 'Vos notes reçues' : '5 axes artistiques pour évaluer cette création'}
          </p>

          {isOwnPost ? (
            <>
              <div
                key="stats"
                style={{
                  marginBottom: '20px',
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>{allRatings.length}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {`notation${allRatings.length !== 1 ? 's' : ''} reçue${allRatings.length !== 1 ? 's' : ''}`}
                </div>
              </div>

              {allRatings.length > 0 ? (
                <div key="averages">
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>Moyennes par axe :</h4>
                  {axes.map((axis) => (
                    <div
                      key={axis.key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        padding: '8px 0',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{axis.label}</span>
                      <span style={{ fontSize: '16px', color: '#f59e0b', fontWeight: '600' }}>{`${averageRatings[axis.key]}/5`}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div key="no-ratings" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  Aucune notation reçue pour cette publication
                </div>
              )}
            </>
          ) : (
            <>
              {axes.map((axis) => (
                <div key={axis.key} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{axis.label}</span>
                    <span style={{ fontSize: '16px', color: '#f59e0b', fontWeight: '600' }}>{ratings[axis.key]}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={ratings[axis.key]}
                    onChange={(e) => updateRating(axis.key, parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      cursor: 'pointer',
                      background: '#e5e7eb',
                      borderRadius: '3px',
                      outline: 'none',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                    }}
                  />
                </div>
              ))}
              <button
                onClick={publishRating}
                disabled={isPublishing}
                style={{
                  backgroundColor: isPublishing ? '#9ca3af' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isPublishing ? 'not-allowed' : 'pointer',
                  marginTop: '16px',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
              >
                {isPublishing ? 'Publication...' : 'Publier ma notation ECHOES'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default EchoesRating;
