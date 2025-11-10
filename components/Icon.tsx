import React from 'react';

interface IconProps {
  className?: string;
}

export const ChessKingIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M13 3h-2v2h-1a1 1 0 00-1 1v1H8v2h1v1h-1v2h1v1h-1v2h8v-2h-1v-1h1v-2h-1v-1h1V6h-1V5a1 1 0 00-1-1h-1V3zM7 18h10v2H7v-2z"
      clipRule="evenodd"
    />
  </svg>
);

export const PrintIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
  </svg>
);