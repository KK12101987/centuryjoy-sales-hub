import React, { useEffect } from 'react';
import { verifyWatermarkIntegrity } from '../utils/integrity';

/**
 * Watermark Component
 * Watermark element is embedded in index.html for zero-latency DOM presence.
 * This component verifies integrity whenever React renders.
 */
export default function Watermark() {
  useEffect(() => {
    verifyWatermarkIntegrity();
  }, []);

  return null;
}
