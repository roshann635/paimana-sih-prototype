import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, AlertTriangle, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { paimanaApi } from '../../services/api/paimanaApi';

export default function WhatIfSimulator({ projectId, baselineSnapshot = {}, baselinePrediction = {} }) {
  const [progressDelta, setProgressDelta] = useState(0);
  const [expMultiplier, setExpMultiplier] = useState(1.0);
  const [delayDelta, setDelayDelta] = useState(0);

  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await paimanaApi.simulateProjectScenario(projectId, {
        progress_delta_pct: Number(progressDelta),
        expenditure_multiplier: Number(expMultiplier),
        delay_delta_days: Number(delayDelta)
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProgressDelta(0);
    setExpMultiplier(1.0);
    setDelayDelta(0);
    setSimulationResult(null);
  };

  const baseScore = baselinePrediction?.composite_risk_score || 75.0;
  const simScore = simulationResult ? simulationResult.simulation?.composite_risk_score : baseScore;
  const deltaScore = simulationResult ? simulationResult.simulation?.delta_risk_score : 0;

  return (
    <div className="bg-[#0D1E30] border border-[#16324A] rounded-xl p-5 shadow-command-card space-y-5 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#16324A]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shadow-gold-glow">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                What-If Risk Scenario Simulator
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                Decision Differentiator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Simulate progress slowdowns, expenditure acceleration, and milestone delays to observe real-time risk shifts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-[#07131F] border border-[#16324A] hover:bg-[#11263C] text-slate-300 text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#07131F] text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-gold-glow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Simulating...' : 'Run Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls & Scenario Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sliders Column */}
        <div className="lg:col-span-2 space-y-4 p-4 bg-[#07131F] rounded-lg border border-[#16324A]">
          {/* Slider 1: Physical Progress Delta */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">Physical Progress Adjustment:</span>
              <strong className={`font-bold ${progressDelta < 0 ? 'text-[#EF4444]' : progressDelta > 0 ? 'text-[#10B981]' : 'text-white'}`}>
                {progressDelta > 0 ? `+${progressDelta}%` : `${progressDelta}%`}
              </strong>
            </div>
            <input
              type="range"
              min="-25"
              max="20"
              step="1"
              value={progressDelta}
              onChange={(e) => setProgressDelta(Number(e.target.value))}
              className="w-full h-1.5 bg-[#11263C] rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-25% (Stagnation)</span>
              <span>Baseline (0%)</span>
              <span>+20% (Acceleration)</span>
            </div>
          </div>

          {/* Slider 2: Expenditure Acceleration */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">Expenditure Burn Multiplier:</span>
              <strong className={`font-bold ${expMultiplier > 1.0 ? 'text-[#EF4444]' : expMultiplier < 1.0 ? 'text-[#10B981]' : 'text-white'}`}>
                {expMultiplier.toFixed(2)}x ({expMultiplier > 1.0 ? `+${Math.round((expMultiplier - 1)*100)}% capex` : expMultiplier < 1.0 ? `${Math.round((expMultiplier - 1)*100)}% capex` : 'Nominal'})
              </strong>
            </div>
            <input
              type="range"
              min="0.80"
              max="1.50"
              step="0.05"
              value={expMultiplier}
              onChange={(e) => setExpMultiplier(Number(e.target.value))}
              className="w-full h-1.5 bg-[#11263C] rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.80x (Constrained)</span>
              <span>1.00x (Baseline)</span>
              <span>1.50x (+50% Front-loading)</span>
            </div>
          </div>

          {/* Slider 3: Milestone Delay Delta */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">Additional Schedule Delay:</span>
              <strong className={`font-bold ${delayDelta > 0 ? 'text-[#EF4444]' : 'text-white'}`}>
                {delayDelta > 0 ? `+${delayDelta} days` : '0 days (No added delay)'}
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="15"
              value={delayDelta}
              onChange={(e) => setDelayDelta(Number(e.target.value))}
              className="w-full h-1.5 bg-[#11263C] rounded-lg appearance-none cursor-pointer accent-[#EF4444]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 Days</span>
              <span>+90 Days</span>
              <span>+180 Days (6 Months)</span>
            </div>
          </div>
        </div>

        {/* Live Scenario Impact Card */}
        <div className="p-4 bg-[#07131F] rounded-lg border border-[#16324A] flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Projected Risk Score Shift
            </div>
            
            <div className="flex items-baseline gap-3 my-2">
              <div className="text-3xl font-extrabold font-mono text-white">
                {simScore.toFixed(1)}
              </div>
              <div className="text-xs font-mono text-slate-400">/ 100</div>

              {deltaScore !== 0 && (
                <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  deltaScore > 0 ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40' : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                }`}>
                  {deltaScore > 0 ? `+${deltaScore.toFixed(1)} pts` : `${deltaScore.toFixed(1)} pts`}
                </div>
              )}
            </div>

            {/* Baseline vs Scenario EVM Comparison */}
            <div className="space-y-2 pt-2 border-t border-[#16324A] text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline Score:</span>
                <span className="text-white font-bold">{baseScore.toFixed(1)}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Simulated SPI:</span>
                <span className={`font-bold ${simulationResult?.simulation?.spi < 0.85 ? 'text-[#EF4444]' : 'text-[#00E5FF]'}`}>
                  {simulationResult ? simulationResult.simulation?.spi?.toFixed(2) : (baselineSnapshot.spi || 1.0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Simulated CPI:</span>
                <span className={`font-bold ${simulationResult?.simulation?.cpi < 0.90 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                  {simulationResult ? simulationResult.simulation?.cpi?.toFixed(2) : (baselineSnapshot.cpi || 1.0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-[#0D1E30] rounded border border-[#16324A] text-[11px] text-slate-300 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
            <span>
              {deltaScore > 10
                ? 'High Risk Surge: Simultaneous progress slowdown and capex burn pushes project into urgent escalation.'
                : deltaScore < -5
                ? 'Risk Mitigation: Accelerated physical progress restores earned value alignment.'
                : 'Interactive scenario testing runs instantly on calibrated XGBoost inference.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
