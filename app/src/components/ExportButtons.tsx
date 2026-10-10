interface ExportButtonsProps {
  onGuidePng: () => void;
  onShareUrl: () => void;
  onJson: () => void;
  onText: () => void;
  toastVisible: boolean;
  toastMessage: string;
}

export function ExportButtons({ onGuidePng, onShareUrl, onJson, onText, toastVisible, toastMessage }: ExportButtonsProps) {
  return (
    <div className="toolbar-group">
      <button className="export-btn primary" onClick={onGuidePng} title="PinP 領域を描いた 1920×1080 の透過PNG">ガイドPNG</button>
      <button className="export-btn" onClick={onShareUrl}>共有URL</button>
      <button className="export-btn" onClick={onJson}>JSON</button>
      <button className="export-btn" onClick={onText}>テキスト</button>
      <span className={`toast${toastVisible ? ' show' : ''}`}>{toastMessage}</span>
    </div>
  );
}
