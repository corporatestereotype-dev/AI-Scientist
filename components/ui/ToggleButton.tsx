
import React from 'react';

interface ToggleButtonProps {
  label: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  className?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ label, enabled, setEnabled, className }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <button
        type="button"
        className={`${
          enabled ? 'bg-cyan-500' : 'bg-slate-600'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

export default ToggleButton;
