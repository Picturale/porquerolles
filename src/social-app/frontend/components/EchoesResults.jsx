import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EchoesService } from '../services/echoesService';

const EchoesResults = ({ postId, postAuthorId }) => {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const isPostCreator = currentUser && currentUser.uid === postAuthorId;

  useEffect(() => {
    if (isPostCreator) {
      loadRatings();
    }
  }, [postId, isPostCreator]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const postRatings = await EchoesService.getPostRatings(postId);
      if (postRatings.length > 0) {
        const ratingSummary = EchoesService.calculateRatingSummary(postRatings);
        setSummary(ratingSummary);
      }
    } catch (error) {
      console.error('Erreur chargement résultats ECHOES:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isPostCreator) {
    return null;
  }

  if (loading) {
    return React.createElement('div', {
      style: { padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }
    }, 'Chargement des résultats ECHOES...');
  }

  if (!summary) {
    return React.createElement('div', {
      style: { padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }
    }, 'Aucune notation ECHOES pour le moment');
  }

  const axes = ['intention', 'composition', 'matiere', 'technique', 'emotion'];

  return React.createElement('div', {
    style: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '16px'
    }
  },
  React.createElement('h4', {
    style: { margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }
  }, `✨ Résultats ECHOES (${summary.totalRatings} notation${summary.totalRatings > 1 ? 's' : ''})`),
  React.createElement('div', {
    style: { marginBottom: '16px', fontSize: '18px', fontWeight: '700', color: '#f59e0b' }
  }, `Note globale: ${summary.overall.toFixed(1)}/5`),
  React.createElement('div', null, 
    ...axes.map((axis) =>
      React.createElement('div', {
        key: axis,
        style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }
      },
      React.createElement('span', { style: { fontSize: '14px' } }, axis),
      React.createElement('span', { 
        style: { fontSize: '14px', fontWeight: '600', color: '#f59e0b' } 
      }, summary.averages[axis].toFixed(1))
      )
    )
  )
  );
};

export default EchoesResults;
