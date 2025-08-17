/* Cache-buster: 20250702_123759 *//**
 * @fileoverview Vision Picturale - Bundled JavaScript
 * @description This file contains the bundled and minified code for the application
 * @version 1.0.0
 * @generated 2025-06-16T17:59:20.009Z
 * @copyright Vision Picturale 2025
 * @license MIT
 * @author Vision Picturale Team
 */


/**
 * @namespace DataProcessing
 * @description Functions and utilities for processing data within the application
 */
//  dataprocessing-start

/**
 * @namespace DataStorage
 * @description Functions and utilities for storing and retrieving data
 */
//  datastorage-start

/**
 * @namespace ChartFunctionality
 * @description Functions and components for chart rendering and manipulation
 */
//  chart-start

/**
 * @namespace EventListeners
 * @description Event handlers and listeners for user interactions
 */
//  events-start
(function () {
  const normalizeInput = document.createElement('link').relList;
  if (normalizeInput && normalizeInput.supports && normalizeInput.supports('modulepreload')) return;
  for (const startPoint of document.querySelectorAll('link[rel="modulepreload"]')) preloadModuleLink(startPoint);
  new MutationObserver((startPoint) => {
    for (const endPoint of startPoint)
      if (endPoint.type === 'childList')
        for (const imageDataURL of endPoint.addedNodes)
          imageDataURL.tagName === 'LINK' && imageDataURL.rel === 'modulepreload' && preloadModuleLink(imageDataURL);
  }).observe(document, { childList: !0, subtree: !0 });
  function windowSize(startPoint) {
    const endPoint = {};
    return (startPoint.integrity && (endPoint.integrity = startPoint.integrity), startPoint.referrerPolicy && (endPoint.referrerPolicy = startPoint.referrerPolicy), startPoint.crossOrigin === 'use-credentials'
      ? (endPoint.credentials = 'include')
      : startPoint.crossOrigin === 'anonymous'
        ? (endPoint.credentials = 'omit')
        : (endPoint.credentials = 'same-origin'), endPoint);
  }
  function preloadModuleLink(startPoint) {
    if (startPoint.ep) return;
    startPoint.ep = !0;
    const endPoint = windowSize(startPoint);
    fetch(startPoint.href, endPoint);
  }
})();
/**
 * @function buildCorrectionTableFromPoints
 * @description Builds a correction table from calibration points
 * @param {Array} calibrationPoints - The collection of calibration points used to build the correction table
 * @returns {Object} The generated correction table
 */
function buildCorrectionTableFromPoints(calibrationPoints) {
  if (!calibrationPoints || calibrationPoints.length < 2)
    throw new Error('Au moins 2 points de calibration sont nécessaires.');
  const normalizeInput = [...calibrationPoints].sort((preloadModuleLink, startPoint) => preloadModuleLink.measured - startPoint.measured),
    windowSize = new Array(256);
  for (let preloadModuleLink = 0; preloadModuleLink <= 255; preloadModuleLink++) {
    let startPoint = normalizeInput[0],
      endPoint = normalizeInput[normalizeInput.length - 1];
    for (let dataURL = 0; dataURL < normalizeInput.length - 1; dataURL++)
      if (preloadModuleLink >= normalizeInput[dataURL].measured && preloadModuleLink <= normalizeInput[dataURL + 1].measured) {
        (startPoint = normalizeInput[dataURL]), (endPoint = normalizeInput[dataURL + 1]);
        break;
      }
    let imageDataURL;
    if (endPoint.measured === startPoint.measured) imageDataURL = startPoint.expected;
    else {
      const dataURL = (preloadModuleLink - startPoint.measured) / (endPoint.measured - startPoint.measured);
      imageDataURL = startPoint.expected + dataURL * (endPoint.expected - startPoint.expected);
    }
    windowSize[preloadModuleLink] = Math.round(Math.max(0, Math.min(255, imageDataURL)));
  }
  return windowSize;
}
const buildRawTable = buildCorrectionTableFromPoints;

// Import des fonctions utilitaires depuis les modules APP
// Ces fonctions seront disponibles via les imports des modules dans main.js
const normalizeSamples = window.AppUtils?.normalizeSamples || function(calibrationPoints, normalizeInput = 0, windowSize = 255) {
  if (!calibrationPoints || !calibrationPoints.length) return [];
  const preloadModuleLink = Math.min(...calibrationPoints), startPoint = Math.max(...calibrationPoints);
  return preloadModuleLink === normalizeInput && startPoint === windowSize ? [...calibrationPoints] : startPoint === preloadModuleLink ? calibrationPoints.map(() => normalizeInput) : calibrationPoints.map((endPoint) => normalizeInput + ((endPoint - preloadModuleLink) / (startPoint - preloadModuleLink)) * (windowSize - normalizeInput));
};

const calculateMovingAverage = window.AppUtils?.calculateMovingAverage || function(calibrationPoints, normalizeInput = 20) {
  if (!calibrationPoints || !calibrationPoints.length) return [];
  const windowSize = new Array(calibrationPoints.length), preloadModuleLink = Math.floor(normalizeInput / 2);
  for (let startPoint = 0; startPoint < calibrationPoints.length; startPoint++) {
    let endPoint = 0, imageDataURL = 0;
    for (let dataURL = Math.max(0, startPoint - preloadModuleLink); dataURL <= Math.min(calibrationPoints.length - 1, startPoint + preloadModuleLink); dataURL++) (endPoint += calibrationPoints[dataURL]), imageDataURL++;
    windowSize[startPoint] = Math.round(endPoint / imageDataURL);
  }
  return windowSize;
};

const enforceMonotonicityAndSlope = window.AppUtils?.enforceMonotonicityAndSlope || function(calibrationPoints, { min: normalizeInput = 0, max: windowSize = 1 / 0 } = {}) {
  if (!calibrationPoints || !calibrationPoints.length) return [];
  const preloadModuleLink = [...calibrationPoints];
  for (let startPoint = 1; startPoint < preloadModuleLink.length; startPoint++) preloadModuleLink[startPoint] < preloadModuleLink[startPoint - 1] && (preloadModuleLink[startPoint] = preloadModuleLink[startPoint - 1]);
  for (let startPoint = 1; startPoint < preloadModuleLink.length; startPoint++) {
    const endPoint = preloadModuleLink[startPoint] - preloadModuleLink[startPoint - 1];
    endPoint > windowSize && (preloadModuleLink[startPoint] = preloadModuleLink[startPoint - 1] + windowSize), endPoint < normalizeInput && (preloadModuleLink[startPoint] = preloadModuleLink[startPoint - 1] + normalizeInput);
  }
  return preloadModuleLink;
};
const CoreUtils = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      buildCorrectionTableFromPoints: buildCorrectionTableFromPoints,
      buildRawTable: buildRawTable,
      calculateMovingAverage: calculateMovingAverage,
      enforceMonotonicityAndSlope: enforceMonotonicityAndSlope,
      normalizeSamples: normalizeSamples,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);
/**
 * @function buildStandardTable
 * @description Creates a standard correction table with normalization settings
 * @param {Array} calibrationPoints - The collection of calibration points
 * @param {Object} options - Configuration options
 * @param {boolean} [options.normalizeInput=true] - Whether to normalize input values
 * @param {number} [options.windowSize=20] - The size of the processing window
 * @returns {Object} The generated standard table
 */
function buildStandardTable(calibrationPoints, { normalizeInput: normalizeInput = !0, windowSize: windowSize = 20 } = {}) {
  if (!calibrationPoints || calibrationPoints.length < 2)
    throw new Error(
      'Au moins 2 échantillons sont nécessaires pour construire une table de correction.',
    );
  console.log('[Standard] Étape 1: Préparation des échantillons', {
    count: calibrationPoints.length,
    min: Math.min(...calibrationPoints),
    max: Math.max(...calibrationPoints),
  });
  console.log('[Standard] Valeurs avant normalisation:', calibrationPoints);
  let preloadModuleLink = calibrationPoints;
  if (normalizeInput) {
    const B = Math.min(...calibrationPoints),
      N = Math.max(...calibrationPoints);
    (B > 10 || N < 245) &&
      (console.warn(
        '[Standard] Normalisation requise: les échantillons ne couvrent pas toute la plage de valeurs',
      ),
      (preloadModuleLink = normalizeSamples(calibrationPoints)),
      console.log('[Standard] Échantillons normalisés:', {
        min: Math.min(...preloadModuleLink),
        max: Math.max(...preloadModuleLink),
      }),
      console.log('[Standard] Valeurs après normalisation:', preloadModuleLink));
  }
  console.log('[Standard] Étape 2: Création des points de calibration');
  const startPoint = preloadModuleLink.map((B, N) => ({
    measured: B,
    expected: 255 - Math.round((N / (preloadModuleLink.length - 1)) * 255),
  }));
  startPoint.unshift({ measured: 0, expected: 0 }),
  startPoint.push({ measured: 255, expected: 255 }),
  startPoint.sort((B, N) => B.measured - N.measured),
  console.log('[Standard] Étape 3: Construction de la table brute');
  const endPoint = buildCorrectionTableFromPoints(startPoint);
  console.log('[Standard] Étape 4: Lissage par moyenne mobile');
  const imageDataURL = calculateMovingAverage(endPoint, windowSize);
  console.log(
    '[Standard] Étape 5: Application des contraintes de monotonicité et pente',
  );
  const dataURL = enforceMonotonicityAndSlope(imageDataURL, { min: 0.2, max: 5 });
  return console.log('[Standard] Table de correction générée avec succès'), dataURL;
}
/**
 * @function buildCorrectionTablePro
 * @description Creates an advanced correction table with professional-grade settings
 * @param {Array} calibrationPoints - The collection of calibration points
 * @param {Object} options - Advanced configuration options
 * @returns {Object} The generated professional-grade correction table
 */
