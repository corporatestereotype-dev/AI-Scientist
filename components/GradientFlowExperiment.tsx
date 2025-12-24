import React, { useState, useMemo } from 'react';
import { generateExperimentHypothesis } from '../services/geminiService';
import { SimpleMarkdown } from './GeminiAnalysis';
import ToggleButton from './ui/ToggleButton';
import { useSettings } from '../contexts/SettingsContext';

const SvgChart: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-80 flex flex-col">
        <svg width="100%" height="100%" className="flex-grow">
            {children}
        </svg>
    </div>
);

const GradientFlowExperiment: React.FC = () => {
    const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
    const [isStabilized, setIsStabilized] = useState(false);
    const [weightScale, setWeightScale] = useState(1.5);
    const [runId, setRunId] = useState(0);
    const [hypothesis, setHypothesis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const simulationResults = useMemo(() => {
        const depth = 50;
        let classicalNorm = 1.0;
        let fozNorm = 1.0;
        const classicalHistory = [1.0];
        const fozHistory = [1.0];

        for (let i = 0; i < depth; i++) {
            classicalNorm *= weightScale;
            fozNorm *= weightScale;
            // FØZ Stabilization: pull the norm back towards 1
            fozNorm = fozNorm + (1 - fozNorm) * 0.2; 
            classicalHistory.push(classicalNorm);
            fozHistory.push(fozNorm);
        }
        return { classicalHistory, fozHistory, depth };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weightScale, runId]);

    const runExperiment = async () => {
        setRunId(id => id + 1); // Reruns the simulation
        setIsGenerating(true);
        setHypothesis('');
        const { classicalHistory, fozHistory, depth } = simulationResults;
        const analysis = await generateExperimentHypothesis('GradientFlow', {
            classicalNorm: classicalHistory[classicalHistory.length - 1],
            fozNorm: fozHistory[fozHistory.length - 1],
            depth,
        }, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
        setHypothesis(analysis);
        setIsGenerating(false);
    };
    
    const displayedHistory = isStabilized ? simulationResults.fozHistory : simulationResults.classicalHistory;
    const maxVal = Math.max(...simulationResults.classicalHistory, ...simulationResults.fozHistory, 1);

    const points = displayedHistory.map((val, i) => ({
        x: (i / (displayedHistory.length - 1)) * 100,
        y: 100 - (Math.log10(val + 1) / Math.log10(maxVal + 1)) * 95,
    }));
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');


    return (
        <div>
            <h2 className="text-3xl font-bold mb-1 text-cyan-400">Experiment CS-ML-001</h2>
            <p className="text-xl text-slate-300 mb-4">Vanishing/Exploding Gradients</p>
            <p className="text-slate-400 mb-6">Simulate gradient norm propagation through a deep network. Toggle stabilization to see how FØZ prevents the gradient from becoming unstable, enabling deep learning.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SvgChart>
                        <path d={pathData} stroke={isStabilized ? "#06b6d4" : "#f43f5e"} strokeWidth="3" fill="none" />
                        <text x="50%" y="98%" textAnchor="middle" fill="gray" fontSize="12">Network Layer</text>
                        <text x="2%" y="50%" transform="rotate(-90, 10, 100)" textAnchor="middle" fill="gray" fontSize="12">Gradient Norm (Log Scale)</text>
                    </SvgChart>
                </div>
                <div>
                     <h3 className="text-lg font-semibold text-slate-200 mb-2">Controls & Analysis</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                        <ToggleButton label="FØZ Stabilization" enabled={isStabilized} setEnabled={setIsStabilized} />
                        <div className="flex flex-col space-y-2">
                             <label className="text-sm font-medium text-slate-300">Initial Weight Scale: <span className="text-sm font-mono text-cyan-400 bg-slate-700 px-2 py-1 rounded-md">{weightScale.toFixed(1)}</span></label>
                             <div className="flex gap-2">
                                <button onClick={() => setWeightScale(0.8)} className={`flex-1 text-sm py-1 rounded ${weightScale === 0.8 ? 'bg-cyan-500 text-white' : 'bg-slate-600'}`}>Vanish (0.8)</button>
                                <button onClick={() => setWeightScale(1.5)} className={`flex-1 text-sm py-1 rounded ${weightScale === 1.5 ? 'bg-cyan-500 text-white' : 'bg-slate-600'}`}>Explode (1.5)</button>
                             </div>
                        </div>

                        <button 
                            onClick={runExperiment}
                            className="w-full bg-cyan-500 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Generate Analysis
                        </button>
                         <div className="min-h-[150px] pt-4 border-t border-slate-700">
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
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradientFlowExperiment;
