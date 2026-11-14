'use client';

import React from 'react';
import { RouletteEngineTool } from './RouletteEngineTool';

export interface ApiRouletteToolProps {
  apiEndpoint?: string;
  onPredictionChange?: (data: any) => void;
  onMinimize?: () => void;
}

/**
 * Legacy API tool adapter.
 *
 * The original component contained a simulated prediction generator. It has
 * been replaced by the real native engine so no synthetic pockets or fake
 * confidence values can reach the UI. The `apiEndpoint` prop is retained for
 * backwards compatibility; all network access now goes through the secure
 * backend Dealer Signature proxy.
 */
export function ApiRouletteTool(_props: ApiRouletteToolProps) {
  return <RouletteEngineTool compact={true} />;
}
