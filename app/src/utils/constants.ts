import type { PresetConfig, ParamGroup, SampleImage } from '../types';

export const W = 1920;
export const H = 1080;

export const COLORS: Record<number, string> = {
  1: '#4a90d9',
  2: '#d94a6e',
  3: '#e6a030',
  4: '#9b59b6',
};

export const COLOR_ARR = ['#4a90d9', '#d94a6e', '#e6a030', '#9b59b6'];

export const SAMPLE_IMAGES: SampleImage[] = [
  { id: 'grid', name: 'グリッド', path: null },
  { id: 'person', name: '人物', path: 'images/person.jpg' },
  { id: 'slide', name: 'スライド', path: 'images/slide.jpg' },
  { id: 'room', name: '部屋', path: 'images/room.jpg' },
];

export const GRID_LABELS = ['左上', '上', '右上', '左', '中央', '右', '左下', '下', '右下'];

export const PARAMS: ParamGroup[] = [
  {
    group: 'クロッピング',
    items: [
      { key: 'cropH', label: 'H', min: 1, max: 100, step: 0.1, unit: '%' },
      { key: 'cropV', label: 'V', min: 1, max: 100, step: 0.1, unit: '%' },
    ],
  },
  {
    group: '小画面',
    items: [
      { key: 'posH', label: 'H', min: -50, max: 50, step: 0.1, unit: '%' },
      { key: 'posV', label: 'V', min: -50, max: 50, step: 0.1, unit: '%' },
      { key: 'zoom', label: 'Zoom', min: 0, max: 100, step: 0.1, unit: '%' },
    ],
  },
  {
    group: '子画面映像',
    items: [
      { key: 'imgH', label: 'H', min: -50, max: 50, step: 0.1, unit: '%' },
      { key: 'imgV', label: 'V', min: -50, max: 50, step: 0.1, unit: '%' },
      { key: 'imgZoom', label: 'Zoom', min: 100, max: 400, step: 1, unit: '%' },
    ],
  },
];

export const PRESETS: PresetConfig[] = [
  {
    name: 'レイアウト 1',
    desc: '左メイン＋右クロップ',
    config: {
      1: { enabled: true, cropH: 100, cropV: 100, posH: -50, posV: 0, zoom: 71.2, imgH: 0, imgV: 0, imgZoom: 100 },
      2: { enabled: true, cropH: 40.4, cropV: 100, posH: 50, posV: 0, zoom: 71.2, imgH: 0, imgV: 0, imgZoom: 100 },
      3: { enabled: false, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100 },
      4: { enabled: false, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100 },
    },
  },
  {
    name: 'レイアウト 2',
    desc: '3カラム',
    config: {
      1: { enabled: true, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 56.1, imgH: 0, imgV: 0, imgZoom: 100 },
      2: { enabled: false, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100 },
      3: { enabled: true, cropH: 29.2, cropV: 100, posH: -50, posV: 0, zoom: 75, imgH: 0, imgV: 0, imgZoom: 100 },
      4: { enabled: true, cropH: 29.2, cropV: 100, posH: 50, posV: 0, zoom: 75, imgH: 0, imgV: 0, imgZoom: 100 },
    },
  },
  {
    name: 'レイアウト 3',
    desc: '左右均等分割',
    config: {
      1: { enabled: false, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100 },
      2: { enabled: false, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100 },
      3: { enabled: true, cropH: 50, cropV: 100, posH: -50, posV: 0, zoom: 100, imgH: 0, imgV: 0, imgZoom: 100 },
      4: { enabled: true, cropH: 50, cropV: 100, posH: 50, posV: 0, zoom: 100, imgH: 0, imgV: 0, imgZoom: 100 },
    },
  },
];

export const DEFAULT_PINPS: Record<number, PinPParams> = {
  1: { enabled: true, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100, imageId: 'person' },
  2: { enabled: true, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100, imageId: 'slide' },
  3: { enabled: false, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100, imageId: 'room' },
  4: { enabled: false, cropH: 100, cropV: 100, posH: 0, posV: 0, zoom: 50, imgH: 0, imgV: 0, imgZoom: 100, imageId: 'grid' },
};

import type { PinPParams } from '../types';
