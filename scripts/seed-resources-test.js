/**
 * Script pour ajouter des ressources de test dans Firestore
 * À exécuter une fois pour tester le système de ressources
 */

import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyDrTJ8k4rfjEKx_nJeeSqJuswQtNPqvquo',
    authDomain: 'vision-picturale-community.firebaseapp.com',
    databaseURL: 'https://vision-picturale-community-default-rtdb.firebaseio.com',
    projectId: 'vision-picturale-community',
    storageBucket: 'vision-picturale-community.firebasestorage.app',
    messagingSenderId: '304352209471',
    appId: '1:304352209471:web:56a0ff752ced120c14e68a'
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ressources de test
const testResources = [
    {
        title: "Appareil Photo Canon EOS R5",
        description: "Appareil photo professionnel pour la photographie haute résolution",
        price: 3899,
        imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
        link: "https://www.canon.fr/cameras/eos-r5/",
        active: true,
        ownerId: "test-user-1", // Remplacez par un vrai ID utilisateur
    },
    {
        title: "Objectif Sony 24-70mm f/2.8",
        description: "Objectif polyvalent pour tous types de photographie",
        price: 2199,
        imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400",
        link: "https://www.sony.fr/cameras/camera-lenses/sel2470gm",
        active: true,
        ownerId: "test-user-2",
    },
    {
        title: "Trépied Manfrotto Carbon",
        description: "Trépied en fibre de carbone ultra-léger et stable",
        price: 459,
        imageUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400",
        link: "https://www.manfrotto.com/fr-fr/trepied-carbone-4-sections-mt055cxpro4",
        active: true,
        ownerId: "test-user-1",
    },
    {
        title: "Logiciel Adobe Lightroom",
        description: "Logiciel de retouche photo professionnel",
        price: 11.99,
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
        link: "https://www.adobe.com/fr/products/photoshop-lightroom.html",
        active: true,
        ownerId: "test-user-3",
    },
    {
        title: "Éclairage Studio Godox",
        description: "Kit d'éclairage professionnel pour studio photo",
        price: 299,
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
        link: "https://www.godox.com/",
        active: true,
        ownerId: "test-user-2",
    }
];

async function seedResources() {
    console.log('🌱 Ajout des ressources de test...');

    try {
        for (const resource of testResources) {
            const docData = {
                ...resource,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'products'), docData);
            console.log(`✅ Ressource ajoutée: ${resource.title} (ID: ${docRef.id})`);
        }

        console.log('🎉 Toutes les ressources de test ont été ajoutées !');
        console.log('Vous pouvez maintenant tester l\'autocomplétion sur http://localhost:8000/src/social-app/#/create');

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout des ressources:', error);
    }
}

// Exécuter le script
seedResources().then(() => {
    console.log('Script terminé');
    process.exit(0);
}).catch((error) => {
    console.error('Erreur script:', error);
    process.exit(1);
});
