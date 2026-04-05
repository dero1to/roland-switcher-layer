interface ExportButtonsProps {
  onShareUrl: () => void;
  onJson: () => void;
  onText: () => void;
  toastVisible: boolean;
}

export function ExportButtons({ onShareUrl, onJson, onText, toastVisible }: ExportButtonsProps) {
  return (
    <div className="toolbar-group">
      <button className="export-btn primary" onClick={onShareUrl}>共有URL</button>
      <button className="export-btn" onClick={onJson}>JSON</button>
      <button className="export-btn" onClick={onText}>テキスト</button>
      <span className={`toast${toastVisible ? ' show' : ''}`}>コピーしました</span>
    </div>
  );
}
