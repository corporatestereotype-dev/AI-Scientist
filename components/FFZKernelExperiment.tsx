
import React, { useState, useMemo } from 'react';
import { generateExperimentHypothesis } from '../services/geminiService';
import { SimpleMarkdown } from './GeminiAnalysis';
import Slider from './ui/Slider';
import { useSettings } from '../contexts/SettingsContext';

type SeriesType = 'Grandi' | 'AlternatingNatural' | 'RandomDivergence';

const FFZKernelExperiment: React.FC = () => {
    const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
    const [epsilon, setEpsilon] = useState(0.1);
    const [seriesType, setSeriesType] = useState<SeriesType>('Grandi');
    const [hypothesis, setHypothesis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const data = useMemo(() => {
        const points = 50;
        const classical = [];
        const kernel = [];
        let classicalSum = 0;
        let kernelSum = 0;
        let randomSeed = 0.5;

        for (let n = 1; n <= points; n++) {
            let term = 0;
            switch (seriesType) {
                case 'Grandi': term = (n % 2 !== 0) ? 1 : -1; break;
                case 'AlternatingNatural': term = (n % 2 !== 0) ? n : -n; break;
                case 'RandomDivergence':
                    randomSeed = (randomSeed * 9301 + 49297) % 233280;
                    term = ((randomSeed / 233280) * 2 - 1) * n * 0.5;
                    break;
            }
            classicalSum += term;
            // Standard Abel Summation: term * e^(-epsilon * n)
            kernelSum += term * Math.exp(-epsilon * n);
            classical.push({ n, val: classicalSum });
            kernel.push({ n, val: kernelSum });
        }
        return { classical, kernel, lastKernel: kernelSum };
    }, [seriesType, epsilon]);

    const generateAnalysis = async () => {
        setIsGenerating(true);
        setHypothesis('');
        const analysis = await generateExperimentHypothesis('AbelRegularization', {
            seriesType,
            convergedValue: data.lastKernel,
            epsilon
        }, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
        setHypothesis(analysis);
        setIsGenerating(false);
    };

    const maxY = Math.max(...data.classical.map(d => Math.abs(d.val)), ...data.kernel.map(d => Math.abs(d.val))) * 1.1 || 1;
    const scaleY = (val: number) => 50 - (val / maxY) * 45;
    const scaleX = (n: number) => ((n - 1) / (data.classical.length - 1)) * 100;
    const classicalPath = data.classical.map((d, i) => `${i===0?'M':'L'} ${scaleX(d.n)} ${scaleY(d.val)}`).join(' ');
    const kernelPath = data.kernel.map((d, i) => `${i===0?'M':'L'} ${scaleX(d.n)} ${scaleY(d.val)}`).join(' ');

    return (
        <div>
            <h2 className="text-3xl font-bold mb-1 text-cyan-400">Experiment MATH-004</h2>
            <p className="text-xl text-slate-300 mb-4">Abel Regularization of Divergent Series</p>
            <p className="text-slate-400 mb-6">Demonstrating how analytic regularization (Abel Summation) assigns finite values to divergent sums.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-[350px] relative overflow-hidden">
                        <svg className="w-full h-full" preserveAspectRatio="none">
                            <path d={classicalPath} stroke="#f43f5e" strokeWidth="2" fill="none" strokeDasharray="4 2" />
                            <path d={kernelPath} stroke="#06b6d4" strokeWidth="3" fill="none" />
                        </svg>
                    </div>
                </div>
                <div>
                     <h3 className="text-lg font-semibold text-slate-200 mb-2">Regularization Controls</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-6">
                        <div className="grid grid-cols-1 gap-2">
                             <button onClick={() => setSeriesType('Grandi')} className="px-3 py-2 rounded text-sm bg-slate-800 text-slate-400">Grandi (1-1+1...)</button>
                             <button onClick={() => setSeriesType('AlternatingNatural')} className="px-3 py-2 rounded text-sm bg-slate-800 text-slate-400">Alt. Natural (1-2+3...)</button>
                        </div>
                        <Slider label="Regularizer (ε)" value={epsilon} onChange={setEpsilon} min={0.01} max={1.0} step={0.01} />
                        <button onClick={generateAnalysis} disabled={isGenerating} className="w-full bg-cyan-500 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-400 disabled:bg-slate-600">Analyze Convergence</button>
                        <div className="min-h-[100px] pt-4 border-t border-slate-700">
                            {!isGenerating && hypothesis && <SimpleMarkdown text={hypothesis} />}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FFZKernelExperiment;
