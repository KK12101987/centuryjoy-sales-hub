import React from 'react';
import { WATERMARK_TEXT, WATERMARK_ID } from '../utils/integrity';

/**
 * Watermark Component adhering strictly to Rule 19:
 * - Exact text required: "Crafted with ❤️ and Antigravity by KUSHAL KAR"
 * - Inactive opacity: 0 (invisible by default)
 * - Hover opacity: 1 (visible only when hovered)
 * - Monitored by continuous integrity watcher
 */
export default function Watermark() {
  return (
    <div
      className="fixed bottom-3 right-4 z-50 pointer-events-auto"
      style={{ userSelect: 'none' }}
    >
      <div
        id={WATERMARK_ID}
        className="px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-slate-900/90 text-slate-300 border border-slate-700/60 shadow-xl backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-default"
      >
        {WATERMARK_TEXT}
      </div>
    </div>
  );
}
