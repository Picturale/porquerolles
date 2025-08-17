import React from 'react';

const EchoesLogo = ({ size = 24, color = '#6b7280', className = '' }) => {
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    className: `echoes-logo ${className}`,
    style: { display: 'inline-block' }
  },
  React.createElement('circle', {
    cx: '16',
    cy: '16',
    r: '2',
    fill: color
  }),
  React.createElement('circle', {
    cx: '16',
    cy: '16',
    r: '6',
    stroke: color,
    strokeWidth: '1',
    fill: 'none',
    opacity: '0.6'
  }),
  React.createElement('circle', {
    cx: '16',
    cy: '16',
    r: '10',
    stroke: color,
    strokeWidth: '0.8',
    fill: 'none',
    opacity: '0.4'
  }),
  React.createElement('circle', {
    cx: '16',
    cy: '16',
    r: '14',
    stroke: color,
    strokeWidth: '0.6',
    fill: 'none',
    opacity: '0.2'
  }),
  React.createElement('circle', {
    cx: '12',
    cy: '10',
    r: '0.8',
    fill: color,
    opacity: '0.7'
  }),
  React.createElement('circle', {
    cx: '20',
    cy: '12',
    r: '0.6',
    fill: color,
    opacity: '0.5'
  }),
  React.createElement('circle', {
    cx: '22',
    cy: '20',
    r: '0.7',
    fill: color,
    opacity: '0.6'
  }),
  React.createElement('circle', {
    cx: '10',
    cy: '22',
    r: '0.5',
    fill: color,
    opacity: '0.4'
  })
  );
};

export default EchoesLogo;
