
import React, { useState, useEffect, useRef } from 'react';
import { generateExperimentHypothesis } from '../services/geminiService';
import { SimpleMarkdown } from './GeminiAnalysis';
import Slider from './ui/Slider';
import { useSettings } from '../contexts/SettingsContext';

const BlackHoleExperiment: React.FC = () => {
    const { llmProvider, ollamaBaseUrl, ollamaModel } = useSettings();
    const [isRunning, setIsRunning] = useState(false);
    const [epsilon, setEpsilon] = useState(0.5);
    const [hypothesis, setHypothesis] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [finalDistance, setFinalDistance] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);

    const runSimulation = () => {
        setIsRunning(true);
        setHypothesis('');
        setFinalDistance(0);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        const width = rect.width;
        const height = rect.height;
        const center = { x: width / 2, y: height / 2 };
        const scale = 100; 

        let p_classical = { x: width / 2 - 150, y: height / 2 - 50, vx: 1.2, vy: 0.5 };
        let p_effective = { ...p_classical };
        
        let classical_path: {x:number, y:number}[] = [];
        let effective_path: {x:number, y:number}[] = [];
        let classical_done = false;
        let effective_done = false;
        let step = 0;
        const maxSteps = 1000;

        const animate = () => {
            step++;
            ctx.clearRect(0, 0, width, height);

            // Draw Planck Scale Cutoff Region
            const coreRadius = epsilon * scale;
            const coreGradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, coreRadius * 2.5);
            coreGradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)'); 
            coreGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(center.x, center.y, coreRadius * 2.5, 0, 2 * Math.PI);
            ctx.fill();

            // Black Hole
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
            ctx.fill();

            if (step < 50) { 
                ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
                ctx.textAlign = 'center';
                ctx.font = '10px Inter';
                ctx.fillText(`Planck Cutoff (ε=${epsilon})`, center.x, center.y - coreRadius - 5);
            }

            // Classical Physics (Singular)
            if (!classical_done) {
                const dx = center.x - p_classical.x;
                const dy = center.y - p_classical.y;
                const r2 = dx * dx + dy * dy;
                const r = Math.sqrt(r2);
                if (r < 5) {
                    classical_done = true;
                } else {
                    const forceStrength = 1500;
                    const ax = (forceStrength / r2) * (dx / r);
                    const ay = (forceStrength / r2) * (dy / r);
                    p_classical.vx += ax;
                    p_classical.vy += ay;
                    p_classical.x += p_classical.vx;
                    p_classical.y += p_classical.vy;
                    classical_path.push({x: p_classical.x, y: p_classical.y});
                }
            }

            // Effective Field Theory (Regularized)
            if (!effective_done) {
                const dx = center.x - p_effective.x;
                const dy = center.y - p_effective.y;
                let r2 = dx * dx + dy * dy;
                
                // Regularization: Limit potential depth
                const minR2 = (epsilon * scale) ** 2;
                if (r2 < minR2) r2 = minR2;
                
                const r = Math.sqrt(r2);
                const forceStrength = 1500;
                const ax = (forceStrength / r2) * (dx / r);
                const ay = (forceStrength / r2) * (dy / r);
                p_effective.vx += ax;
                p_effective.vy += ay;
                p_effective.x += p_effective.vx;
                p_effective.y += p_effective.vy;
                effective_path.push({x: p_effective.x, y: p_effective.y});

                if (step > maxSteps) {
                     effective_done = true;
                     setFinalDistance(Math.sqrt(r2)/scale);
                }
            }

            // Draw Traces
            const drawTrace = (path: {x:number, y:number}[], color: string) => {
                if (path.length < 2) return;
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                for (let i = 0; i < path.length - 1; i++) {
                    ctx.moveTo(path[i].x, path[i].y);
                    ctx.lineTo(path[i+1].x, path[i+1].y);
                }
                ctx.stroke();
            };

            drawTrace(classical_path, '#ef4444');
            drawTrace(effective_path, '#22d3ee');

            if (classical_done && effective_done) {
                setIsRunning(false);
                if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
                generateHypothesis();
            } else {
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };
        animate();
    };

    const generateHypothesis = async () => {
        setIsGenerating(true);
        const analysis = await generateExperimentHypothesis('BlackHole', { finalDistance, epsilon }, llmProvider, { baseUrl: ollamaBaseUrl, model: ollamaModel });
        setHypothesis(analysis);
        setIsGenerating(false);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-1 text-cyan-400">Experiment PHY-001</h2>
            <p className="text-xl text-slate-300 mb-4">Black Hole Singularity Regularization</p>
            <p className="text-slate-400 mb-6">Comparison of Classical Singularity (Red) vs. Quantum Effective Field Theory with a Planck Scale Cutoff (Cyan).</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[400px]">
                    <canvas ref={canvasRef} style={{ width: '100%', height: '400px' }} className="bg-slate-950 rounded-md"></canvas>
                </div>
                <div>
                     <h3 className="text-lg font-semibold text-slate-200 mb-2">Controls</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                        <Slider label="Cutoff Scale ε (Planck Length)" value={epsilon} onChange={setEpsilon} min={0.1} max={1.0} step={0.1} />
                        <button onClick={runSimulation} disabled={isRunning} className="w-full bg-cyan-500 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-400 disabled:bg-slate-600">
                            {isRunning ? 'Simulating...' : 'Run Simulation'}
                        </button>
                        <div className="min-h-[150px] pt-4 border-t border-slate-700">
                             {isGenerating && <div className="text-center text-slate-400">Generating Scientific Hypothesis...</div>}
                            {!isGenerating && hypothesis && <SimpleMarkdown text={hypothesis} />}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BlackHoleExperiment;
