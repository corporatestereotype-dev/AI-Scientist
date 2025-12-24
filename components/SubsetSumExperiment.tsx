
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PCA } from 'ml-pca';
import { generateStressTestAnalysis, StressTestResult } from '../services/geminiService';
import { SimpleMarkdown } from './GeminiAnalysis';
import { useSettings } from '../contexts/SettingsContext';
import { Instability } from '../types';

interface ExperimentProps {
    instability?: Instability;
}

// --- MATH HELPERS ---
const vec = {
  dot: (a: number[], b: number[]) => a.reduce((sum, val, i) => sum + val * b[i], 0),
  sum: (a: number[]) => a.reduce((sum, val) => sum + val, 0),
  scale: (a: number[], s: number) => a.map(v => v * s),
  add: (a: number[], b: number[]) => a.map((v, i) => v + b[i]),
  sub: (a: number[], b: number[]) => a.map((v, i) => v - b[i]),
  abs: (a: number[]) => a.map(Math.abs),
  clone: (a: number[]) => [...a],
};

// Renamed from f0z_stabilize to standard regularization term
const smooth_abs_gradient = (x: number, epsilon: number = 1e-8): number => {
    // Huber-like smoothing near zero
    if (Math.abs(x) < epsilon) {
        return Math.sign(x) * epsilon || epsilon;
    }
    return x;
};

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

const generateProblemInstance = (n: number, range: number = 20): number[] => {
    const subset: number[] = [];
    for (let i = 0; i < n - 1; i++) {
        subset.push(Math.floor(Math.random() * range * 2) - range);
    }
    const k = Math.floor(n / 2);
    const indices = new Set<number>();
    while(indices.size < k) indices.add(Math.floor(Math.random() * (n-1)));
    const partialSum = Array.from(indices).reduce((acc, idx) => acc + subset[idx], 0);
    subset.push(-partialSum);
    for (let i = subset.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [subset[i], subset[j]] = [subset[j], subset[i]];
    }
    return subset;
};

// ... Chart Components (SvgChart, TrajectoryChart, CostChart) remain the same ...
// Copied from previous version for brevity as they depend on math helpers
const SvgChart: React.FC<{children: React.ReactNode, title: string}> = ({ children, title }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-64 md:h-80 flex flex-col relative overflow-hidden group">
        <h4 className="font-semibold text-slate-300 text-sm mb-2 text-center z-10 relative">{title}</h4>
        <svg width="100%" height="100%" className="flex-grow z-10 relative">
            {children}
        </svg>
    </div>
);

const TrajectoryChart: React.FC<{ data: number[][], tunnelingIndices: number[] }> = ({ data, tunnelingIndices }) => {
    const chartContent = useMemo(() => {
        if (data.length < 2) return <text x="50%" y="50%" fill="gray" textAnchor="middle">Waiting for data...</text>;
        try {
            const pca = new PCA(data);
            const proj = pca.predict(data).to2DArray();
            const xCoords = proj.map(p => p[0]);
            const yCoords = proj.map(p => p[1]);
            const minX = Math.min(...xCoords);
            const maxX = Math.max(...xCoords);
            const minY = Math.min(...yCoords);
            const maxY = Math.max(...yCoords);
            const rangeX = (maxX - minX) || 1;
            const rangeY = (maxY - minY) || 1;
            const points = proj.map(([x, y]) => ({
                x: ((x - minX) / rangeX) * 90 + 5,
                y: 95 - (((y - minY) / rangeY) * 90),
            }));
            return (
                <>
                    <rect width="100%" height="100%" fill="#0f172a" fillOpacity="0.5" />
                    {points.map((p, i) => {
                        if (i === points.length - 1) return null;
                        const next = points[i+1];
                        return <line key={i} x1={`${p.x}%`} y1={`${p.y}%`} x2={`${next.x}%`} y2={`${next.y}%`} stroke="#06b6d4" strokeWidth="1" opacity="0.6" />;
                    })}
                     <circle cx={`${points[0].x}%`} cy={`${points[0].y}%`} r="3" fill="#10B981" />
                    <circle cx={`${points[points.length-1].x}%`} cy={`${points[points.length-1].y}%`} r="3" fill="#F43F5E" />
                </>
            );
        } catch (e) { return null; }
    }, [data, tunnelingIndices]);
    return <SvgChart title="Optimization Landscape (PCA)">{chartContent}</SvgChart>;
};

const CostChart: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length < 2) return <SvgChart title="Energy Landscape"><text x="50%" y="50%" fill="gray" textAnchor="middle">Waiting...</text></SvgChart>;
    const maxCost = Math.max(...data);
    const points = data.map((cost, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (cost / maxCost) * 95,
    }));
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return (
         <SvgChart title="Energy Landscape Descent">
            <path d={pathData} stroke="#06b6d4" strokeWidth="2" fill="none" />
        </SvgChart>
    );
};

