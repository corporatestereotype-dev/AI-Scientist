import React, { useState, useEffect, useRef } from 'react';
import { generateExperimentHypothesis } from '../services/geminiService';
import { SimpleMarkdown } from './GeminiAnalysis';
import CircularityAnalysis from './CircularityAnalysis';
import { useSettings } from '../contexts/SettingsContext';

const RussellsParadoxExperiment: React.FC = () => {
    const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
    const [isRunning, setIsRunning] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [hypothesis, setHypothesis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [log]);

    const runSimulation = async () => {
        setIsRunning(true);
        setHypothesis('');
        setIsGenerating(false);
        setLog(['> evaluate(R ∈ R)']);

        const budget = 10;
        let steps = 0;
        let fozResult = 'Loop Detected (λ term)';

        const intervalId = setInterval(() => {
            if (steps < budget) {
                setLog(prev => [...prev, ` > R ∈ R ? Check if R contains itself...`]);
                steps++;
            } else {
                setLog(prev => [...prev, `> Computational budget exhausted.`]);
                setLog(prev => [...prev, `> FØZ Result: ${fozResult}`]);
                clearInterval(intervalId);
                setIsRunning(false);
                generateHypothesis(fozResult, budget);
            }
        }, 300);
    };

    const generateHypothesis = async (fozResult: string, budget: number) => {
        setIsGenerating(true);
        const analysis = await generateExperimentHypothesis('RussellsParadox', {
            fozResult,
            budget,
        }, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
        setHypothesis(analysis);
        setIsGenerating(false);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-1 text-cyan-400">Experiment MATH-001</h2>
            <p className="text-xl text-slate-300 mb-4">Russell's Paradox</p>
            <p className="text-slate-400 mb-6">{`A computational visualizer for the statement \`R = {x | x ∉ x}\`. The FØZ-stabilized evaluation uses a finite budget to diagnose the resulting infinite loop.`}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Computational Trace</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <button 
                            onClick={runSimulation}
                            disabled={isRunning}
                            className="w-full bg-cyan-500 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                             {isRunning && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isRunning ? 'Evaluating...' : 'Run FØZ Evaluation'}
                        </button>
                        <div ref={logRef} className="mt-4 h-60 bg-slate-950 rounded-md p-3 font-mono text-xs text-slate-400 overflow-y-auto whitespace-pre-wrap break-word">
                            {log.map((line, i) => (
                                <p key={i} style={{ textIndent: `${line.split('>').length * 10}px`, animation: `fadeIn 0.5s ${i * 0.3}s both` }}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                        Creative Agent Hypothesis
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[17.5rem]">
                         {isGenerating && (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Generating hypothesis...</span>
                                </div>
                            </div>
                        )}
                        {!isGenerating && hypothesis && (
                            <SimpleMarkdown text={hypothesis} />
                        )}
                         {!isGenerating && !hypothesis && !isRunning && (
                             <div className="flex items-center justify-center h-full text-slate-500">
                                Run evaluation to generate analysis.
                            </div>
                        )}
                    </div>
                 </div>
            </div>
            <CircularityAnalysis />
             <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default RussellsParadoxExperiment;
