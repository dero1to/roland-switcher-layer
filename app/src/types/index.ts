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

/** alpha: 画像自身のアルファチャンネル / fillKey: Fill画像 + Key画像(輝度=透過率) */
export type DskKeyMode = 'alpha' | 'fillKey';

export interface DskSettings {
  visible: boolean;
  mode: DskKeyMode;
  fillId: string | null;
  keyId: string | null;
  keyInvert: boolean;
  level: number;
}
