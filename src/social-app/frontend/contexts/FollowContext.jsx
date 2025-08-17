import React from 'react';
import { createContext, useContext, useState } from 'react';

const FollowContext = createContext();

export function FollowProvider({ children }) {
  // État global des relations follow
  const [followRelations, setFollowRelations] = useState(new Map());
  
  // État global des compteurs
  const [userCounters, setUserCounters] = useState(new Map());

  // Mettre à jour l'état de follow d'un utilisateur
  const updateFollowStatus = (targetUserId, isFollowing) => {
    setFollowRelations(prev => {
      const newMap = new Map(prev);
      newMap.set(targetUserId, isFollowing);
      return newMap;
    });
  };

  // Mettre à jour les compteurs d'un utilisateur
  const updateUserCounters = (userId, followersCount, followingCount) => {
    setUserCounters(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, { followers: followersCount, following: followingCount });
      return newMap;
    });
  };

  // Mettre à jour uniquement le compteur de followers (valeur absolue, pas d'incréments)
  const setFollowersCount = (userId, count) => {
    setUserCounters(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(userId) || { followers: 0, following: 0 };
      newMap.set(userId, {
        ...current,
        followers: Math.max(0, count)
      });
      return newMap;
    });
  };

  // Mettre à jour uniquement le compteur de following (valeur absolue, pas d'incréments)
  const setFollowingCount = (userId, count) => {
    setUserCounters(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(userId) || { followers: 0, following: 0 };
      newMap.set(userId, {
        ...current,
        following: Math.max(0, count)
      });
      return newMap;
    });
  };

  // Incrémenter/décrémenter le compteur de followers
  const updateFollowersCount = (userId, increment) => {
    setUserCounters(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(userId) || { followers: 0, following: 0 };
      newMap.set(userId, {
        ...current,
        followers: Math.max(0, current.followers + increment)
      });
      return newMap;
    });
  };

  // Incrémenter/décrémenter le compteur de following
  const updateFollowingCount = (userId, increment) => {
    setUserCounters(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(userId) || { followers: 0, following: 0 };
      newMap.set(userId, {
        ...current,
        following: Math.max(0, current.following + increment)
      });
      return newMap;
    });
  };

  // Récupérer l'état de follow d'un utilisateur
  const getFollowStatus = (targetUserId) => {
    return followRelations.get(targetUserId) || false;
  };

  // Récupérer les compteurs d'un utilisateur
  const getUserCounters = (userId) => {
    return userCounters.get(userId) || { followers: 0, following: 0 };
  };

  const value = {
    followRelations,
    userCounters,
    updateFollowStatus,
    updateUserCounters,
    setFollowersCount,
    setFollowingCount,
    updateFollowersCount,
    updateFollowingCount,
    getFollowStatus,
    getUserCounters
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}
