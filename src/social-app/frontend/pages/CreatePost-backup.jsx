import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/CreatePost.css";
import { useMentionHandler } from "../utils/mentionHooks";

// Components
import Cropper from "react-easy-crop";
import DescriptionEditor from "../components/DescriptionEditor";
import LocationPicker from "../components/LocationPicker";
import SmartInput from "../components/SmartInput";
import VideoPlayer from "../components/VideoPlayer";

// Firebase
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../firebase";

// Utils
import {
  extractHashtags,
} from "../utils/hashtagUtils";
import { getCroppedImg } from "../utils/imageProcessing";
import {
  isVideoFile,
  prepareVideoForUpload
} from "../utils/videoUtils";

// Define utilities that might be missing
const cleanHashtags = (hashtags) => {
  return Array.isArray(hashtags) ? [...new Set(hashtags.map(tag => tag.toLowerCase().trim()))] : [];
};

const updateHashtagCounts = async (newHashtags, oldHashtags, postId) => {
  // Implementation will be added later
  return true;
};

const createContentData = (type, id) => {
  return { type, id };
};

const retryOperation = async (operation) => {
  return await operation();
};

const updatePostHashtagsAndMentions = async (postId, oldPostData, newPostData, currentUser) => {
  // Implementation will be added later
  return true;
};

const needsVideoConversion = (file) => {
  // Simple check based on file size
  return file.size > 5 * 1024 * 1024; // Convert files larger than 5MB
};