function buildCorrectionTablePro(
  calibrationPoints,
  { fromOrangeCurve: normalizeInput = !1, normalizeInput: windowSize = !0, windowSize: preloadModuleLink = 20 } = {},
) {
  if (!calibrationPoints || calibrationPoints.length < 2)
    throw new Error(
      'Au moins 2 points sont nécessaires pour construire une table de correction Pro.',
    );
  console.log('[Pro] Étape 1: Préparation des données', {
    type: normalizeInput ? 'courbe brute' : 'échantillons',
    count: calibrationPoints.length,
  });
  let startPoint = [];
  if (normalizeInput)
    console.log(
      '[Pro] Transformation de la courbe brute en points de calibration',
    ),
    (startPoint = calibrationPoints.map((B) => ({ measured: B.y, expected: B.x })));
  else {
    console.log('[Pro] Traitement des échantillons bruts');
    let B = calibrationPoints;
    if (windowSize) {
      const N = Math.min(...calibrationPoints),
        Q = Math.max(...calibrationPoints);
      (N > 10 || Q < 245) &&
        (console.warn(
          '[Pro] Normalisation requise: les échantillons ne couvrent pas toute la plage',
        ),
        (B = normalizeSamples(calibrationPoints)),
        console.log('[Pro] Échantillons normalisés:', {
          min: Math.min(...B),
          max: Math.max(...B),
        }));
    }
    for (let N = 0; N < B.length; N++) {
      const Q = N / (B.length - 1),
        F = 255 - Math.round(Q * 255);
      startPoint.push({ measured: B[N], expected: F });
    }
  }
  console.log('[Pro] Étape 2: Préparation des points de calibration'),
  startPoint.sort((B, N) => B.measured - N.measured),
  startPoint[0].measured > 0 && startPoint.unshift({ measured: 0, expected: 0 }),
  startPoint[startPoint.length - 1].measured < 255 && startPoint.push({ measured: 255, expected: 255 }),
  console.log('[Pro] Points de calibration préparés avec extrémités:', {
    min: startPoint[0],
    max: startPoint[startPoint.length - 1],
    count: startPoint.length,
  }),
  console.log('[Pro] Étape 3: Construction de la table brute');
  const endPoint = buildCorrectionTableFromPoints(startPoint);
  console.log('[Pro] Étape 4: Application du lissage par moyenne mobile');
  const imageDataURL = calculateMovingAverage(endPoint, preloadModuleLink);
  console.log(
    '[Pro] Étape 5: Application des contraintes de monotonicité et pente',
  );
  const dataURL = enforceMonotonicityAndSlope(imageDataURL, { min: 0.2, max: 5 });
  return ((dataURL[0] = 0), (dataURL[255] = 255), console.log('[Pro] Table de correction Pro générée avec succès'), dataURL);
}
const Pipelines = Object.freeze(
  Object.defineProperty(
    { __proto__: null, buildCorrectionTablePro: buildCorrectionTablePro, buildStandardTable: buildStandardTable },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);
console.log('Chargement des modules:');
console.log('- CoreUtils:', Object.keys(CoreUtils));
console.log('- Pipelines:', Object.keys(Pipelines));
const coreFunctionNames = [
    'buildCorrectionTableFromPoints',
    'normalizeSamples',
    'calculateMovingAverage',
    'enforceMonotonicityAndSlope',
  ],
  pipelineFunctionNames = ['buildStandardTable', 'buildCorrectionTablePro'],
  missingCoreFunctions = coreFunctionNames.filter((calibrationPoints) => typeof CoreUtils[calibrationPoints] != 'function'),
  missingPipelineFunctions = pipelineFunctionNames.filter((calibrationPoints) => typeof Pipelines[calibrationPoints] != 'function');
missingCoreFunctions.length > 0 && console.warn('⚠️ Fonctions de base manquantes:', missingCoreFunctions);
missingPipelineFunctions.length > 0 && console.warn('⚠️ Pipelines manquants:', missingPipelineFunctions);
window.CurvesLib = {
  ...CoreUtils,
  ...Pipelines,
  version: '1.0.0',
  author: 'Vision Picturale',
  description:
    'Bibliothèque de génération de courbes de correction unifiée pour Vision Picturale',
};
console.log(
  `CurvesLib v${window.CurvesLib.version} initialisée avec ${Object.keys(window.CurvesLib).length} fonctions`,
);
console.log(
  'CurvesLib chargée avec succès, version:',
  window.CurvesLib.version,
);
/**
 * @function detectCurrentPage
 * @description Detects the current page the user is viewing in the application
 * @returns {string} The identifier for the current page
 */
function detectCurrentPage() {
  console.log('[DEBUG] detectCurrentPage() appelée');
  const calibrationPoints = document.querySelector('.step-panel.active');
  if (calibrationPoints) {
    const windowSize = calibrationPoints.id;
    if ((console.log('[DEBUG] Panneau actif détecté:', windowSize), windowSize === 'step2')) {
      const preloadModuleLink = document.querySelector('#step2 .sub-step.active');
      if (preloadModuleLink)
        switch (
          (console.log('[DEBUG] Sous-étape active dans step2:', preloadModuleLink.id), preloadModuleLink.id)
        ) {
        case 'subStep1':
          return 'generationMire';
        case 'subStep2':
          return 'scanImport';
        case 'subStep3':
        case 'subStepPro':
          return 'analyseColorimetrique';
        }
      return (
        console.log(
          '[DEBUG] Aucune sous-étape active dans step2, fallback sur generationMire',
        ),
        'generationMire'
      );
    }
    if (windowSize === 'step3')
      return (
        console.log('[DEBUG] Page détectée: transformationImages'),
        'transformationImages'
      );
    if (windowSize === 'libraryPanel')
      return console.log('[DEBUG] Page détectée: library'), 'library';
    if (windowSize === 'homePanel')
      return console.log('[DEBUG] Page détectée: home'), 'home';
  }
  const normalizeInput = document.querySelector('.bottom-nav button.active');
  if (normalizeInput) {
    const windowSize = normalizeInput.id;
    switch ((console.log('[DEBUG] Bouton de navigation actif:', windowSize), windowSize)) {
    case 'btnNavHome':
      return 'home';
    case 'btnNavMire':
      return 'generationMire';
    case 'btnNavCourbe':
      return 'analyseColorimetrique';
    case 'btnNavNegatif':
      return 'transformationImages';
    case 'btnNavLibrary':
      return 'library';
    }
  }
  return console.log('[DEBUG] Aucune page détectée, fallback sur home'), 'home';
}
/**
 * @function updateTooltipContent
 * @description Updates the content of tooltips based on the current context
 * @returns {void}
 */
function updateTooltipContent() {
  const calibrationPoints = detectCurrentPage();
  console.log('[DEBUG] Page détectée pour info-bulle:', calibrationPoints);
  const normalizeInput = document.querySelector('.info-modal-body'),
    preloadModuleLink = document.getElementById('infoModalContent') || normalizeInput;
  if (preloadModuleLink) {
    console.log(
      '[DEBUG] window.getTooltipData disponible:',
      typeof window.getTooltipData,
    ),
    console.log(
      '[DEBUG] window.INFO_TOOLTIPS_DATA disponible:',
      typeof window.INFO_TOOLTIPS_DATA,
    );
    const startPoint = window.getTooltipData ? window.getTooltipData(calibrationPoints) : null;
    if (startPoint)
      console.log('[DEBUG] Info-bulle trouvée:', startPoint.title),
      (preloadModuleLink.innerHTML = `<h3>${startPoint.title}</h3>${startPoint.content}`);
    else if (
      (console.log(
        '[DEBUG] Aucune info-bulle trouvée, utilisation du fallback',
      ),
      window.INFO_TOOLTIPS_DATA && window.INFO_TOOLTIPS_DATA[calibrationPoints])
    ) {
      const endPoint = window.INFO_TOOLTIPS_DATA[calibrationPoints];
      console.log('[DEBUG] Accès direct réussi:', endPoint.title),
      (preloadModuleLink.innerHTML = `<h3>${endPoint.title}</h3>${endPoint.content}`);
    } else
      preloadModuleLink.innerHTML = `
          <h3>🏠 Vision Picturale</h3>
          <p>Système de calibrage colorimétrique professionnel pour l'impression photographique.</p>
          <div class="info-highlight">
            <p>💡 Chargement des informations détaillées...</p>
          </div>
        `;
    (preloadModuleLink.style.opacity = '0'),
    setTimeout(() => {
      (preloadModuleLink.style.transition = 'opacity 0.3s ease'), (preloadModuleLink.style.opacity = '1');
    }, 50);
  } else console.log('[DEBUG] Aucun conteneur trouvé pour les info-bulles');
}
const mt = window.showStep;
mt &&
  /**
   * @function window.showStep
   * @description Displays a specific step in the user interface
   * @param {number|string} calibrationPoints - The step identifier or data points
   * @returns {void}
   * @global
   */
  (window.showStep = function (calibrationPoints) {
    mt(calibrationPoints), setTimeout(updateTooltipContent, 150);
  });
const gt = window.showPanel;
gt &&
  /**
   * @function window.showPanel
   * @description Shows a specific panel in the user interface
   * @param {number|string} calibrationPoints - The panel identifier or data points
   * @returns {void}
   * @global
   */
  (window.showPanel = function (calibrationPoints) {
    gt(calibrationPoints), setTimeout(updateTooltipContent, 150);
  });
const ft = window.showSubStep;
ft &&
  /**
   * @function window.showSubStep
   * @description Displays a sub-step within the current step
   * @param {number|string} calibrationPoints - The sub-step identifier or data points
   * @returns {void}
   * @global
   */
  (window.showSubStep = function (calibrationPoints) {
    ft(calibrationPoints), setTimeout(updateTooltipContent, 150);
  });
/**
 * Event listener for DOMContentLoaded event
 * @event DOMContentLoaded
 * @description Initializes the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('[DEBUG] DOM chargé, initialisation des info-bulles'),
  setTimeout(updateTooltipContent, 500),
  document.addEventListener('click', function (dataURL) {
    (dataURL.target.matches('.bottom-nav button') ||
        dataURL.target.closest('.bottom-nav button')) &&
        (console.log('[DEBUG] Clic sur navigation détecté'),
        setTimeout(updateTooltipContent, 300)),
    (dataURL.target.matches('[id^="btn"]') || dataURL.target.closest('[id^="btn"]')) &&
          (console.log('[DEBUG] Clic sur bouton détecté'), setTimeout(updateTooltipContent, 300)),
    (dataURL.target.matches('[id*="next"], [id*="back"], [id*="pro"]') ||
          dataURL.target.closest('[id*="next"], [id*="back"], [id*="pro"]')) &&
          (console.log('[DEBUG] Clic sur bouton de navigation d\'étape détecté'),
          setTimeout(updateTooltipContent, 300));
  });
  const calibrationPoints = new MutationObserver(function (dataURL) {
    dataURL.forEach(function (B) {
      if (B.type === 'attributes' && B.attributeName === 'class') {
        const N = B.target;
        (N.classList.contains('step-panel') ||
          N.classList.contains('sub-step')) &&
          (console.log('[DEBUG] Changement de classe détecté sur:', N.id),
          setTimeout(updateTooltipContent, 100));
      }
    });
  });
  document.querySelectorAll('.step-panel, .sub-step').forEach((dataURL) => {
    calibrationPoints.observe(dataURL, { attributes: !0, attributeFilter: ['class'] });
  });
  function windowSize() {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }
  function preloadModuleLink() {
    var pe;
    const dataURL = document.getElementById('infoModal'),
      B = document.querySelector('.info-modal-content'),
      N = document.querySelector('.info-modal-body');
    if (!dataURL || !B || !N) return;
    const Q = windowSize(),
      F = window.innerWidth <= 480,
      $ = window.innerHeight <= 700;
    if (
      (console.log(
        '[DEBUG] Optimisation modal - iOS:',
        Q,
        'Mobile:',
        F,
        'Petit écran:',
        $,
      ),
      Q || F)
    ) {
      let de = window.innerHeight;
      Q && (de = window.innerHeight - 120);
      const isAutoRegenerating = Math.min(de * 0.85, de - 40);
      (B.style.maxHeight = isAutoRegenerating + 'px'),
      (B.style.margin = F ? '5px' : '10px'),
      (B.style.overflowY = 'auto'),
      (B.style.webkitOverflowScrolling = 'touch');
      const ye =
          ((pe = document.querySelector('.info-modal-header')) == null
            ? void 0
            : pe.offsetHeight) || 60,
        _ = isAutoRegenerating - ye - 20;
      (N.style.maxHeight = _ + 'px'),
      (N.style.overflowY = 'auto'),
      (N.style.webkitOverflowScrolling = 'touch'),
      window.innerWidth <= 320 &&
          ((N.style.fontSize = '0.8rem'), (N.style.lineHeight = '1.4')),
      console.log(
        '[DEBUG] Modal optimisée - Hauteur disponible:',
        de,
        'Hauteur modal:',
        isAutoRegenerating,
      );
    } else
      (B.style.maxHeight = ''),
      (B.style.margin = ''),
      (N.style.maxHeight = ''),
      (N.style.fontSize = ''),
      (N.style.lineHeight = '');
  }
  const startPoint = document.getElementById('infoButton'),
    endPoint = document.getElementById('infoModal'),
    imageDataURL = document.getElementById('closeInfoModal');
  console.log('[DEBUG] Configuration bouton info - startPoint:', !!startPoint, 'endPoint:', !!endPoint);
  startPoint &&
    endPoint &&
    (startPoint.addEventListener('click', function (dataURL) {
      dataURL.preventDefault(),
      dataURL.stopPropagation(),
      console.log('[DEBUG] Ouverture de la modal d\'info'),
      console.log('[DEBUG] Classes avant:', endPoint.className);
      console.log('[DEBUG] INFO_TOOLTIPS_DATA disponible:', typeof window.INFO_TOOLTIPS_DATA);
      updateTooltipContent(),
      preloadModuleLink(),
      endPoint.classList.remove('hidden'),
      endPoint.classList.add('show'),
      console.log('[DEBUG] Classes après:', endPoint.className);
      (document.body.style.overflow = 'hidden'),
      setTimeout(function () {
        preloadModuleLink();
      }, 50);
    }),
    imageDataURL &&
      imageDataURL.addEventListener('click', function (dataURL) {
        dataURL.preventDefault(),
        dataURL.stopPropagation(),
        endPoint.classList.remove('show'),
        (document.body.style.overflow = '');
      }),
    endPoint.addEventListener('click', function (dataURL) {
      dataURL.target === endPoint &&
        (endPoint.classList.remove('show'), (document.body.style.overflow = ''));
    }),
    document.addEventListener('keydown', function (dataURL) {
      dataURL.key === 'Escape' &&
        endPoint.classList.contains('show') &&
        (endPoint.classList.remove('show'), (document.body.style.overflow = ''));
    }),
    window.addEventListener('resize', function () {
      endPoint.classList.contains('show') && preloadModuleLink();
    }),
    window.addEventListener('orientationchange', function () {
      setTimeout(function () {
        endPoint.classList.contains('show') && preloadModuleLink();
      }, 100);
    }));
});
window.debugPanels = function () {
  console.log('=== DEBUG PANNEAUX ==='),
  document.querySelectorAll('.step-panel').forEach((windowSize) => {
    console.log(
      `Panneau ${windowSize.id}:`,
      windowSize.classList.contains('active') ? 'ACTIF' : 'INACTIF',
    );
  }),
  document.querySelectorAll('.sub-step').forEach((windowSize) => {
    console.log(
      `Sous-étape ${windowSize.id}:`,
      windowSize.classList.contains('active') ? 'ACTIF' : 'INACTIF',
    );
  }),
  console.log('Page détectée:', detectCurrentPage()),
  console.log('=== FIN DEBUG ===');
};
let patchValues = [];
window.customizationOptions = {
  paperSize: 'A4',
  orientation: 'portrait',
  background: 'black',
  frame: 'none',
  registration: 'off',
};
/**
 * @function getActiveGenerateButton
 * @description Gets the currently active generation button
 * @returns {string|null} The ID of the active button or null
 */
function getActiveGenerateButton() {
  const calibrationPoints = ['btnGenerateNegative', 'btnGeneratePositive', 'btnGenerateCMJN'];
  for (const normalizeInput of calibrationPoints) {
    const windowSize = document.getElementById(normalizeInput);
    if (windowSize && windowSize.classList.contains('active')) return normalizeInput;
  }
  return null;
}
let Le = !1;
/**
 * @function triggerAutoRegeneration
 * @description Initiates the automatic regeneration process for visual elements
 * @returns {void}
 */
function triggerAutoRegeneration() {
  if (Le) {
    console.log('Régénération déjà en cours, saut...');
    return;
  }
  
  // Vérifier si on est encore dans step3 avant de continuer
  const currentPanel = document.querySelector('.step-panel.active');
  if (!currentPanel || currentPanel.id !== 'step3') {
    console.log('Plus dans step3, annulation de la régénération automatique');
    Le = false;
    return;
  }
  
  const calibrationPoints = getActiveGenerateButton(),
    normalizeInput = document.getElementById('curveSelector');
  if (!calibrationPoints) {
    console.log('Aucun bouton de génération actif détecté');
    return;
  }
  if (!window.importedImageFile) {
    console.log('Aucune image importée pour la régénération');
    return;
  }
  if (!normalizeInput || !normalizeInput.value || normalizeInput.value === '-1') {
    console.log('Aucune courbe sélectionnée pour la régénération');
    return;
  }
  console.log('Régénération automatique déclenchée pour:', calibrationPoints),
  (Le = !0),
  showRegenerationIndicator('Mise à jour automatique', 'Régénération en cours...'),
  animatePreviewRefresh(calibrationPoints);
  const windowSize = document.getElementById(calibrationPoints);
  windowSize
    ? setTimeout(() => {
      // Vérifier à nouveau si on est encore dans step3 avant de cliquer
      const stillInStep3 = document.querySelector('.step-panel.active');
      if (stillInStep3 && stillInStep3.id === 'step3') {
        windowSize.click();
      } else {
        console.log('Plus dans step3, annulation du clic de génération');
      }
      setTimeout(() => {
        Le = !1;
      }, 1e3);
    }, 200)
    : (Le = !1);
}
/**
 * @function showRegenerationIndicator
 * @description Displays a visual indicator when regeneration is in progress with full screen overlay
 * @param {string} title - Custom title for the overlay (default: "Mise à jour automatique")
 * @param {string} subtitle - Custom subtitle for the overlay (default: "Génération en cours...")
 * @returns {void}
 */
function showRegenerationIndicator(title = 'Mise à jour automatique', subtitle = 'Génération en cours...') {
  const calibrationPoints = document.getElementById('regenIndicator');
  calibrationPoints && calibrationPoints.remove();
  const normalizeInput = document.createElement('div');
  if (
    ((normalizeInput.id = 'regenIndicator'),
    (normalizeInput.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(2px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeInOverlay 0.3s ease-out;
    ">
      <div style="
        background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
        color: white;
        padding: 24px 32px;
        border-radius: 16px;
        font-size: 1rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 8px 32px rgba(255, 107, 53, 0.4), 0 4px 16px rgba(0, 0, 0, 0.1);
        animation: bounceIn 0.5s ease-out 0.1s both;
        min-width: 280px;
        text-align: center;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: spinPulse 1.5s ease-in-out infinite;
        ">
          <i class="fas fa-sync-alt" style="font-size: 18px;"></i>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 1.1rem; margin-bottom: 4px;">${title}</div>
          <div style="font-size: 0.85rem; opacity: 0.9;">${subtitle}</div>
        </div>
      </div>
    </div>
  `),
    !document.getElementById('regenIndicatorStyles'))
  ) {
    const windowSize = document.createElement('style');
    (windowSize.id = 'regenIndicatorStyles'),
    (windowSize.textContent = `
      @keyframes fadeInOverlay {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      @keyframes fadeOutOverlay {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes bounceIn {
        0% { 
          opacity: 0; 
          transform: scale(0.3) translateY(30px); 
        }
        50% { 
          opacity: 1; 
          transform: scale(1.05) translateY(-10px); 
        }
        70% { 
          transform: scale(0.95) translateY(5px); 
        }
        100% { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
      @keyframes spinPulse {
        0% { 
          transform: rotate(0deg) scale(1); 
          background: rgba(255, 255, 255, 0.2);
        }
        25% { 
          transform: rotate(90deg) scale(1.1); 
          background: rgba(255, 255, 255, 0.3);
        }
        50% { 
          transform: rotate(180deg) scale(1); 
          background: rgba(255, 255, 255, 0.2);
        }
        75% { 
          transform: rotate(270deg) scale(1.1); 
          background: rgba(255, 255, 255, 0.3);
        }
        100% { 
          transform: rotate(360deg) scale(1); 
          background: rgba(255, 255, 255, 0.2);
        }
      }
    `),
    document.head.appendChild(windowSize);
  }
  document.body.appendChild(normalizeInput),
  setTimeout(() => {
    const windowSize = document.getElementById('regenIndicator');
    windowSize &&
        ((windowSize.style.animation = 'fadeOutOverlay 0.3s ease-in forwards'),
        setTimeout(() => {
          windowSize.parentNode && windowSize.remove();
        }, 300));
  }, 2e3);
}
/**
 * @function animatePreviewRefresh
 * @description Animates the refresh of the preview panel with visual transition effects
 * @param {Array|Object} calibrationPoints - Data points or configuration for the animation
 * @returns {void}
 */
function animatePreviewRefresh(calibrationPoints) {
  let normalizeInput = null;
  switch (calibrationPoints) {
  case 'btnGenerateNegative':
  case 'btnGeneratePositive':
    normalizeInput = document.getElementById('correctedImagePreview');
    break;
  case 'btnGenerateCMJN':
    normalizeInput = document.querySelector('#colorPreviewContainer img:not(.hidden)');
    break;
  }
  normalizeInput &&
    !normalizeInput.classList.contains('hidden') &&
    ((normalizeInput.style.transition = 'all 0.3s ease'),
    (normalizeInput.style.opacity = '0.6'),
    (normalizeInput.style.filter = 'blur(1px)'),
    setTimeout(() => {
      (normalizeInput.style.opacity = '1'), (normalizeInput.style.filter = 'none');
    }, 1500));
}
/**
 * @function updateCustomizationOption
 * @description Updates a customization option based on user selection
 * @param {string|Object} calibrationPoints - The option identifier or configuration data
 * @param {boolean} normalizeInput - Whether to normalize the input values
 * @returns {Object} The updated configuration
 */
function updateCustomizationOption(calibrationPoints, normalizeInput) {
  (window.customizationOptions[calibrationPoints] = normalizeInput),
  document
    .querySelectorAll(`.segment-btn[data-option="${calibrationPoints}"]`)
    .forEach((windowSize) => {
      windowSize.classList.remove('active');
    }),
  document
    .querySelectorAll(`.segment-btn[data-option="${calibrationPoints}"][data-value="${normalizeInput}"]`)
    .forEach((windowSize) => {
      windowSize.classList.add('active');
    }),
  triggerAutoRegeneration(),
  console.log(`Option ${calibrationPoints} mise à jour:`, normalizeInput);
}
window.setCustomizationOption = updateCustomizationOption;
window.setCustomizationOption = updateCustomizationOption;
/** @function getCustomizationOption */
function getCustomizationOption(calibrationPoints) {
  return window.customizationOptions[calibrationPoints];
}
/** @function initializeCustomizationControls */
function initializeCustomizationControls() {
  console.log('[DEBUG] initializeCustomizationControls CALLED.'),
  document.addEventListener('click', function (calibrationPoints) {
    const normalizeInput = calibrationPoints.target.closest('.segment-btn[data-option]');
    if (normalizeInput) {
      console.log('[DEBUG] Option button clicked. Element:', normalizeInput);
      const windowSize = normalizeInput.getAttribute('data-option'),
        preloadModuleLink = normalizeInput.getAttribute('data-value');
      console.log('[DEBUG] Extracted attributes - Option:', windowSize, 'Value:', preloadModuleLink),
      windowSize && preloadModuleLink
        ? updateCustomizationOption(windowSize, preloadModuleLink)
        : console.log(
          '[DEBUG] ERROR: Missing data-option or data-value attribute on button:',
          normalizeInput,
        );
    }
  }),
  console.log(
    'Contrôles de personnalisation initialisés (avec logs de débogage détaillés).',
  );
}
window.onload = function () {
  initializeCustomizationControls();
  let calibrationPoints = -1,
    normalizeInput = -1,
    windowSize = JSON.parse(localStorage.getItem('savedCurves')) || [],
    preloadModuleLink = [],
    startPoint = Array(256)
      .fill(0)
      .map((width, height) => height),
    endPoint = Array(256)
      .fill(0)
      .map((width, height) => height),
    imageDataURL = null,
    dataURL = '',
    B = null;
  (window.importedImageFile = null), (window.histogramChart = null);
  let N = null,
    Q = 0,
    F = { tx: 0, ty: 0, scale: 1, rotation: 0 },
    $ = { tx: 0, ty: 0, scale: 1, rotation: 0 },
    pe = [],
    de = [],
    isAutoRegenerating = !1,
    ye = null;
  document.getElementById('nextToStep3').style.display = 'none';
  const _ = 5,
    re = _ * _,
    me = 0.5,
    V = { rows: 6, cols: 10 },
    ee = V.rows * V.cols,
    se = 0.5;
  let ge;
  const pt = 'ImageLibrary',
    te = 'processedImages';
  console.log('Application chargée. Courbes initiales :', windowSize);
  let measuredPatchValues = [];
  window['chartjs-plugin-dragdata'] &&
    Chart.register(window['chartjs-plugin-dragdata']);
  
  // Plugin personnalisé pour dessiner un cadre autour du graphique
  const chartBorderPlugin = {
    id: 'chartBorder',
    afterDraw: function(chart, args, options) {
      const { ctx, chartArea: { left, top, right, bottom } } = chart;
      ctx.save();
      ctx.strokeStyle = options.borderColor || '#666';
      ctx.lineWidth = options.borderWidth || 2;
      ctx.strokeRect(left, top, right - left, bottom - top);
      ctx.restore();
    }
  };
  Chart.register(chartBorderPlugin);
  /** @function initializeIndexedDB */
  function initializeIndexedDB() {
    const width = indexedDB.open(pt, 1);
    (width.onupgradeneeded = function (height) {
      (ge = height.target.result),
      // Exposer les variables globalement dès la création
      window.ge = ge;
      window.te = te;
      ge.createObjectStore(te, { keyPath: 'id', autoIncrement: !0 });
    }),
    (width.onsuccess = function (height) {
      (ge = height.target.result),
      // Exposer les variables globalement pour les scripts externes
      window.ge = ge;
      window.te = te;
      console.log('IndexedDB initialisé avec succès. Variables exposées globalement.');
      
      // Déclencher un événement personnalisé pour signaler que IndexedDB est prêt
      const indexedDBReadyEvent = new CustomEvent('indexedDBReady', {
        detail: { ge: ge, te: te }
      });
      document.dispatchEvent(indexedDBReadyEvent);
      
      loadImagesFromIndexedDB();
    }),
    (width.onerror = function (height) {
      console.error(
        'Erreur lors de l\'initialisation d\'IndexedDB :',
        height.target.error,
      );
    });
  }
  initializeIndexedDB();
  /** @function loadImagesFromIndexedDB */
  function loadImagesFromIndexedDB() {
    console.log('🔄 loadImagesFromIndexedDB appelée...');
    const eventObj = ge.transaction([te], 'readonly').objectStore(te).getAll();
    (eventObj.onsuccess = function (t) {
      (preloadModuleLink = t.target.result || []),
      console.log('📦 Images chargées depuis IndexedDB :', preloadModuleLink.length, 'images'),
      console.log('🎯 Détail des images:', preloadModuleLink),
      displayArchiveContainers();
    }),
    (eventObj.onerror = function (t) {
      console.error('❌ Erreur lors du chargement :', t.target.error);
    });
  }
  
  // Exposer la fonction globalement pour les scripts externes
  window.loadImagesFromIndexedDB = loadImagesFromIndexedDB;
  function _e(width, height) {
    const eventObj = ['jpg', 'jpeg', 'png'],
      t = document.getElementById(height);
    if (((t.textContent = ''), t.classList.add('hidden'), !width)) return !1;
    const a = width.name.split('.').pop().toLowerCase();
    return eventObj.includes(a)
      ? !0
      : ((t.textContent =
          'Erreur : Seuls les formats JPG, JPEG et PNG sont acceptés.'),
      t.classList.remove('hidden'),
      !1);
  }
  function hideSaveForms() {
    const width = document.getElementById('saveImageNavigation'),
      height = document.getElementById('negativeImageName');
    width && (width.style.display = 'none'), height && (height.value = '');
    const eventObj = document.getElementById('saveFormsContainer');
    eventObj && eventObj.classList.add('hidden');
    const t = document.getElementById('saveFormsContent');
    t && (t.innerHTML = ''),
    window.fixedNavigation &&
        typeof window.fixedNavigation.update == 'function' &&
        (window.fixedNavigation.update(),
        console.log(
          'Position de la barre de navigation mise à jour après avoir caché les formulaires',
        )),
    console.log('Formulaires CMJN et autres cachés et vidés');
  }
  function showPanelById(width) {
    hideSaveForms();
    const height = document.querySelector('.top-nav-buttons');
    height && (height.style.display = 'none'),
    document.querySelectorAll('.step-panel').forEach((eventObj) => {
      eventObj.classList.remove('active');
    }),
    document.getElementById(width).classList.add('active'),
    window.fixedNavigation &&
        typeof window.fixedNavigation.update == 'function' &&
        setTimeout(() => {
          window.fixedNavigation.update();
        }, 100),
    console.log('Panneau affiché :', width, '- top-nav-buttons masqués');
  }
  function showSubStepById(width) {
    console.log('Attempting to show sub-step:', width),
    document.querySelectorAll('#step2 .sub-step').forEach((eventObj) => {
      eventObj.classList.remove('active');
    });
    const height = document.getElementById(width);
    if (height) {
      if (
        (height.classList.add('active'),
        console.log('Sub-step activated:', width),
        width === 'subStep3')
      ) {
        console.log(
          'Mode dans subStep3:',
          window.useProCompensation ? 'Pro' : 'Standard',
        );
        const eventObj = document.querySelector('.top-nav-buttons');
        eventObj &&
          ((eventObj.style.display = 'flex'),
          window.fixedNavigation &&
            typeof window.fixedNavigation.update == 'function' &&
            setTimeout(() => {
              window.fixedNavigation.update();
            }, 100)),
        window.histogramChart && renderHistogramChart();
      } else if (width === 'subStepPro') {
        (window.useProCompensation = !0),
        console.log('Mode Pro activé automatiquement dans subStepPro');
        const eventObj = document.querySelector('.top-nav-buttons');
        eventObj &&
          ((eventObj.style.display = 'flex'),
          window.fixedNavigation &&
            typeof window.fixedNavigation.update == 'function' &&
            setTimeout(() => {
              window.fixedNavigation.update();
            }, 100)),
        window.histogramChart && renderHistogramChart();
      } else if (width === 'subStep2') {
        (window.useProCompensation = !1),
        console.log('Mode standard forcé dans subStep2');
        const eventObj = document.querySelector('.top-nav-buttons');
        eventObj && (eventObj.style.display = 'none'), renderDefaultMire();
      }
      updateSaveButtonLabel();
    } else console.error('Sub-step not found:', width);
    width === 'subStep3' &&
      B &&
      (console.log('Loading scanned file for subStep3:', B),
      loadImageFile(B).then((eventObj) => analyzeStandardCalibration(eventObj))),
    width === 'subStepPro' &&
        B &&
        (console.log('Loading scanned file for subStepPro:', B),
        stopProOverlay(),
        startProAnimation(),
        loadImageFile(B).then((eventObj) => analyzeProCalibration(eventObj)));
  }
  function renderDefaultMire() {
    const u = document.createElement('canvas');
    (u.width = 692), (u.height = 580);
    const l = u.getContext('2d');
    (l.fillStyle = '#fff'), l.fillRect(0, 0, 692, 580);
    for (let x = 0; x < 25; x++) {
      const I = x / 24,
        R = 255 - Math.round(I * 255),
        A = x % 5,
        H = Math.floor(x / 5),
        D = 10 + A * 112,
        z = 10 + H * 112;
      (l.fillStyle = `rgb(${R},${R},${R})`), l.fillRect(D, z, 112, 112);
    }
    const y = 10 + 560,
      adjustColorValue = 10,
      w = l.createLinearGradient(0, adjustColorValue + 560, 0, adjustColorValue);
    w.addColorStop(0, '#000000'),
    w.addColorStop(1, '#ffffff'),
    (l.fillStyle = w),
    l.fillRect(y, adjustColorValue, 112, 560),
    (l.strokeStyle = '#888888'),
    (l.lineWidth = 2),
    l.strokeRect(10 - 1, 10 - 1, 560 + 112 + 2, 560 + 2);
    const blueValue = u.toDataURL('image/png'),
      C = document.getElementById('scannedChartPreview');
    C &&
      ((C.src = blueValue),
      C.classList.remove('hidden'),
      (C.dataset.defaultMire = 'true'),
      console.log(
        'Mire positive avec dégradé affichée par défaut dans subStep2',
      ));
  }
  /** @function displayArchiveContainers */
  function displayArchiveContainers() {
    const width = document.getElementById('mireArchiveContainer'),
      height = document.getElementById('imageArchiveContainer');
    if (((width.innerHTML = ''), (height.innerHTML = ''), windowSize.length)) {
      width.innerHTML = '';
      const eventObj = document.createElement('div');
      (eventObj.className = 'library-grid'),
      windowSize.forEach((t, a) => {
        const index = document.createElement('div');
        index.className = 'card';
        const s = document.createElement('div');
        if (
          ((s.textContent = `Courbe : ${t.info}`), index.appendChild(s), t.mire)
        ) {
          const l = document.createElement('img');
          (l.src = t.mire),
          l.classList.add('preview-image'),
          (l.dataset.info = t.info),
          l.addEventListener('click', () =>
            showImageModal(t.mire, t, 'courbe', t.info),
          ),
          index.appendChild(l);
        }
        const redValue = document.createElement('div');
        (redValue.style.width = '200px'),
        (redValue.style.height = '150px'),
        (redValue.style.marginTop = '10px');
        const d = document.createElement('canvas');
        (d.width = 200), (d.height = 150), redValue.appendChild(d), index.appendChild(redValue);
        const f = Array.from({ length: 256 }, (l, y) => y);
        new Chart(d, {
          type: 'line',
          data: {
            labels: f,
            datasets: [
              {
                label: 'Courbe',
                data: t.curve,
                borderColor: 'red',
                borderWidth: 2,
                fill: !1,
                pointRadius: 0,
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: !1,
            maintainAspectRatio: !1,
            scales: {
              x: { display: !1 },
              y: { min: 0, max: 255, display: !1 },
            },
            plugins: { legend: { display: false }, tooltip: { enabled: !1 } },
            animation: !1,
          },
        });
        
        const u = document.createElement('button');
        (u.innerHTML = '<i class="fas fa-trash-alt"></i>'),
        (u.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)'),
        (u.style.color = '#ffffff'),
        (u.style.border = 'none'),
        (u.style.borderRadius = '8px'),
        (u.style.padding = '10px 12px'),
        (u.style.cursor = 'pointer'),
        (u.style.fontSize = '14px'),
        (u.style.fontWeight = '500'),
        (u.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'),
        (u.style.boxShadow = '0 2px 8px rgba(238, 90, 82, 0.2)'),
        (u.style.minWidth = '44px'),
        (u.style.minHeight = '44px'),
        (u.style.display = 'flex'),
        (u.style.alignItems = 'center'),
        (u.style.justifyContent = 'center'),
        (u.title = 'Supprimer cette courbe'),
        (u.onmouseenter = () => {
          u.style.transform = 'translateY(-2px) scale(1.02)';
          u.style.boxShadow = '0 4px 16px rgba(238, 90, 82, 0.3)';
          u.style.background = 'linear-gradient(135deg, #ff5252, #d32f2f)';
        }),
        (u.onmouseleave = () => {
          u.style.transform = 'translateY(0) scale(1)';
          u.style.boxShadow = '0 2px 8px rgba(238, 90, 82, 0.2)';
          u.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        }),
        (u.onmousedown = () => {
          u.style.transform = 'translateY(0) scale(0.98)';
        }),
        (u.onmouseup = () => {
          u.style.transform = 'translateY(-2px) scale(1.02)';
        }),
        (u.onclick = () => {
          windowSize.splice(a, 1);
          try {
            localStorage.setItem('savedCurves', JSON.stringify(windowSize));
          } catch (l) {
            console.error(
              'Erreur lors de la mise à jour de localStorage :',
              l,
            ),
            alert(
              'Erreur lors de la suppression. Le stockage est peut-être plein.',
            );
          }
          displayArchiveContainers(), updateCurveSelector();
        });
        
        // Conteneur pour les boutons avec style flex
        const buttonDiv = document.createElement('div');
        (buttonDiv.style.display = 'flex'),
        (buttonDiv.style.gap = '8px'),
        (buttonDiv.style.marginTop = '12px'),
        (buttonDiv.style.justifyContent = 'flex-end');
        
        // Bouton d'export ACV moderne
        const exportAcvBtn = document.createElement('button');
        (exportAcvBtn.innerHTML = '<i class="fas fa-download"></i> <span style="margin-left: 6px; font-size: 12px;">.acv</span>'),
        (exportAcvBtn.className = 'btn-export-acv-card'),
        (exportAcvBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)'),
        (exportAcvBtn.style.color = '#ffffff'),
        (exportAcvBtn.style.border = 'none'),
        (exportAcvBtn.style.borderRadius = '8px'),
        (exportAcvBtn.style.padding = '10px 12px'),
        (exportAcvBtn.style.cursor = 'pointer'),
        (exportAcvBtn.style.fontSize = '14px'),
        (exportAcvBtn.style.fontWeight = '500'),
        (exportAcvBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'),
        (exportAcvBtn.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.2)'),
        (exportAcvBtn.style.minWidth = '70px'),
        (exportAcvBtn.style.minHeight = '44px'),
        (exportAcvBtn.style.display = 'flex'),
        (exportAcvBtn.style.alignItems = 'center'),
        (exportAcvBtn.style.justifyContent = 'center'),
        (exportAcvBtn.title = 'Exporter en fichier .acv'),
        (exportAcvBtn.onmouseenter = () => {
          exportAcvBtn.style.transform = 'translateY(-2px) scale(1.02)';
          exportAcvBtn.style.boxShadow = '0 4px 16px rgba(76, 175, 80, 0.3)';
          exportAcvBtn.style.background = 'linear-gradient(135deg, #45a049, #3d8b40)';
        }),
        (exportAcvBtn.onmouseleave = () => {
          exportAcvBtn.style.transform = 'translateY(0) scale(1)';
          exportAcvBtn.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.2)';
          exportAcvBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        }),
        (exportAcvBtn.onmousedown = () => {
          exportAcvBtn.style.transform = 'translateY(0) scale(0.98)';
        }),
        (exportAcvBtn.onmouseup = () => {
          exportAcvBtn.style.transform = 'translateY(-2px) scale(1.02)';
        }),
        (exportAcvBtn.onclick = () => {
          if (window.ACVExporter && typeof window.ACVExporter.exportCurve === 'function') {
            const success = window.ACVExporter.exportCurve({ rgb: t.curve }, t.info);
            if (success) {
              exportAcvBtn.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
              exportAcvBtn.innerHTML = '<i class="fas fa-check"></i> <span style="margin-left: 6px; font-size: 12px;">OK</span>';
              setTimeout(() => {
                exportAcvBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                exportAcvBtn.innerHTML = '<i class="fas fa-download"></i> <span style="margin-left: 6px; font-size: 12px;">.acv</span>';
              }, 1500);
            }
          } else {
            console.warn('ACVExporter non disponible');
          }
        }),
        
        buttonDiv.appendChild(exportAcvBtn),
        buttonDiv.appendChild(u),
        index.appendChild(buttonDiv),
        eventObj.appendChild(index);
      }),
      width.appendChild(eventObj);
    } else width.innerHTML = '<p>Aucun scan sauvegardé</p>';
    if (preloadModuleLink.length) {
      console.log('🖼️ Affichage de', preloadModuleLink.length, 'images dans imageArchiveContainer');
      
      const eventObj = document.createElement('div');
      (eventObj.className = 'library-grid'),
      preloadModuleLink.forEach((t, a) => {
        const index = document.createElement('div');
        index.className = 'card';
        const s = document.createElement('img');
        (s.src = t.final),
        (s.style.width = '100%'),
        s.classList.add('preview-image'),
        (s.dataset.info = t.curveName),
        index.appendChild(s);
        const redValue = document.createElement('div');
        (redValue.textContent = t.curveName), index.appendChild(redValue);
        const d = document.createElement('button');
        (d.innerHTML = '<i class="fas fa-trash-alt"></i>'),
        (d.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)'),
        (d.style.color = '#ffffff'),
        (d.style.border = 'none'),
        (d.style.borderRadius = '8px'),
        (d.style.padding = '10px 12px'),
        (d.style.cursor = 'pointer'),
        (d.style.fontSize = '14px'),
        (d.style.fontWeight = '500'),
        (d.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'),
        (d.style.boxShadow = '0 2px 8px rgba(238, 90, 82, 0.2)'),
        (d.style.minWidth = '44px'),
        (d.style.minHeight = '44px'),
        (d.style.display = 'flex'),
        (d.style.alignItems = 'center'),
        (d.style.justifyContent = 'center'),
        (d.title = 'Supprimer cette image'),
        (d.onmouseenter = () => {
          d.style.transform = 'translateY(-2px) scale(1.02)';
          d.style.boxShadow = '0 4px 16px rgba(238, 90, 82, 0.3)';
          d.style.background = 'linear-gradient(135deg, #ff5252, #d32f2f)';
        }),
        (d.onmouseleave = () => {
          d.style.transform = 'translateY(0) scale(1)';
          d.style.boxShadow = '0 2px 8px rgba(238, 90, 82, 0.2)';
          d.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        }),
        (d.onmousedown = () => {
          d.style.transform = 'translateY(0) scale(0.98)';
        }),
        (d.onmouseup = () => {
          d.style.transform = 'translateY(-2px) scale(1.02)';
        }),
        (d.onclick = () => {
          const f = ge.transaction([te], 'readwrite');
          f.objectStore(te).delete(t.id),
          (f.oncomplete = function () {
            console.log('Image supprimée de IndexedDB.'), loadImagesFromIndexedDB();
          }),
          (f.onerror = function (l) {
            console.error(
              'Erreur lors de la suppression :',
              l.target.error,
            );
          });
        }),
        index.appendChild(d),
        eventObj.appendChild(index);
      }),
      height.appendChild(eventObj);
    } else height.innerHTML = '<p>Aucune image traitée</p>';
    console.log('Bibliothèque mise à jour :', {
      savedCurves: windowSize,
      processedImages: preloadModuleLink,
    });
  }
  /** @function showImageModal */
  function showImageModal(width, height, eventObj, t) {
    const a = document.getElementById('imageModal'),
      index = document.getElementById('modalImage');
    (index.src = width || ''), a.classList.remove('hidden');
  }
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('imageModal').classList.add('hidden');
  }),
  document.addEventListener('click', (width) => {
    width.target.classList.contains('preview-image') &&
        ((document.getElementById('modalImage').src = width.target.src),
        document.getElementById('imageModal').classList.remove('hidden'));
  }),
  document.getElementById('btnGenerateMire').addEventListener('click', () => {
    renderMireCanvases(), showPanelById('step2'), showSubStepById('subStep1');
  }),
  document
    .getElementById('btnGenererCourbeOptimisee')
    .addEventListener('click', () => {
      renderMireCanvases(),
      setTimeout(() => {
        showPanelById('step2'), showSubStepById('subStep2');
      }, 100);
    });
  /** @function hideAllContainers */
  function hideAllContainers() {
    hideSaveForms(),
    (document.getElementById('curveSelectorContainer').style.display =
        'none'),
    (document.getElementById('generateOptionsContainer').style.display =
        'none'),
    (document.getElementById('generationButtonsContainer').style.display =
        'none'),
    document
      .getElementById('monochromePreviewContainer')
      .classList.add('hidden'),
    document.getElementById('colorPreviewContainer').classList.add('hidden'),
    (document.getElementById('imagePreview').src = ''),
    document.getElementById('imagePreview').classList.add('hidden'),
    (window.importedImageFile = null);
    const width = document.getElementById('imageInput');
    width && (width.value = '');
    // Remettre le bouton d'import visible, mais garder le bouton reset aussi
    (document.getElementById('importImageLabel').style.display = 'block');
    // Rendre visible le texte d'import lors du reset
    const importImageText = document.getElementById('importImageText');
    if (importImageText) {
      importImageText.style.display = 'block';
    }
  }
  
  /** @function resetStep3ToInitialState */
  function resetStep3ToInitialState() {
    console.log('🔄 Reset de step3 vers état initial - interruption des processus');
    
    // Interrompre la régénération automatique en cours
    if (typeof Le !== 'undefined') {
      Le = false;
      console.log('🛑 Processus de régénération automatique interrompu');
    }
    
    // Supprimer l'indicateur de régénération s'il existe
    const regenIndicator = document.getElementById('regenIndicator');
    if (regenIndicator) {
      regenIndicator.remove();
      console.log('🗑️ Indicateur de régénération supprimé');
    }
    
    // Nettoyer les timeout et intervals en cours (si des IDs sont disponibles)
    // Ceci arrêtera les processus asynchrones en cours
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    
    // Réinitialiser l'état des boutons de génération
    const generateButtons = ['btnGenerateNegative', 'btnGeneratePositive', 'btnGenerateCMJN'];
    generateButtons.forEach(buttonId => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.classList.remove('active');
        button.disabled = false;
      }
    });
    
    // Nettoyer l'état de l'image importée
    if (window.importedImageFile) {
      window.importedImageFile = null;
      console.log('🗑️ Image importée nettoyée');
    }
    
    // Masquer les containers et réinitialiser l'UI
    hideAllContainers();
    
    console.log('✅ Step3 complètement réinitialisé et processus interrompus');
  }
  
  // Rendre la fonction accessible globalement
  window.resetStep3ToInitialState = resetStep3ToInitialState;
  document.getElementById('btnCreateNegatif').addEventListener('click', () => {
    updateCurveSelector(), showPanelById('step3'), hideAllContainers();
  }),
  document.getElementById('btnLibrary').addEventListener('click', () => {
    displayArchiveContainers(), showPanelById('libraryPanel');
  });
  const We = document.getElementById('toStep3FromSubStep3');
  We
    ? We.addEventListener('click', () => {
      console.log('Clic sur \'Transformer en négatif\' depuis subStep3'),
      updateCurveSelector(),
      showPanelById('step3'),
      hideAllContainers();
    })
    : console.error('Bouton \'toStep3FromSubStep3\' non trouvé dans le DOM'),
  document
    .getElementById('btnShowScans')
    .addEventListener('click', function () {
      (document.getElementById('scansPage').style.display = 'block'),
      (document.getElementById('generatedPage').style.display = 'none');
    }),
  document
    .getElementById('btnShowGenerated')
    .addEventListener('click', function () {
      (document.getElementById('scansPage').style.display = 'none'),
      (document.getElementById('generatedPage').style.display = 'block');
    }),
  document.getElementById('nextToStep3').addEventListener('click', () => {
    (window.useProCompensation = !1),
    console.log(
      'Navigation vers subStep3 en mode standard depuis subStep2',
    ),
    showSubStepById('subStep3');
  }),
  document
    .getElementById('proVersionButton')
    .addEventListener('click', () => {
      if (!B) {
        alert(
          'Veuillez d\'abord importer un scan avant d\'accéder au mode Pro.',
        );
        return;
      }
      generateMasterMirePro(),
      console.log('Affichage du mode Pro'),
      showSubStepById('subStepPro'),
      ($ = { tx: 0, ty: 0, scale: 1, rotation: 0 }),
      loadImageFile(B).then((width) => analyzeProCalibration(width));
    }),
  document.getElementById('backFromPro').addEventListener('click', () => {
    console.log('Retour du mode Pro vers standard'),
    stopProOverlay(),
    (window.useProCompensation = !1),
    updateSaveButtonLabel(),
    showSubStepById('subStep2');
  }),
  scanInput.addEventListener('change', async (width) => {
    if (((B = width.target.files[0]), !_e(B, 'scanError'))) {
      (B = null),
      (document.getElementById('scannedChartPreview').src = ''),
      document
        .getElementById('scannedChartPreview')
        .classList.add('hidden'),
      (document.getElementById('nextToStep3').disabled = !0),
      (document.getElementById('proVersionButton').style.display = 'none');
      return;
    }
    
    // Afficher l'overlay de chargement pendant le traitement du scan
    showRegenerationIndicator('Traitement scan', 'Analyse de la mire scannée...');
    
    const height = URL.createObjectURL(B),
      eventObj = new Image();
    (eventObj.onload = function () {
      const t = document.createElement('canvas'),
        a = t.getContext('2d');
      (t.width = eventObj.width), (t.height = eventObj.height), a.drawImage(eventObj, 0, 0);
      const index = a.getImageData(0, 0, eventObj.width, eventObj.height).data;
      let s = eventObj.width,
        redValue = 0,
        d = eventObj.height,
        f = 0;
      for (let C = 0; C < eventObj.height; C++)
        for (let x = 0; x < eventObj.width; x++) {
          const I = (C * eventObj.width + x) * 4;
          (index[I] < 250 || index[I + 1] < 250 || index[I + 2] < 250) &&
              ((s = Math.min(s, x)),
              (redValue = Math.max(redValue, x)),
              (d = Math.min(d, C)),
              (f = Math.max(f, C)));
        }
      const u = redValue - s + 1,
        l = f - d + 1,
        y = document.createElement('canvas'),
        adjustColorValue = y.getContext('2d');
      (y.width = u), (y.height = l), adjustColorValue.drawImage(t, s, d, u, l, 0, 0, u, l);
      const w = y.toDataURL(),
        blueValue = document.getElementById('scannedChartPreview');
      (blueValue.src = w),
      blueValue.classList.remove('hidden'),
      blueValue.dataset.defaultMire &&
            (delete blueValue.dataset.defaultMire,
            console.log('Mire par défaut remplacée par le scan uploadé'));
      
      // Automatiquement passer à l'étape suivante après l'upload
      setTimeout(() => {
        console.log('Passage automatique vers subStep3 après upload du scan');
        showSubStepById('subStep3');
      }, 1000); // Délai de 1 seconde pour que l'utilisateur voie l'image uploadée
      
      // Masquer l'overlay de chargement après traitement du scan
      const regenIndicator = document.getElementById('regenIndicator');
      if (regenIndicator) {
        regenIndicator.remove();
      }
    }),
    (eventObj.src = height);
  }),
  document.getElementById('saveCurve').addEventListener('click', () => {
    const width = document.getElementById('mireName').value.trim();
    if (!width) {
      alert('Veuillez entrer un nom pour la courbe.');
      return;
    }
    const height = window.useProCompensation === !0;
    if (
      (console.log('Mode de sauvegarde:', height ? 'Pro' : 'Standard'),
      !window.histogramChart ||
          !window.histogramChart.data ||
          !window.histogramChart.data.datasets)
    ) {
      alert('Aucune courbe disponible. Veuillez analyser une mire.');
      return;
    }
    let eventObj;
    if (
      (console.log('Datasets disponibles:'),
      histogramChart.data.datasets.forEach((w, blueValue) => {
        console.log(
          `Dataset ${blueValue}: ${w.label} - ${w.borderColor} - ${w.data && w.data.length} points`,
        );
      }),
      height)
    ) {
      const w = histogramChart.data.datasets.find(
        (blueValue) => blueValue.label === 'Courbe de correction Pro',
      );
      if (w && w.data && w.data.length > 0) {
        console.log(
          'Utilisation de la courbe violette "Courbe de correction Pro"',
        ),
        (eventObj = new Array(256).fill(0));
        const blueValue = [...w.data].sort((C, x) => C.x - x.x);
        for (let C = 0; C < 256; C++) {
          const x = blueValue.find((I) => Math.round(I.x) === C);
          if (x) eventObj[C] = Math.round(x.y);
          else {
            const I = blueValue.filter((D) => D.x <= C),
              R = blueValue.filter((D) => D.x >= C),
              A = I.length ? I[I.length - 1] : null,
              H = R.length ? R[0] : null;
            if (A && H) {
              const D = (C - A.x) / (H.x - A.x);
              eventObj[C] = Math.round(A.y + D * (H.y - A.y));
            } else
              A
                ? (eventObj[C] = Math.round(A.y))
                : H
                  ? (eventObj[C] = Math.round(H.y))
                  : (eventObj[C] = C);
          }
        }
      } else {
        console.log('Courbe Pro non trouvée, recherche d\'une alternative');
        const blueValue = histogramChart.data.datasets.find(
          (C) =>
            (C.label === 'Courbe Pro lissée' || C.borderColor === 'blue') &&
              C.type === 'line',
        );
        if (blueValue && blueValue.data && blueValue.data.length > 0) {
          console.log(
            'Utilisation de la courbe bleue comme alternative:',
            blueValue.label,
          ),
          (eventObj = new Array(256).fill(0));
          const C = [...blueValue.data].sort((x, I) => x.x - I.x);
          for (let x = 0; x < 256; x++) {
            const I = C.find((R) => Math.round(R.x) === x);
            if (I) eventObj[x] = Math.round(I.y);
            else {
              const R = C.filter((z) => z.x <= x),
                A = C.filter((z) => z.x >= x),
                H = R.length ? R[R.length - 1] : null,
                D = A.length ? A[0] : null;
              if (H && D) {
                const z = (x - H.x) / (D.x - H.x);
                eventObj[x] = Math.round(H.y + z * (D.y - H.y));
              } else
                H
                  ? (eventObj[x] = Math.round(H.y))
                  : D
                    ? (eventObj[x] = Math.round(D.y))
                    : (eventObj[x] = x);
            }
          }
        } else {
          alert(
            'La courbe Pro n\'est pas disponible. Veuillez générer une courbe Pro.',
          ),
          console.error('Aucune courbe Pro trouvée dans le graphique');
          return;
        }
      }
      (endPoint = [...eventObj]), console.log('Courbe Pro extraite, longueur:', eventObj.length);
    } else {
      const w = histogramChart.data.datasets[0];
      if (!w || !w.data || w.data.length === 0) {
        alert(
          'La courbe de correction n\'est pas disponible. Veuillez analyser une mire.',
        );
        return;
      }
      console.log('Utilisation de la courbe rouge standard:', w.label);
      const blueValue = w.data[0];
      if ((console.log('Échantillon de données:', blueValue), typeof blueValue == 'number'))
        console.log('Format détecté: tableau de nombres'), (eventObj = [...w.data]);
      else if (blueValue && typeof blueValue == 'object' && 'y' in blueValue) {
        console.log('Format détecté: objets {x,y}'),
        (eventObj = new Array(256).fill(0));
        for (let C = 0; C < 256; C++) {
          const x = w.data.find((I) => Math.round(I.x) === C);
          x ? (eventObj[C] = Math.round(x.y)) : (eventObj[C] = C);
        }
      } else
        console.log('Format non reconnu, utilisation de correctionTable'),
        (eventObj = [...startPoint]);
      (startPoint = [...eventObj]),
      console.log('Courbe standard extraite, longueur:', eventObj.length);
    }
    if (!eventObj || eventObj.every((w) => w === eventObj[0])) {
      alert(
        'Aucune courbe valide à sauvegarder. Veuillez analyser une mire.',
      );
      return;
    }
    const t = document.getElementById('scannedChartPreview');
    if (!(t && t.complete && t.src)) {
      alert('Scan non disponible.');
      return;
    }
    const a = document.getElementById(
        height ? 'overlayCanvasPro' : 'overlayCanvas',
      ),
      index = height ? $ : F,
      s = a.width,
      redValue = t.naturalWidth / t.naturalHeight;
    let d, f;
    redValue > 1 ? ((d = s), (f = s / redValue)) : ((d = s * redValue), (f = s));
    const u = document.createElement('canvas');
    (u.width = s), (u.height = s);
    const l = u.getContext('2d');
    l.save(),
    l.translate(s / 2 + index.tx, s / 2 + index.ty),
    l.rotate(index.rotation),
    l.scale(index.scale, index.scale),
    l.drawImage(t, -d / 2, -f / 2, d, f),
    l.restore();
    const y = u.toDataURL('image/png'),
      adjustColorValue = height ? (width.toLowerCase().includes('pro') ? width : width + ' Pro') : width;
    windowSize.push({ info: adjustColorValue, curve: [...eventObj], mire: y, isPro: height }),
    localStorage.setItem('savedCurves', JSON.stringify(windowSize)),
    updateCurveSelector(),
    console.log(
      height ? 'Courbe Pro sauvegardée :' : 'Courbe standard sauvegardée :',
      windowSize[windowSize.length - 1],
    ),
    alert('Courbe sauvegardée avec succès !');
  }),
  (document.getElementById('saveCurvePro').textContent = 'Suivant'),
  document.getElementById('saveCurvePro').addEventListener('click', () => {
    console.log('Navigation vers la vue histogramme'),
    showSubStepById('subStep3'),
    console.log(
      'Mode actuel préservé:',
      window.useProCompensation ? 'Pro' : 'Standard',
    ),
    updateSaveButtonLabel();
  });
  function updateSaveButtonLabel() {
    const width = window.useProCompensation === !0,
      height = document.getElementById('saveCurve');
    height &&
      ((height.innerHTML = `<i class="fas fa-save"></i> ${width ? 'Sauvegarder Pro' : 'Sauvegarder'}`),
      console.log('Bouton mis à jour. Mode Pro:', width, 'Texte:', height.innerHTML));
  }
  function resetState() {
    (B = null),
    (document.getElementById('scanInput').value = ''),
    (document.getElementById('scannedChartPreview').src = ''),
    document.getElementById('scannedChartPreview').classList.add('hidden'),
    (document.getElementById('mireName').value = ''),
    (startPoint = Array(256)
      .fill(0)
      .map((a, index) => index)),
    (endPoint = Array(256)
      .fill(0)
      .map((a, index) => index)),
    (window.useProCompensation = !1),
    (measuredPatchValues = []),
    (pe = []),
    (de = []),
    window.histogramChart &&
        (window.histogramChart.destroy(), (window.histogramChart = null));
    const width = document.getElementById('histogramChart');
    width.getContext('2d').clearRect(0, 0, width.width, width.height),
    N && (N.destroy(), (N = null));
    const eventObj = document.getElementById('histogramChartPro');
    eventObj && eventObj.getContext('2d').clearRect(0, 0, eventObj.width, eventObj.height),
    (F = { tx: 0, ty: 0, scale: 1, rotation: 0 }),
    ($ = { tx: 0, ty: 0, scale: 1, rotation: 0 }),
    (document.getElementById('nextToStep3').style.display = 'none'),
    (document.getElementById('proVersionButton').style.display = 'none');
    const t = document.querySelector('.top-nav-buttons');
    t && (t.style.display = 'none'),
    stopProOverlay(),
    setTimeout(() => {
      renderDefaultMire();
    }, 100);
  }
  document
    .getElementById('imageInput')
    .addEventListener('change', async (width) => {
      const height = width.target.files[0];
      if (!_e(height, 'imageError')) {
        (window.importedImageFile = null),
        (document.getElementById('imagePreview').src = ''),
        document.getElementById('imagePreview').classList.add('hidden'),
        (document.getElementById('curveSelectorContainer').style.display =
            'none'),
        (document.getElementById('generateOptionsContainer').style.display =
            'none'),
        // Remettre le bouton importer visible mais garder le bouton reset aussi
        (document.getElementById('importImageLabel').style.display = 'block');
        return;
      }
      
      // Afficher l'overlay de chargement pendant le chargement de l'image
      showRegenerationIndicator('Chargement image', 'Préparation de l\'image...');
      
      try {
        (window.importedImageFile = height),
        (dataURL = await readFileAsDataURL(height)),
        (document.getElementById('imagePreview').src = dataURL),
        document.getElementById('imagePreview').classList.remove('hidden'),
        // Le conteneur de prévisualisation de l'image originale a été supprimé
        // On affiche directement le sélecteur de courbe
        (document.getElementById('curveSelectorContainer').style.display =
            'block'),
        // Afficher automatiquement les boutons de génération
        (document.getElementById('generationButtonsContainer').style.display =
            'block'),
        // Afficher automatiquement les options de personnalisation
        (document.getElementById('generateOptionsContainer').style.display =
            'block'),
        // Définir la courbe standard par défaut (aucune modification)
        (document.getElementById('curveSelector').value = '-2'),
        // Sélectionner automatiquement le mode négatif par défaut
        setActiveButton('btnGenerateNegative'),
        // Masquer le bouton importer et afficher le bouton reset
        (document.getElementById('importImageLabel').style.display = 'none'),
        (document.getElementById('importImageBtn').style.display = 'block'),
        // Masquer le texte d'import une fois l'image chargée
        document.getElementById('importImageText') &&
          (document.getElementById('importImageText').style.display = 'none');
        
        // Masquer le titre "Transformer une image en négatif" pour optimiser l'espace
        const step3Title = document.getElementById('step3Title');
        if (step3Title) {
          step3Title.style.display = 'none';
        }
        
        // Générer automatiquement le négatif avec les paramètres par défaut
        setTimeout(() => {
          // Simuler un clic sur le bouton négatif pour générer automatiquement
          const btnGenerateNegative = document.getElementById('btnGenerateNegative');
          if (btnGenerateNegative) {
            btnGenerateNegative.click();
          }
        }, 500); // Petit délai pour s'assurer que tout est bien initialisé
      } finally {
        // Masquer l'overlay de chargement
        const regenIndicator = document.getElementById('regenIndicator');
        if (regenIndicator) {
          regenIndicator.remove();
        }
      }
    }),
  // Gestionnaire pour le bouton Reset
  document.getElementById('importImageBtn').addEventListener('click', () => {
    console.log('🔄 Reset de la page step3 demandé');
    hideAllContainers();
    // Remettre le bouton importer visible, mais garder le bouton reset visible aussi
    document.getElementById('importImageLabel').style.display = 'block';
    // document.getElementById('importImageBtn').style.display = 'none'; // Gardons le bouton reset toujours visible
    // Rendre visible le texte d'import lors du reset
    const importImageText = document.getElementById('importImageText');
    if (importImageText) {
      importImageText.style.display = 'block';
    }
    // Réafficher le titre lors du reset
    const step3Title = document.getElementById('step3Title');
    if (step3Title) {
      step3Title.style.display = 'block';
    }
  }),
  document
    .getElementById('curveSelector')
    .addEventListener('change', function () {
      parseInt(this.value) !== -1
        ? ((document.getElementById(
          'generationButtonsContainer',
        ).style.display = 'flex'),
        (document.getElementById('generateOptionsContainer').style.display =
              'none'),
        clearActiveButtons())
        : ((document.getElementById(
          'generateOptionsContainer',
        ).style.display = 'none'),
        (document.getElementById(
          'generationButtonsContainer',
        ).style.display = 'none'));
    });
  /** @function generateNegativeAutomatic */
  async function generateNegativeAutomatic() {
    if (!window.importedImageFile) {
      console.log('Aucune image importée pour la génération automatique');
      return;
    }
    setActiveButton('btnGenerateNegative'),
    console.log('Génération automatique du négatif'),
    document.getElementById('colorPreviewContainer').classList.add('hidden'),
    // Afficher l'overlay de génération moderne
    showRegenerationIndicator('Génération négatif', 'Transformation en cours...'),
    (document.getElementById('loadingOverlay').style.display = 'flex');
    try {
      const width = await loadImageFile(window.importedImageFile),
        height = parseInt(document.getElementById('curveSelector').value),
        eventObj = height >= 0 ? windowSize[height].curve : (height === -2 ? startPoint : startPoint),
        t = await applyNegativeTransformation(width, eventObj, !0),
        a = document.getElementById('correctedImagePreview');
      (a.src = t), a.classList.remove('hidden');
      const index = document.getElementById('monochromePreviewContainer');
      (index.innerHTML = `
            <h3>Résultat final (Négatif)</h3>
            <img id="correctedImagePreview" class="preview-image" src="${t}" alt="Image modifiée" />
          `),
      (document.getElementById('saveImageNavigation').style.display = 'flex'),
      index.classList.remove('hidden');
    } catch (width) {
      console.error(
        'Erreur lors de la transformation automatique en négatif :',
        width,
      );
    } finally {
      // Masquer l'overlay de génération moderne et l'ancien
      const regenIndicator = document.getElementById('regenIndicator');
      if (regenIndicator) {
        regenIndicator.remove();
      }
      document.getElementById('loadingOverlay').style.display = 'none';
    }
  }
  /** @function clearActiveButtons */
  function clearActiveButtons() {
    ['btnGenerateNegative', 'btnGeneratePositive', 'btnGenerateCMJN'].forEach(
      (height) => {
        const eventObj = document.getElementById(height);
        eventObj && eventObj.classList.remove('active');
      },
    );
  }
  /** @function setActiveButton */
  function setActiveButton(width) {
    clearActiveButtons();
    const height = document.getElementById(width);
    height &&
      (height.classList.add('active'),
      (document.getElementById('generateOptionsContainer').style.display =
        'block'));
  }
  document
    .getElementById('btnGenerateNegative')
    .addEventListener('click', async () => {
      if (!window.importedImageFile) {
        alert('Veuillez importer une image.');
        return;
      }
      generateNegativeAutomatic();
    }),
  document
    .getElementById('btnGenerateCMJN')
    .addEventListener('click', async () => {
      if (!window.importedImageFile) {
        alert('Veuillez importer une image.');
        return;
      }
      setActiveButton('btnGenerateCMJN'),
      console.log('Début de la transformation en CMJN'),
      document
        .getElementById('monochromePreviewContainer')
        .classList.add('hidden'),
      // Afficher l'overlay de génération moderne
      showRegenerationIndicator('Génération CMJN', 'Séparation des couleurs...'),
      (document.getElementById('loadingOverlay').style.display = 'flex');
      try {
        const width = await loadImageFile(window.importedImageFile),
          height = parseInt(document.getElementById('curveSelector').value),
          eventObj = height >= 0 ? windowSize[height].curve : (height === -2 ? startPoint : startPoint),
          t = await applyCMYKTransformation(width, eventObj),
          a = document.getElementById('colorPreviewContainer');
          
        // Conserver le titre et créer le conteneur d'images
        const title = a.querySelector('h4');
        const imagesRow = a.querySelector('#cmjnImagesRow') || document.createElement('div');
        imagesRow.id = 'cmjnImagesRow';
        // Laisser le CSS gérer le responsive, ne pas imposer de styles inline
        
        // Vider le conteneur d'images existant
        imagesRow.innerHTML = '';
        
        // Si le titre n'existe pas, le recréer
        if (!title) {
          a.innerHTML = '<h4 style="color: #666; font-size: 0.8rem; margin: 0 0 8px 0; font-weight: 500; text-align: center; width: 100%;">🎨 Résultats couleur (CMJN)</h4>';
          a.appendChild(imagesRow);
        }
          
        const index = {
          cyan: 'Cyan',
          magenta: 'Magenta',
          yellow: 'Jaune',
          black: 'Noir',
        };
        
        // Créer les vignettes pour chaque canal CMJN alignées horizontalement
        for (let redValue in t) {
          let d = document.createElement('div');
          d.className = 'cmjn-image-card'; // Ajout d'une classe pour le CSS
          d.style.background = '#f9f9f9';
          d.style.borderRadius = '8px';
          d.style.border = '1px solid #ddd';
          d.style.textAlign = 'center';
          d.style.padding = '10px';
          
          let f = document.createElement('h5');
          f.textContent = index[redValue];
          f.style.margin = '0 0 8px 0';
          f.style.fontSize = '0.9rem';
          f.style.fontWeight = '500';
          d.appendChild(f);
          
          let u = document.createElement('img');
          u.src = t[redValue];
          u.classList.add('preview-image');
          u.style.maxWidth = '100%';
          u.style.borderRadius = '4px';
          // Set alt text to help our unified save form identify the images
          u.alt = `Image ${index[redValue]} CMJN`;
          d.appendChild(u);
          
          // Ajouter chaque vignette à la ligne d'images plutôt qu'au conteneur principal
          imagesRow.appendChild(d);
          // Removed automatic download links - using unified top save form instead
          /*
          let l = document.createElement('a');
          (l.href = t[redValue]),
          (l.download = `${window.importedImageFile.name}_${index[redValue]}.png`),
          (l.textContent = `Télécharger ${index[redValue]} (automatique)`),
          (l.style.display = 'block'),
          (l.style.marginBottom = '15px'),
          (l.style.color = '#007bff'),
          (l.style.textDecoration = 'none'),
          d.appendChild(l),
          */
        }
        // Legacy save forms completely disabled for CMJN - using unified top save forms only
        /*
        const s = document.getElementById('saveFormsContent');
        if (s) {
          s.innerHTML = '';
          for (let redValue in t) {
            const d = document.createElement('div');
            (d.className = 'individual-save-form'),
            (d.innerHTML = `
                  <div class="form-row">
                    <input type="text" id="${redValue}ImageName" placeholder="Nom personnalisé pour ${index[redValue]}" />
                    <button id="save${redValue.charAt(0).toUpperCase() + redValue.slice(1)}Image">
                      <i class="fas fa-save"></i> Sauvegarder
                    </button>
                  </div>
                `),
            s.appendChild(d);
          }
        }
        const saveFormsContainer = document.getElementById('saveFormsContainer');
        if (saveFormsContainer) {
          saveFormsContainer.classList.remove('hidden');
        }
        */
        // Anciens gestionnaires d'événements supprimés - gérés maintenant dans index.html
        
        // Afficher la barre de navigation pour le mode CMJN
        document.getElementById('saveCMJNNavigation').style.display = 'flex';
        
        a.classList.remove('hidden');
      } catch (width) {
        console.error('Erreur lors de la transformation en CMJN :', width);
      } finally {
        // Masquer l'overlay de génération moderne et l'ancien
        const regenIndicator = document.getElementById('regenIndicator');
        if (regenIndicator) {
          regenIndicator.remove();
        }
        document.getElementById('loadingOverlay').style.display = 'none';
      }
    });
  document
    .getElementById('btnGeneratePositive')
    .addEventListener('click', async () => {
      if (!window.importedImageFile) {
        alert('Veuillez importer une image.');
        return;
      }
      setActiveButton('btnGeneratePositive'),
      console.log('Début de la transformation en positif'),
      document
        .getElementById('colorPreviewContainer')
        .classList.add('hidden'),
      // Afficher l'overlay de génération moderne
      showRegenerationIndicator('Génération positif', 'Transformation en cours...'),
      (document.getElementById('loadingOverlay').style.display = 'flex');
      try {
        const width = await loadImageFile(window.importedImageFile),
          height = parseInt(document.getElementById('curveSelector').value),
          eventObj = height >= 0 ? windowSize[height].curve : (height === -2 ? startPoint : startPoint),
          t = await applyNegativeTransformation(width, eventObj, !1),
          a = document.getElementById('correctedImagePreview');
        (a.src = t), a.classList.remove('hidden');
        const index = document.getElementById('monochromePreviewContainer');
        index.innerHTML = `
              <h3>Résultat final (Positif)</h3>
              <img id="correctedImagePreview" class="preview-image" src="${t}" alt="Image modifiée" />
            `;
        
        // Afficher la barre de navigation pour le mode positif
        document.getElementById('savePositiveNavigation').style.display = 'flex';
        
        // Legacy save forms disabled - now using unified top save forms
        const s = document.getElementById('saveFormsContent');
        if (s) {
          s.innerHTML = '';
          const redValue = document.createElement('div');
          (redValue.className = 'individual-save-form'),
          (redValue.innerHTML = `
                <div class="form-row">
                  <input type="text" id="positiveImageName" placeholder="Nom de l'image pour la bibliothèque" />
                  <button id="savePositiveImage">
                    <i class="fas fa-save"></i> Sauvegarder
                  </button>
                </div>
              `);
          s.appendChild(redValue);
        }
        const saveFormsContainer = document.getElementById('saveFormsContainer');
        if (saveFormsContainer) {
          saveFormsContainer.classList.remove('hidden');
        }
        index.classList.remove('hidden');
      } catch (width) {
        console.error('Erreur lors de la transformation en positif :', width);
      } finally {
        // Masquer l'overlay de génération moderne et l'ancien
        const regenIndicator = document.getElementById('regenIndicator');
        if (regenIndicator) {
          regenIndicator.remove();
        }
        document.getElementById('loadingOverlay').style.display = 'none';
      }
    });
  function renderMireCanvases() {
    const height = document.createElement('canvas');
    (height.width = 800), (height.height = 800);
    const eventObj = height.getContext('2d');
    (eventObj.fillStyle = '#fff'), eventObj.fillRect(0, 0, 800, 800);
    const t = 800 / _;
    for (let blueValue = 0; blueValue < re; blueValue++) {
      const C = blueValue / (re - 1),
        I = 255 - Math.round(C * 255),
        R = (blueValue % _) * t,
        A = Math.floor(blueValue / _) * t;
      (eventObj.fillStyle = `rgb(${I}, ${I}, ${I})`), eventObj.fillRect(R, A, t, t);
    }
    (imageDataURL = height.toDataURL('image/png')),
    (document.getElementById('downloadRef').href = imageDataURL),
    document.getElementById('downloadRef').classList.remove('hidden'),
    (document.getElementById('mireNegativePreview').src = imageDataURL),
    document.getElementById('mireNegativePreview').classList.remove('hidden');
    const a = document.createElement('canvas');
    (a.width = 800), (a.height = a.height = 800);
    const index = a.getContext('2d');
    (index.fillStyle = '#fff'), index.fillRect(0, 0, 800, 800);
    for (let blueValue = 0; blueValue < re; blueValue++) {
      const C = blueValue / (re - 1),
        x = Math.round(C * 255),
        I = (blueValue % _) * t,
        R = Math.floor(blueValue / _) * t;
      (index.fillStyle = `rgb(${x},${x},${x})`), index.fillRect(I, R, t, t);
    }
    const s = a.toDataURL('image/png');
    (document.getElementById('downloadRefPositive').href = s),
    document.getElementById('downloadRefPositive').classList.remove('hidden'),
    (document.getElementById('mirePositivePreview').src = s),
    document.getElementById('mirePositivePreview').classList.remove('hidden'),
    (document.getElementById('normalMirePreview').src = s),
    document.getElementById('normalMirePreview').classList.remove('hidden'),
    (document.getElementById('downloadNormalMire').href = s),
    document.getElementById('downloadNormalMire').classList.remove('hidden');
    const redValue = document.createElement('canvas'),
      f = 800 * 4;
    (redValue.width = f), (redValue.height = f);
    const u = redValue.getContext('2d');
    (u.fillStyle = '#fff'), u.fillRect(0, 0, f, f);
    const l = f / _;
    for (let blueValue = 0; blueValue < re; blueValue++) {
      const C = blueValue / (re - 1),
        x = Math.round((1 - C) * 255),
        I = (blueValue % _) * l,
        R = Math.floor(blueValue / _) * l,
        A = [];
      for (let z = 0; z < l; z++) {
        A[z] = [];
        for (let G = 0; G < l; G++) {
          const v =
              ([
                [0, 8, 2, 10],
                [12, 4, 14, 6],
                [3, 11, 1, 9],
                [15, 7, 13, 5],
              ][z % 4][G % 4] /
                16) *
              255,
            L = (Math.random() - 0.5) * 32,
            P = x + L;
          A[z][G] = P > v ? 0 : 255;
        }
      }
      const H = u.createImageData(l, l),
        D = H.data;
      for (let z = 0; z < l; z++)
        for (let G = 0; G < l; G++) {
          const c = (z * l + G) * 4,
            v = A[z][G];
          (D[c] = v), (D[c + 1] = v), (D[c + 2] = v), (D[c + 3] = 255);
        }
      u.putImageData(H, I, R);
    }
    const y = document.createElement('canvas');
    (y.width = 800), (y.height = 800);
    const adjustColorValue = y.getContext('2d');
    (adjustColorValue.imageSmoothingEnabled = !1), adjustColorValue.drawImage(redValue, 0, 0, f, f, 0, 0, 800, 800);
    const w = y.toDataURL('image/png');
    (document.getElementById('downloadRefA4').href = w),
    document.getElementById('downloadRefA4').classList.remove('hidden'),
    (document.getElementById('mireBitmapPreview').src = w),
    document.getElementById('mireBitmapPreview').classList.remove('hidden');
  }
  function generateMasterMirePro(
    width = 6,
    height = 10,
    eventObj = 50,
    t = 50,
    a = 4,
    index = 0.9,
    s = 0.5,
    redValue = 1.3,
    d = 1,
    f = 1.7,
  ) {
    const u = document.createElement('canvas');
    (u.width = height * eventObj), (u.height = width * t);
    const l = u.getContext('2d'),
      y = [];
    /** @function adjustColorValue */
    function adjustColorValue(C, x) {
      return Math.floor((C - 128) * x + 128);
    }
    for (let C = 0; C < width; C++)
      for (let x = 0; x < height; x++) {
        let I = 255,
          R = ((height - x) / height) * 255 * index,
          A = ((width - C) / width) * 255 * s,
          H = (Math.sin((x / height) * 2 * Math.PI) * 0.5 + 0.5) * 255 * redValue;
        switch (a) {
        case 1:
          I = Math.floor(R * d);
          break;
        case 2:
          I = Math.floor(A * d);
          break;
        case 3:
          I = Math.floor(H * d);
          break;
        case 4:
          I = Math.floor(((R + A + H) / 3) * d);
          break;
        }
        (I = adjustColorValue(I, f)), (I = Math.max(0, Math.min(255, I)));
        const D = x * eventObj,
          z = C * t;
        (l.fillStyle = `rgb(${I},${I},${I})`),
        l.fillRect(D, z, eventObj, t),
        y.push(I);
      }
    window.expectedPro = y;
    const w = u.toDataURL('image/png'),
      blueValue = document.getElementById('masterMirePreview');
    return ((blueValue.src = w), blueValue.classList.remove('hidden'), (document.getElementById('downloadMasterMire').href = w), document.getElementById('downloadMasterMire').classList.remove('hidden'), console.log('Valeurs attendues Pro générées:', expectedPro), expectedPro);
  }
  function analyzeProCalibration(width) {
    // Afficher l'overlay de chargement pendant l'analyse Pro
    showRegenerationIndicator('Analyse Pro en cours', 'Traitement avancé de la mire...');
    
    try {
      const height = document.getElementById('overlayCanvasPro'),
        eventObj = height.width,
        t = height.height,
        a = document.getElementById('monCanvas');
      (a.width = eventObj), (a.height = t);
      const index = a.getContext('2d');
      (index.fillStyle = 'white'), index.fillRect(0, 0, eventObj, t);
      const s = 0.8,
        redValue = eventObj * s,
        d = t * s,
        f = (eventObj - redValue) / 2,
        u = (t - d) / 2,
        l = width.width / width.height;
      let y, adjustColorValue;
      redValue / d > l ? ((adjustColorValue = d), (y = d * l)) : ((y = redValue), (adjustColorValue = redValue / l));
      const w = Math.min(redValue / y, d / adjustColorValue);
      (y *= w), (adjustColorValue *= w), index.save();
      const blueValue = eventObj / 2 + $.tx,
        C = t / 2 + $.ty;
      index.translate(blueValue, C),
      index.rotate($.rotation),
      index.scale($.scale, $.scale),
      index.drawImage(width, -y / 2, -adjustColorValue / 2, y, adjustColorValue),
      index.restore();
      let x = index.getImageData(0, 0, eventObj, t);
      const I = x.data;
      for (let O = 0; O < I.length; O += 4) {
        const U = 0.2126 * I[O] + 0.7152 * I[O + 1] + 0.0722 * I[O + 2];
        I[O] = I[O + 1] = I[O + 2] = U;
      }
      index.putImageData(x, 0, 0);
      const R = redValue / V.cols,
        A = d / V.rows,
        D = se - 0.03,
        z = 3,
        G = 0,
        c = f + z * R + (R * (1 - D)) / 2,
        v = u + G * A + (A * (1 - D)) / 2,
        L = R * D,
        P = A * D,
        S = index.getImageData(c, v, L, P).data,
        X = calculateAverageColor(S);
      console.log('[Pro] Étape 1 - Couleur du papier détectée:', {
        r: X.r,
        calibrationPoints: X.calibrationPoints,
        b: X.b,
      }),
      console.log('[Pro] Étape 2 - Début extraction des valeurs des patchs'),
      (measuredPatchValues = []);
      for (let O = 0; O < V.rows; O++)
        for (let U = 0; U < V.cols; U++) {
          const ae = f + U * R + (R * (1 - se)) / 2,
            ze = u + O * A + (A * (1 - se)) / 2,
            Ut = R * se,
            Ft = A * se,
            $t = index.getImageData(ae, ze, Ut, Ft).data,
            ct = calculatePatchLuminance($t, X);
          (O * V.cols + U) % 10 === 0 &&
              console.log(`[Pro] Patch [${O},${U}] - Luminance: ${ct}`),
          measuredPatchValues.push(ct);
        }
      if (
        (console.log(
          '[Pro] Étape 2 - Fin extraction. Nombre de valeurs:',
          measuredPatchValues.length,
        ),
        console.log(
          '[Pro] Valeurs min/max brutes:',
          Math.min(...measuredPatchValues),
          Math.max(...measuredPatchValues),
        ),
        console.log(
          '[Pro] Étape 3 - Calcul des écarts avec les valeurs attendues',
        ),
        !Array.isArray(window.expectedPro) || window.expectedPro.length !== ee)
      )
        throw new Error(
          'Valeurs attendues manquantes ou invalides. Regénérez la mire Pro.',
        );
      const oe = [...window.expectedPro];
      console.log('[Pro] Valeurs attendues (sample):', oe.slice(0, 5), '...'),
      (window.diffPro = window.expectedPro.map(
        (O, U) => (measuredPatchValues[U] != null ? measuredPatchValues[U] : O) - O,
      )),
      console.log(
        '[Pro] Écarts calculés (sample):',
        window.diffPro.slice(0, 5),
        '...',
      ),
      console.log(
        '[Pro] Statistiques des écarts - Min:',
        Math.min(...window.diffPro),
        'Max:',
        Math.max(...window.diffPro),
        'Moyenne:',
        window.diffPro.reduce((O, U) => O + U, 0) / window.diffPro.length,
      ),
      (window.orderedDiffPro = window.expectedPro
        .map((O, U) => ({ exp: O, i: U, diff: window.diffPro[U] }))
        .sort((O, U) => O.exp - U.exp)
        .map((O) => O.diff)),
      console.log('[Pro] Écarts réordonnés selon luminosité attendue'),
      console.log('[Pro] Étape 4 - Interpolation des valeurs manquantes');
      const K = measuredPatchValues.map((O, U) => ({ value: O, index: U })).filter(
        (O) => O.value != null,
      );
      if (
        (console.log(`[Pro] Échantillons valides: ${K.length}/${ee}`),
        K.length < ee / 2)
      )
        throw new Error(`Trop de patchs invalides (${K.length}/${ee}).`);
      const cellY = Array(ee).fill(null);
      K.forEach((O) => (cellY[O.index] = O.value));
      let lt = 0;
      for (let O = 0; O < ee; O++)
        if (cellY[O] === null) {
          lt++;
          let U = O - 1;
          for (; U >= 0 && cellY[U] === null; ) U--;
          let ae = O + 1;
          for (; ae < ee && cellY[ae] === null; ) ae++;
          if (U < 0) cellY[O] = cellY[ae];
          else if (ae >= ee) cellY[O] = cellY[U];
          else {
            const ze = (O - U) / (ae - U);
            (cellY[O] = cellY[U] + ze * (cellY[ae] - cellY[U])),
            console.log(
              `[Pro] Interpolation du patch ${O} entre ${U}(${cellY[U]}) et ${ae}(${cellY[ae]}) => ${cellY[O]}`,
            );
          }
        }
      console.log(`[Pro] ${lt} valeurs interpolées sur ${ee}`),
      (endPoint = generateProCorrection(cellY)),
      renderProChart(),
      console.log(`Analyse Pro réussie : ${K.length}/${ee} patchs valides.`);
    } catch (height) {
      console.error('Erreur analyse Pro :', height), N && (N.destroy(), (N = null));
      const eventObj = document.getElementById('histogramChartPro'),
        t = eventObj.getContext('2d');
      t.clearRect(0, 0, eventObj.width, eventObj.height),
      (t.fillStyle = 'red'),
      (t.textAlign = 'center'),
      t.fillText(
        'Erreur lors de l\'analyse Pro.',
        eventObj.width / 2,
        eventObj.height / 2 - 10,
      ),
      t.fillText(
        height.message || 'Vérifiez alignement ou qualité.',
        eventObj.width / 2,
        eventObj.height / 2 + 20,
      );
      const a = document.getElementById('masterMirePreview');
      a &&
          a.complete &&
          t.drawImage(a, (eventObj.width - 200) / 2, eventObj.height / 2 + 30, 200, 200);
    } finally {
      // Masquer l'overlay de chargement Pro
      const regenIndicator = document.getElementById('regenIndicator');
      if (regenIndicator) {
        regenIndicator.remove();
      }
    }
  }
  function analyzeStandardCalibration(width) {
    // Afficher l'overlay de chargement pendant l'analyse
    showRegenerationIndicator('Analyse en cours', 'Traitement de la mire...');
    
    try {
      const eventObj = document.getElementById('overlayCanvas').width,
        t = document.getElementById('monCanvas');
      (t.width = eventObj), (t.height = eventObj);
      const a = t.getContext('2d'),
        index = 0.8,
        s = eventObj * index,
        redValue = eventObj * index,
        d = (eventObj - s) / 2,
        f = (eventObj - redValue) / 2,
        u = width.width / width.height;
      let l, y;
      s / redValue > u ? ((y = redValue), (l = redValue * u)) : ((l = s), (y = s / u));
      const adjustColorValue = Math.min(s / l, redValue / y);
      (l *= adjustColorValue), (y *= adjustColorValue), a.save();
      const w = eventObj / 2 + F.tx,
        blueValue = eventObj / 2 + F.ty;
      a.translate(w, blueValue),
      a.rotate(F.rotation),
      a.scale(F.scale, F.scale),
      a.drawImage(width, -l / 2, -y / 2, l, y),
      a.restore();
      const C = a.getImageData(d + (s * 0.8) / 2, f + redValue * 0.1, 20, 20).data,
        x = calculateAverageColor(C);
      if (!x || typeof x.r > 'u' || typeof x.calibrationPoints > 'u' || typeof x.b > 'u')
        return (
          console.error(
            'Erreur : papierColor n\'est pas défini ou manque des propriétés.',
          ),
          0
        );
      const I = s / _,
        R = redValue / _,
        A = [];
      for (let H = 0; H < re; H++) {
        const D = H % _,
          z = Math.floor(H / _),
          G = d + D * I + (I * (1 - me)) / 2,
          c = f + z * R + (R * (1 - me)) / 2,
          v = I * me,
          L = R * me,
          P = a.getImageData(G, c, v, L).data,
          S = calculatePatchLuminance(P, x);
        A.push(S);
      }
      (patchValues = [...A]),
      (startPoint = generateStandardCorrection(A)),
      renderHistogramChart(),
      console.log(`Analyse réussie : ${A.length} patchs analysés.`);
    } catch (height) {
      console.error('Erreur analyse :', height),
      window.histogramChart &&
            (window.histogramChart.destroy(), (window.histogramChart = null));
    } finally {
      // Masquer l'overlay de chargement
      const regenIndicator = document.getElementById('regenIndicator');
      if (regenIndicator) {
        regenIndicator.remove();
      }
    }
  }
  function calculatePatchLuminance(width, height) {
    let eventObj = [];
    for (let blueValue = 0; blueValue < width.length; blueValue += 4) {
      const C = width[blueValue],
        x = width[blueValue + 1],
        I = width[blueValue + 2],
        c = 0.2126 * C + 0.7152 * x + 0.0722 * I;
      eventObj.push(Math.round(c * 100) / 100);
    }
    if (eventObj.length === 0) return 0;
    eventObj.sort((blueValue, C) => blueValue - C);
    const t = Math.floor(eventObj.length / 2);
    let a = eventObj.length % 2 === 0 ? (eventObj[t - 1] + eventObj[t]) / 2 : eventObj[t];
    if (eventObj.length < 10) return Math.round(a);
    const index = Math.floor(eventObj.length / 4),
      s = Math.floor((3 * eventObj.length) / 4),
      redValue = eventObj[index],
      d = eventObj[s],
      f = d - redValue,
      u = redValue - 1.5 * f,
      l = d + 1.5 * f,
      y = eventObj.filter((blueValue) => blueValue >= u && blueValue <= l);
    if (y.length === 0) return Math.round(a);
    const adjustColorValue = Math.floor(y.length / 2),
      w = y.length % 2 === 0 ? (y[adjustColorValue - 1] + y[adjustColorValue]) / 2 : y[adjustColorValue];
    return Math.round(w);
  }
  function generateStandardCorrection(width) {
    try {
      const height = width.length;
      if (height < 2)
        throw new Error('At least 2 patches are required for correction.');
      const eventObj = window.CurvesLib.buildStandardTable(width, {
          normalizeInput: !0,
          windowSize: 20,
        }),
        t = Math.min(...width),
        a = Math.max(...width);
      let index = width.slice();
      (t > 10 || a < 245) && (index = window.CurvesLib.normalizeSamples(width));
      const s = [];
      for (let redValue = 0; redValue < height; redValue++) {
        const d = redValue / (height - 1),
          f = 255 - Math.round(d * 255);
        s.push({ measured: index[redValue], expected: f });
      }
      return (s.sort((redValue, d) => redValue.measured - d.measured), s.unshift({ measured: 0, expected: 0 }), s.push({ measured: 255, expected: 255 }), (pe = s), window.currentCorrectionTable = eventObj, eventObj);
    } catch (height) {
      throw (
        (console.error(
          'Erreur lors de la génération de la table de correction standard:',
          height,
        ),
        height)
      );
    }
  }
  function generateProCorrection(width) {
    try {
      const height = width.length;
      if (height < 2)
        throw new Error(
          'Au moins 2 patchs sont nécessaires pour la correction Pro.',
        );
      let eventObj = !1,
        t = null;
      if (
        window.histogramChart &&
          window.histogramChart.data &&
          window.histogramChart.data.datasets
      ) {
        const index = window.histogramChart.data.datasets.findIndex(
            (redValue) => redValue.label === 'Courbe brut pro',
          ),
          s = index !== -1 ? window.histogramChart.data.datasets[index] : null;
        s &&
            s.data &&
            ((t = s.data),
            (eventObj = !0),
            console.log(
              'Utilisation de la courbe brut pro pour calcul de compensation:',
              t,
            ));
      }
      let a;
      if (eventObj && t) {
        a = window.CurvesLib.buildCorrectionTablePro(t, {
          fromOrangeCurve: !0,
          normalizeInput: !0,
          windowSize: 20,
        });
        const index = window.CurvesLib.normalizeSamples(width),
          s = [];
        for (let redValue = 0; redValue < height; redValue++) {
          const d = redValue / (height - 1),
            f = Math.round(255 - d * 255);
          let u = f;
          const l = [...t].sort((y, adjustColorValue) => y.y - adjustColorValue.y);
          for (let y = 0; y < l.length - 1; y++) {
            const adjustColorValue = l[y],
              w = l[y + 1];
            if ((adjustColorValue.y <= f && w.y >= f) || (adjustColorValue.y >= f && w.y <= f)) {
              const blueValue = (f - adjustColorValue.y) / (w.y - adjustColorValue.y) || 0;
              u = Math.round(adjustColorValue.x + blueValue * (w.x - adjustColorValue.x));
              break;
            }
          }
          s.push({ measured: index[redValue], expected: u });
        }
        s.sort((redValue, d) => redValue.measured - d.measured),
        s.unshift({ measured: 0, expected: 0 }),
        s.push({ measured: 255, expected: 255 }),
        (de = s);
      } else {
        console.log(
          'Utilisation du mode fallback pour la courbe de correction Pro',
        ),
        (a = window.CurvesLib.buildCorrectionTablePro(width, {
          fromOrangeCurve: !1,
          normalizeInput: !0,
          windowSize: 20,
        }));
        const index = window.CurvesLib.normalizeSamples(width),
          s = [];
        for (let redValue = 0; redValue < height; redValue++) {
          const d = redValue / (height - 1),
            f = 255 - Math.round(d * 255);
          s.push({ measured: index[redValue], expected: f });
        }
        s.sort((redValue, d) => redValue.measured - d.measured),
        s.unshift({ measured: 0, expected: 0 }),
        s.push({ measured: 255, expected: 255 }),
        (de = s);
      }
      return a;
    } catch (height) {
      throw (
        (console.error(
          'Erreur lors de la génération de la table de correction Pro:',
          height,
        ),
        height)
      );
    }
  }
  
  // Variable pour le throttling du drag
  let dragLastUpdate = 0;
  
  function renderHistogramChart() {
    const width = document.getElementById('histogramChart');
    if (!window.histogramChart) {
      const c = [
          {
            label: '',
            data: [],
            borderColor: '#2E8B57',
            borderWidth: 2,
            fill: !1,
            pointRadius: 0,
            tension: 0.4,
            dragData: !1,
            order: 5,
          },
          {
            label: '',
            data: [],
            type: 'scatter',
            backgroundColor: 'rgba(46, 139, 87, 0.6)',
            borderColor: '#2E8B57',
            pointRadius: 3,
            pointHoverRadius: 4,
            showLine: !1,
            dragData: !1,
            order: 4,
          },
          {
            label: '',
            data: [],
            type: 'line',
            borderColor: '#FF6B35',
            borderWidth: 2,
            fill: !1,
            pointRadius: 0,
            tension: 0.4,
            dragData: !1,
            order: 3,
          },
          {
            label: '',
            data: [],
            type: 'scatter',
            backgroundColor: 'rgba(255, 107, 53, 1)',
            borderColor: '#FF6B35',
            borderWidth: 0,
            pointRadius: 8,
            pointStyle: 'circle',
            pointHoverRadius: 12,
            pointBorderWidth: 0,
            pointBorderColor: '#FFFFFF',
            showLine: !1,
            dragData: !0,
            dragY: !0,
            parsing: { xAxisKey: 'x', yAxisKey: 'y' },
            order: 0,
            zIndex: 1000,
          },
        ],
        v = [
          {
            type: 'scatter',
            label: 'patchs brut Pro corrigé',
            data: [],
            backgroundColor: 'rgba(0, 0, 255, 0.7)',
            borderColor: 'blue',
            pointRadius: 1,
            showLine: !1,
            parsing: { xAxisKey: 'x', yAxisKey: 'y' },
            dragData: !1,
          },
          {
            type: 'line',
            label: 'Courbe Pro lissée',
            data: [],
            borderColor: 'blue',
            borderWidth: 2,
            parsing: { xAxisKey: 'x', yAxisKey: 'y' },
            dragData: !1,
          },
          {
            type: 'line',
            label: 'Courbe brut pro',
            data: [],
            borderColor: 'orange',
            borderWidth: 2,
            fill: !1,
            pointRadius: 0,
            tension: 0.4,
            parsing: { xAxisKey: 'x', yAxisKey: 'y' },
            dragData: !1,
          },
        ],
        L = [...c, ...v];
      window.histogramChart = new Chart(width, {
        type: 'line',
        data: { labels: Array.from({ length: 256 }, (P, S) => S), datasets: L },
        options: {
          responsive: !0,
          maintainAspectRatio: !0,
          aspectRatio: 3/2,
          layout: {
            padding: {
              top: 10,
              right: 15,
              bottom: 10,
              left: 15
            }
          },
          scales: {
            x: {
              display: !0,
              border: {
                display: !0,
                color: '#666',
                width: 2
              },
              ticks: { 
                display: !1,
                maxTicksLimit: 3,
                stepSize: 85
              },
              grid: {
                display: !0,
                drawOnChartArea: !0,
                color: 'rgba(150, 150, 150, 0.3)',
                lineWidth: 1,
                tickMarkLength: 0
              }
            },
            y: {
              display: !0,
              border: {
                display: !0,
                color: '#666',
                width: 2
              },
              min: 0,
              max: 255,
              ticks: { 
                display: !1,
                maxTicksLimit: 3,
                stepSize: 85
              },
              grid: {
                display: !0,
                drawOnChartArea: !0,
                color: 'rgba(150, 150, 150, 0.3)',
                lineWidth: 1,
                tickMarkLength: 0
              }
            },
          },
          onHover: (P, S) => {
            if (S.length > 0) {
              const X = S[0];
              X.datasetIndex === 3 ? (calibrationPoints = X.index) : (calibrationPoints = -1);
            } else calibrationPoints = -1;
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: !1 },
            chartBorder: {
              borderColor: '#666',
              borderWidth: 2
            },
            dragData: {
              round: 1,
              dragX: !1,
              dragY: !0,
              showTooltip: !1,
              magnet: {
                to: Math.round
              },
              touchSensitivity: 20,
              onDragStart: function (P, S) {
                return S === 3;
              },
              onDrag: function (P, S, X, oe) {
                // Uniquement mettre à jour visuellement le point déplacé
                histogramChart.data.datasets[3].data[X].y = oe.y;
                // Mise à jour légère sans animation
                histogramChart.update('none');
                
                // Limiter la fréquence de recalcul complet (throttling)
                if (!dragLastUpdate || Date.now() - dragLastUpdate > 50) {
                  dragLastUpdate = Date.now();
                  // Recalcul complet à fréquence limitée
                  patchValues[X] = 255 - oe.y;
                  startPoint = generateStandardCorrection(patchValues);
                  renderHistogramChart();
                }
              },
              onDragEnd: null,
            },
          },
        },
      });
    }
    (histogramChart.options.plugins.legend = {
      display: false,
      labels: {
        filter: function () {
          return false; // Masquer toutes les légendes
        }
      }
    }),
    histogramChart.update();
    const height = [],
      eventObj = 25;
    for (let c = 0; c < eventObj; c++) {
      const v = Math.round(255 - (c / (eventObj - 1)) * 255),
        L = startPoint[v];
      height.push({ x: v, y: L, index: c });
    }
    const t = [],
      a = [];
    for (let c = 0; c < eventObj; c++) {
      const v = patchValues[c];
      if (v !== null) {
        const L = eventObj - 1 - c,
          P = Math.round(255 - (L / (eventObj - 1)) * 255),
          S = 255 - v;
        t.push({ x: P, y: S, index: c }), a.push({ x: P, y: S });
      }
    }
    const index = [],
      s = pe.slice();
    for (let c = 0; c < 256; c++) {
      let v = s[0],
        L = s[s.length - 1];
      for (let S = 0; S < s.length - 1; S++)
        if (c >= s[S].measured && c <= s[S + 1].measured) {
          (v = s[S]), (L = s[S + 1]);
          break;
        }
      let P = v.expected;
      if (L.measured !== v.measured) {
        const S = (c - v.measured) / (L.measured - v.measured);
        P = v.expected + S * (L.expected - v.expected);
      }
      index[c] = Math.round(Math.max(0, Math.min(255, P)));
    }
    const redValue = 20,
      d = [];
    for (let c = 0; c < 256; c++) {
      let v = 0,
        L = 0;
      for (
        let S = Math.max(0, c - Math.floor(redValue / 2));
        S <= Math.min(255, c + Math.floor(redValue / 2));
        S++
      )
        (v += index[S]), L++;
      let P = v / L;
      c > 0 && P < d[c - 1] && (P = d[c - 1]), (d[c] = Math.round(P));
    }
    (d[0] = s[0].expected), (d[255] = s[s.length - 1].expected);
    const f = 5,
      u = 0.2;
    for (let c = 1; c < 256; c++) {
      let v = d[c] - d[c - 1];
      v > f ? (d[c] = d[c - 1] + f) : v < u && (d[c] = d[c - 1] + u);
    }
    startPoint = d.slice();
    let l = [], y = [], adjustColorValue = Array(256);
    if (window.expectedPro && Array.isArray(window.expectedPro) && measuredPatchValues) {
      l = window.expectedPro.map((c, v) => ({ y: 255 - measuredPatchValues[v], x: 255 - c }));
      y = l.slice().sort((c, v) => c.x - v.x);
    }
    if (a.length) {
      const c = a.slice().sort((v, L) => v.x - L.x);
      for (let v = 0; v < 256; v++) {
        let L = c[0],
          P = c[c.length - 1];
        for (let S = 0; S < c.length - 1; S++)
          if (v >= c[S].x && v <= c[S + 1].x) {
            (L = c[S]), (P = c[S + 1]);
            break;
          }
        adjustColorValue[v] =
            L.x === P.x ? L.y : L.y + (P.y - L.y) * ((v - L.x) / (P.x - L.x));
      }
    }
    const w = Array(256);
    if (y.length) {
      const c = y;
      for (let v = 0; v < 256; v++) {
        let L = c[0],
          P = c[c.length - 1];
        for (let S = 0; S < c.length - 1; S++)
          if (v >= c[S].x && v <= c[S + 1].x) {
            (L = c[S]), (P = c[S + 1]);
            break;
          }
        w[v] =
            L.x === P.x ? L.y : L.y + (P.y - L.y) * ((v - L.x) / (P.x - L.x));
      }
    }
    for (let c = 0; c < 256; c++)
      (adjustColorValue[c] = Math.round(adjustColorValue[c] ?? 0)), (w[c] = Math.round(w[c] ?? 0));
    const blueValue = histogramChart.data.datasets[2].data;
    let C = [];
    const x = histogramChart.data.datasets.findIndex(
      (c) => c.label === 'patchs brut Pro corrigé',
    );
    x !== -1 &&
        histogramChart.data.datasets[x] &&
        (C = histogramChart.data.datasets[x].data || []);
    let I = [];
    if (blueValue && blueValue.length > 1 && C && C.length > 1) {
      console.log(
        'Début de la génération de la courbe orange (équidistante géométrique)',
      );
      const c = blueValue.slice().sort((P, S) => P.x - S.x),
        v = C.slice().sort((P, S) => P.x - S.x);
      console.log('Points verts triés:', c),
      console.log('Points bleus triés:', v);
      const L = (P, S) => {
        let X = P[0],
          oe = P[P.length - 1];
        for (let K = 0; K < P.length - 1; K++)
          if (S >= P[K].x && S <= P[K + 1].x) {
            (X = P[K]), (oe = P[K + 1]);
            break;
          }
        return X.x === oe.x
          ? X.y
          : X.y + ((oe.y - X.y) * (S - X.x)) / (oe.x - X.x);
      };
      for (let P = 0; P < 256; P++) {
        const S = L(c, P),
          X = L(v, P),
          oe = (S + X) / 2;
        I.push({ x: P, y: Math.round(oe) });
      }
      console.log(
        'Courbe orange (courbe brut pro) générée avec différence verticale :',
        I,
      );
    }
    const R = histogramChart.data.datasets.findIndex(
      (c) => c.label === 'Courbe brut pro',
    );
    R !== -1 && (histogramChart.data.datasets[R].data = I);
    let A = [];
    if (I && I.length > 0)
      try {
        const c = I.filter(
          (v) => typeof v.x == 'number' && typeof v.y == 'number',
        )
          .sort((v, L) => v.x - L.x)
          .map((v) => v.y);
        if (
          (console.log(
            'Échantillons extraits de la courbe orange pour buildStandardTable:',
            {
              count: c.length,
              min: Math.min(...c),
              max: Math.max(...c),
              samples: c,
            },
          ),
          window.CurvesLib &&
              window.CurvesLib.buildStandardTable &&
              c.length >= 2)
        )
          console.log(
            'Génération de la courbe violette avec buildStandardTable...',
          ),
          (A = window.CurvesLib.buildStandardTable(c, {
            normalizeInput: !1,
            windowSize: 20,
          }).map((L, P) => ({ x: P, y: L }))),
          console.log(
            'Courbe de correction Pro générée avec buildStandardTable:',
            {
              length: A.length,
              firstPoint: A[0],
              lastPoint: A[255],
              samplePoints: A.filter((L, P) => P % 51 === 0),
            },
          );
        else
          throw new Error(
            'buildStandardTable non disponible ou échantillons insuffisants',
          );
      } catch (c) {
        console.warn(
          'Erreur avec buildStandardTable, utilisation de la méthode de fallback:',
          c,
        ),
        I.forEach((v) => {
          typeof v.x == 'number' &&
                typeof v.y == 'number' &&
                A.push({ x: v.y, y: v.x });
        }),
        A.sort((v, L) => v.x - L.x),
        console.log(
          'Courbe de correction Pro générée par méthode de fallback:',
          A,
        );
      }
    const H = A.map(({ x: c, y: v }) => ({ x: 255 - c, y: 255 - v }))
        .concat([
          { x: 0, y: 0 },
          { x: 255, y: 255 },
        ])
        .sort((c, v) => c.x - v.x),
      D = histogramChart.data.datasets.findIndex(
        (c) => c.label === 'Courbe de correction Pro',
      );
    D !== -1
      ? (histogramChart.data.datasets[D].data = H)
      : histogramChart.data.datasets.push({
        type: 'line',
        label: 'Courbe de correction Pro',
        data: H,
        fill: !1,
        pointRadius: 0,
        tension: 0.4,
        borderColor: 'purple',
        borderWidth: 2,
      }),
    histogramChart.update();
      
    // Suppression de la ligne diagonale de référence pour simplifier l'affichage
      
    // Mise à jour des données des datasets
    (window.histogramChart.data.datasets[0].data = d),
    (window.histogramChart.data.datasets[1].data = height.map((c) => ({
      x: c.x,
      y: c.y,
    }))),
    (window.histogramChart.data.datasets[2].data = a.map((c) => ({
      x: c.x,
      y: c.y,
    }))),
    (window.histogramChart.data.datasets[3].data = t.map((c) => ({
      x: c.x,
      y: c.y,
    })));
        
    if (window.useProCompensation) {
      const c = histogramChart.data.datasets.findIndex(
          (P) => P.label === 'patchs brut Pro corrigé',
        ),
        v = histogramChart.data.datasets.findIndex(
          (P) => P.label === 'Courbe Pro lissée',
        ),
        L = histogramChart.data.datasets.findIndex(
          (P) => P.label === 'Courbe brut pro',
        );
      c !== -1 && (histogramChart.data.datasets[c].data = l),
      v !== -1 && (histogramChart.data.datasets[v].data = y),
      L !== -1 && (histogramChart.data.datasets[L].data = I);
    }
    histogramChart.update();
  }
  function renderProChart() {
    const width = Date.now();
    if (width - Q < 1e3) return;
    Q = width;
    const height = document.getElementById('histogramChartPro');
    if (N) {
      if (window.expectedPro && Array.isArray(window.expectedPro) && measuredPatchValues) {
        N.data.datasets[0].data = window.expectedPro;
        N.data.datasets[1].data = measuredPatchValues.map((eventObj, t) => ({ x: t, y: eventObj }));
        N.data.datasets[2].data = measuredPatchValues.map((eventObj, t) => ({
          x: t,
          y: eventObj - window.expectedPro[t],
        }));
      }
      N.update();
      return;
    }
    (N = new Chart(height, {
      data: {
        labels: Array.from({ length: ee }, (eventObj, t) => t),
        datasets: [
          {
            type: 'line',
            label: 'Attendu',
            data: window.expectedPro,
            borderColor: '#888',
            fill: !1,
            order: 3,
          },
          {
            type: 'scatter',
            label: 'Mesuré',
            data: measuredPatchValues.map((eventObj, t) => ({ x: t, y: eventObj })),
            borderColor: '#0a0',
            backgroundColor: 'rgba(0, 255, 0, 1)',
            pointRadius: 5,
            pointStyle: 'rect',
            pointHoverRadius: 18,
            pointBorderWidth: 4,
            pointBorderColor: '#FFFFFF',
            showLine: !1,
            parsing: { xAxisKey: 'x', yAxisKey: 'y' },
            dragData: !1,
            order: 0,
            zIndex: 1000,
          },
          {
            type: 'bar',
            label: 'Écart',
            data: window.expectedPro && Array.isArray(window.expectedPro) && measuredPatchValues ? 
              measuredPatchValues.map((eventObj, t) => ({ x: t, y: eventObj - window.expectedPro[t] })) : [],
            order: 2,
            backgroundColor: (eventObj) =>
              eventObj.raw && typeof eventObj.raw.y < 'u'
                ? eventObj.raw.y > 0
                  ? 'rgba(255, 99, 132, 0.5)'
                  : 'rgba(54, 162, 235, 0.5)'
                : 'rgba(128, 128, 128, 0.7)',
            borderColor: (eventObj) =>
              eventObj.raw && typeof eventObj.raw.y < 'u'
                ? eventObj.raw.y > 0
                  ? 'rgb(255, 99, 132)'
                  : 'rgb(54, 162, 235)'
                : 'rgb(128, 128, 128)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: !0,
        maintainAspectRatio: !0,
        aspectRatio: 2/3,
        layout: {
          padding: {
            top: 10,
            right: 15,
            bottom: 10,
            left: 15
          }
        },
        scales: {
          x: {
            display: !0,
            border: {
              display: !0,
              color: '#666',
              width: 2
            },
            title: { display: !0, text: 'Patch n°' },
            ticks: { 
              display: !1,
              maxTicksLimit: 3
            },
            grid: {
              display: !0,
              drawOnChartArea: !0,
              color: 'rgba(150, 150, 150, 0.25)',
              lineWidth: 1
            }
          },
          y: {
            display: !0,
            border: {
              display: !0,
              color: '#666',
              width: 2
            },
            title: { display: !0, text: 'Valeurs' },
            suggestedMin: 0,
            suggestedMax: 255,
            ticks: { 
              display: !1,
              maxTicksLimit: 3
            },
            grid: {
              display: !0,
              drawOnChartArea: !0,
              color: 'rgba(150, 150, 150, 0.25)',
              lineWidth: 1
            },
          },
        },
        onHover: (eventObj, t) => {
          if (t.length > 0) {
            const a = t[0];
            a.datasetIndex === 2 ? (normalizeInput = a.index) : (normalizeInput = -1);
          } else normalizeInput = -1;
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: { enabled: !1 },
          chartBorder: {
            borderColor: '#666',
            borderWidth: 2
          },
          dragData: {
            round: 1,
            dragX: !1,
            dragY: !0,
            showTooltip: !1,
            magnet: {
              to: Math.round
            },
            touchSensitivity: 20,
            onDragStart: (eventObj, t) => t.datasetIndex === 1,
            onDrag: function (eventObj, t, a, index) {
              (N.data.datasets[1].data[a].y = index.y),
              (measuredPatchValues[a] = index.y),
              (endPoint = generateProCorrection(measuredPatchValues));
              if (window.expectedPro && Array.isArray(window.expectedPro)) {
                N.data.datasets[2].data = measuredPatchValues.map((s, redValue) => ({
                  x: redValue,
                  y: s - window.expectedPro[redValue],
                }));
              }
              N.update(),
              renderHistogramChart();
            },
            onDragEnd: null,
          },
        },
        animation: !1,
      },
    })),
    (Q = width);
  }
  function updateCurveSelector() {
    const width = document.getElementById('curveSelector');
    // Garder les options de base et nettoyer seulement les optgroups
    const baseOptions = width.querySelectorAll('option[value="-1"], option[value="-2"]');
    width.innerHTML = '';
    
    // Remettre les options de base
    baseOptions.forEach(option => width.appendChild(option));
    
    const eventObj = document.createElement('optgroup');
    eventObj.label = 'Courbes standards';
    const t = document.createElement('optgroup');
    (t.label = 'Courbes Pro'),
    windowSize.forEach((a, index) => {
      const s = document.createElement('option');
      (s.value = index),
      (s.textContent = a.info),
      a.isPro ? t.appendChild(s) : eventObj.appendChild(s);
    }),
    eventObj.children.length > 0 && width.appendChild(eventObj),
    t.children.length > 0 && width.appendChild(t),
    console.log(
      'Sélecteur de courbes mis à jour :',
      windowSize.length,
      'options (dont ' + t.children.length + ' Pro)',
    );
  }
  function applyNegativeTransformation(width, height, eventObj = !0) {
    const t = document.createElement('canvas');
    (t.width = width.width), (t.height = width.height);
    const a = t.getContext('2d');
    a.drawImage(width, 0, 0);
    const index = a.getImageData(0, 0, t.width, t.height),
      s = index.data;
    for (let redValue = 0; redValue < s.length; redValue += 4) {
      const d = Math.round(
          0.2126 * s[redValue] + 0.7152 * s[redValue + 1] + 0.0722 * s[redValue + 2],
        ),
        f = height[d],
        u = eventObj ? 255 - f : f;
      s[redValue] = s[redValue + 1] = s[redValue + 2] = u;
    }
    return (a.putImageData(index, 0, 0), 
    window.applyDitheringToCanvas && window.applyDitheringToCanvas(t),
    composePrintableCanvas(t, {
      paperSize: getCustomizationOption('paperSize'),
      orientation: getCustomizationOption('orientation'),
      background: getCustomizationOption('background'),
      frame: getCustomizationOption('frame'),
      registration: getCustomizationOption('registration'),
    }));
  }
  async function applyCMYKTransformation(width, height) {
    const eventObj = document.createElement('canvas');
    (eventObj.width = width.width), (eventObj.height = width.height);
    const t = eventObj.getContext('2d');
    t.drawImage(width, 0, 0);
    const index = t.getImageData(0, 0, eventObj.width, eventObj.height).data,
      s = { cyan: [], magenta: [], yellow: [], black: [] };
    for (let d = 0; d < index.length; d += 4) {
      const f = index[d],
        u = index[d + 1],
        l = index[d + 2];
      s.cyan.push(255 - height[f]),
      s.magenta.push(255 - height[u]),
      s.yellow.push(255 - height[l]);
      const y = Math.round(0.2126 * f + 0.7152 * u + 0.0722 * l);
      s.black.push(255 - height[y]);
    }
    const redValue = {};
    for (let d in s) {
      const f = document.createElement('canvas');
      (f.width = eventObj.width), (f.height = eventObj.height);
      const u = f.getContext('2d'),
        l = new Uint8ClampedArray(index.length);
      for (let y = 0; y < index.length; y += 4)
        (l[y] = l[y + 1] = l[y + 2] = s[d][y / 4]), (l[y + 3] = 255);
      u.putImageData(new ImageData(l, eventObj.width, eventObj.height), 0, 0),
      window.applyDitheringToCanvas && window.applyDitheringToCanvas(f),
      (redValue[d] = composePrintableCanvas(f, {
        paperSize: getCustomizationOption('paperSize'),
        orientation: getCustomizationOption('orientation'),
        background: getCustomizationOption('background'),
        frame: getCustomizationOption('frame'),
        registration: getCustomizationOption('registration'),
      }));
    }
    return redValue;
  }



  function composePrintableCanvas(width, height = {}) {
    const eventObj = height.paperSize || getCustomizationOption('paperSize') || 'A4',
      t = height.orientation || getCustomizationOption('orientation') || 'portrait',
      a = height.background || getCustomizationOption('background') || 'black',
      index = height.frame || getCustomizationOption('frame') || 'none',
      s = height.registration || getCustomizationOption('registration') || 'off',
      redValue = s === 'on' ? 236 : 118;
    let d, f;
    eventObj === 'A4' ? ((d = 2480), (f = 3508)) : ((d = 3508), (f = 4962));
    let u, l;
    t === 'landscape'
      ? ((u = Math.max(d, f)), (l = Math.min(d, f)))
      : ((u = Math.min(d, f)), (l = Math.max(d, f)));
    let y;
    index === 'none' ? (y = 0) : index === 'thick' ? (y = 118) : (y = 35);
    const adjustColorValue = document.createElement('canvas');
    (adjustColorValue.width = u), (adjustColorValue.height = l);
    const w = adjustColorValue.getContext('2d');
    (w.fillStyle = a === 'white' ? '#fff' : '#000'), w.fillRect(0, 0, u, l);
    const blueValue = u - 2 * redValue,
      C = l - 2 * redValue,
      x = Math.min(blueValue / width.width, C / width.height),
      I = width.width * x,
      R = width.height * x,
      A = redValue + (blueValue - I) / 2,
      H = redValue + (C - R) / 2;
    if ((w.drawImage(width, A, H, I, R), y > 0)) {
      const D = a === 'white' ? '#000' : '#fff';
      w.fillStyle = D;
      const z = A - y,
        G = H - y,
        c = I + 2 * y,
        v = R + 2 * y;
      w.fillRect(z, G, c, y),
      w.fillRect(z, G + v - y, c, y),
      w.fillRect(z, G, y, v),
      w.fillRect(z + c - y, G, y, v);
    }
    if (s === 'on') {
      const D = a === 'white' ? '#000' : '#fff';
      w.fillStyle = D;
      const z = 24,
        G = 71,
        c = 35,
        v = 20,
        L = 7;
      [
        { x: redValue / 2, y: redValue / 2 },
        { x: u - redValue / 2, y: redValue / 2 },
        { x: redValue / 2, y: l - redValue / 2 },
        { x: u - redValue / 2, y: l - redValue / 2 },
      ].forEach((S) => {
        w.beginPath(),
        w.arc(S.x, S.y, c, 0, 2 * Math.PI),
        w.fill(),
        (w.fillStyle = a === 'white' ? '#fff' : '#000'),
        w.beginPath(),
        w.arc(S.x, S.y, v, 0, 2 * Math.PI),
        w.fill(),
        (w.fillStyle = D),
        w.beginPath(),
        w.arc(S.x, S.y, L, 0, 2 * Math.PI),
        w.fill(),
        w.fillRect(S.x - G / 2, S.y - z / 2, G, z),
        w.fillRect(S.x - z / 2, S.y - G / 2, z, G);
      });
    }
    return adjustColorValue.toDataURL('image/png');
  }
  const overlayCanvas = document.getElementById('overlayCanvas'),
    overlayCtx = overlayCanvas.getContext('2d');
  function renderOverlay() {
    const width = overlayCanvas.width,
      height = overlayCanvas.height;
    (overlayCtx.fillStyle = 'white'), overlayCtx.fillRect(0, 0, width, height);
    const eventObj = 0.8,
      t = width * eventObj,
      a = height * eventObj,
      index = (width - t) / 2,
      s = (height - a) / 2,
      redValue = document.getElementById('mireNegativePreview');
    redValue &&
      redValue.complete &&
      redValue.src &&
      (overlayCtx.save(),
      (overlayCtx.globalAlpha = 0.5),
      overlayCtx.drawImage(redValue, index, s, t, a),
      overlayCtx.restore());
    const d = document.getElementById('scannedChartPreview');
    if (d && d.complete && d.src) {
      const f = d.naturalWidth / d.naturalHeight;
      let u, l;
      t / a > f ? ((l = a), (u = a * f)) : ((u = t), (l = t / f));
      const y = Math.min(t / u, a / l);
      (u *= y),
      (l *= y),
      overlayCtx.save(),
      overlayCtx.translate(index + t / 2 + F.tx, s + a / 2 + F.ty),
      overlayCtx.rotate(F.rotation),
      overlayCtx.scale(F.scale, F.scale),
      (overlayCtx.globalAlpha = 0.9),
      overlayCtx.drawImage(d, -u / 2, -l / 2, u, l),
      overlayCtx.restore();
    }
    (overlayCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)'), (overlayCtx.lineWidth = 1);
    for (let f = 1; f < _; f++) {
      const u = index + f * (t / _);
      overlayCtx.beginPath(), overlayCtx.moveTo(u, s), overlayCtx.lineTo(u, s + a), overlayCtx.stroke();
    }
    for (let f = 1; f < _; f++) {
      const u = s + f * (a / _);
      overlayCtx.beginPath(), overlayCtx.moveTo(index, u), overlayCtx.lineTo(index + t, u), overlayCtx.stroke();
    }
    if (
      ((overlayCtx.strokeStyle = 'blue'),
      (overlayCtx.lineWidth = 2),
      overlayCtx.strokeRect(index, s, t, a),
      redValue && redValue.complete && redValue.src)
    ) {
      (overlayCtx.strokeStyle = 'red'), (overlayCtx.lineWidth = 2);
      const f = t / _,
        u = a / _;
      for (let l = 0; l < re; l++) {
        const y = l % _,
          adjustColorValue = Math.floor(l / _),
          w = index + y * f + (f * (1 - me)) / 2,
          blueValue = s + adjustColorValue * u + (u * (1 - me)) / 2,
          C = f * me,
          x = u * me;
        overlayCtx.strokeRect(w, blueValue, C, x),
        l === calibrationPoints &&
            ((overlayCtx.fillStyle = 'rgba(255, 0, 0, 0.5)'), overlayCtx.fillRect(w, blueValue, C, x));
      }
    }
  }
  /** @function animationLoop */
  function animationLoop() {
    renderOverlay(), requestAnimationFrame(animationLoop);
  }
  animationLoop();
  function renderProOverlay() {
    if (!isAutoRegenerating) return;
    const width = document.getElementById('overlayCanvasPro');
    if (!width) return;
    const height = width.getContext('2d');
    (height.fillStyle = 'white'), height.fillRect(0, 0, width.width, width.height);
    const eventObj = 0.8,
      t = width.width * eventObj,
      a = width.height * eventObj,
      index = (width.width - t) / 2,
      s = (width.height - a) / 2,
      redValue = document.getElementById('scannedChartPreview');
    if (redValue && redValue.complete && redValue.src) {
      const u = redValue.naturalWidth / redValue.naturalHeight;
      let l, y;
      u > 1 ? ((l = t), (y = t / u)) : ((l = a * u), (y = a)),
      height.save(),
      height.translate(index + t / 2 + $.tx, s + a / 2 + $.ty),
      height.rotate($.rotation),
      height.scale($.scale, $.scale),
      (height.globalAlpha = 0.9),
      height.drawImage(redValue, -l / 2, -y / 2, l, y),
      height.restore();
    }
    (height.strokeStyle = 'blue'),
    (height.lineWidth = 2),
    height.strokeRect(index, s, t, a),
    (height.strokeStyle = 'rgba(0, 0, 0, 0.5)'),
    (height.lineWidth = 1);
    for (let u = 1; u < V.cols; u++) {
      const l = index + u * (t / V.cols);
      height.beginPath(), height.moveTo(l, s), height.lineTo(l, s + a), height.stroke();
    }
    for (let u = 1; u < V.rows; u++) {
      const l = s + u * (a / V.rows);
      height.beginPath(), height.moveTo(index, l), height.lineTo(index + t, l), height.stroke();
    }
    (height.strokeStyle = 'red'), (height.lineWidth = 2);
    const d = t / V.cols,
      f = a / V.rows;
    for (let u = 0; u < V.rows; u++)
      for (let l = 0; l < V.cols; l++) {
        const y = u * V.cols + l,
          adjustColorValue = index + l * d + (d * (1 - se)) / 2,
          w = s + u * f + (f * (1 - se)) / 2,
          blueValue = d * se,
          C = f * se;
        height.strokeRect(adjustColorValue, w, blueValue, C),
        y === normalizeInput &&
            ((height.fillStyle = 'rgba(255, 0, 0, 0.5)'), height.fillRect(adjustColorValue, w, blueValue, C));
      }
    ye = requestAnimationFrame(renderProOverlay);
  }
  /** @function startProAnimation */
  function startProAnimation() {
    isAutoRegenerating && stopProOverlay(), console.log('Starting Pro animation'), (isAutoRegenerating = !0), renderProOverlay();
  }
  function stopProOverlay() {
    console.log('Stopping Pro animation'),
    (isAutoRegenerating = !1),
    ye && (cancelAnimationFrame(ye), (ye = null));
  }
  const nt = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isCatalyst = navigator.platform === 'MacIntel' || /Macintosh/.test(navigator.userAgent);
  
  console.log('[DEBUG] Touch detection - nt:', nt, 'isCatalyst:', isCatalyst, 'platform:', navigator.platform, 'maxTouchPoints:', navigator.maxTouchPoints, 'userAgent:', navigator.userAgent.substring(0, 50));
  
  // Pour Mac Catalyst, on ajoute TOUJOURS les événements souris
  if (nt || isCatalyst) {
    let width = 0,
      height = 0,
      eventObj = { x: 0, y: 0 };
    overlayCanvas.addEventListener(
      'touchstart',
      function (t) {
        if (t.touches.length === 1)
          eventObj = { x: t.touches[0].clientX, y: t.touches[0].clientY };
        else if (t.touches.length >= 2) {
          const a = t.touches[0],
            index = t.touches[1];
          (width = Math.hypot(index.clientX - a.clientX, index.clientY - a.clientY)),
          (height = Math.atan2(index.clientY - a.clientY, index.clientX - a.clientX)),
          (eventObj = {
            x: (a.clientX + index.clientX) / 2,
            y: (a.clientY + index.clientY) / 2,
          });
        }
      },
      { passive: !1 },
    ),
    overlayCanvas.addEventListener(
      'touchmove',
      function (t) {
        if ((t.preventDefault(), t.touches.length === 1)) {
          const a = t.touches[0];
          let index = a.clientX - eventObj.x,
            s = a.clientY - eventObj.y;
          (F.tx += index), (F.ty += s), (eventObj = { x: a.clientX, y: a.clientY });
        } else if (t.touches.length >= 2) {
          const a = t.touches[0],
            index = t.touches[1],
            s = Math.hypot(index.clientX - a.clientX, index.clientY - a.clientY),
            redValue = Math.atan2(index.clientY - a.clientY, index.clientX - a.clientX),
            d = {
              x: (a.clientX + index.clientX) / 2,
              y: (a.clientY + index.clientY) / 2,
            };
          width !== 0 && (F.scale *= s / width),
          (F.rotation += redValue - height),
          (F.tx += d.x - eventObj.x),
          (F.ty += d.y - eventObj.y),
          (width = s),
          (height = redValue),
          (eventObj = d);
        }
      },
      { passive: !1 },
    ),
    overlayCanvas.addEventListener('touchend', function () {
      B && loadImageFile(B).then((t) => analyzeStandardCalibration(t));
    });
  }
  
  // Optimisation: débouncer pour éviter les calculs trop fréquents
  let analysisTimeout = null;
  let lastAnalysisTime = 0;
  const ANALYSIS_DEBOUNCE = 500; // 100ms de délai minimum entre les analyses
  
  function debouncedAnalyzeStandardCalibration(imageFile) {
    const now = Date.now();
    
    // Si un timeout est en cours, l'annuler
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
    }
    
    // Si trop peu de temps s'est écoulé depuis la dernière analyse, débouncer
    if (now - lastAnalysisTime < ANALYSIS_DEBOUNCE) {
      analysisTimeout = setTimeout(() => {
        lastAnalysisTime = Date.now();
        analyzeStandardCalibration(imageFile);
        analysisTimeout = null;
      }, ANALYSIS_DEBOUNCE);
    } else {
      // Analyser immédiatement
      lastAnalysisTime = now;
      analyzeStandardCalibration(imageFile);
    }
  }
  
  // Optimisation: débouncer pour l'analyse Pro
  let proAnalysisTimeout = null;
  let lastProAnalysisTime = 0;
  const PRO_ANALYSIS_DEBOUNCE = 500;
  
  function debouncedAnalyzeProCalibration(imageFile) {
    const now = Date.now();
    
    if (proAnalysisTimeout) {
      clearTimeout(proAnalysisTimeout);
    }
    
    if (now - lastProAnalysisTime < PRO_ANALYSIS_DEBOUNCE) {
      proAnalysisTimeout = setTimeout(() => {
        lastProAnalysisTime = Date.now();
        analyzeProCalibration(imageFile);
        proAnalysisTimeout = null;
      }, PRO_ANALYSIS_DEBOUNCE);
    } else {
      lastProAnalysisTime = now;
      analyzeProCalibration(imageFile);
    }
  }
  
  // Fonction de rendu rapide pour les mises à jour visuelles sans calculs lourds
  function drawOverlayPreview() {
    // Appel direct de renderOverlay pour la mise à jour visuelle immédiate
    renderOverlay();
  }
  
  // Fonction de rendu rapide pour les overlays Pro
  function drawProOverlayPreview() {
    // Mise à jour visuelle immédiate pour le Pro overlay
    if (isAutoRegenerating) {
      renderProOverlay();
    }
  }
  
  // Événements souris (toujours pour les non-tactiles, et aussi pour Mac Catalyst)
  if (!nt || isCatalyst) {
    let width = !1,
      height = { x: 0, y: 0 };
    overlayCanvas.addEventListener('mousedown', function (eventObj) {
      (width = !0), (height = { x: eventObj.clientX, y: eventObj.clientY });
    }),
    overlayCanvas.addEventListener('mousemove', function (eventObj) {
      if (width) {
        const t = eventObj.clientX - height.x,
          a = eventObj.clientY - height.y;
        eventObj.shiftKey ? (F.rotation += t * 0.01) : ((F.tx += t), (F.ty += a)),
        (height = { x: eventObj.clientX, y: eventObj.clientY });
        // Mise à jour visuelle immédiate sans recalcul complet
        drawOverlayPreview();
      }
    }),
    overlayCanvas.addEventListener('mouseup', function () {
      if (width && B) {
        (width = !1);
        // Analyser seulement au relâchement avec débounce
        loadImageFile(B).then((eventObj) => debouncedAnalyzeStandardCalibration(eventObj));
      }
    }),
    overlayCanvas.addEventListener('mouseleave', function () {
      if (width && B) {
        (width = !1);
        // Analyser seulement au relâchement avec débounce
        loadImageFile(B).then((eventObj) => debouncedAnalyzeStandardCalibration(eventObj));
      }
    }),
    overlayCanvas.addEventListener('wheel', function (eventObj) {
      eventObj.preventDefault(),
      eventObj.shiftKey
        ? (F.rotation += eventObj.deltaY * 0.005)
        : (F.scale *= 1 - eventObj.deltaY * 0.001);
      // Mise à jour visuelle immédiate
      drawOverlayPreview();
      // Analyser avec débounce
      if (B) {
        loadImageFile(B).then((t) => debouncedAnalyzeStandardCalibration(t));
      }
    });
  }
  const le = document.getElementById('overlayCanvasPro');
  if (le)
    if (nt) {
      let width = 0,
        height = 0,
        eventObj = { x: 0, y: 0 };
      le.addEventListener(
        'touchstart',
        function (t) {
          if (t.touches.length === 1)
            eventObj = { x: t.touches[0].clientX, y: t.touches[0].clientY };
          else if (t.touches.length >= 2) {
            const a = t.touches[0],
              index = t.touches[1];
            (width = Math.hypot(index.clientX - a.clientX, index.clientY - a.clientY)),
            (height = Math.atan2(index.clientY - a.clientY, index.clientX - a.clientX)),
            (eventObj = {
              x: (a.clientX + index.clientX) / 2,
              y: (a.clientY + index.clientY) / 2,
            });
          }
        },
        { passive: !1 },
      ),
      le.addEventListener(
        'touchmove',
        function (t) {
          if ((t.preventDefault(), t.touches.length === 1)) {
            const a = t.touches[0];
            let index = a.clientX - eventObj.x,
              s = a.clientY - eventObj.y;
            ($.tx += index), ($.ty += s), (eventObj = { x: a.clientX, y: a.clientY });
            // Mise à jour visuelle immédiate
            drawProOverlayPreview();
          } else if (t.touches.length >= 2) {
            const a = t.touches[0],
              index = t.touches[1],
              s = Math.hypot(index.clientX - a.clientX, index.clientY - a.clientY),
              redValue = Math.atan2(index.clientY - a.clientY, index.clientX - a.clientX),
              d = {
                x: (a.clientX + index.clientX) / 2,
                y: (a.clientY + index.clientY) / 2,
              };
            width !== 0 && ($.scale *= s / width),
            ($.rotation += redValue - height),
            ($.tx += d.x - eventObj.x),
            ($.ty += d.y - eventObj.y),
            (width = s),
            (height = redValue),
            (eventObj = d);
            // Mise à jour visuelle immédiate
            drawProOverlayPreview();
          }
        },
        { passive: !1 },
      ),
      le.addEventListener('touchend', function () {
        B && loadImageFile(B).then((t) => debouncedAnalyzeProCalibration(t));
      });
    }
    
  // Événements souris pour overlayCanvasPro (toujours pour les non-tactiles, et aussi pour Mac Catalyst)
  if (!nt || isCatalyst) {
    let width = !1,
      height = { x: 0, y: 0 };
    le.addEventListener('mousedown', function (eventObj) {
      (width = !0), (height = { x: eventObj.clientX, y: eventObj.clientY });
    }),
    le.addEventListener('mousemove', function (eventObj) {
      if (width) {
        const t = eventObj.clientX - height.x,
          a = eventObj.clientY - height.y;
        eventObj.shiftKey ? ($.rotation += t * 0.01) : (($.tx += t), ($.ty += a)),
        (height = { x: eventObj.clientX, y: eventObj.clientY });
        // Mise à jour visuelle immédiate
        drawProOverlayPreview();
      }
    }),
    le.addEventListener('mouseup', function () {
      if (width && B) {
        (width = !1);
        loadImageFile(B).then((eventObj) => debouncedAnalyzeProCalibration(eventObj));
      }
    }),
    le.addEventListener('mouseleave', function () {
      if (width && B) {
        (width = !1);
        loadImageFile(B).then((eventObj) => debouncedAnalyzeProCalibration(eventObj));
      }
    }),
    le.addEventListener('wheel', function (eventObj) {
      eventObj.preventDefault(),
      eventObj.shiftKey
        ? ($.rotation += eventObj.deltaY * 0.005)
        : ($.scale *= 1 - eventObj.deltaY * 0.001);
      // Mise à jour visuelle immédiate
      drawProOverlayPreview();
      // Analyser avec débounce
      if (B) {
        loadImageFile(B).then((t) => debouncedAnalyzeProCalibration(t));
      }
    });
  }
  function loadImageFile(width) {
    return new Promise((height) => {
      const eventObj = new Image();
      (eventObj.onload = () => height(eventObj)), (eventObj.src = URL.createObjectURL(width));
    });
  }
  const ot = document.getElementById('monCanvas').getContext('2d'),
    Pt = 0,
    St = 0,
    Bt = 100,
    Lt = 100,
    Mt = 100,
    Tt = 100,
    At = 100,
    Dt = 100;
  function calculateAverageColor(width) {
    let height = 0,
      eventObj = 0,
      t = 0;
    for (let index = 0; index < width.length; index += 4)
      (height += width[index]), (eventObj += width[index + 1]), (t += width[index + 2]);
    const a = width.length / 4;
    return { r: height / a, calibrationPoints: eventObj / a, b: t / a };
  }
  const kt = ot.getImageData(Pt, St, Bt, Lt).data,
    Rt = calculateAverageColor(kt),
    Nt = ot.getImageData(Mt, Tt, At, Dt).data,
    Ot = calculatePatchLuminance(Nt, Rt);
  console.log('Luminance calculée :', Ot);
  function readFileAsDataURL(width) {
    return new Promise((height) => {
      const eventObj = new FileReader();
      (eventObj.onload = () => height(eventObj.result)), eventObj.readAsDataURL(width);
    });
  }
  /** @function exportLibraryAsZip */
  function exportLibraryAsZip() {
    const width = new JSZip();
    width.file(
      'library.json',
      JSON.stringify({ savedCurves: windowSize, processedImages: preloadModuleLink }),
    ),
    width.generateAsync({ type: 'blob' }).then((height) => {
      const eventObj = document.createElement('a');
      (eventObj.href = URL.createObjectURL(height)),
      (eventObj.download = 'bibliotheque.zip'),
      document.body.appendChild(eventObj),
      eventObj.click(),
      document.body.removeChild(eventObj),
      console.log('Bibliothèque téléchargée en ZIP');
    });
  }
  /** @function importLibraryFromZip */
  function importLibraryFromZip(width) {
    new JSZip().loadAsync(width).then((eventObj) => {
      eventObj.file('library.json')
        .async('string')
        .then((t) => {
          const a = JSON.parse(t);
          (windowSize = a.savedCurves || []),
          (preloadModuleLink = a.processedImages || []),
          localStorage.setItem('savedCurves', JSON.stringify(windowSize)),
          displayArchiveContainers(),
          updateCurveSelector(),
          console.log('Bibliothèque chargée depuis ZIP');
        });
    });
  }
  function generateGradientTargets() {
    const u = document.createElement('canvas');
    (u.width = 692), (u.height = 580);
    const l = u.getContext('2d');
    (l.fillStyle = '#fff'), l.fillRect(0, 0, 692, 580);
    for (let D = 0; D < 25; D++) {
      const z = D / 24,
        G = Math.round(z * 255),
        c = D % 5,
        v = Math.floor(D / 5),
        L = 10 + c * 112,
        P = 10 + v * 112;
      (l.fillStyle = `rgb(${G},${G},${G})`), l.fillRect(L, P, 112, 112);
    }
    const y = 10 + 560,
      adjustColorValue = 10,
      w = l.createLinearGradient(0, adjustColorValue + 560, 0, adjustColorValue);
    w.addColorStop(0, '#ffffff'),
    w.addColorStop(1, '#000000'),
    (l.fillStyle = w),
    l.fillRect(y, adjustColorValue, 112, 560),
    (l.strokeStyle = '#888888'),
    (l.lineWidth = 2),
    l.strokeRect(10 - 1, 10 - 1, 560 + 112 + 2, 560 + 2);
    const blueValue = u.toDataURL('image/png');
    (document.getElementById('downloadNegativeGradient').href = blueValue),
    (document.getElementById('mireNegativeGradientPreview').src = blueValue),
    document
      .getElementById('mireNegativeGradientPreview')
      .classList.remove('hidden');
    const C = document.createElement('canvas');
    (C.width = 692), (C.height = 580);
    const x = C.getContext('2d');
    (x.fillStyle = '#fff'), x.fillRect(0, 0, 692, 580);
    for (let D = 0; D < 25; D++) {
      const z = D / 24,
        G = 255 - Math.round(z * 255),
        c = D % 5,
        v = Math.floor(D / 5),
        L = 10 + c * 112,
        P = 10 + v * 112;
      (x.fillStyle = `rgb(${G},${G},${G})`), x.fillRect(L, P, 112, 112);
    }
    const I = 10 + 560,
      R = 10,
      A = x.createLinearGradient(0, R + 560, 0, R);
    A.addColorStop(0, '#000000'),
    A.addColorStop(1, '#ffffff'),
    (x.fillStyle = A),
    x.fillRect(I, R, 112, 560),
    (x.strokeStyle = '#888888'),
    (x.lineWidth = 2),
    x.strokeRect(10 - 1, 10 - 1, 560 + 112 + 2, 560 + 2);
    const H = C.toDataURL('image/png');
    (document.getElementById('downloadPositiveGradient').href = H),
    (document.getElementById('mirePositiveGradientPreview').src = H),
    document
      .getElementById('mirePositiveGradientPreview')
      .classList.remove('hidden'),
    console.log('Mires avec dégradé générées avec succès');
  }
  document
    .getElementById('mireFilterSelector')
    .addEventListener('change', function () {
      const width = this.value,
        height = {
          mirePositiveContainer: document.getElementById(
            'mirePositiveContainer',
          ),
          mireNegativeContainer: document.getElementById(
            'mireNegativeContainer',
          ),
          mireBitmapContainer: document.getElementById('mireBitmapContainer'),
          mirePositiveGradientContainer: document.getElementById(
            'mirePositiveGradientContainer',
          ),
          mireNegativeGradientContainer: document.getElementById(
            'mireNegativeGradientContainer',
          ),
        },
        eventObj = {
          positive: ['mirePositiveContainer'],
          negative: ['mireNegativeContainer'],
          bitmap: ['mireBitmapContainer'],
          'positive-gradient': ['mirePositiveGradientContainer'],
          'negative-gradient': ['mireNegativeGradientContainer'],
        };
      if (width) {
        const t = eventObj[width] || [];
        for (let a in height) height[a].style.display = 'none';
        t.forEach((a) => {
          height[a] && (height[a].style.display = 'block');
        }),
        (width === 'positive-gradient' || width === 'negative-gradient') && generateGradientTargets();
      } else for (let t in height) height[t].style.display = 'none';
    }),
  document.getElementById('btnNavHome').addEventListener('click', () => {
    // Redirection vers l'application sociale
    window.location.href = '../social-app/';
  }),
  document.getElementById('btnNavMire').addEventListener('click', () => {
    // Réinitialiser step3 avant de quitter
    window.resetStep3ToInitialState && window.resetStep3ToInitialState();
    activateNavButton('btnNavMire'), renderMireCanvases(), showPanelById('step2'), showSubStepById('subStep1');
  }),
  document.getElementById('btnNavCourbe').addEventListener('click', () => {
    // Réinitialiser step3 avant de quitter
    window.resetStep3ToInitialState && window.resetStep3ToInitialState();
    activateNavButton('btnNavCourbe'),
    resetState(),
    renderMireCanvases(),
    generateMasterMirePro(),
    setTimeout(() => {
      showPanelById('step2'), showSubStepById('subStep2');
    }, 100);
  }),
  document.getElementById('btnNavNegatif').addEventListener('click', () => {
    activateNavButton('btnNavNegatif'), updateCurveSelector(), showPanelById('step3'), hideAllContainers();
  }),
  document.getElementById('btnNavLibrary').addEventListener('click', () => {
    // Réinitialiser step3 avant de quitter
    window.resetStep3ToInitialState && window.resetStep3ToInitialState();
    activateNavButton('btnNavLibrary'), displayArchiveContainers(), showPanelById('libraryPanel');
  }),
  document
    .getElementById('btnDownloadLibraryZip')
    .addEventListener('click', () => {
      exportLibraryAsZip();
    }),
  document
    .getElementById('btnLoadLibraryZip')
    .addEventListener('click', () => {
      document.getElementById('zipInput').click();
    }),
  document.getElementById('zipInput').addEventListener('change', (width) => {
    const height = width.target.files[0];
    height && height.type === 'application/zip'
      ? importLibraryFromZip(height)
      : alert('Veuillez sélectionner un fichier ZIP valide.'),
    (width.target.value = '');
  }),
  document.getElementById('btnClearLibrary').addEventListener('click', () => {
    confirm(
      'Êtes-vous sûr de vouloir effacer toute la bibliothèque ? Cette action est irréversible.',
    ) &&
        (() => {
          // Effacer les courbes sauvegardées
          windowSize = [];
          preloadModuleLink = [];
          localStorage.setItem('savedCurves', JSON.stringify(windowSize));
          
          // Effacer toutes les images de IndexedDB
          if (ge) {
            const transaction = ge.transaction([te], 'readwrite');
            const objectStore = transaction.objectStore(te);
            const clearRequest = objectStore.clear();
            
            clearRequest.onsuccess = function() {
              console.log('Toutes les images supprimées de IndexedDB');
              loadImagesFromIndexedDB();
              displayArchiveContainers();
              updateCurveSelector();
              alert('Bibliothèque effacée avec succès !');
            };
            
            clearRequest.onerror = function(event) {
              console.error('Erreur lors de la suppression des images:', event.target.error);
              // Fallback: effacer quand même les courbes
              displayArchiveContainers();
              updateCurveSelector();
              alert('Courbes effacées, mais erreur lors de la suppression des images.');
            };
          } else {
            // Si IndexedDB n'est pas disponible, effacer quand même les courbes
            displayArchiveContainers();
            updateCurveSelector();
            console.log('Bibliothèque des courbes effacée');
            alert('Courbes effacées avec succès !');
          }
        })();
  });
  function activateNavButton(width) {
    document.querySelectorAll('.bottom-nav button').forEach((height) => {
      height.classList.remove('active');
    }),
    document.getElementById(width).classList.add('active');
  }
  activateNavButton('btnNavHome');
  const at = document.getElementById('optionsToggleBtn'),
    it = document.getElementById('verticalOptionsMenu'),
    rt = document.getElementById('closeOptionsMenu'),
    Se = document.getElementById('optionsMenuOverlay'),
    st = document.querySelector('.main-content-shift'),
    Ne = {
      open: function () {
        it.classList.add('open'),
        Se.classList.add('active'),
        st.classList.add('menu-open');
      },
      close: function () {
        it.classList.remove('open'),
        Se.classList.remove('active'),
        st.classList.remove('menu-open');
      },
    };
  at && at.addEventListener('click', Ne.open),
  rt && rt.addEventListener('click', Ne.close),
  Se && Se.addEventListener('click', Ne.close),
  document
    .querySelectorAll('#verticalOptionsMenu .segment-btn')
    .forEach((width) => {
      width.addEventListener('click', function () {
        const height = this.getAttribute('data-option'),
          eventObj = this.getAttribute('data-value');
        document
          .querySelectorAll(`#verticalOptionsMenu [data-option="${height}"]`)
          .forEach((a) => a.classList.remove('active')),
        this.classList.add('active'),
        typeof window.setCustomizationOption == 'function' &&
              window.setCustomizationOption(height, eventObj);
      });
    });
  const Oe = document.querySelectorAll('.view-toggle');
  console.log('View toggle buttons found:', Oe.length),
  Oe.forEach((width, height) => {
    console.log(
      `Adding event listener to button ${height}:`,
      width.getAttribute('data-view'),
    ),
    width.addEventListener('click', function () {
      const eventObj = this.getAttribute('data-view');
      console.log('View toggle clicked:', eventObj),
      Oe.forEach((s) => s.classList.remove('active')),
      this.classList.add('active');
      const t = document.querySelector('.overlay-container'),
        a = document.querySelector('.histogram-container'),
        index = document.querySelector('.overlay-histogram-container');
      switch (
        (console.log('Containers found:', {
          overlay: !!t,
          histogram: !!a,
          parent: !!index,
        }),
        eventObj)
      ) {
      case 'full':
        index &&
                ((index.style.flexDirection = 'row'),
                (index.style.justifyContent = 'space-between')),
        t && ((t.style.display = 'block'), (t.style.width = '48%')),
        a && ((a.style.display = 'block'), (a.style.width = '48%'));
        break;
      case 'overlay':
        index && (index.style.flexDirection = 'column'),
        t && ((t.style.display = 'block'), (t.style.width = '100%')),
        a && (a.style.display = 'none');
        break;
      case 'histogram':
        index && (index.style.flexDirection = 'column'),
        t && (t.style.display = 'none'),
        a && ((a.style.display = 'block'), (a.style.width = '100%'));
        break;
      }
      (eventObj === 'full' || eventObj === 'histogram') &&
            window.histogramChart &&
            setTimeout(() => {
              window.histogramChart.resize(),
              console.log('Chart resize triggered');
            }, 100);
    });
  });
};
function verifyCurvesLibLoadCheck() {
  return new Promise((calibrationPoints, normalizeInput) => {
    setTimeout(() => {
      try {
        if (!window.CurvesLib)
          throw new Error('CurvesLib n\'est pas défini dans l\'objet window');
        const windowSize = [
            'buildCorrectionTableFromPoints',
            'normalizeSamples',
            'calculateMovingAverage',
            'enforceMonotonicityAndSlope',
            'buildStandardTable',
            'buildCorrectionTablePro',
          ],
          preloadModuleLink = windowSize.filter((imageDataURL) => typeof window.CurvesLib[imageDataURL] != 'function');
        if (preloadModuleLink.length > 0)
          throw new Error(
            `Fonctions manquantes dans CurvesLib: ${preloadModuleLink.join(', ')}`,
          );
        const startPoint = [10, 20, 30, 40, 50],
          endPoint = window.CurvesLib.normalizeSamples(startPoint, 0, 100);
        if (!Array.isArray(endPoint) || endPoint.length !== startPoint.length)
          throw new Error(
            'Test de fonction échoué: normalizeSamples ne fonctionne pas correctement',
          );
        calibrationPoints({
          status: 'success',
          message: 'CurvesLib est correctement chargée et fonctionnelle',
          version: window.CurvesLib.version,
          availableFunctions: windowSize,
          testResult: endPoint,
        });
      } catch (windowSize) {
        normalizeInput({ status: 'error', message: windowSize.message, error: windowSize });
      }
    }, 1e3);
  });
}
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🔍 Vérification du chargement des modules...'),
    console.log('📂 Structure actuelle des fichiers:'),
    console.log('  ├── curves.js (fichier de compatibilité)'),
    console.log('  ├── main.js'),
    console.log('  └── APP/'),
    console.log('      ├── index.js (point d\'entrée principal)'),
    console.log('      ├── utils/'),
    console.log('      │   └── core/ (fonctions utilitaires de base)'),
    console.log('      └── chart/'),
    console.log('          └── pipelines/ (générateurs de courbes)');
    const calibrationPoints = await verifyCurvesLibLoadCheck();
    console.log(
      '%c✅ SUCCÈS: Modules chargés correctement',
      'color: green; font-weight: bold',
    ),
    console.log('📊 Détails:', calibrationPoints);
    // Notification visuelle retirée - modules chargés en silence
  } catch (calibrationPoints) {
    console.error(
      '%c❌ ERREUR: Échec de chargement des modules',
      'color: red; font-weight: bold',
    ),
    console.error('📋 Détails de l\'erreur:', calibrationPoints);
    const normalizeInput = document.createElement('div');
    (normalizeInput.style.position = 'fixed'),
    (normalizeInput.style.top = '50%'),
    (normalizeInput.style.left = '50%'),
    (normalizeInput.style.transform = 'translate(-50%, -50%)'),
    (normalizeInput.style.backgroundColor = '#f44336'),
    (normalizeInput.style.color = 'white'),
    (normalizeInput.style.padding = '20px'),
    (normalizeInput.style.borderRadius = '5px'),
    (normalizeInput.style.zIndex = '9999'),
    (normalizeInput.style.textAlign = 'center'),
    (normalizeInput.innerHTML = `
      <h3>Erreur de chargement des modules JavaScript</h3>
      <p>${calibrationPoints.message || 'Erreur inconnue'}</p>
      <p>Vérifiez la console pour plus de détails (F12)</p>
    `),
    document.body.appendChild(normalizeInput);
  }
});
