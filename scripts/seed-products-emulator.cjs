#!/usr/bin/env node
/* eslint-disable no-console */
/*
Seeds Firestore emulator with a few demo products for /api/products/search.
Run while emulators are up.
*/
const admin = require('firebase-admin');

(async () => {
  try {
    try { admin.app(); } catch { admin.initializeApp({ projectId: 'vision-picturale-community' }); }
    const db = admin.firestore();
    const now = new Date();
    const demo = [
      {
        id: 'demo-wood-frame',
        title: 'Cadre photo en bois – format A4',
        description: 'Cadre artisanal en chêne massif, verre acrylique. Idéal pour photos et illustrations.',
        imageUrl: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800',
        sellerUsername: 'atelier-lucie',
        updatedAt: now,
      },
      {
        id: 'demo-archival-paper',
        title: 'Papier Beaux-Arts 300g – Aquarelle/Impression',
        description: 'Papier sans acide, grain fin, compatible jet d’encre pigmentaire. Pack 25 feuilles.',
        imageUrl: 'https://images.unsplash.com/photo-1528460033278-a6ba57020470?w=800',
        sellerUsername: 'atelier-lucie',
        updatedAt: now,
      },
      {
        id: 'demo-hanging-kit',
        title: 'Kit de suspension discret pour cadres',
        description: 'Câbles acier, chevilles et crochets. Supporte jusqu’à 10 kg.',
        imageUrl: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800',
        sellerUsername: 'maison-deco',
        updatedAt: now,
      },
    ];
    for (const p of demo) {
      const {id, ...data} = p;
      await db.collection('products').doc(id).set(data, { merge: true });
      if (process.env.DEBUG) console.log('Seeded product:', id);
    }
    if (process.env.DEBUG) console.log('Done.');
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  }
})();
