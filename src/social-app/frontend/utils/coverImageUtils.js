/**
 * Utilities to generate responsive cover image variants with a fixed 3:1 aspect ratio.
 * We center-crop the original image to the target aspect, then resize to sm/md/lg.
 */

/**
 * Load a File/Blob into an HTMLImageElement
 * @param {File|Blob} file
 * @returns {Promise<HTMLImageElement>}
 */
export const fileToImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Center-crop an image to a given aspect ratio (width/height)
 * @param {HTMLImageElement} img
 * @param {number} aspectRatio e.g., 3/1
 * @returns {HTMLCanvasElement} a canvas containing the cropped image at source resolution
 */
export const cropImageToAspect = (img, aspectRatio = 3 / 1) => {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const srcAspect = srcW / srcH;

  let cropW, cropH, cropX, cropY;
  if (srcAspect > aspectRatio) {
    // Image too wide -> crop horizontally
    cropH = srcH;
    cropW = Math.round(cropH * aspectRatio);
    cropX = Math.round((srcW - cropW) / 2);
    cropY = 0;
  } else {
    // Image too tall -> crop vertically
    cropW = srcW;
    cropH = Math.round(cropW / aspectRatio);
    cropX = 0;
    cropY = Math.round((srcH - cropH) / 2);
  }

  const canvas = document.createElement('canvas');
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return canvas;
};

/**
 * Resize a source canvas to a target width/height and return a Blob
 * @param {HTMLCanvasElement} sourceCanvas
 * @param {number} targetW
 * @param {number} targetH
 * @param {string} mime
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
export const resizeCanvasToBlob = (sourceCanvas, targetW, targetH, mime = 'image/jpeg', quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, targetW, targetH);
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Erreur lors de la génération de l\'image'));
      resolve(blob);
    }, mime, quality);
  });
};

/**
 * Generate 3 responsive variants for cover images with a fixed 3:1 ratio.
 * sm: 600x200, md: 1200x400, lg: 1800x600 (JPEG)
 * @param {File|Blob} file
 * @returns {Promise<{ sm: File, md: File, lg: File }>} Files named with suffixes _sm/_md/_lg
 */
export const generateCoverVariants = async (file) => {
  const img = await fileToImage(file);
  const cropped = cropImageToAspect(img, 3 / 1);

  const [smBlob, mdBlob, lgBlob] = await Promise.all([
    resizeCanvasToBlob(cropped, 600, 200, 'image/jpeg', 0.8),
    resizeCanvasToBlob(cropped, 1200, 400, 'image/jpeg', 0.82),
    resizeCanvasToBlob(cropped, 1800, 600, 'image/jpeg', 0.85),
  ]);

  const base = (file.name || 'cover').replace(/\.[^/.]+$/, '');
  const ts = Date.now();

  const smFile = new File([smBlob], `${base}_${ts}_sm.jpg`, { type: 'image/jpeg', lastModified: ts });
  const mdFile = new File([mdBlob], `${base}_${ts}_md.jpg`, { type: 'image/jpeg', lastModified: ts });
  const lgFile = new File([lgBlob], `${base}_${ts}_lg.jpg`, { type: 'image/jpeg', lastModified: ts });

  return { sm: smFile, md: mdFile, lg: lgFile };
};
