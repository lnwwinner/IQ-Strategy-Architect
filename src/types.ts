export enum TradeDirection {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface TradeResult {
  timestamp: string;
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  result: 'WIN' | 'LOSS' | 'DRAW';
  profit: number;
}

export interface MarketData {
  asset: string;
  price: number;
  timestamp: number;
}
