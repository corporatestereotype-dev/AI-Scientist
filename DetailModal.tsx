
import React, { useState } from 'react';
import { Instability, FozAnalysisResult } from './types';
import GeminiAnalysis, { SimpleMarkdown } from './components/GeminiAnalysis';
import SubsetSumExperiment from './components/SubsetSumExperiment';
import BlackHoleExperiment from './components/BlackHoleExperiment';
import GradientFlowExperiment from './components/GradientFlowExperiment';
import RussellsParadoxExperiment from './components/RussellsParadoxExperiment';
import FFZClockExperiment from './components/FFZClockExperiment';
import FFZKernelExperiment from './components/FFZKernelExperiment';
import TorsionCancellationDemo from './components/TorsionCancellationDemo';
import { ErrorBoundary } from './components/ErrorBoundary';

interface DetailModalProps {
  instability: Instability;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ instability, onClose }) => {
    const [isMathExpanded, setIsMathExpanded] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<FozAnalysisResult | null>(null);
    
    // Homotopy path can come from static data OR AI analysis
    const homotopyPathContent = instability.fozInterpretation.homotopyPath || aiAnalysis?.foz_proposal?.homotopy_path;

    const renderExperiment = () => {
        if (!instability.experimentComponent) return null;

        const experimentProps = { key: instability.id };
        let Component;

        switch(instability.experimentComponent) {
            case 'SubsetSum':
                Component = <SubsetSumExperiment {...experimentProps} instability={instability} />;
                break;
            case 'BlackHole':
                Component = <BlackHoleExperiment {...experimentProps} />;
                break;
            case 'GradientFlow':
                Component = <GradientFlowExperiment {...experimentProps} />;
                break;
            case 'RussellsParadox':
                Component = <RussellsParadoxExperiment {...experimentProps} />;
                break;
            case 'FFZClock':
                Component = <FFZClockExperiment {...experimentProps} />;
                break;
            case 'FFZKernel':
                Component = <FFZKernelExperiment {...experimentProps} />;
                break;
            case 'TorsionCancellation':
                Component = <TorsionCancellationDemo {...experimentProps} />;
                break;
            default:
                return null;
        }

        return (
            <ErrorBoundary componentName={instability.experimentComponent}>
                {Component}
            </ErrorBoundary>
        );
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl shadow-cyan-900/20"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h2 className="text-3xl font-bold mb-2 text-cyan-400">{instability.canonicalName}</h2>
                <p className="text-slate-400 mb-6">{instability.description}</p>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-2 border-b border-slate-700 pb-1">FØZ Interpretation</h3>
                        <p className="text-slate-300">{instability.fozInterpretation.summary}</p>
                    </div>

                    <div className="bg-slate-900 rounded-md p-3 my-4 border border-slate-800">
                        <div className="flex justify-between items-start">
                            <div className="flex-grow">
                                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Mathematical Formulation</p>
                                <code className="text-cyan-300 text-sm break-all block mb-1 font-mono">{instability.mathematicalFormulation}</code>
                            </div>
                            {instability.simplifiedMathExplanation && (
                                 <button 
                                    onClick={() => setIsMathExpanded(!isMathExpanded)}
                                    className="text-xs text-cyan-500 hover:text-cyan-400 underline ml-4 flex-shrink-0 mt-1 focus:outline-none"
                                 >
                                     {isMathExpanded ? 'Hide Concept' : 'Explain Math'}
                                 </button>
                            )}
                        </div>
                        
                        {isMathExpanded && instability.simplifiedMathExplanation && (
                            <div className="mt-3 pt-3 border-t border-slate-800 text-sm text-slate-400 leading-relaxed">
                                <p><span className="font-semibold text-slate-300">Conceptual Translation:</span> {instability.simplifiedMathExplanation}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {instability.fozInterpretation.lambdaTermExample && (
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="font-semibold text-slate-400 text-sm mb-1">Example λ-Term</h4>
                                <code className="text-amber-300">{instability.fozInterpretation.lambdaTermExample}</code>
                            </div>
                        )}
                        {instability.fozInterpretation.obstruction && (
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="font-semibold text-slate-400 text-sm mb-1">Obstruction</h4>
                                <p className="text-rose-300">{instability.fozInterpretation.obstruction}</p>
                            </div>
                        )}
                        {instability.fozInterpretation.strictification && (
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="font-semibold text-slate-400 text-sm mb-1">Strictification</h4>
                                <p className="text-green-300">{instability.fozInterpretation.strictification}</p>
                            </div>
                        )}
                    </div>

                    {/* Homotopy Path Visualization */}
                    {homotopyPathContent && (
                        <div className="mt-6 bg-slate-900/30 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-500"></div>
                             <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 to-transparent opacity-50 pointer-events-none"></div>

                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                FFZ-Homotopy Path
                            </h4>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="flex flex-col items-center mt-1">
                                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 ring-2 ring-rose-900/50"></div>
                                    <div className="w-0.5 h-full bg-gradient-to-b from-rose-500 via-purple-500 to-emerald-500 my-1 min-h-[80px] opacity-70"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-900/50"></div>
                                </div>
                                <div className="space-y-6 flex-1">
                                    <div>
                                        <span className="text-xs font-mono text-rose-400 block mb-1 tracking-wider">INITIAL STATE (Unstable)</span>
                                        <p className="text-slate-500 text-xs italic">"Singular configuration, infinite divergence, or logical paradox."</p>
                                    </div>
                                    <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/50 shadow-inner">
                                        <div className="text-slate-200 text-sm leading-relaxed">
                                            <SimpleMarkdown text={homotopyPathContent} />
                                        </div>
                                    </div>
                                     <div>
                                        <span className="text-xs font-mono text-emerald-400 block mb-1 tracking-wider">TARGET STATE (Stabilized)</span>
                                        <p className="text-slate-500 text-xs italic">"Finite torsion cycle, resolved singularity, or polynomial-time solution."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {instability.experimentComponent ? (
                        <div className="mt-8 pt-6 border-t border-slate-700">
                           {instability.experimentComponent === 'SubsetSum' && <GeminiAnalysis instability={instability} onAnalysisLoad={setAiAnalysis} />}
                           <div className={instability.experimentComponent === 'SubsetSum' ? 'mt-8 pt-8 border-t border-slate-700' : ''}>
                             {renderExperiment()}
                           </div>
                        </div>
                    ) : (
                         <GeminiAnalysis instability={instability} onAnalysisLoad={setAiAnalysis} />
                    )}

                </div>
            </div>
        </div>
    );
};

export default DetailModal;
