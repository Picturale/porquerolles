/* eslint-disable no-console */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/CreatePost.css';
import { useMentionHandler } from '../utils/mentionHooks';

// Components
import Cropper from 'react-easy-crop'; // eslint-disable-line no-unused-vars
import AffiliateResourcePicker from '../components/AffiliateResourcePicker'; // eslint-disable-line no-unused-vars
import LocationPicker from '../components/LocationPicker'; // eslint-disable-line no-unused-vars
import RichTextEditor from '../components/RichTextEditor'; // eslint-disable-line no-unused-vars
import VideoCompressionInfo from '../components/VideoCompressionInfo'; // eslint-disable-line no-unused-vars
import VideoDiagnostic from '../components/VideoDiagnostic'; // eslint-disable-line no-unused-vars
import VideoOptimizationTip from '../components/VideoOptimizationTip'; // eslint-disable-line no-unused-vars
import VideoPlayer from '../components/VideoPlayer'; // eslint-disable-line no-unused-vars

// Firebase
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase';

// Utils
import { extractHashtags } from '../utils/hashtagUtils';
import { getCroppedImg } from '../utils/imageProcessing';
import {
  generateOptimizedThumbnail,
  isVideoFile,
  prepareVideoForUpload,
} from '../utils/videoUtils';

// Define utilities that might be missing
const cleanHashtags = (hashtags) => {
  return Array.isArray(hashtags)
    ? [...new Set(hashtags.map((tag) => tag.toLowerCase().trim()))]
    : [];
};

const updateHashtagCounts = async (_newHashtags, _oldHashtags, _postId) => {
  // Touch parameters to satisfy linters
  if (_newHashtags || _oldHashtags || _postId) {
    /* no-op */
  }
  // Implementation will be added later
  return true;
};

const createContentData = (type, id) => {
  return { type, id };
};

const retryOperation = async (operation) => {
  return await operation();
};

const updatePostHashtagsAndMentions = async (_postId, _oldPostData, _newPostData, _currentUser) => {
  // Touch parameters to satisfy linters
  if (_postId || _oldPostData || _newPostData || _currentUser) {
    /* no-op */
  }
  // Implementation will be added later
  return true;
};

const needsVideoConversion = (file) => {
  // Simple check based on file size
  return file.size > 5 * 1024 * 1024; // Convert files larger than 5MB
};