const SubsetSumExperiment: React.FC<ExperimentProps> = ({ instability }) => {
    const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
    const [isRunning, setIsRunning] = useState(false);
    const [log, setLog] = useState<string[]>(['Ready to optimize.']);
    const [trajectory, setTrajectory] = useState<number[][]>([]);
    const [costHistory, setCostHistory] = useState<number[]>([]);
    const [tunnelingEvents, setTunnelingEvents] = useState<number[]>([]);
    const [finalResult, setFinalResult] = useState<{ subset: number[], sum: number, cost: number} | null>(null);
    const [analysisResult, setAnalysisResult] = useState<StressTestResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [mode, setMode] = useState<'Standard' | 'Critical'>('Standard');
    
    const logRef = useRef<HTMLDivElement>(null);
    const isCancelledRef = useRef(false);

    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);
    useEffect(() => { return () => { isCancelledRef.current = true; }; }, []);
    
    const runSimulation = async (selectedMode: 'Standard' | 'Critical') => {
        setIsRunning(true);
        setMode(selectedMode);
        isCancelledRef.current = false;
        setTrajectory([]);
        setCostHistory([]);
        setTunnelingEvents([]);
        setFinalResult(null);
        setAnalysisResult(null);

        const isCritical = selectedMode === 'Critical';
        setLog([`--- Starting ${isCritical ? 'CRITICAL STRESS TEST' : 'Standard'} Relaxation ---`]);

        try {
            const S = isCritical ? generateProblemInstance(40, 50) : [-7, -3, -2, 5, 8];
            const n = S.length;
            
            const alpha = 0.5;
            const initial_lr = 0.02;
            const steps = isCritical ? 8000 : 5000;
            const epsilons = { sum: 1e-6, penalty: 1e-6, grad: 1e-8 };

            let x = Array.from({ length: n }, () => Math.random());
            let velocity = Array(n).fill(0);
            let tempTrajectory: number[][] = [];
            let tempCostHistory: number[] = [];

            const updateInterval = isCritical ? 400 : 100;

            for (let i = 0; i < steps; i++) {
                if (isCancelledRef.current) return;
                const frac = i / Math.max(1, steps);
                const current_lr = clamp(1e-6 + 0.5 * (initial_lr - 1e-6) * (1 + Math.cos(Math.PI * frac)), 1e-6, initial_lr);

                const subset_sum = vec.dot(x, S);
                // Use Standard Regularization instead of FØZ
                const stabilized_cost_sum = smooth_abs_gradient(Math.abs(subset_sum), epsilons.sum);
                const discreteness_penalty = vec.sum(x.map(xi => xi * (1 - xi)));
                const cost = stabilized_cost_sum + alpha * discreteness_penalty;

                // Gradients
                const grad_sum_part = vec.scale(S, Math.sign(subset_sum));
                const grad_disc_part = x.map(xi => alpha * (1 - 2 * xi));
                const grad = vec.add(grad_sum_part, grad_disc_part);
                
                // Momentum
                const v_prev = vec.clone(velocity);
                velocity = vec.sub(vec.scale(velocity, 0.9), vec.scale(grad, current_lr));
                x = vec.add(x, vec.add(vec.scale(v_prev, -0.9), vec.scale(velocity, 1.9)));
                x = x.map(xi => clamp(xi, 0, 1));
                
                if ((i + 1) % updateInterval === 0) {
                    tempTrajectory = [...tempTrajectory, x];
                    tempCostHistory = [...tempCostHistory, cost];
                    if ((i + 1) % (steps / 5) === 0) {
                        setLog(prev => [...prev, `Step ${i+1}/${steps} | Cost=${cost.toFixed(6)}`]);
                    }
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
            
            setLog(prev => [...prev, '--- Optimization Finished ---']);
            setTrajectory(tempTrajectory);
            setCostHistory(tempCostHistory);
            
            const final_solution_vector = x.map(xi => Math.round(xi));
            const solution_subset = S.filter((s, i) => final_solution_vector[i] === 1);
            const solution_sum = vec.sum(solution_subset);
            const final_cost = tempCostHistory[tempCostHistory.length-1];

            setLog(prev => [...prev, `Final Sum: ${solution_sum}`]);
            setFinalResult({ subset: solution_subset, sum: solution_sum, cost: final_cost });
            setIsRunning(false);

            setIsGenerating(true);
            const analysisData = await generateStressTestAnalysis('SubsetSum', { finalCost: final_cost, solutionSum: solution_sum, status: final_cost < 0.1 ? "Converged" : "Failed" }, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel }, { difficulty: selectedMode });
            if (!isCancelledRef.current) setAnalysisResult(analysisData);
            setIsGenerating(false);

        } catch (e) { console.error(e); setIsRunning(false); }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-1 text-cyan-400">Experiment CS-002</h2>
            <p className="text-xl text-slate-300 mb-4">Continuous Relaxation of Subset Sum</p>
            <p className="text-slate-400 mb-6">Standard "Relaxation" technique: Mapping a discrete NP-hard problem into a continuous energy landscape to apply Gradient Descent.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <TrajectoryChart data={trajectory} tunnelingIndices={tunnelingEvents} />
                <CostChart data={costHistory} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Optimization Controls</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex gap-3 mb-4">
                            <button onClick={() => runSimulation('Standard')} disabled={isRunning} className="flex-1 bg-cyan-600 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">Standard Run</button>
                            <button onClick={() => runSimulation('Critical')} disabled={isRunning} className="flex-1 bg-rose-600 text-white font-semibold py-2.5 rounded-lg hover:bg-rose-500 disabled:bg-slate-600">Critical Stress Test</button>
                        </div>
                        <div ref={logRef} className="h-60 bg-slate-950 rounded-md p-3 font-mono text-xs text-slate-400 overflow-y-auto border border-slate-800">{log.map((line, i) => <p key={i}>{line}</p>)}</div>
                    </div>
                </div>
                 <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Scientific Analysis</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex-grow relative overflow-hidden">
                        {!analysisResult && !isGenerating && <div className="text-center text-slate-500 mt-10">Run experiment to analyze robustness.</div>}
                        {isGenerating && <div className="text-center text-cyan-400 mt-10 animate-pulse">Analyzing Convergence...</div>}
                        {analysisResult && (
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-slate-700 pb-2">
                                    <span className="font-bold text-slate-300">Confidence</span>
                                    <span className="text-cyan-400 font-mono">{analysisResult.falsifiability.confidence_score}%</span>
                                </div>
                                <SimpleMarkdown text={analysisResult.analysis} />
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};
export default SubsetSumExperiment;
