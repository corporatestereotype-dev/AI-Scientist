
import React, { useState, useEffect, useRef } from 'react';
import Slider from './ui/Slider';
import ToggleButton from './ui/ToggleButton';
import { generateExperimentHypothesis } from '../services/geminiService';
import { SimpleMarkdown } from './GeminiAnalysis';
import { useSettings } from '../contexts/SettingsContext';

const TorsionCancellationDemo: React.FC = () => {
    const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
    const [modulusA, setModulusA] = useState(5);
    const [isCompactified, setIsCompactified] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hypothesis, setHypothesis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        setProgress(0);
        setIsAnimating(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }, [modulusA, isCompactified]);

    const startAnimation = () => {
        setIsAnimating(true);
        setHypothesis('');
        setProgress(0);
        let startTime: number | null = null;
        const duration = 3000; 

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const rawProgress = (time - startTime) / duration;
            if (rawProgress >= 1) {
                 setIsAnimating(false);
                 generateAnalysis();
                 return;
            }
            setProgress(rawProgress);
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
    };

    const generateAnalysis = async () => {
        setIsGenerating(true);
        const analysis = await generateExperimentHypothesis('Compactification', { type: isCompactified ? 'Compact' : 'Linear', mod: modulusA }, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
        setHypothesis(analysis);
        setIsGenerating(false);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-1 text-cyan-400">Experiment MATH-006</h2>
            <p className="text-xl text-slate-300 mb-4">Topology Change: Compactification</p>
            <p className="text-slate-400 mb-6">Visualizing how changing topology from an infinite line (R) to a finite circle (S1) transforms divergent motion into cyclic motion (Kaluza-Klein theory).</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 min-h-[300px] flex flex-col justify-center items-center">
                     {!isCompactified ? (
                         <div className="w-full relative h-10 border-b border-slate-600">
                             <div className="absolute top-0 h-4 w-4 bg-rose-500 rounded-full" style={{ left: `${Math.min(progress*100, 100)}%` }}></div>
                             <div className="absolute right-0 top-6 text-rose-500 font-mono">x → ∞</div>
                         </div>
                     ) : (
                         <div className="relative w-32 h-32 border-4 border-cyan-500 rounded-full flex items-center justify-center">
                             <div className="absolute w-4 h-4 bg-cyan-400 rounded-full" style={{ 
                                 transform: `rotate(${progress * 360 * 2}deg) translate(64px) rotate(-${progress * 360 * 2}deg)` 
                             }}></div>
                             <div className="text-cyan-400 font-mono">S1</div>
                         </div>
                     )}
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                        <ToggleButton label="Compactify Dimensions" enabled={isCompactified} setEnabled={setIsCompactified} />
                        {isCompactified && <div className="mt-4"><Slider label="Radius (Inverse Modulus)" value={modulusA} min={3} max={12} step={1} onChange={setModulusA} /></div>}
                    </div>

                    <button onClick={startAnimation} disabled={isAnimating} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold">
                        {isAnimating ? 'Simulating...' : 'Run Topology Simulation'}
                    </button>

                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[120px]">
                        {!isGenerating && hypothesis && <SimpleMarkdown text={hypothesis} />}
                        {!isGenerating && !hypothesis && <div className="text-center text-slate-600 italic">Run simulation for analysis.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TorsionCancellationDemo;
