import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import SettingsModal from './SettingsModal';

const Header: React.FC = () => {
    const { llmProvider, setLlmProvider } = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.929 4.929l14.142 14.142M4.929 19.071l14.142-14.142" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-50 tracking-tight">
                            Polymath AI: <span className="text-cyan-400">Atlas of Instability</span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-lg">
                            <button 
                                onClick={() => setLlmProvider('gemini')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${llmProvider === 'gemini' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                            >
                                Gemini
                            </button>
                            <button 
                                onClick={() => setLlmProvider('ollama')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${llmProvider === 'ollama' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                            >
                                Ollama (Local)
                            </button>
                        </div>
                         <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-slate-400 hover:text-cyan-400 transition-colors"
                            aria-label="Open settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </>
    );
};

export default Header;
