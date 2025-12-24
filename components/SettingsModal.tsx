import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { ollamaBaseUrl, setOllamaBaseUrl, ollamaModel, setOllamaModel } = useSettings();

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-8 relative shadow-2xl shadow-cyan-900/20"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10" aria-label="Close settings">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-cyan-400">LLM Provider Settings</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-700 pb-2">Ollama (Local)</h3>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="ollama-url" className="block text-sm font-medium text-slate-300 mb-1">
                                    Network Address (Base URL)
                                </label>
                                <input
                                    type="text"
                                    id="ollama-url"
                                    value={ollamaBaseUrl}
                                    onChange={(e) => setOllamaBaseUrl(e.target.value)}
                                    placeholder="http://127.0.0.1:11434"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">The base URL of your running Ollama instance.</p>
                            </div>
                             <div>
                                <label htmlFor="ollama-model" className="block text-sm font-medium text-slate-300 mb-1">
                                    Model Name
                                </label>
                                <input
                                    type="text"
                                    id="ollama-model"
                                    value={ollamaModel}
                                    onChange={(e) => setOllamaModel(e.target.value)}
                                    placeholder="llama3"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">The model to use (e.g., 'llama3', 'codellama').</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
