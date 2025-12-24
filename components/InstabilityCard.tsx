
import React from 'react';
import { Instability } from '../types';

interface InstabilityCardProps {
  instability: Instability;
  onSelect: (instability: Instability) => void;
}

const getDomainColor = (domain: string): string => {
  const map: Record<string, string> = {
    'General Relativity': 'bg-purple-500 text-purple-100',
    'Machine Learning': 'bg-cyan-500 text-cyan-100',
    'Set Theory': 'bg-amber-500 text-amber-100',
    'Computer Science': 'bg-green-500 text-green-100',
    'Physics': 'bg-rose-500 text-rose-100',
    'Mathematics': 'bg-lime-500 text-lime-100',
    'Economics': 'bg-emerald-500 text-emerald-100',
    'Biology': 'bg-teal-500 text-teal-100',
    'Engineering': 'bg-orange-500 text-orange-100',
  };
  return map[domain] || 'bg-slate-600 text-slate-100';
};

const InstabilityCard: React.FC<InstabilityCardProps> = ({ instability, onSelect }) => {
  const badgeColor = getDomainColor(instability.domain);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col h-full transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badgeColor}`}>
            {instability.domain}
          </span>
          <span className="text-slate-500 font-mono text-sm">{instability.id}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">{instability.canonicalName}</h2>
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">{instability.description}</p>
        <div className="bg-slate-900 rounded-md p-3 my-4">
          <p className="text-xs text-slate-500 mb-1">Mathematical Formulation</p>
          <code className="text-cyan-300 text-sm break-all">{instability.mathematicalFormulation}</code>
        </div>
      </div>
      <button 
        onClick={() => onSelect(instability)}
        className="mt-4 w-full bg-cyan-500 text-white font-semibold py-2 rounded-lg hover:bg-cyan-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800">
        Scientific Analysis
      </button>
    </div>
  );
};

export default InstabilityCard;
