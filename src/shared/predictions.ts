export enum StrategyType {
  OFFSET = 'OFFSET',
  TARGET = 'TARGET',
  DEALER_SIGNATURE = 'DEALER_SIGNATURE'
}

export interface RouletteTable {
  id: string;
  name: string;
  provider: 'Evolution Gaming' | 'Pragmatic Play';
  thumbnailUrl: string;
  isLive: boolean;
  recentNumbers: number[];
  activeStrategy: StrategyType;
  lastUpdated: string;
}

export interface OffsetPrediction {
  predictedNumbers: { number: number; neighbours: number }[];
  calculationMethod: string;
  confirmedSpins: number;
  distance: number;
  hitRate: number;
  isRecommended: boolean;
}

export interface TargetPrediction {
  predictedNumbers: { number: number; neighbours: number }[];
  patternSequence: ('W' | 'L')[];
  streakCount: number;
  momentum: 'HOT' | 'STABLE' | 'WEAKENING';
  isExitSignal: boolean;
}

export interface DealerSignaturePrediction {
  predictedNumbers: { number: number; neighbours: number }[];
  travelLinePosition: 'OVER' | 'UNDER' | 'NEUTRAL';
  travelDistance: 'SMALL' | 'BIG' | 'IRREGULAR';
  topNumbers: { number: number; neighbours: number }[];
  phaseConsistency: number;
}

export interface TableAnalysisResponse {
  tableId: string;
  tableName: string;
  provider: string;
  recentNumbers: number[];
  offsetStrategy?: OffsetPrediction;
  targetStrategy?: TargetPrediction;
  dealerSignature?: DealerSignaturePrediction;
  isLocked: boolean;
}
