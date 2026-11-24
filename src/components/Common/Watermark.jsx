import React, { useEffect } from 'react';
import { verifyWatermarkIntegrity } from '../../utils/integrity';

export default function Watermark() {
  useEffect(() => {
    verifyWatermarkIntegrity();
  }, []);

  return null;
}
