
import React, { useState, useEffect, useRef } from 'react';
import { generateExperimentHypothesis } from '../services/geminiService';
import { SimpleMarkdown } from './GeminiAnalysis';
import Slider from './ui/Slider';
import { useSettings } from '../contexts/SettingsContext';

const fib = (n: number): number => {
    let a = 0, b = 1;
    for (let i = 0; i < n; i++) {
        [a, b] = [b, a + b];
    }
    return a;
};

const FFZClockExperiment: React.FC = () => {
    const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
    const [isRunning, setIsRunning] = useState(false);
    const [fibIndex, setFibIndex] = useState(5);
    const [step, setStep] = useState(0);
    const [hypothesis, setHypothesis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const a = fib(fibIndex);
    const b = fib(fibIndex + 1);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const isCancelledRef = useRef(false);

    const [clockA, setClockA] = useState(0);
    const [clockB, setClockB] = useState(0);
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
        setStep(0);
        setClockA(0);
        setClockB(0);
        setIsSynced(true);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        setIsRunning(false);
    }, [fibIndex]);

    const runSimulation = () => {
        isCancelledRef.current = false;
        setIsRunning(true);
        setHypothesis('');
        let currentStep = 0;
        const period = a * b;

        const animate = () => {
            if (isCancelledRef.current) return;
            if (currentStep > period + 5) {
                 setIsRunning(false);
                 generateHypothesis();
                 return;
            }

            const nextStep = currentStep + 1;
            setClockA(nextStep % a);
            setClockB(nextStep % b);
            setStep(nextStep);
            setIsSynced(nextStep % a === 0 && nextStep % b === 0);

            currentStep = nextStep;
            animationFrameId.current = requestAnimationFrame(animate);
        };
        animate();
    };

    const generateHypothesis = async () => {
        setIsGenerating(true);
        const promptResult = { fibIndex, a, b, recurrencePeriod: a * b };
        try {
            const analysis = await generateExperimentHypothesis('QuasiperiodicSync' as any, promptResult, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
            if (!isCancelledRef.current) setHypothesis(analysis);
        } catch (e) { console.error(e); }
        finally { if (!isCancelledRef.current) setIsGenerating(false); }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-1 text-cyan-400">Experiment PHY-006</h2>
            <p className="text-xl text-slate-300 mb-4">Quasiperiodic Synchronization</p>
            <p className="text-slate-400 mb-6">Simulating coupled oscillators with incommensurate frequencies (derived from Fibonacci numbers). Shows how simple deterministic rules create long-period non-repeating dynamics.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-[200px] flex items-center justify-around">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">{clockA}</div>
                            <div className="text-sm text-slate-500">Oscillator A (T={a})</div>
                        </div>
                        <div className="text-center">
                             <div className={`text-4xl font-bold ${isSynced ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`}>
                                 {isSynced ? 'SYNC' : '...'}
                             </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-rose-400">{clockB}</div>
                            <div className="text-sm text-slate-500">Oscillator B (T={b})</div>
                        </div>
                    </div>
                </div>
                <div>
                     <h3 className="text-lg font-semibold text-slate-200 mb-2">Analysis</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                        <Slider label={`Fibonacci Index`} value={fibIndex} onChange={(v) => setFibIndex(Math.round(v))} min={3} max={12} step={1} />
                        <button onClick={runSimulation} disabled={isRunning} className="w-full bg-cyan-500 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-400 disabled:bg-slate-600">Run Simulation</button>
                        <div className="min-h-[150px] pt-4 border-t border-slate-700">
                             {isGenerating && <div className="text-slate-400 text-center">Analysing Dynamics...</div>}
                            {!isGenerating && hypothesis && <SimpleMarkdown text={hypothesis} />}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FFZClockExperiment;
