import type { PixelRect } from '../types';
import { COLORS } from '../utils/constants';
import { ExportButtons } from './ExportButtons';

interface BottomBarProps {
  enabledRects: (PixelRect & { id: number })[];
  dskHtml: string;
  onCopyShareUrl: () => void;
  onCopyJson: () => void;
  onCopyText: () => void;
  toastVisible: boolean;
}

export function BottomBar({ enabledRects, dskHtml, onCopyShareUrl, onCopyJson, onCopyText, toastVisible }: BottomBarProps) {
  return (
    <div className="bottom-bar">
      <div className="output-card">
        <h4>ピクセル座標</h4>
        <CoordTable rects={enabledRects} />
      </div>
      <div className="output-card">
        <h4>DSK設計情報</h4>
        <div className="dsk-info" dangerouslySetInnerHTML={{ __html: dskHtml }} />
      </div>
      <div className="output-card export-card">
        <h4>エクスポート</h4>
        <ExportButtons onShareUrl={onCopyShareUrl} onJson={onCopyJson} onText={onCopyText} toastVisible={toastVisible} />
      </div>
    </div>
  );
}

export function CoordTable({ rects }: { rects: (PixelRect & { id: number })[] }) {
  return (
    <table className="coord-table">
      <thead>
        <tr><th>PinP</th><th>X</th><th>Y</th><th>W</th><th>H</th></tr>
      </thead>
      <tbody>
        {rects.map(r => (
          <tr key={r.id}>
            <td className="pinp-name" style={{ color: COLORS[r.id] }}>PinP {r.id}</td>
            <td>{r.x}</td>
            <td>{r.y}</td>
            <td>{r.w}</td>
            <td>{r.h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
