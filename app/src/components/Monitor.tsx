import type { PixelRect } from '../types';
import { W, H } from '../utils/constants';

interface MonitorRectItem {
  id: number;
  rect: PixelRect;
  color?: string;
  label?: string;
}

interface MonitorProps {
  rects: MonitorRectItem[];
  dskImage?: string | null;
  children?: React.ReactNode;
}

export function Monitor({ rects, dskImage, children }: MonitorProps) {
  return (
    <div className="monitor">
      <div className="monitor-grid" />
      <div className="monitor-center-h" />
      <div className="monitor-center-v" />
      {rects.map((item) => {
        const r = item.rect;
        return (
          <div
            key={item.id}
            className="pinp-rect"
            data-pinp={item.id}
            style={{
              left: `${(r.x / W) * 100}%`,
              top: `${(r.y / H) * 100}%`,
              width: `${(r.w / W) * 100}%`,
              height: `${(r.h / H) * 100}%`,
              zIndex: 4 + item.id,
              borderColor: item.color || undefined,
              background: item.color
                ? `${item.color}11`
                : undefined,
            }}
          >
            <div className="pinp-rect-label" style={item.color ? { color: item.color } : undefined}>
              {item.label || `PinP ${item.id}`}
              <small>{r.w}&times;{r.h}</small>
            </div>
          </div>
        );
      })}
      {dskImage ? (
        <img
          src={dskImage}
          alt="DSK overlay"
          className="dsk-image-overlay"
        />
      ) : (
        <>
          <div className="dsk-outline" />
          <div className="dsk-badge">DSK</div>
        </>
      )}
      {children}
    </div>
  );
}
