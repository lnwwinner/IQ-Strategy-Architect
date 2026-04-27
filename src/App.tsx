/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { LineChart, BarChart3, Settings, Play, StopCircle } from 'lucide-react';
import { DataEngine } from './services/dataEngine';
import { DecisionEngine } from './services/decisionEngine';
import { ExecutionEngine } from './services/executionEngine';
import { RiskManagement } from './services/riskManagement';
import { Logger } from './services/logger';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [stats, setStats] = useState({ profit: 0, winRate: 0, trades: 0, wins: 0 });
  const [pendingTrade, setPendingTrade] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetch('/api/trades').then(res => res.json()).then(setTrades);
  }, []);

  useEffect(() => {
    if (isRunning) {
      const dataEngine = new DataEngine();
      const decisionEngine = new DecisionEngine();
      const priceHistory: number[] = [50, 52, 48, 51, 49, 50, 53, 47];

      intervalRef.current = setInterval(async () => {
        const data = await dataEngine.fetchMarketData('EURUSD');
        priceHistory.push(data.price);
        if (priceHistory.length > 20) priceHistory.shift();

        const signal = decisionEngine.generateSignal(priceHistory);
        if (signal) {
          // Ask for confirmation
          setPendingTrade({
            asset: data.asset,
            direction: signal.direction,
            amount: 50, // Static for now
            price: data.price
          });
          clearInterval(intervalRef.current); // Pause until confirmed
        }
      }, 2000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const confirmTrade = async () => {
    const executionEngine = new ExecutionEngine();
    const logger = new Logger();
    const success = await executionEngine.executeTrade(pendingTrade.asset, pendingTrade.direction, pendingTrade.amount);
    
    const profit = success ? pendingTrade.amount * 0.8 : -pendingTrade.amount;
    
    setBalance(prev => prev + profit);
    setStats(prev => ({
      profit: prev.profit + profit,
      trades: prev.trades + 1,
      wins: success ? prev.wins + 1 : prev.wins,
      winRate: success ? (prev.wins + 1) / (prev.trades + 1) * 100 : prev.wins / (prev.trades + 1) * 100
    }));

    logger.logTrade({
      timestamp: new Date().toISOString(),
      asset: pendingTrade.asset,
      direction: pendingTrade.direction,
      entryPrice: pendingTrade.price,
      exitPrice: pendingTrade.price,
      result: success ? 'WIN' : 'LOSS',
      profit
    });
    setPendingTrade(null);
    setIsRunning(true); // Restart engine
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold font-sans">IQ Strategy Architect</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isRunning ? <StopCircle size={20} /> : <Play size={20} />}
            {isRunning ? 'Stop System' : 'Start System'}
          </button>
        </div>
      </header>

      {pendingTrade && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Trade</h2>
            <p className="mb-6">Execute {pendingTrade.direction} for {pendingTrade.asset} at ${pendingTrade.price.toFixed(2)}?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setPendingTrade(null)} className="px-4 py-2 bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={confirmTrade} className="px-4 py-2 bg-blue-600 rounded-lg font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <LineChart className="text-blue-500" />
            <h2 className="font-semibold">Profit/Loss</h2>
          </div>
          <p className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>${stats.profit.toFixed(2)}</p>
        </motion.div>

        <motion.div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-green-500" />
            <h2 className="font-semibold">Win Rate</h2>
          </div>
          <p className="text-3xl font-bold">{stats.winRate.toFixed(2)}%</p>
        </motion.div>

        <motion.div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-yellow-500" />
            <h2 className="font-semibold">Balance</h2>
          </div>
          <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
        </motion.div>
      </div>
      
      <div className="mt-8 bg-gray-900 border border-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Past Trades</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Asset</th>
              <th className="p-3">Direction</th>
              <th className="p-3">Result</th>
              <th className="p-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td className="p-3">{trade.timestamp}</td>
                <td className="p-3">{trade.asset}</td>
                <td className="p-3">{trade.direction}</td>
                <td className={`p-3 ${trade.result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>{trade.result}</td>
                <td className="p-3">${trade.profit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
