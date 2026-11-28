import React from 'react';

/**
 * CenturyJoyLogo Component
 * Renders the authentic Century Joy brand emblem and typography.
 * Automatically adapts its background container and typography contrast 
 * according to the currently active application theme (Light vs Dark).
 *
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} size - Scale of the logo
 * @param {boolean} showBadge - Whether to enclose inside theme-adaptive container badge
 * @param {string} className - Additional CSS classes for image
 * @param {string} badgeClassName - Additional CSS classes for badge container
 * @param {boolean} interactive - Enables hover transitions and cursor pointer
 * @param {Function} onClick - Optional click handler
 */
export default function CenturyJoyLogo({
  size = 'sm',
  showBadge = true,
  className = '',
  badgeClassName = '',
  interactive = true,
  onClick,
}) {
  const sizeMap = {
    xs: { h: 'h-8', imgH: 'h-6' },
    sm: { h: 'h-10', imgH: 'h-8 sm:h-8.5' },
    md: { h: 'h-12', imgH: 'h-10' },
    lg: { h: 'h-16', imgH: 'h-13 sm:h-14' },
    xl: { h: 'h-20', imgH: 'h-16 sm:h-18' },
  };

  const currentSize = sizeMap[size] || sizeMap.sm;

  const content = (
    <div className={`relative flex items-center justify-center ${currentSize.imgH} shrink-0`}>
      {/* Light Mode Logo (Red Emblem, Red CENTURY, Black Joy) */}
      <img
        src="/century-joy-logo-light.png"
        alt="Century Joy"
        className={`h-full w-auto object-contain dark:hidden select-none ${className}`}
        loading="eager"
      />
      {/* Dark Mode Logo (Red Emblem, Red CENTURY, Crisp White Joy) */}
      <img
        src="/century-joy-logo-dark.png"
        alt="Century Joy"
        className={`h-full w-auto object-contain hidden dark:block select-none ${className}`}
        loading="eager"
      />
    </div>
  );

  if (!showBadge) {
    return content;
  }

  // Theme-adaptive background container badge:
  // Light Mode: Subtle white frosted card with slate border
  // Dark Mode: Slate 900/90 dark card with slate 800 border and subtle inner shadow
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center px-2 py-1 rounded-xl transition-all duration-200 shrink-0 ${
        currentSize.h
      } ${
        interactive ? 'cursor-pointer hover:shadow-xs hover:border-red-400/40 dark:hover:border-red-500/40' : ''
      } bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs ${badgeClassName}`}
      title="Century Joy Enterprise System"
    >
      {content}
    </div>
  );
}
