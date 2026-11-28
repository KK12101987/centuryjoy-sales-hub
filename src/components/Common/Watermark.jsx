import React, { useEffect } from 'react';
import { WATERMARK_ID, WATERMARK_TEXT, verifyWatermarkIntegrity } from '../../utils/integrity';

export default function Watermark() {
  useEffect(() => {
    // Initial verification on mount
    verifyWatermarkIntegrity();
  }, []);

  return (
    <div className="flex items-center justify-center my-1 sm:my-0">
      <div 
        id={WATERMARK_ID}
        className="opacity-10 hover:opacity-100 transition-opacity duration-300 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-slate-900/95 dark:bg-slate-900/95 text-slate-300 dark:text-slate-300 border border-slate-700/60 shadow-lg backdrop-blur-md cursor-default select-none transition-all hover:border-brand-500/50"
        style={{ userSelect: 'none' }}
      >
        {WATERMARK_TEXT}
      </div>
    </div>
  );
}
