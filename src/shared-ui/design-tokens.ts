/**
 * Design Tokens - Vision Picturale
 * Tokens de design partagés entre core-app et social-app
 */

export const designTokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    canvas: {
      background: '#f8f9fa',
      grid: '#e9ecef',
      cursor: '#007bff',
      selection: 'rgba(0, 123, 255, 0.25)',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Monaco', 'Menlo', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  }
};

// CSS Custom Properties Generator
export function generateCSSVariables(tokens = designTokens) {
  let css = ':root {\n';
  
  // Colors
  Object.entries(tokens.colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([shade, color]) => {
        css += `  --color-${category}-${shade}: ${color};\n`;
      });
    } else {
      css += `  --color-${category}: ${values};\n`;
    }
  });
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([size, value]) => {
    css += `  --spacing-${size}: ${value};\n`;
  });
  
  // Typography
  Object.entries(tokens.typography.fontSize).forEach(([size, value]) => {
    css += `  --font-size-${size}: ${value};\n`;
  });
  
  // Shadows
  Object.entries(tokens.shadows).forEach(([size, value]) => {
    css += `  --shadow-${size}: ${value};\n`;
  });
  
  // Border Radius
  Object.entries(tokens.borderRadius).forEach(([size, value]) => {
    css += `  --radius-${size}: ${value};\n`;
  });
  
  css += '}\n';
  return css;
}
