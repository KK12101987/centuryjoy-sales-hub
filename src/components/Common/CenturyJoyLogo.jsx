import React from 'react';

/**
 * CenturyJoyLogo Component
 * Renders the authentic Century Joy brand emblem and typography.
 * Automatically adapts its background container and typography contrast 
 * according to the currently active application theme (Light vs Dark).
 *
 * @param {'xs' | 'sm' | 'md' | 'hero' | 'lg' | 'xl'} size - Scale of the logo
 * @param {boolean} showBadge - Whether to enclose inside theme-adaptive container badge
 * @param {string} className - Additional CSS classes for image
 * @param {string} badgeClassName - Additional CSS classes for badge container
 * @param {boolean} interactive - Enables hover transitions and cursor pointer
 * @param {Function} onClick - Optional click handler
 */
export default function CenturyJoyLogo({
  size = 'hero',
  showBadge = true,
  className = '',
  badgeClassName = '',
  interactive = true,
  onClick,
}) {
  const sizeMap = {
    xs: { h: 'h-8', imgH: 'h-6' },
    sm: { h: 'h-10', imgH: 'h-8 sm:h-8.5' },
    md: { h: 'h-11 sm:h-12', imgH: 'h-9 sm:h-9.5' },
    hero: { h: 'h-11 sm:h-12', imgH: 'h-9 sm:h-9.5' },
    lg: { h: 'h-16 sm:h-18', imgH: 'h-13 sm:h-15' },
    xl: { h: 'h-24 sm:h-28', imgH: 'h-20 sm:h-24' },
  };

  const currentSize = sizeMap[size] || sizeMap.hero;

  const content = (
    <div className={`relative flex items-center justify-center ${currentSize.imgH} shrink-0`}>
      {/* Light Mode Logo (Red Emblem, Red CENTURY, Black Joy) */}
      <img
        src="/century-joy-logo-light.png"
        alt="Century Joy"
        className={`h-full w-auto object-contain dark:hidden select-none drop-shadow-2xs ${className}`}
        loading="eager"
      />
      {/* Dark Mode Logo (Red Emblem, Red CENTURY, Crisp White Joy) */}
      <img
        src="/century-joy-logo-dark.png"
        alt="Century Joy"
        className={`h-full w-auto object-contain hidden dark:block select-none drop-shadow-2xs ${className}`}
        loading="eager"
      />
    </div>
  );

  if (!showBadge) {
    return content;
  }

  // Theme-adaptive background container badge:
  // Light Mode: Subtle white frosted card with slate border and soft elevation
  // Dark Mode: Slate 900/90 dark card with slate 800 border and subtle inner shadow
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center px-2.5 sm:px-3 py-1 rounded-xl transition-all duration-200 shrink-0 ${
        currentSize.h
      } ${
        interactive ? 'cursor-pointer hover:shadow-sm hover:border-red-400/50 dark:hover:border-red-500/50 hover:scale-[1.02]' : ''
      } bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs ${badgeClassName}`}
      title="Century Joy Enterprise System"
    >
      {content}
    </div>
  );
}
