// Minimal canvas stub for jsdom
beforeAll(() => {
  const origCreateElement = document.createElement.bind(document);
  document.createElement = function (tagName, options) {
    const el = origCreateElement(tagName, options);
    if (String(tagName).toLowerCase() === 'canvas') {
  el.getContext = (_type) => ({
        canvas: el,
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
      });
    }
    return el;
  };
});

// Test example pour l'utilitaire de design tokens
describe('Design Tokens', () => {
  it('should define valid CSS custom properties', () => {
    const mockCSSVariables = {
      '--primary-color': '#007bff',
      '--secondary-color': '#6c757d',
      '--success-color': '#28a745',
      '--danger-color': '#dc3545',
    };

    Object.keys(mockCSSVariables).forEach((variable) => {
      expect(variable).toMatch(/^--[\w-]+$/);
      expect(mockCSSVariables[variable]).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});

// Test example pour les utilitaires Canvas
describe('Canvas Utilities', () => {
  it('should create canvas context', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(ctx).toBeTruthy();
  });

  it('should handle canvas dimensions', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });
});

// Test example pour les variables d'environnement
describe('Environment Variables', () => {
  it('should have required environment variables in test mode', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
