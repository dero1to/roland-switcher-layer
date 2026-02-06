export interface PinPParams {
  enabled: boolean;
  cropH: number;
  cropV: number;
  posH: number;
  posV: number;
  zoom: number;
  imgH: number;
  imgV: number;
  imgZoom: number;
  imageId: string;
}

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ReverseRect extends PixelRect {
  id: number;
  color: string;
  zoom: number;
  imageId: string;
}

export interface ReverseParams {
  zoom: number;
  cropH: number;
  cropV: number;
  posH: number;
  posV: number;
}

export interface PresetConfig {
  name: string;
  desc: string;
  config: Record<number, Omit<PinPParams, 'imageId'>>;
}

export interface ParamDef {
  key: keyof PinPParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface ParamGroup {
  group: string;
  items: ParamDef[];
}

export interface SampleImage {
  id: string;
  name: string;
  path: string | null;
}

export type Mode = 'forward' | 'reverse';
