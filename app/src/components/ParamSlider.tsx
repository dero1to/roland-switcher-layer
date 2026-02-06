import { useState, useCallback } from 'react';
import type { ParamDef } from '../types';

interface ParamSliderProps {
  param: ParamDef;
  value: number;
  onChange: (value: number) => void;
}

export function ParamSlider({ param, value, onChange }: ParamSliderProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleFocus = useCallback(() => {
    setEditing(true);
    setEditValue(value.toFixed(1));
  }, [value]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    let v = parseFloat(editValue);
    if (isNaN(v)) v = value;
    v = Math.max(param.min, Math.min(param.max, v));
    onChange(v);
  }, [editValue, value, param.min, param.max, onChange]);

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
        type="text"
        className="param-value"
        value={editing ? editValue : `${value.toFixed(1)}${param.unit}`}
        onFocus={handleFocus}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      />
    </div>
  );
}
