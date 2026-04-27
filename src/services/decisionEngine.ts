import { AnalysisEngine } from './analysisEngine';
import { TradeDirection } from '../types';

export class DecisionEngine {
  private analysisEngine: AnalysisEngine;

  constructor() {
    this.analysisEngine = new AnalysisEngine();
  }

  generateSignal(prices: number[]): { direction: TradeDirection; confidence: number } | null {
    const rsi = this.analysisEngine.calculateRSI(prices);
    
    if (rsi < 30) return { direction: TradeDirection.BUY, confidence: 0.8 };
    if (rsi > 70) return { direction: TradeDirection.SELL, confidence: 0.8 };
    
    return null;
  }
}