function CreatePost() {
  const { currentUser, userProfile } = useAuth();
  const { handleMentions } = useMentionHandler(currentUser);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: urlPostId } = useParams(); // Pour détecter /edit-post/:id
  
  // Mode édition - peut venir des params URL ou de la route
  const editValue = searchParams.get('edit');
  const isEditModeFromParams = editValue !== null && editValue !== 'false';
  const isEditModeFromUrl = !!urlPostId; // Si on a un ID dans l'URL /edit-post/:id
  const isEditMode = isEditModeFromParams || isEditModeFromUrl;
  const editPostId = editValue || searchParams.get('id') || urlPostId;
  
  // États de base
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState(""); // Fusionnera description et méthode
  const [ingredients, setIngredients] = useState("");
  const [methodSteps, setMethodSteps] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLocationValidated, setIsLocationValidated] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // États pour le média
  const [step, setStep] = useState('select');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  
  // États pour les vidéos
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  
  // États pour les popups
  const [showResourcesPopup, setShowResourcesPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  
  // États pour les ressources
  const [resources, setResources] = useState([]);
  const [selectedResourceType, setSelectedResourceType] = useState('');
  
  // États pour l'upload
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  // Chargement du post en mode édition
  useEffect(() => {
    
    const loadPostForEdit = async () => {
      if (!isEditMode || !editPostId || !currentUser) return;
      
      setIsLoading(true);
      
      try {
        const postDoc = await getDoc(doc(db, 'posts', editPostId));
        
        if (!postDoc.exists()) {
          console.error('❌ Post non trouvé:', editPostId);
          alert(`Le post ${editPostId} n'existe pas ou a été supprimé.`);
          navigate('/');
          return;
        }
        
        const postData = postDoc.data();
        
        // Vérifier que l'utilisateur est bien l'auteur
        if (postData.userId !== currentUser.uid) {
          console.error('🔧 Cet utilisateur n\'est pas autorisé à modifier ce post');
          alert('Vous n\'êtes pas autorisé à modifier ce post');
          navigate('/');
          return;
        }
        
        // Configuration des données de base
        setTitle(postData.title || '');
        setDescription(postData.description || '');
        setIngredients(postData.ingredients || '');
        setMethodText(postData.methodText || '');        // Charger les étapes de méthode si présentes
        if (postData.methodSteps && Array.isArray(postData.methodSteps) && postData.methodSteps.length > 0) {
          setMethodSteps(postData.methodSteps.map((step, index) => ({
            id: step.id || Date.now() + index + 1,
            text: step.text || '',
            imageSrc: step.imageUrl || null,
            crop: { x: 0, y: 0 },
            zoom: 1,
            croppedAreaPixels: null,
            croppedImage: step.imageUrl ? { url: step.imageUrl } : null,
            imageStep: step.imageUrl ? 'preview' : 'none',
            fileType: step.mediaType || 'image' // Récupérer le type de média depuis la base de données
          })));
        }
          
        // Gérer l'image/vidéo principale
        if (postData.imageUrl) {
          setImageSrc(postData.imageUrl);
          setCroppedImage({ url: postData.imageUrl });
          
          // Détecter et configurer le type de média
          if (postData.mediaType === 'video') {
            setFileType('video');
          } else {
            setFileType('image');
          }
          
          setStep('preview');
        } else {
          // Si pas de média principal, aller directement en mode preview pour éditer les textes
          setStep('preview');
        }

        // Gérer la localisation
        if (postData.location) {
          setLocation(postData.location);
          setIsLocationValidated(true);
          setShowLocationPicker(false);
        }
        
      } catch (error) {
        console.error('🔧 Erreur lors du chargement du post:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      loadPostForEdit();
    }
  }, [isEditMode, editPostId, currentUser, navigate]);
  
  // En mode édition, nous ne préchargeons pas la vidéo pour la durée
  // La durée sera obtenue par le composant VideoPlayer au lieu de le faire ici
  useEffect(() => {
    if (isEditMode && fileType === 'video') {
      // Nous définissons une valeur par défaut raisonnable pour la durée
      // La vraie durée sera mise à jour quand le VideoPlayer sera chargé
      if (!videoDuration) {
        setVideoDuration(30); // Valeur par défaut
      }
    }
  }, [isEditMode, fileType, videoDuration]);

  const onFileSelect = useCallback(async (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFileType('image');
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setStep('crop'); // Toujours aller au crop pour les images
      };
      reader.readAsDataURL(file);
    } else if (file && isVideoFile(file)) {
      setIsLoading(true);
      setUploadStatus('Préparation de la vidéo...');
      
      try {
        let processedVideo = file;
        let thumbnail = null;
        
        // Vérifier si la vidéo nécessite une conversion
        if (needsVideoConversion(file)) {
          setUploadStatus('Optimisation de la vidéo en cours...');
          
          // Préparer la vidéo (conversion + miniature)
          const result = await prepareVideoForUpload(file, (progress, message) => {
            setUploadProgress(progress);
            setUploadStatus(message || `Optimisation: ${progress.toFixed(1)}%`);
          });
          
          processedVideo = result.video;
          thumbnail = result.thumbnail;
          
          setUploadStatus(`Vidéo optimisée (${result.compressionRatio}% plus légère)`);
        } else {
          // Générer juste la miniature pour les vidéos déjà optimisées
          setUploadStatus('Génération de la miniature...');
          thumbnail = await generateOptimizedThumbnail(file);
          setUploadStatus('Vidéo prête');
        }
        
        setSelectedFile(processedVideo);
        setFileType('video');
        
        const reader = new FileReader();
        reader.onload = async () => {
          setImageSrc(reader.result);
          setCroppedImage({ url: reader.result, blob: processedVideo });
          
          // Set video duration for the slider
          const video = document.createElement('video');
          video.src = reader.result;
          video.onloadedmetadata = () => {
            setVideoDuration(video.duration);
          };
          
          setStep('preview'); // Les vidéos vont directement à la preview
        };
        reader.readAsDataURL(processedVideo);
        
      } catch (error) {
        console.error('❌ Erreur traitement vidéo:', error);
        setUploadStatus(`Erreur: ${error.message}`);
        alert(`Erreur lors du traitement de la vidéo: ${error.message}`);
      } finally {
        setIsLoading(false);
        setUploadProgress(0);
      }
    } else {
      console.warn('⚠️ Type de fichier non supporté:', file?.type);
      alert('Type de fichier non supporté. Veuillez sélectionner une image ou une vidéo.');
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setCroppedImage({ blob: croppedImageBlob, url: croppedImageUrl });
      setStep('preview');
    } catch (error) {
      console.error('Erreur lors du crop:', error);
      alert('Erreur lors du recadrage de l\'image');
    }
  };

  const handleBackToCrop = () => {
    if (fileType === 'video' || selectedFile?.type?.startsWith('video/')) {
      setStep('select');
    } else {
      setStep('crop');
      if (croppedImage?.url) {
        URL.revokeObjectURL(croppedImage.url);
      }
      setCroppedImage(null);
    }
  };

  const handleReset = () => {
    setStep('select');
    setTitle('');
    setSelectedFile(null);
    setFileType(null); // Reset du type de fichier
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (croppedImage?.url) {
      URL.revokeObjectURL(croppedImage.url);
    }
    setCroppedImage(null);
    setDescription('');
    setIngredients('');
    setResources([]);
    setSelectedResourceType('');
    setMethodText('');
    setMethodSteps([]); // Reset avec un tableau vide
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!croppedImage || !currentUser) {
      alert('Veuillez sélectionner une image ou vidéo et vous connecter');
      return;
    }

    if (!title.trim()) {
      alert('Veuillez ajouter un titre à votre publication');
      return;
    }

    // Vérifier la connectivité réseau
    if (!navigator.onLine) {
      alert('Aucune connexion internet détectée. Veuillez vérifier votre connexion.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Préparation de l\'upload...');

    try {
      let imageUrl = croppedImage;

      // Upload du média principal (image ou vidéo)
      if (croppedImage.blob) {
        setUploadStatus('Upload du média principal...');

        const mediaRef = ref(storage, `social-app/posts/${currentUser.uid}/${Date.now()}`);
        const uploadTask = uploadBytesResumable(mediaRef, croppedImage.blob);

        // Promesse pour suivre le progrès
        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              // Calcul du progrès (25% pour le média principal)
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 25;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('❌ Erreur upload média principal:', error);
              reject(error);
            },
            async () => {
              // Upload terminé
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });

      } else if (croppedImage.url) {
        // Utiliser l'URL existante si c'est un média déjà uploadé
        imageUrl = croppedImage.url;
      }

      // Préparation des étapes de méthode avec upload des images
      const validMethodSteps = methodSteps.filter(step => step.text.trim());
      let methodStepsData = null;
      
      if (validMethodSteps.length > 0) {
        setUploadStatus('Upload des médias des étapes...');
        setUploadProgress(30);
        
        // Upload des images/vidéos d'étapes
        const stepsWithImages = await Promise.all(
          validMethodSteps.map(async (step, index) => {
            let stepMediaUrl = step.imageSrc;
            let stepMediaType = step.fileType || 'image';
            
            // Mise à jour du progrès pour chaque étape (30% à 70%)
            const stepProgress = 30 + ((index + 1) / validMethodSteps.length) * 40;
            setUploadProgress(stepProgress);
            setUploadStatus(`Upload étape ${index + 1}/${validMethodSteps.length}...`);
            
            // Upload seulement si c'est un nouveau média
            if (step.fileType === 'image' && step.croppedImage?.blob) {
              const stepImageRef = ref(storage, `social-app/posts/${currentUser.uid}/${Date.now()}_step_${step.id}`);
              const stepSnapshot = await uploadBytes(stepImageRef, step.croppedImage.blob);
              stepMediaUrl = await getDownloadURL(stepSnapshot.ref);
            } else if (step.fileType === 'image' && step.croppedImage?.url) {
              // Utiliser l'URL existante si c'est une image déjà uploadée
              stepMediaUrl = step.croppedImage.url;
            } else if (step.fileType === 'video' && (step.croppedImage?.blob || step.selectedFile)) {
              const stepVideoRef = ref(storage, `social-app/posts/${currentUser.uid}/${Date.now()}_step_${step.id}_video`);
              const videoFile = step.croppedImage?.blob || step.selectedFile;
              const stepSnapshot = await uploadBytes(stepVideoRef, videoFile);
              stepMediaUrl = await getDownloadURL(stepSnapshot.ref);
            } else if (step.fileType === 'video' && step.croppedImage?.url) {
              // Utiliser l'URL existante si c'est une vidéo déjà uploadée
              stepMediaUrl = step.croppedImage.url;
            }
            
            return {
              id: step.id,
              text: step.text.trim(),
              imageUrl: stepMediaUrl, // Garder le nom imageUrl pour compatibilité
              mediaType: stepMediaType
            };
          })
        );
        methodStepsData = stepsWithImages;
      }

      const postData = {
        title: title.trim(),
        imageUrl,
        description: description.trim(),
        hashtags: cleanHashtags(extractHashtags(description.trim())),
        ingredients: ingredients.trim(),
        methodText: methodText.trim(),
        methodSteps: methodStepsData,
        location: location, // Géolocalisation optionnelle
        updatedAt: serverTimestamp(),
      };


      if (isEditMode && editPostId) {
        // Mode édition - mise à jour du post existant
        setUploadStatus('Mise à jour du post...');
        setUploadProgress(80);
        
        // Récupérer les données de l'ancien post pour comparer
        const oldPostDoc = await getDoc(doc(db, 'posts', editPostId));
        const oldPostData = oldPostDoc.exists() ? oldPostDoc.data() : {};
        
        // En mode édition, préserver le mediaType existant si on n'a pas uploadé de nouveau média
        if (!croppedImage.blob && oldPostData.mediaType) {
          postData.mediaType = oldPostData.mediaType;
        } else {
          // Nouveau média uploadé, déterminer le type
          postData.mediaType = fileType === 'video' || selectedFile?.type?.startsWith('video/') ? 'video' : 'image';
        }
        
        // En mode édition, on ne modifie pas les miniatures vidéo
        // On garde la miniature existante
        
        // Mettre à jour le post dans Firestore
        await retryOperation(() => updateDoc(doc(db, 'posts', editPostId), postData));
        
        setUploadProgress(90);
        setUploadStatus('Finalisation...');
        
        // Utiliser le nouveau service pour mettre à jour hashtags et mentions
        await updatePostHashtagsAndMentions(editPostId, oldPostData, postData, currentUser);
        
        setUploadProgress(100);
        setUploadStatus('Post mis à jour avec succès !');
        
        setTimeout(() => {
          alert('Post modifié avec succès !');
          navigate(`/user/${userProfile?.username || currentUser.email.split('@')[0]}/post/${editPostId}`);
        }, 500);
      } else {
        // Mode création - nouveau post
        setUploadStatus('Sauvegarde du post...');
        setUploadProgress(80);
        
        // En mode création, déterminer le mediaType
        postData.mediaType = fileType === 'video' || selectedFile?.type?.startsWith('video/') ? 'video' : 'image';
        
        const docRef = await retryOperation(() => addDoc(collection(db, 'posts'), {
          ...postData,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          createdAt: serverTimestamp(),
          likes: [],
          comments: [],
          username: userProfile?.username || currentUser.email.split('@')[0],
          authorName: userProfile?.username || currentUser.email.split('@')[0],
          userProfilePicture: userProfile?.profilePicture || currentUser.photoURL,
          profilePicture: userProfile?.profilePicture || currentUser.photoURL,
          photoURL: userProfile?.profilePicture || currentUser.photoURL
        }));
        
        // Traiter les mentions dans la description
        if (description.trim()) {
          const contentData = createContentData('post', docRef.id);
          await handleMentions(description.trim(), contentData);
        }
        
        setUploadProgress(95);
        setUploadStatus('Finalisation...');
        
        // Mettre à jour les compteurs de hashtags
        if (postData.hashtags.length > 0) {
          await updateHashtagCounts(postData.hashtags, [], docRef.id);
        }
        
        setUploadProgress(100);
        setUploadStatus('Post créé avec succès !');
        
        
        setTimeout(() => {
          alert('Post créé avec succès !');
          handleReset();
          // Rediriger vers le feed principal
          navigate('/');
        }, 500);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du post:`, error);
      
      setUploadStatus('Erreur lors de la publication');
      setUploadProgress(0);
      
      // Gestion spécifique des erreurs réseau
      if (error.code === 'unavailable' || error.message.includes('QUIC_PROTOCOL_ERROR')) {
        alert('Problème de connexion réseau. Veuillez réessayer dans quelques instants.');
      } else if (error.code === 'permission-denied') {
        alert('Permissions insuffisantes. Veuillez vous reconnecter.');
      } else {
        alert(`Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du post: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('');
      }, 2000);
    }
  };

  // Fonctions pour la gestion des étapes de méthode avec images
  const addMethodStep = () => {
    const newStep = {
      id: Date.now(),
      text: '',
      showTextarea: false,
      imageSrc: null,
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedAreaPixels: null,
      croppedImage: null,
      imageStep: 'none'
    };
    setMethodSteps([...methodSteps, newStep]);
  };

  const removeMethodStep = (stepId) => {
    const stepToRemove = methodSteps.find(step => step.id === stepId);
    if (stepToRemove?.croppedImage?.url) {
      URL.revokeObjectURL(stepToRemove.croppedImage.url);
    }
    setMethodSteps(methodSteps.filter(step => step.id !== stepId));
  };

  const updateMethodStep = (stepId, newText) => {
    setMethodSteps(methodSteps.map(step => 
      step.id === stepId ? { ...step, text: newText } : step
    ));
  };

  const handleLocationSelect = (newLocation, isValidated = false) => {
    setLocation(newLocation);
    if (isValidated) {
      setIsLocationValidated(true);
      setShowLocationPicker(false);
    }
  };

  const handleEditLocation = () => {
    setIsLocationValidated(false);
    setShowLocationPicker(true);
  };

  const updateMethodStepImage = (stepId, updates) => {
    setMethodSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const onStepFileSelect = useCallback((stepId, file) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setMethodSteps(prevSteps => prevSteps.map(step => 
            step.id === stepId ? { 
              ...step, 
              imageSrc: reader.result,
              imageStep: 'crop',
              crop: { x: 0, y: 0 },
              zoom: 1,
              croppedAreaPixels: null,
              croppedImage: null,
              fileType: 'image'
            } : step
          ));
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setMethodSteps(prevSteps => prevSteps.map(step => 
            step.id === stepId ? { 
              ...step, 
              imageSrc: reader.result,
              imageStep: 'video-preview',
              selectedFile: file,
              fileType: 'video'
            } : step
          ));
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleStepCropComplete = useCallback((stepId, croppedArea, croppedAreaPixels) => {
    setMethodSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? { ...step, croppedAreaPixels } : step
    ));
  }, []);

  const handleStepCropConfirm = async (stepId) => {
    const step = methodSteps.find(s => s.id === stepId);
    if (!step) return;

    try {
      const croppedImageBlob = await getCroppedImg(step.imageSrc, step.croppedAreaPixels);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setMethodSteps(prevSteps => prevSteps.map(step => 
        step.id === stepId ? { 
          ...step, 
          croppedImage: { blob: croppedImageBlob, url: croppedImageUrl },
          imageStep: 'preview'
        } : step
      ));
    } catch (error) {
      console.error('Erreur lors du crop de l\'image étape:', error);
      alert('Erreur lors du recadrage de l\'image');
    }
  };

  const handleStepVideoConfirm = (stepId) => {
    setMethodSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? { 
        ...step, 
        imageStep: 'preview',
        // Pour les vidéos, on crée un objet croppedImage avec l'URL et le fichier
        croppedImage: { url: step.imageSrc, blob: step.selectedFile }
      } : step
    ));
  };

  const handleStepImageReset = (stepId) => {
    const step = methodSteps.find(s => s.id === stepId);
    if (step?.croppedImage?.url) {
      URL.revokeObjectURL(step.croppedImage.url);
    }
    setMethodSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? {
        ...step,
        imageSrc: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedAreaPixels: null,
        croppedImage: null,
        imageStep: 'none'
      } : step
    ));
  };

  const handleStepBackToCrop = (stepId) => {
    const step = methodSteps.find(s => s.id === stepId);
    if (step?.croppedImage?.url) {
      URL.revokeObjectURL(step.croppedImage.url);
    }
    setMethodSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? { 
        ...step, 
        croppedImage: null,
        imageStep: step.fileType === 'video' ? 'video-preview' : 'crop'
      } : step
    ));
  };

  const removeMethodStepImage = (stepId) => {
    const step = methodSteps.find(s => s.id === stepId);
    if (step?.croppedImage?.url) {
      URL.revokeObjectURL(step.croppedImage.url);
    }
    setMethodSteps(prevSteps => prevSteps.map(step => 
      step.id === stepId ? {
        ...step,
        imageSrc: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedAreaPixels: null,
        croppedImage: null,
        imageStep: 'none',
        selectedFile: null,
        fileType: null
      } : step
    ));
  };

  return (
    <div className="create-post-container create-post-fullscreen">
      {/* Header fixe en haut - style bottom menu */}
      <div className="create-post-header">
        <button 
          className="close-create-post-btn"
          onClick={() => navigate('/')}
          title="Fermer et retourner à l'accueil"
        >
          ✕
        </button>
        <h2>{isEditMode ? 'Modifier la publication' : 'Créer un nouveau post'}</h2>
        <div className="header-spacer"></div>
      </div>
      
      <div className="create-post-card" data-edit-mode={isEditMode}>
        <h2 className="create-post-title-inline">{isEditMode ? 'Modifier la publication' : 'Créer un nouveau post'}</h2>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de la publication...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="create-post-form">
            {step === 'select' && (
              <div className="upload-section">
                <div className="title-section">
                  <label htmlFor="title">Titre de votre publication:</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Donnez un titre à votre publication..."
                    required
                    className="title-input"
                  />
                </div>

                <div 
                  className="upload-area"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="file-input"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    <div className="upload-content">
                      <span className="upload-icon">📸</span>
                      <p>Cliquez pour sélectionner une image ou glissez-déposez</p>
                      <p className="upload-hint">Formats acceptés: JPG, PNG, GIF</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 'crop' && imageSrc && fileType === 'image' && (
              <div className="crop-section">
                <h3>Recadrer votre image</h3>
                <div className="cropper-container">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="crop-controls">
                  <label>
                    Zoom: 
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                    />
                  </label>
                </div>
                <div className="crop-buttons">
                  <button type="button" onClick={() => setStep('select')} className="btn-secondary">
                    Retour
                  </button>
                  <button type="button" onClick={handleCropConfirm} className="btn-primary">
                    Confirmer le recadrage
                  </button>
                </div>
              </div>
            )}

            {step === 'video-preview' && imageSrc && fileType === 'video' && (
              <div className="video-preview-section">
                <h3>Aperçu de votre vidéo</h3>
                <div className="video-container">
                  <VideoPlayer
                    src={imageSrc}
                    autoPlay={false}
                    muted={true}
                    onTimeUpdate={(time) => setVideoCurrentTime(time)}
                    onDurationChange={(duration) => setVideoDuration(duration)}
                  />
                </div>
                <div className="video-buttons">
                  <button type="button" onClick={() => setStep('select')} className="btn-secondary">
                    Retour
                  </button>
                  <button type="button" onClick={() => setStep('preview')} className="btn-primary">
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div className="preview-section">
                <div className="title-section">
                  <label htmlFor="title">Titre de votre publication:</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Donnez un titre à votre publication..."
                    required
                    className="title-input"
                  />
                </div>

                <div className="image-preview">
                  {(fileType === 'video' || selectedFile?.type?.startsWith('video/')) ? (
                    <>
                      <VideoPlayer
                        src={imageSrc}
                        autoPlay={false}
                        muted={true}
                        onTimeUpdate={(time) => setVideoCurrentTime(time)}
                        onDurationChange={(duration) => setVideoDuration(duration)}
                      />
                    </>
                  ) : (
                    <img 
                      src={croppedImage?.url || croppedImage} 
                      alt="Aperçu"
                      className="preview-image"
                    />
                  )}
                  {/* Bouton de modification uniquement en mode création ou pour les images */}
                  {!isEditMode && (
                    <button 
                      type="button" 
                      onClick={handleBackToCrop} 
                      className="edit-option-btn"
                    >
                      ✏️ Modifier
                    </button>
                  )}
                  {isEditMode && (
                    <div className="edit-mode-notice">
                      <span className="edit-mode-text">
                        📷 Média non modifiable en mode édition
                      </span>
                    </div>
                  )}
                </div>

                {/* Nouvel éditeur WYSIWYG fusionné */}
                <DescriptionEditor
                  initialValue={contentHtml}
                  onChange={setContentHtml}
                  title="Description et méthode"
                  placeholder="Décrivez votre création et ajoutez une méthode étape par étape..."
                />

                {/* Boutons d'ajout d'options restantes */}
                <div className="add-options-section">
                  {/* Bouton Ressources */}
                  {!ingredients ? (
                    <button
                      type="button"
                      onClick={() => setShowResourcesPopup(true)}
                      className="add-first-method-btn"
                    >
                      + Ajouter ressources
                    </button>
                  ) : (
                    <div className="option-added">
                      <div className="option-summary">
                        <span className="option-label">🛠️ Ressources</span>
                        <p className="option-preview">
                          {ingredients.length > 80 ? `${ingredients.substring(0, 80)}...` : ingredients}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResourcesPopup(true)}
                        className="edit-option-btn"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  )}

                  {/* Bouton Localisation */}
                  {!location || !isLocationValidated ? (
                    <button
                      type="button"
                      onClick={() => setShowLocationPopup(true)}
                      className="add-first-method-btn"
                    >
                      + Ajouter localisation
                    </button>
                  ) : (
                    <div className="option-added">
                      <div className="option-summary">
                        <span className="option-label">📍 Localisation</span>
                        <p className="option-preview">
                          {location.address || `${location.lat?.toFixed(4)}, ${location.lng?.toFixed(4)}`}
                        </p>
                        <span className="option-meta">
                          {location.address ? 'Adresse validée' : 'Coordonnées GPS'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLocationPopup(true)}
                        className="edit-option-btn"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  )}
                </div>

                {/* Bouton Publier fixe */}
                <div className="publish-button-container">
                  {/* Barre de progression d'upload */}
                  {isUploading && (
                    <div className="upload-progress-section">
                      <div className="upload-progress-bar">
                        <div 
                          className="upload-progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="upload-status">{uploadStatus}</p>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="publish-btn" 
                    disabled={isUploading || !title.trim()}
                  >
                    {isUploading ? `${uploadProgress}%` : (isEditMode ? 'Modifier le post' : 'Publier')}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
                                      image={step.imageSrc}
                                      crop={step.crop}
                                      zoom={step.zoom}
                                      aspect={1}
                                      onCropChange={(crop) => updateMethodStepImage(step.id, { crop })}
                                      onCropComplete={(croppedArea, croppedAreaPixels) => 
                                        handleStepCropComplete(step.id, croppedArea, croppedAreaPixels)
                                      }
                                      onZoomChange={(zoom) => updateMethodStepImage(step.id, { zoom })}
                                    />
                                  </div>
                                  <div className="step-crop-controls">
                                    <label>
                                      Zoom: 
                                      <input
                                        type="range"
                                        value={step.zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        onChange={(e) => updateMethodStepImage(step.id, { zoom: parseFloat(e.target.value) })}
                                      />
                                    </label>
                                  </div>
                                  <div className="step-crop-buttons">
                                    <button 
                                      type="button" 
                                      onClick={() => removeMethodStepImage(step.id)}
                                      className="btn-secondary"
                                    >
                                      Supprimer
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => handleStepCropConfirm(step.id)}
                                      className="btn-primary"
                                    >
                                      Confirmer
                                    </button>
                                  </div>
                                </div>
                              )}

                              {step.imageStep === 'video-preview' && step.imageSrc && step.fileType === 'video' && (
                                <div className="step-video-section">
                                  <div className="step-video-container">
                                    <VideoPlayer
                                      src={step.imageSrc}
                                      autoPlay={false}
                                      muted={true}
                                      onTimeUpdate={(time) => setVideoCurrentTime(time)}
                                      onDurationChange={(duration) => setVideoDuration(duration)}
                                    />
                                  </div>
                                  <div className="step-video-buttons">
                                    <button 
                                      type="button" 
                                      onClick={() => removeMethodStepImage(step.id)}
                                      className="btn-secondary"
                                    >
                                      Supprimer
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => handleStepVideoConfirm(step.id)}
                                      className="btn-primary"
                                    >
                                      Confirmer
                                    </button>
                                  </div>
                                </div>
                              )}

                              {step.imageStep === 'preview' && (step.croppedImage || (step.fileType === 'video' && step.imageSrc)) && (
                                <div className="step-image-preview">
                                  {step.fileType === 'video' ? (
                                    <VideoPlayer
                                      src={step.croppedImage?.url || step.imageSrc}
                                      autoPlay={false}
                                      muted={true}
                                      onTimeUpdate={(time) => setVideoCurrentTime(time)}
                                      onDurationChange={(duration) => setVideoDuration(duration)}
                                    />
                                  ) : (
                                    <img 
                                      src={step.croppedImage.url} 
                                      alt={`Étape ${index + 1}`}
                                      className="step-preview-image"
                                    />
                                  )}
                                  <div className="step-image-actions">
                                    {!isEditMode && (
                                      <>
                                        <button 
                                          type="button" 
                                          onClick={() => handleStepBackToCrop(step.id)} 
                                          className="btn-secondary"
                                          title="Modifier l'image"
                                        >
                                          ✏️ Modifier
                                        </button>
                                        <button 
                                          type="button" 
                                          onClick={() => handleStepImageReset(step.id)} 
                                          className="btn-secondary"
                                          title="Supprimer l'image"
                                        >
                                          🗑️ Supprimer
                                        </button>
                                      </>
                                    )}
                                    {isEditMode && (
                                      <div className="edit-mode-notice-step">
                                        <span className="edit-mode-text">
                                          📷 Médias non modifiables en mode édition
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Description - style PostCard */}
                            <div className="step-description-section">
                              {step.showTextarea || step.text.trim() ? (
                                <div className="step-description-display">
                                  <textarea
                                    id={`step-textarea-${step.id}`}
                                    value={step.text}
                                    onChange={(e) => updateMethodStep(step.id, e.target.value)}
                                    placeholder={`Décrivez l'étape ${index + 1}...`}
                                    rows="3"
                                    className="step-textarea"
                                  />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Révéler le textarea en mettant showTextarea à true
                                    updateMethodStepImage(step.id, { showTextarea: true });
                                    setTimeout(() => {
                                      document.getElementById(`step-textarea-${step.id}`)?.focus();
                                    }, 100);
                                  }}
                                  className="add-description-btn"
                                >
                                  + Ajouter une description
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    
                    <button
                      type="button"
                      onClick={addMethodStep}
                      className="add-step-btn"
                    >
                      + Ajouter une étape
                    </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bouton Publier fixe */}
                <div className="publish-button-container">
                  {/* Barre de progression d'upload */}
                  {isUploading && (
                    <div className="upload-progress-section">
                      <div className="upload-status-text">{uploadStatus}</div>
                      <div className="upload-progress-bar">
                        <div 
                          className="upload-progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="upload-percentage">{Math.round(uploadProgress)}%</div>
                    </div>
                  )}
                  
                  {/* Afficher le bouton seulement quand on n'est pas en train d'uploader */}
                  {!isUploading && (
                    <button
                      type="submit"
                      disabled={!title.trim()}
                      className="publish-button"
                      title={isEditMode ? 'Modifier le post' : 'Publier le post'}
                    >
                      <span className="publish-text">PUBLIER</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Popups pour les options */}
      
      {/* Popup Description */}
      {showDescriptionPopup && (
        <div className="popup-overlay" onClick={() => setShowDescriptionPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Description</h3>
              <button 
                className="close-popup-btn"
                onClick={() => setShowDescriptionPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="popup-body">
              <label htmlFor="popup-description">Décrivez votre création :</label>
              <SmartInput
                value={description}
                onChange={setDescription}
                placeholder="Décrivez votre création... Utilisez @nom pour mentionner des utilisateurs et #hashtag pour les sujets"
                multiline={true}
                maxLength={500}
                className="description-textarea"
                showHashtagCount={true}
                onMentionSelect={(user) => {
                }}
              />
            </div>
            <div className="popup-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowDescriptionPopup(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowDescriptionPopup(false)}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Ressources */}
      {showResourcesPopup && (
        <div className="popup-overlay" onClick={() => setShowResourcesPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Ressources nécessaires</h3>
              <button 
                className="close-popup-btn"
                onClick={() => setShowResourcesPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="popup-body">
              <label htmlFor="popup-ingredients">Listez les ressources nécessaires :</label>
              <textarea
                id="popup-ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Listez les matériaux, outils, logiciels... (un par ligne)"
                rows="6"
                className="ingredients-textarea"
              />
            </div>
            <div className="popup-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowResourcesPopup(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowResourcesPopup(false)}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Localisation */}
      {showLocationPopup && (
        <div className="popup-overlay" onClick={() => setShowLocationPopup(false)}>
          <div className="popup-content location-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Localisation</h3>
              <button 
                className="close-popup-btn"
                onClick={() => setShowLocationPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="popup-body">
              <LocationPicker
                onLocationSelect={(selectedLocation) => {
                  setLocation(selectedLocation);
                  setIsLocationValidated(true);
                  setShowLocationPicker(false);
                  // Ne pas fermer le popup automatiquement, laisser l'utilisateur cliquer sur "Valider"
                }}
                initialLocation={location}
                isVisible={true}
              />
            </div>
            <div className="popup-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setLocation(null);
                  setIsLocationValidated(false);
                  setShowLocationPopup(false);
                }}
              >
                Supprimer localisation
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowLocationPopup(false)}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePost;