function CreatePost() {
  // Marquer le body pour masquer TopMenu/BottomNavbar pendant création/édition
  useEffect(() => {
    document.body.classList.add('create-post-active');
    return () => {
      document.body.classList.remove('create-post-active');
    };
  }, []);
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Removed legacy free-text resources field
  const [methodText, setMethodText] = useState('');
  const [methodSteps, setMethodSteps] = useState([
    {
      id: Date.now(),
      text: '',
      showTextarea: false,
      imageSrc: null,
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedAreaPixels: null,
      croppedImage: null,
      imageStep: 'none',
    },
  ]);
  const [location, setLocation] = useState(null);
  const [isLocationValidated, setIsLocationValidated] = useState(false);
  // const [showLocationPicker, setShowLocationPicker] = useState(false); // legacy, replaced by showLocationPopup

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
  // removed unused videoCurrentTime state
  const [videoDuration, setVideoDuration] = useState(0);

  // États pour les popups
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // États pour les ressources
  // Resources optional state (kept for future enhancements)
  // const [resources, setResources] = useState([]);
  // const [selectedResourceType, setSelectedResourceType] = useState('');
  const [affiliateResources, setAffiliateResources] = useState([]);

  // États pour l'upload
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  // États pour la compression vidéo
  const [videoCompressionInfo, setVideoCompressionInfo] = useState(null);

  // Pro: Product creation (Boutique)
  const isPro = !!userProfile?.isPro;
  const shopEnabled = !!userProfile?.shopEnabled;
  // Pro: creation mode switch (post or product)
  // null means user hasn't chosen yet (for Pro we want a pre-choice screen)
  const [creationMode, setCreationMode] = useState(null);
  useEffect(() => {
    // Non-pro users create normal posts by default
    if (!isPro && creationMode === null) {
      setCreationMode('post');
    }
  }, [isPro, creationMode]);
  // En mode édition (y compris pour les profils Pro), forcer le type 'post' et ne pas afficher le pré-choix
  useEffect(() => {
    if (isEditMode && creationMode !== 'post') {
      setCreationMode('post');
    }
  }, [isEditMode]);
  // product section toggle is driven by creationMode now
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productLink, setProductLink] = useState('');
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [productImageSrc, setProductImageSrc] = useState(null);
  const [productImageStep, setProductImageStep] = useState('none'); // none | crop | preview
  const [productCrop, setProductCrop] = useState({ x: 0, y: 0 });
  const [productZoom, setProductZoom] = useState(1);
  const [productCroppedAreaPixels, setProductCroppedAreaPixels] = useState(null);
  const [productUploading, setProductUploading] = useState(false);
  const [productUploadStatus, setProductUploadStatus] = useState('');

  // États pour contrôler l'affichage des sections
  const [showTitleSection, setShowTitleSection] = useState(false);
  const [showDescriptionSection, setShowDescriptionSection] = useState(false);
  const [showResourcesSection, setShowResourcesSection] = useState(false);

  // État pour les paramètres de réponses visuelles
  const [allowVisualResponses, setAllowVisualResponses] = useState(true);

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
          console.error("🔧 Cet utilisateur n'est pas autorisé à modifier ce post");
          alert("Vous n'êtes pas autorisé à modifier ce post");
          navigate('/');
          return;
        }

        // Configuration des données de base
        setTitle(postData.title || '');
        setDescription(postData.description || '');
        // Legacy free-text resources removed; ignore postData.ingredients
        setMethodText(postData.methodText || '');

        // Initialiser l'état des sections basé sur les données existantes
        setShowTitleSection(!!postData.title?.trim());
        setShowDescriptionSection(!!postData.description?.trim());
        setShowResourcesSection(
          Array.isArray(postData.affiliateResources) && postData.affiliateResources.length > 0
        );

        // Configurer les paramètres des réponses visuelles
        setAllowVisualResponses(postData.allowVisualResponses !== false); // Par défaut true

        // Restaurer les ressources affiliées si présentes
        if (Array.isArray(postData.affiliateResources)) {
          setAffiliateResources(postData.affiliateResources);
        }

        // Charger les étapes de méthode si présentes
        if (
          postData.methodSteps &&
          Array.isArray(postData.methodSteps) &&
          postData.methodSteps.length > 0
        ) {
          setMethodSteps(
            postData.methodSteps.map((step, index) => ({
              id: step.id || Date.now() + index + 1,
              text: step.text || '',
              imageSrc: step.imageUrl || null,
              crop: { x: 0, y: 0 },
              zoom: 1,
              croppedAreaPixels: null,
              croppedImage: step.imageUrl ? { url: step.imageUrl } : null,
              imageStep: step.imageUrl ? 'preview' : 'none',
              fileType: step.mediaType || 'image', // Récupérer le type de média depuis la base de données
            }))
          );
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
          setIsLocationValidated(true);
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

  // Surveiller les changements de contenu pour ajuster l'affichage des sections
  useEffect(() => {
    if (!isEditMode) {
      if (title.trim() && !showTitleSection) setShowTitleSection(true);
      if (description.trim() && !showDescriptionSection) setShowDescriptionSection(true);
      if (affiliateResources.length > 0 && !showResourcesSection) setShowResourcesSection(true);
    }
  }, [
    title,
    description,
    affiliateResources,
    isEditMode,
    showTitleSection,
    showDescriptionSection,
    showResourcesSection,
  ]);

  const onFileSelect = useCallback(async (file) => {
    console.log(
      `📁 [CreatePost] Fichier sélectionné: ${file?.name || 'Aucun'} (${file?.type || 'N/A'}, ${file ? (file.size / 1024 / 1024).toFixed(2) : '0'}MB)`
    );

    if (file && file.type.startsWith('image/')) {
      console.log('🖼️ [CreatePost] Traitement image...');
      setSelectedFile(file);
      setFileType('image');
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setStep('crop'); // Toujours aller au crop pour les images
        console.log('✅ [CreatePost] Image prête pour recadrage');
      };
      reader.readAsDataURL(file);
    } else if (file && isVideoFile(file)) {
      console.log('🎥 [CreatePost] Traitement vidéo détecté...');

      // Gate video to Pro accounts only
      if (!isPro) {
        console.warn("⚠️ [CreatePost] Utilisateur non-Pro tente d'uploader une vidéo");
        alert('La publication de vidéos est réservée aux comptes Pro.');
        return;
      }
      setIsLoading(true);
      setUploadStatus('Préparation de la vidéo...');
      console.log('🔄 [CreatePost] Démarrage traitement vidéo...');

      try {
        let processedVideo = file;

        // Vérifier si la vidéo nécessite une compression (maintenant asynchrone)
        setUploadStatus('Analyse de la vidéo...');
        console.log('🔍 [CreatePost] Vérification si compression nécessaire...');
        const needsCompression = await needsVideoConversion(file);
        console.log(
          `📊 [CreatePost] Résultat analyse: compression ${needsCompression ? 'nécessaire' : 'non nécessaire'}`
        );

        if (needsCompression) {
          setUploadStatus('Compression 720p en cours...');
          console.log('🗜️ [CreatePost] Démarrage compression 720p...');

          // Préparer la vidéo (compression + miniature)
          const result = await prepareVideoForUpload(file, (progress, message) => {
            setUploadProgress(progress);
            setUploadStatus(message || `Compression 720p: ${progress.toFixed(1)}%`);

            // Log uniquement tous les 20%
            if (progress % 20 < 1) {
              console.log(
                `⏳ [CreatePost] Progression: ${progress.toFixed(1)}% - ${message || 'Compression'}`
              );
            }
          });

          processedVideo = result.video;

          // Stocker les infos de compression pour affichage
          setVideoCompressionInfo({
            originalSize: result.originalSize,
            compressedSize: result.optimizedSize,
            compressionRatio: result.compressionRatio,
          });

          console.log(
            `✅ [CreatePost] Compression terminée: ${(result.originalSize / 1024 / 1024).toFixed(2)}MB → ${(result.optimizedSize / 1024 / 1024).toFixed(2)}MB (${result.compressionRatio}% économisés)`
          );

          setUploadStatus(`Vidéo compressée en 720p (${result.compressionRatio}% plus légère)`);
        } else {
          // Générer juste la miniature pour les vidéos déjà optimisées
          setUploadStatus('Génération de la miniature...');
          console.log('🖼️ [CreatePost] Génération miniature uniquement (vidéo déjà optimale)...');
          await generateOptimizedThumbnail(file);
          setUploadStatus('Vidéo prête (déjà optimisée)');
          setVideoCompressionInfo(null); // Reset compression info
          console.log('✅ [CreatePost] Vidéo prête (pas de compression nécessaire)');
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

  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setProductImageSrc(reader.result);
        setProductImageStep('crop');
        setProductCrop({ x: 0, y: 0 });
        setProductZoom(1);
        setProductCroppedAreaPixels(null);
        setProductImageFile(null);
        setProductImagePreview(null);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Image de produit invalide. Formats acceptés: JPG, PNG, GIF.');
    }
  };

  const onProductCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setProductCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleProductCropConfirm = async () => {
    if (!productImageSrc || !productCroppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(productImageSrc, productCroppedAreaPixels);
      const url = URL.createObjectURL(croppedBlob);
      setProductImageFile(croppedBlob);
      setProductImagePreview(url);
      setProductImageStep('preview');
    } catch (err) {
      console.error('Erreur crop image produit:', err);
      alert("Erreur lors du recadrage de l'image produit");
    }
  };

  const handleProductImageReset = () => {
    if (productImagePreview) URL.revokeObjectURL(productImagePreview);
    setProductImageFile(null);
    setProductImagePreview(null);
    setProductImageSrc(null);
    setProductImageStep('none');
    setProductCrop({ x: 0, y: 0 });
    setProductZoom(1);
    setProductCroppedAreaPixels(null);
  };

  const resetProductForm = () => {
    setProductTitle('');
    setProductDescription('');
    setProductPrice('');
    setProductLink('');
    setProductImageFile(null);
    setProductImagePreview(null);
    setProductImageSrc(null);
    setProductImageStep('none');
    setProductCrop({ x: 0, y: 0 });
    setProductZoom(1);
    setProductCroppedAreaPixels(null);
  };

  const handleCreateProduct = async () => {
    if (!currentUser) {
      alert('Vous devez être connecté.');
      return;
    }
    if (!isPro) {
      alert("La création d'article est réservée aux profils Pro.");
      return;
    }
    if (!shopEnabled) {
      alert('Activez la Boutique dans votre profil pour publier un article.');
      return;
    }
    if (!productTitle.trim()) {
      alert("Veuillez ajouter un nom d'article.");
      return;
    }
    if (!productImageFile) {
      alert("Veuillez ajouter une photo de l'article.");
      return;
    }
    const priceNumber = parseFloat(String(productPrice).replace(',', '.'));
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      alert('Veuillez saisir un prix valide.');
      return;
    }

    setProductUploading(true);
    setProductUploadStatus("Upload de l'image produit...");
    try {
      // Upload image to Storage
      const imgRef = ref(
        storage,
        `social-app/products/${currentUser.uid}/${Date.now()}_product.jpg`
      );
      await uploadBytes(imgRef, productImageFile);
      const productImageUrl = await getDownloadURL(imgRef);

      setProductUploadStatus("Création de l'article...");
      const docData = {
        ownerId: currentUser.uid,
        title: productTitle.trim(),
        description: productDescription.trim(),
        price: priceNumber,
        link: productLink.trim(),
        imageUrl: productImageUrl,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'products'), docData);

      setProductUploadStatus('Article créé');
      alert('Article publié dans votre Boutique.');
      resetProductForm();
      const username = userProfile?.username || currentUser.email.split('@')[0];
      navigate(`/profile/${username}`);
    } catch (err) {
      console.error('Erreur création produit:', err);
      alert(`Erreur lors de la création de l'article: ${err.message || err}`);
    } finally {
      setProductUploading(false);
      setTimeout(() => setProductUploadStatus(''), 1500);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!isPro && file.type?.startsWith('video/')) {
        alert('La publication de vidéos est réservée aux comptes Pro.');
        return;
      }
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
      alert("Erreur lors du recadrage de l'image");
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
    // ingredients removed
    setMethodText('');
    setMethodSteps([
      {
        id: Date.now(),
        text: '',
        showTextarea: false,
        imageSrc: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedAreaPixels: null,
        croppedImage: null,
        imageStep: 'none',
      },
    ]); // Reset avec une étape par défaut
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('📤 [CreatePost] Démarrage processus de publication...');

    if (!croppedImage || !currentUser) {
      console.warn('⚠️ [CreatePost] Validation échouée: image/utilisateur manquant');
      alert('Veuillez sélectionner une image ou vidéo et vous connecter');
      return;
    }

    if (!title.trim()) {
      console.warn('⚠️ [CreatePost] Validation échouée: titre manquant');
      alert('Veuillez ajouter un titre à votre publication');
      return;
    }

    // Gate video publishing to Pro accounts (defense-in-depth)
    if (!isPro && (fileType === 'video' || selectedFile?.type?.startsWith('video/'))) {
      console.warn('⚠️ [CreatePost] Utilisateur non-Pro tente de publier une vidéo');
      alert('La publication de vidéos est réservée aux comptes Pro.');
      return;
    }

    // Vérifier la connectivité réseau
    if (!navigator.onLine) {
      console.error('❌ [CreatePost] Pas de connexion internet');
      alert('Aucune connexion internet détectée. Veuillez vérifier votre connexion.');
      return;
    }

    console.log('✅ [CreatePost] Validations passées, démarrage upload...');
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Préparation de l'upload...");

    try {
      let imageUrl = croppedImage;

      console.log('📤 [CreatePost] Début upload média principal...');

      // Upload du média principal (image ou vidéo)
      if (croppedImage.blob) {
        setUploadStatus('Upload du média principal...');

        const mediaType =
          fileType === 'video' || selectedFile?.type?.startsWith('video/') ? 'vidéo' : 'image';
        console.log(
          `🚀 [CreatePost] Upload ${mediaType} (${(croppedImage.blob.size / 1024 / 1024).toFixed(2)}MB)...`
        );

        // Déterminer extension/type correct pour de meilleures compatibilités lecteur
        const blobType =
          croppedImage.blob.type || (fileType === 'video' ? 'video/mp4' : 'image/jpeg');
        const ext = blobType.startsWith('video/')
          ? blobType.includes('webm')
            ? 'webm'
            : 'mp4'
          : blobType.includes('png')
            ? 'png'
            : 'jpg';
        const mediaRef = ref(storage, `social-app/posts/${currentUser.uid}/${Date.now()}.${ext}`);
        const uploadTask = uploadBytesResumable(mediaRef, croppedImage.blob, {
          contentType: blobType,
        });

        // Promesse pour suivre le progrès
        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Calcul du progrès (25% pour le média principal)
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 25;
              setUploadProgress(progress);

              // Log tous les 5MB
              if (snapshot.bytesTransferred % (5 * 1024 * 1024) < 100000) {
                console.log(
                  `⏳ [CreatePost] Upload média: ${(snapshot.bytesTransferred / 1024 / 1024).toFixed(1)}MB / ${(snapshot.totalBytes / 1024 / 1024).toFixed(1)}MB`
                );
              }
            },
            (error) => {
              console.error('❌ [CreatePost] Erreur upload média principal:', error);
              reject(error);
            },
            async () => {
              // Upload terminé
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(
                `✅ [CreatePost] Média principal uploadé: ${downloadURL.substring(0, 80)}...`
              );
              resolve(downloadURL);
            }
          );
        });
      } else if (croppedImage.url) {
        // Utiliser l'URL existante si c'est un média déjà uploadé
        imageUrl = croppedImage.url;
      }

      // Préparation des étapes de méthode avec upload des images
      const validMethodSteps = methodSteps.filter((step) => step.text.trim());
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
              const sType = step.croppedImage.blob.type || 'image/jpeg';
              const sExt = sType.includes('png') ? 'png' : 'jpg';
              const stepImageRef = ref(
                storage,
                `social-app/posts/${currentUser.uid}/${Date.now()}_step_${step.id}.${sExt}`
              );
              const stepSnapshot = await uploadBytes(stepImageRef, step.croppedImage.blob, {
                contentType: sType,
              });
              stepMediaUrl = await getDownloadURL(stepSnapshot.ref);
            } else if (step.fileType === 'image' && step.croppedImage?.url) {
              // Utiliser l'URL existante si c'est une image déjà uploadée
              stepMediaUrl = step.croppedImage.url;
            } else if (
              step.fileType === 'video' &&
              (step.croppedImage?.blob || step.selectedFile)
            ) {
              const vBlob = step.croppedImage?.blob || step.selectedFile;
              const vType = vBlob.type || 'video/mp4';
              const vExt = vType.includes('webm') ? 'webm' : 'mp4';
              const stepVideoRef = ref(
                storage,
                `social-app/posts/${currentUser.uid}/${Date.now()}_step_${step.id}_video.${vExt}`
              );
              const stepSnapshot = await uploadBytes(stepVideoRef, vBlob, { contentType: vType });
              stepMediaUrl = await getDownloadURL(stepSnapshot.ref);
            } else if (step.fileType === 'video' && step.croppedImage?.url) {
              // Utiliser l'URL existante si c'est une vidéo déjà uploadée
              stepMediaUrl = step.croppedImage.url;
            }

            return {
              id: step.id,
              text: step.text.trim(),
              imageUrl: stepMediaUrl, // Garder le nom imageUrl pour compatibilité
              mediaType: stepMediaType,
            };
          })
        );
        methodStepsData = stepsWithImages;
      }

      // Validate affiliate resources server-side before persisting
      let validatedAffiliates = [];
      try {
        if (affiliateResources && affiliateResources.length) {
          const resp = await fetch('/api/affiliates/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: affiliateResources }),
          });
          if (resp.ok) {
            validatedAffiliates = await resp.json();
          }
        }
      } catch (_e) {
        // ignore validation errors, fallback to empty list
      }

      const postData = {
        title: title.trim(),
        imageUrl,
        description: description.trim(),
        hashtags: cleanHashtags(extractHashtags(description.trim())),
        methodText: methodText.trim(),
        methodSteps: methodStepsData,
        location: location, // Géolocalisation optionnelle
        affiliateResources: validatedAffiliates,
        allowVisualResponses: allowVisualResponses, // Paramètre pour les réponses visuelles
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
          postData.mediaType =
            fileType === 'video' || selectedFile?.type?.startsWith('video/') ? 'video' : 'image';
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
          navigate(
            `/user/${userProfile?.username || currentUser.email.split('@')[0]}/post/${editPostId}`
          );
        }, 500);
      } else {
        // Mode création - nouveau post
        setUploadStatus('Sauvegarde du post...');
        setUploadProgress(80);

        // En mode création, déterminer le mediaType
        postData.mediaType =
          fileType === 'video' || selectedFile?.type?.startsWith('video/') ? 'video' : 'image';

        const docRef = await retryOperation(() =>
          addDoc(collection(db, 'posts'), {
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
            photoURL: userProfile?.profilePicture || currentUser.photoURL,
          })
        );

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
          const username = userProfile?.username || currentUser.email.split('@')[0];
          navigate(`/profile/${username}`);
        }, 500);
      }
    } catch (error) {
      console.error(
        `❌ Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du post:`,
        error
      );

      setUploadStatus('Erreur lors de la publication');
      setUploadProgress(0);

      // Gestion spécifique des erreurs réseau
      if (error.code === 'unavailable' || error.message.includes('QUIC_PROTOCOL_ERROR')) {
        alert('Problème de connexion réseau. Veuillez réessayer dans quelques instants.');
      } else if (error.code === 'permission-denied') {
        alert('Permissions insuffisantes. Veuillez vous reconnecter.');
      } else {
        alert(
          `Erreur lors de ${isEditMode ? 'la modification' : 'la création'} du post: ${error.message}`
        );
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
      imageStep: 'none',
    };
    setMethodSteps([...methodSteps, newStep]);
  };

  const removeMethodStep = (stepId) => {
    const stepToRemove = methodSteps.find((step) => step.id === stepId);
    if (stepToRemove?.croppedImage?.url) {
      URL.revokeObjectURL(stepToRemove.croppedImage.url);
    }
    setMethodSteps(methodSteps.filter((step) => step.id !== stepId));
  };

  const updateMethodStep = (stepId, newText) => {
    setMethodSteps(
      methodSteps.map((step) => (step.id === stepId ? { ...step, text: newText } : step))
    );
  };

  // Removed unused legacy location handlers

  const updateMethodStepImage = (stepId, updates) => {
    setMethodSteps((prevSteps) =>
      prevSteps.map((step) => (step.id === stepId ? { ...step, ...updates } : step))
    );
  };

  const onStepFileSelect = useCallback((stepId, file) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setMethodSteps((prevSteps) =>
            prevSteps.map((step) =>
              step.id === stepId
                ? {
                    ...step,
                    imageSrc: reader.result,
                    imageStep: 'crop',
                    crop: { x: 0, y: 0 },
                    zoom: 1,
                    croppedAreaPixels: null,
                    croppedImage: null,
                    fileType: 'image',
                  }
                : step
            )
          );
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // Gate video in steps to Pro accounts only
        if (!isPro) {
          alert("L'ajout de vidéos est réservé aux comptes Pro.");
          return;
        }

        // Process video with 720p compression for step videos too
        (async () => {
          try {
            setUploadStatus("Traitement de la vidéo de l'étape...");
            setIsLoading(true);

            // Check if compression is needed
            const needsCompression = await needsVideoConversion(file);
            let processedVideo = file;

            if (needsCompression) {
              setUploadStatus("Compression 720p de l'étape en cours...");
              const result = await prepareVideoForUpload(file, (progress, message) => {
                setUploadProgress(progress);
                setUploadStatus(message || `Compression étape: ${progress.toFixed(1)}%`);
              });
              processedVideo = result.video;
              setUploadStatus(`Vidéo étape compressée (${result.compressionRatio}% plus légère)`);
            }

            const reader = new FileReader();
            reader.onload = () => {
              setMethodSteps((prevSteps) =>
                prevSteps.map((step) =>
                  step.id === stepId
                    ? {
                        ...step,
                        imageSrc: reader.result,
                        imageStep: 'video-preview',
                        selectedFile: processedVideo,
                        fileType: 'video',
                      }
                    : step
                )
              );
            };
            reader.readAsDataURL(processedVideo);
          } catch (error) {
            console.error('❌ Erreur traitement vidéo étape:', error);
            alert(`Erreur lors du traitement de la vidéo: ${error.message}`);
          } finally {
            setIsLoading(false);
            setUploadProgress(0);
            setUploadStatus('');
          }
        })();
      }
    }
  }, []);

  const handleStepCropComplete = useCallback((stepId, croppedArea, croppedAreaPixels) => {
    setMethodSteps((prevSteps) =>
      prevSteps.map((step) => (step.id === stepId ? { ...step, croppedAreaPixels } : step))
    );
  }, []);

  const handleStepCropConfirm = async (stepId) => {
    const step = methodSteps.find((s) => s.id === stepId);
    if (!step) return;

    try {
      const croppedImageBlob = await getCroppedImg(step.imageSrc, step.croppedAreaPixels);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      setMethodSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                croppedImage: { blob: croppedImageBlob, url: croppedImageUrl },
                imageStep: 'preview',
              }
            : step
        )
      );
    } catch (error) {
      console.error("Erreur lors du crop de l'image étape:", error);
      alert("Erreur lors du recadrage de l'image");
    }
  };

  const handleStepVideoConfirm = (stepId) => {
    setMethodSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              imageStep: 'preview',
              // Pour les vidéos, on crée un objet croppedImage avec l'URL et le fichier
              croppedImage: { url: step.imageSrc, blob: step.selectedFile },
            }
          : step
      )
    );
  };

  const handleStepImageReset = (stepId) => {
    const step = methodSteps.find((s) => s.id === stepId);
    if (step?.croppedImage?.url) {
      URL.revokeObjectURL(step.croppedImage.url);
    }
    setMethodSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              imageSrc: null,
              crop: { x: 0, y: 0 },
              zoom: 1,
              croppedAreaPixels: null,
              croppedImage: null,
              imageStep: 'none',
            }
          : step
      )
    );
  };

  const handleStepBackToCrop = (stepId) => {
    const step = methodSteps.find((s) => s.id === stepId);
    if (step?.croppedImage?.url) {
      URL.revokeObjectURL(step.croppedImage.url);
    }
    setMethodSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              croppedImage: null,
              imageStep: step.fileType === 'video' ? 'video-preview' : 'crop',
            }
          : step
      )
    );
  };

  const removeMethodStepImage = (stepId) => {
    const step = methodSteps.find((s) => s.id === stepId);
    if (step?.croppedImage?.url) {
      URL.revokeObjectURL(step.croppedImage.url);
    }
    setMethodSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              imageSrc: null,
              crop: { x: 0, y: 0 },
              zoom: 1,
              croppedAreaPixels: null,
              croppedImage: null,
              imageStep: 'none',
              selectedFile: null,
              fileType: null,
            }
          : step
      )
    );
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
        {!isUploading &&
          creationMode &&
          (creationMode === 'product' ? (
            <button
              type="button"
              disabled={
                productUploading || !shopEnabled || !productTitle.trim() || !productImageFile
              }
              className="header-publish-button"
              onClick={handleCreateProduct}
              title={shopEnabled ? "Publier l'article" : 'Activez la Boutique pour publier'}
            >
              PUBLIER
            </button>
          ) : (
            <button
              type="submit"
              disabled={!title.trim()}
              className="header-publish-button"
              onClick={handleSubmit}
              title={isEditMode ? 'Modifier le post' : 'Publier le post'}
            >
              PUBLIER
            </button>
          ))}
      </div>

      <div className="create-post-card" data-edit-mode={isEditMode}>
        <h2 className="create-post-title-inline">
          {isEditMode ? 'Modifier la publication' : 'Créer un nouveau post'}
        </h2>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Chargement...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="create-post-form">
            {isPro && !isEditMode && creationMode === null && (
              <div className="creation-choice" style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 className="section-title-centered" style={{ marginBottom: 12 }}>
                  Choisir un type de création
                </h3>
                <div
                  className="creation-choice-buttons"
                  style={{ display: 'flex', gap: 12, justifyContent: 'center' }}
                >
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setCreationMode('post')}
                  >
                    Publication normale
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setCreationMode('product')}
                  >
                    Article Boutique
                  </button>
                </div>
                <p className="creation-choice-hint" style={{ marginTop: 8 }}>
                  Vous pourrez changer de type à tout moment.
                </p>
              </div>
            )}
            {/* Mode Article (Pro): afficher le formulaire produit en premier */}
            {creationMode === 'product' && (
              <div className="product-form-card">
                <h3 className="section-title-centered">Nouvel article de Boutique</h3>
                {!shopEnabled && (
                  <div className="info-banner">
                    La Boutique est désactivée. Activez-la dans votre profil pour publier des
                    articles.
                  </div>
                )}
                <div className="product-image-field">
                  <label className="field-label">Photo de l'article</label>
                  {productImageStep === 'none' && (
                    <input type="file" accept="image/*" onChange={handleProductImageChange} />
                  )}
                  {productImageStep === 'crop' && productImageSrc && (
                    <div className="crop-section">
                      <div className="cropper-container">
                        <Cropper
                          image={productImageSrc}
                          crop={productCrop}
                          zoom={productZoom}
                          aspect={1}
                          onCropChange={setProductCrop}
                          onCropComplete={onProductCropComplete}
                          onZoomChange={setProductZoom}
                        />
                      </div>
                      <div className="crop-controls">
                        <label>
                          Zoom:
                          <input
                            type="range"
                            value={productZoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setProductZoom(parseFloat(e.target.value))}
                          />
                        </label>
                      </div>
                      <div className="crop-buttons">
                        <button
                          type="button"
                          onClick={handleProductImageReset}
                          className="btn-secondary"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={handleProductCropConfirm}
                          className="btn-primary"
                        >
                          Confirmer le recadrage
                        </button>
                      </div>
                    </div>
                  )}
                  {productImageStep === 'preview' && productImagePreview && (
                    <div
                      className="product-image-preview"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <div
                        className="square"
                        style={{
                          width: 240,
                          maxWidth: '100%',
                          aspectRatio: '1 / 1',
                          overflow: 'hidden',
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <img
                          src={productImagePreview}
                          alt="Aperçu article"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleProductImageReset}
                      >
                        Changer
                      </button>
                    </div>
                  )}
                </div>
                <div className="product-fields">
                  <label className="field-label">Nom de l'article</label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    maxLength={80}
                    placeholder="Ex: Tirage Fine Art A4"
                    className="title-input"
                  />
                  <label className="field-label" style={{ marginTop: 12 }}>
                    Description
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows="3"
                    className="ingredients-textarea"
                    placeholder="Décrivez l'article..."
                  />
                  <div
                    className="product-inline-fields"
                    style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}
                  >
                    <div>
                      <label className="field-label">Prix (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        className="title-input"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="field-label">Lien (achat)</label>
                      <input
                        type="url"
                        value={productLink}
                        onChange={(e) => setProductLink(e.target.value)}
                        className="title-input"
                        placeholder="https://votre-boutique.com/produit"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="product-actions"
                  style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      resetProductForm();
                      setCreationMode('post');
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={
                      productUploading || !shopEnabled || !productTitle.trim() || !productImageFile
                    }
                    onClick={handleCreateProduct}
                  >
                    {productUploading
                      ? productUploadStatus || 'Publication...'
                      : "Publier l'article"}
                  </button>
                </div>
              </div>
            )}

            {/* Mode Publication: flux standard */}
            {creationMode === 'post' && step === 'select' && (
              <div className="upload-section">
                {/* Section d'upload de photo principale en haut */}
                <div className="main-upload-section">
                  <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver}>
                    <input
                      type="file"
                      accept={isPro ? 'image/*,video/*' : 'image/*'}
                      onChange={handleFileChange}
                      className="file-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path d="M13 11L9 17h6l-4-6z" fill="currentColor" />
                          </svg>
                        </span>
                        <p>Cliquez pour sélectionner une image ou glissez-déposez</p>
                        <p className="upload-hint">
                          Formats acceptés: JPG, PNG, GIF{!isPro ? '' : ', Vidéos'}
                        </p>
                        {!isPro && (
                          <p className="upload-hint" style={{ color: '#64748b' }}>
                            Les vidéos sont réservées aux comptes Pro.
                          </p>
                        )}
                        {isPro && <VideoOptimizationTip />}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Section titre avec pattern step-description */}
                <div className="title-section">
                  {showTitleSection || title.trim() ? (
                    <div className="title-section-display">
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Donnez un titre à votre publication..."
                        required
                        className="title-input"
                        maxLength={20}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowTitleSection(true);
                        setTimeout(() => {
                          document.getElementById('title')?.focus();
                        }, 100);
                      }}
                      className="add-description-btn"
                    >
                      + Ajouter un titre
                    </button>
                  )}
                </div>

                {/* Section description avec pattern step-description */}
                <div className="description-section">
                  {showDescriptionSection || description.trim() ? (
                    <div className="description-section-display">
                      <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Décrivez votre création... Utilisez @nom pour mentionner des utilisateurs et #hashtag pour les sujets"
                        maxLength={4000}
                        className="description-textarea"
                        onMentionSelect={(user) => handleMentions(user)}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDescriptionSection(true);
                        setTimeout(() => {
                          document.querySelector('.description-textarea')?.focus();
                        }, 100);
                      }}
                      className="add-description-btn"
                    >
                      + Ajouter une description
                    </button>
                  )}
                </div>

                {/* Section méthode optionnelle */}
                <div className="method-section">
                  <h3 className="section-title-centered">Méthode</h3>
                  <div className="method-steps-container">
                    {methodSteps.length === 0 ? (
                      <button
                        type="button"
                        onClick={addMethodStep}
                        className="add-first-method-btn"
                      >
                        + Ajouter une méthode
                      </button>
                    ) : (
                      <>
                        {methodSteps.map((step, index) => (
                          <div key={step.id} className="method-step-editor">
                            {/* Upload d'image en premier */}
                            <div className="step-image-section">
                              {step.imageStep === 'none' && (
                                <div className="step-image-upload">
                                  <input
                                    type="file"
                                    accept={isPro ? 'image/*,video/*' : 'image/*'}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) onStepFileSelect(step.id, file);
                                    }}
                                    className="file-input"
                                    id={`step-image-${step.id}`}
                                  />
                                  <label
                                    htmlFor={`step-image-${step.id}`}
                                    className="step-upload-label"
                                  >
                                    <span className="upload-icon">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path d="M13 11L9 17h6l-4-6z" fill="currentColor" />
                                      </svg>
                                    </span>
                                  </label>
                                </div>
                              )}

                              {step.imageStep === 'crop' &&
                                step.imageSrc &&
                                step.fileType === 'image' && (
                                  <div className="step-crop-section">
                                    <div className="step-cropper-container">
                                      <Cropper
                                        image={step.imageSrc}
                                        crop={step.crop}
                                        zoom={step.zoom}
                                        aspect={1}
                                        onCropChange={(crop) =>
                                          updateMethodStepImage(step.id, { crop })
                                        }
                                        onCropComplete={(croppedArea, croppedAreaPixels) =>
                                          handleStepCropComplete(
                                            step.id,
                                            croppedArea,
                                            croppedAreaPixels
                                          )
                                        }
                                        onZoomChange={(zoom) =>
                                          updateMethodStepImage(step.id, { zoom })
                                        }
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
                                          onChange={(e) =>
                                            updateMethodStepImage(step.id, {
                                              zoom: parseFloat(e.target.value),
                                            })
                                          }
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

                              {step.imageStep === 'video-preview' &&
                                step.imageSrc &&
                                step.fileType === 'video' && (
                                  <div className="step-video-section">
                                    <div className="step-video-container">
                                      <VideoPlayer
                                        src={step.imageSrc}
                                        autoPlay={false}
                                        muted={true}
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

                              {step.imageStep === 'preview' &&
                                (step.croppedImage ||
                                  (step.fileType === 'video' && step.imageSrc)) && (
                                  <div className="step-image-preview">
                                    {step.fileType === 'video' ? (
                                      <VideoPlayer
                                        src={step.croppedImage?.url || step.imageSrc}
                                        autoPlay={false}
                                        muted={true}
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
                                <div
                                  className={`step-description-display step-rich-text step-editor-${step.id}`}
                                >
                                  <RichTextEditor
                                    value={step.text}
                                    onChange={(val) => updateMethodStep(step.id, val)}
                                    placeholder={`Décrivez l'étape ${index + 1}... Utilisez @nom et #hashtag`}
                                    maxLength={1000}
                                    className="step-textarea"
                                    onMentionSelect={(user) => handleMentions(user)}
                                  />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Révéler l'éditeur riche et le focaliser
                                    updateMethodStepImage(step.id, { showTextarea: true });
                                    setTimeout(() => {
                                      document
                                        .querySelector(`.step-editor-${step.id} .editor-content`)
                                        ?.focus();
                                    }, 100);
                                  }}
                                  className="add-description-btn"
                                >
                                  + Ajouter une description
                                </button>
                              )}
                            </div>

                            {/* Bouton supprimer l'étape */}
                            {methodSteps.length > 1 && (
                              <div className="step-delete-section">
                                <button
                                  type="button"
                                  onClick={() => removeMethodStep(step.id)}
                                  className="btn-delete-step"
                                  title={`Supprimer l'étape ${index + 1}`}
                                >
                                  🗑️ Supprimer cette étape
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        <button type="button" onClick={addMethodStep} className="add-step-btn">
                          + Ajouter une étape
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Section ressources affiliées uniquement */}
                <div className="resources-section">
                  {showResourcesSection || affiliateResources.length > 0 ? (
                    <div className="resources-section-display">
                      <AffiliateResourcePicker
                        value={affiliateResources}
                        onChange={setAffiliateResources}
                        maxItems={8}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowResourcesSection(true)}
                      className="add-description-btn"
                    >
                      + Ajouter des ressources affiliées
                    </button>
                  )}
                </div>

                {/* Section localisation optionnelle */}
                <div className="location-section">
                  {!location || !isLocationValidated ? (
                    <button
                      type="button"
                      onClick={() => setShowLocationPopup(true)}
                      className="add-first-method-btn"
                    >
                      + Ajouter une localisation
                    </button>
                  ) : (
                    <div className="option-added">
                      <div className="option-summary">
                        <span className="option-label">📍 Localisation</span>
                        <p className="option-preview">
                          {location.address ||
                            `${location.lat?.toFixed(4)}, ${location.lng?.toFixed(4)}`}
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
              </div>
            )}

            {creationMode === 'post' && step === 'crop' && imageSrc && fileType === 'image' && (
              <div className="crop-section">
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

            {creationMode === 'post' &&
              step === 'video-preview' &&
              imageSrc &&
              fileType === 'video' && (
                <div className="video-preview-section">
                  <div className="video-container">
                    <VideoPlayer
                      src={imageSrc}
                      autoPlay={false}
                      muted={true}
                      onDurationChange={(duration) => setVideoDuration(duration)}
                    />
                  </div>

                  {/* Affichage des informations de compression */}
                  {videoCompressionInfo && (
                    <VideoCompressionInfo
                      originalSize={videoCompressionInfo.originalSize}
                      compressedSize={videoCompressionInfo.compressedSize}
                      compressionRatio={videoCompressionInfo.compressionRatio}
                    />
                  )}

                  {/* Diagnostic vidéo pour débugger les problèmes de fluidité */}
                  {selectedFile && selectedFile.type?.startsWith('video/') && (
                    <VideoDiagnostic videoBlob={selectedFile} />
                  )}

                  <div className="video-buttons">
                    <button
                      type="button"
                      onClick={() => setStep('select')}
                      className="btn-secondary"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('preview')}
                      className="btn-primary"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

            {creationMode === 'post' && step === 'preview' && (
              <div className="preview-section">
                {/* Aperçu de l'image/vidéo uploadée */}
                <div className="image-preview">
                  {fileType === 'video' || selectedFile?.type?.startsWith('video/') ? (
                    <>
                      <VideoPlayer
                        src={imageSrc}
                        autoPlay={false}
                        muted={true}
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
                    <button type="button" onClick={handleBackToCrop} className="edit-option-btn">
                      ✏️ Modifier l'image
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

                {/* Section titre avec pattern step-description */}
                <div className="title-section">
                  {showTitleSection || title.trim() ? (
                    <div className="title-section-display">
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Donnez un titre à votre publication..."
                        required
                        className="title-input"
                        maxLength={20}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowTitleSection(true);
                        setTimeout(() => {
                          document.getElementById('title')?.focus();
                        }, 100);
                      }}
                      className="add-description-btn"
                    >
                      + Ajouter un titre
                    </button>
                  )}
                </div>

                {/* Section description avec pattern step-description */}
                <div className="description-section">
                  {showDescriptionSection || description.trim() ? (
                    <div className="description-section-display">
                      <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Décrivez votre création... Utilisez @nom pour mentionner des utilisateurs et #hashtag pour les sujets"
                        maxLength={4000}
                        className="description-textarea"
                        onMentionSelect={(user) => handleMentions(user)}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDescriptionSection(true);
                        setTimeout(() => {
                          document.querySelector('.description-textarea')?.focus();
                        }, 100);
                      }}
                      className="add-description-btn"
                    >
                      + Ajouter une description
                    </button>
                  )}
                </div>

                <div className="method-section">
                  <h3 className="section-title-centered">Méthode</h3>
                  <div className="method-steps-container">
                    {methodSteps.length === 0 ? (
                      <button
                        type="button"
                        onClick={addMethodStep}
                        className="add-first-method-btn"
                      >
                        + Ajouter une méthode
                      </button>
                    ) : (
                      <>
                        {methodSteps.map((step, index) => (
                          <div key={step.id} className="method-step-editor">
                            {/* Upload d'image en premier */}
                            <div className="step-image-section">
                              {step.imageStep === 'none' && (
                                <div className="step-image-upload">
                                  <input
                                    type="file"
                                    accept={isPro ? 'image/*,video/*' : 'image/*'}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) onStepFileSelect(step.id, file);
                                    }}
                                    className="file-input"
                                    id={`step-image-${step.id}`}
                                  />
                                  <label
                                    htmlFor={`step-image-${step.id}`}
                                    className="step-upload-label"
                                  >
                                    <span className="upload-icon">
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path d="M13 11L9 17h6l-4-6z" fill="currentColor" />
                                      </svg>
                                    </span>
                                  </label>
                                </div>
                              )}

                              {step.imageStep === 'crop' &&
                                step.imageSrc &&
                                step.fileType === 'image' && (
                                  <div className="step-crop-section">
                                    <div className="step-cropper-container">
                                      <Cropper
                                        image={step.imageSrc}
                                        crop={step.crop}
                                        zoom={step.zoom}
                                        aspect={1}
                                        onCropChange={(crop) =>
                                          updateMethodStepImage(step.id, { crop })
                                        }
                                        onCropComplete={(croppedArea, croppedAreaPixels) =>
                                          handleStepCropComplete(
                                            step.id,
                                            croppedArea,
                                            croppedAreaPixels
                                          )
                                        }
                                        onZoomChange={(zoom) =>
                                          updateMethodStepImage(step.id, { zoom })
                                        }
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
                                          onChange={(e) =>
                                            updateMethodStepImage(step.id, {
                                              zoom: parseFloat(e.target.value),
                                            })
                                          }
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

                              {step.imageStep === 'video-preview' &&
                                step.imageSrc &&
                                step.fileType === 'video' && (
                                  <div className="step-video-section">
                                    <div className="step-video-container">
                                      <VideoPlayer
                                        src={step.imageSrc}
                                        autoPlay={false}
                                        muted={true}
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

                              {step.imageStep === 'preview' &&
                                (step.croppedImage ||
                                  (step.fileType === 'video' && step.imageSrc)) && (
                                  <div className="step-image-preview">
                                    {step.fileType === 'video' ? (
                                      <VideoPlayer
                                        src={step.croppedImage?.url || step.imageSrc}
                                        autoPlay={false}
                                        muted={true}
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
                                <div
                                  className={`step-description-display step-rich-text step-editor-${step.id}`}
                                >
                                  <RichTextEditor
                                    value={step.text}
                                    onChange={(val) => updateMethodStep(step.id, val)}
                                    placeholder={`Décrivez l'étape ${index + 1}... Utilisez @nom et #hashtag`}
                                    maxLength={1000}
                                    className="step-textarea"
                                    onMentionSelect={(user) => handleMentions(user)}
                                  />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Révéler l'éditeur riche et le focaliser
                                    updateMethodStepImage(step.id, { showTextarea: true });
                                    setTimeout(() => {
                                      document
                                        .querySelector(`.step-editor-${step.id} .editor-content`)
                                        ?.focus();
                                    }, 100);
                                  }}
                                  className="add-description-btn"
                                >
                                  + Ajouter une description
                                </button>
                              )}
                            </div>

                            {/* Bouton supprimer l'étape */}
                            {methodSteps.length > 1 && (
                              <div className="step-delete-section">
                                <button
                                  type="button"
                                  onClick={() => removeMethodStep(step.id)}
                                  className="btn-delete-step"
                                  title={`Supprimer l'étape ${index + 1}`}
                                >
                                  🗑️ Supprimer cette étape
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        <button type="button" onClick={addMethodStep} className="add-step-btn">
                          + Ajouter une étape
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Section ressources affiliées uniquement */}
                <div className="resources-section">
                  {showResourcesSection || affiliateResources.length > 0 ? (
                    <div className="resources-section-display">
                      <AffiliateResourcePicker
                        value={affiliateResources}
                        onChange={setAffiliateResources}
                        maxItems={8}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowResourcesSection(true)}
                      className="add-description-btn"
                    >
                      + Ajouter des ressources affiliées
                    </button>
                  )}
                </div>

                {/* Section localisation optionnelle */}
                <div className="location-section">
                  {!location || !isLocationValidated ? (
                    <button
                      type="button"
                      onClick={() => setShowLocationPopup(true)}
                      className="add-first-method-btn"
                    >
                      + Ajouter une localisation
                    </button>
                  ) : (
                    <div className="option-added">
                      <div className="option-summary">
                        <span className="option-label">📍 Localisation</span>
                        <p className="option-preview">
                          {location.address ||
                            `${location.lat?.toFixed(4)}, ${location.lng?.toFixed(4)}`}
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

                {/* Section paramètres des réponses visuelles */}
                <div className="visual-responses-section">
                  <div className="visual-responses-settings">
                    <div className="setting-header">
                      <h4 className="setting-title">🎨 Réponses visuelles</h4>
                      <p className="setting-subtitle">
                        Permettez aux autres artistes de créer des réponses visuelles à votre
                        publication
                      </p>
                    </div>
                    <div className="setting-options">
                      <label className="setting-option">
                        <input
                          type="checkbox"
                          checked={allowVisualResponses}
                          onChange={(e) => setAllowVisualResponses(e.target.checked)}
                          className="setting-checkbox"
                        />
                        <span className="setting-label">Autoriser les réponses visuelles</span>
                      </label>
                      <p className="setting-help">
                        {allowVisualResponses
                          ? 'Les utilisateurs pourront créer et partager leurs propres interprétations visuelles de votre création.'
                          : 'Les réponses visuelles seront désactivées pour cette publication.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ancienne section bouton publier supprimée */}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Section de progression d'upload fullscreen */}
      {isUploading && (
        <div className="upload-progress-fullscreen">
          <div className="upload-progress-content">
            <div className="loading-spinner" style={{ margin: '0 auto 16px auto' }} />
            <div className="upload-status-text">{uploadStatus}</div>
            <div className="upload-progress-bar">
              <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="upload-percentage">{Math.round(uploadProgress)}%</div>
          </div>
        </div>
      )}

      {/* Popup Localisation seulement */}

      {/* Popup Localisation */}
      {showLocationPopup && (
        <div className="popup-overlay" onClick={() => setShowLocationPopup(false)}>
          <div className="popup-content location-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Localisation</h3>
              <button className="close-popup-btn" onClick={() => setShowLocationPopup(false)}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <LocationPicker
                value={location}
                onChange={(loc) => {
                  setLocation(loc);
                }}
                height={280}
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
                onClick={() => {
                  setIsLocationValidated(true);
                  setShowLocationPopup(false);
                }}
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
