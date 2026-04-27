export class RiskManagement {
  calculatePositionSize(balance: number, riskPerTrade: number): number {
    return balance * riskPerTrade;
  }
}
