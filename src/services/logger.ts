import { TradeResult } from '../types';

export class Logger {
  logTrade(result: TradeResult): void {
    console.log('Trade Logged:', result);
  }
}
