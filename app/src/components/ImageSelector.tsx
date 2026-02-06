import { SAMPLE_IMAGES } from '../utils/constants';

interface ImageSelectorProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function ImageSelector({ selectedId, onChange }: ImageSelectorProps) {
  return (
    <div className="param-group">
      <div className="param-group-title">入力ソース</div>
      <div className="image-selector">
        {SAMPLE_IMAGES.map(img => (
          <button
            key={img.id}
            className={`image-btn${selectedId === img.id ? ' active' : ''}${!img.path ? ' grid-pattern' : ''}`}
            title={img.name}
            style={img.path ? { backgroundImage: `url(${img.path})` } : undefined}
            onClick={() => onChange(img.id)}
          />
        ))}
      </div>
    </div>
  );
}
