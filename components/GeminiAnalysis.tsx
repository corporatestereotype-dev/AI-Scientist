
import React, { useState, useEffect, useRef } from 'react';
import { Instability, ScientificAnalysisResult } from '../types';
import { analyzeInstability, runUniversalSimulation, SimulationResult } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';

interface GeminiAnalysisProps {
  instability: Instability;
  onAnalysisLoad?: (analysis: ScientificAnalysisResult) => void;
}

export const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const html = text
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-slate-700 text-amber-300 rounded px-1 py-0.5">$1</code>')
        .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
        .replace(/(\n<li>.*<\/li>)/gs, '<ul>$1\n</ul>');
        
    return <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};

const SimulationTerminal: React.FC<{ result: SimulationResult | null, isRunning: boolean, onRun: () => void }> = ({ result, isRunning, onRun }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
    
    useEffect(() => {
        if (result && result.logs) {
            setDisplayedLogs([]);
            let i = 0;
            const interval = setInterval(() => {
                if (i < result.logs.length) {
                    setDisplayedLogs(prev => [...prev, result.logs[i]]);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 600);
            return () => clearInterval(interval);
        }
    }, [result]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [displayedLogs]);

    return (
        <div className="mt-3 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden font-mono text-xs shadow-inner">
            <div className="bg-slate-900 px-3 py-1 border-b border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">./run_stress_test.sh</span>
                {result?.verdict && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result.verdict === 'PASS' ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'}`}>
                        {result.verdict === 'PASS' ? 'ROBUST' : 'FALSIFIED'}
                    </span>
                )}
            </div>
            <div ref={scrollRef} className="p-3 h-48 overflow-y-auto space-y-1">
                {!isRunning && !result && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                        <button 
                            onClick={onRun}
                            className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-600/50 px-4 py-2 rounded transition-colors"
                        >
                            INITIATE SIMULATION
                        </button>
                    </div>
                )}
                {isRunning && !result && (
                    <div className="text-cyan-400 animate-pulse">Initializing Physics Engine...</div>
                )}
                {displayedLogs.map((log, i) => (
                    <div key={i} className="text-slate-300">
                        <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        {log}
                    </div>
                ))}
                {result && displayedLogs.length === result.logs.length && (
                    <div className="mt-4 pt-2 border-t border-slate-800">
                        <span className="text-slate-500 block mb-1">SCIENTIFIC OUTCOME:</span>
                        <span className={result.verdict === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}>{result.outcome}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ instability, onAnalysisLoad }) => {
  const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
  const [analysis, setAnalysis] = useState<ScientificAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    setSimResult(null);
    setIsSimulating(false);
    const getAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);
      try {
        const result = await analyzeInstability(instability, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
        setAnalysis(result);
        if (onAnalysisLoad) onAnalysisLoad(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      } finally {
        setIsLoading(false);
      }
    };
    getAnalysis();
  }, [instability, llmProvider, ollamaBaseUrl, ollamaModel, onAnalysisLoad]);

  const handleRunSimulation = async () => {
      if (!analysis?.falsifiability?.critical_experiment) return;
      setIsSimulating(true);
      setSimResult(null);
      try {
          const result = await runUniversalSimulation(
              instability.canonicalName, 
              analysis.falsifiability.critical_experiment, 
              llmProvider, 
              { baseUrl: ollamaBaseUrl, model: ollamaModel }
          );
          setSimResult(result);
      } catch (e) { console.error(e); } finally { setIsSimulating(false); }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-700 pb-1 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        Scientific Analysis
      </h3>
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[150px]">
        {isLoading && (
          <div className="flex items-center justify-center h-full text-slate-400">
              <span className="animate-pulse">Generating Scientific Critique...</span>
          </div>
        )}
        {error && <div className="text-rose-400">{error}</div>}
        {!isLoading && !error && analysis && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-rose-400 text-sm mb-2">Diagnosis</h4>
              <div className="bg-rose-500/10 p-3 rounded-md border border-rose-500/20">
                  <SimpleMarkdown text={analysis.diagnosis} />
              </div>
            </div>

            {analysis.scientific_proposal && (
                <div>
                    <h4 className="font-semibold text-amber-400 text-sm mb-2">Scientific Proposal</h4>
                    <div className="bg-amber-500/10 p-4 rounded-md border border-amber-500/20 space-y-4">
                         <div>
                            <h5 className="font-medium text-amber-300 text-xs uppercase tracking-wider">Proposed Mechanism</h5>
                            <div className="mt-1 border-l-2 border-amber-400/30 pl-3">
                                <SimpleMarkdown text={analysis.scientific_proposal.mechanism} />
                            </div>
                        </div>
                         <div>
                            <h5 className="font-medium text-amber-300 text-xs uppercase tracking-wider">Mathematical Basis</h5>
                            <div className="mt-1 border-l-2 border-amber-400/30 pl-3">
                                <SimpleMarkdown text={analysis.scientific_proposal.mathematical_basis} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {analysis.falsifiability && (
                <div className="mt-6 border-t border-slate-700 pt-4">
                    <h4 className="font-semibold text-cyan-400 text-sm mb-2">Falsifiability & Robustness</h4>
                    <div className="bg-cyan-900/10 p-4 rounded-md border border-cyan-500/20 space-y-4">
                        <div className="flex justify-between items-center">
                             <span className="text-xs uppercase font-bold text-cyan-300/70">Confidence Score</span>
                             <div className="text-sm font-mono text-cyan-200">{analysis.falsifiability.confidence_score}%</div>
                        </div>
                        <div>
                            <h5 className="font-medium text-cyan-200 text-xs uppercase tracking-wider mb-1">Failure Condition</h5>
                            <p className="text-slate-400 text-sm">{analysis.falsifiability.failure_condition}</p>
                        </div>
                        <div>
                            <h5 className="font-medium text-cyan-200 text-xs uppercase tracking-wider mb-1">Critical Stress Test</h5>
                            <div className="bg-slate-900/50 p-3 rounded border border-cyan-500/10 text-sm mb-2">
                                <SimpleMarkdown text={analysis.falsifiability.critical_experiment} />
                            </div>
                            <SimulationTerminal result={simResult} isRunning={isSimulating} onRun={handleRunSimulation} />
                        </div>
                    </div>
                </div>
            )}
             {analysis.groundingSources && analysis.groundingSources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700 text-xs">
                    <h4 className="font-semibold text-slate-400 mb-2">References</h4>
                    <ul className="space-y-1">
                        {analysis.groundingSources.map((s, i) => (
                            <li key={i}><a href={s.uri} target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline">{s.title}</a></li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default GeminiAnalysis;
