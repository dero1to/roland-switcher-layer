import type { ParamDef } from '../types';

interface ParamSliderProps {
  param: ParamDef;
  value: number;
  onChange: (value: number) => void;
}

export function ParamSlider({ param, value, onChange }: ParamSliderProps) {
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) {
      onChange(Math.max(param.min, Math.min(param.max, v)));
    }
  };

  return (
    <div className="param-row">
      <span className="param-label">{param.label}</span>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <input
        type="number"
        className="param-value"
        min={param.min}
        max={param.max}
        step={param.step}
        value={parseFloat(value.toFixed(1))}
        onChange={handleNumberChange}
      />
      <span className="param-unit">{param.unit}</span>
    </div>
  );
}
