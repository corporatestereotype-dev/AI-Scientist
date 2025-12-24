
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, className }) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label htmlFor={label} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <span className="text-sm font-mono text-cyan-400 bg-slate-700 px-2 py-1 rounded-md">
          {value.toFixed(3)}
        </span>
      </div>
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
  );
};

export default Slider;
