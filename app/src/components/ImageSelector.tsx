import { useRef } from 'react';
import { SAMPLE_IMAGES } from '../utils/constants';
import { useImages } from '../contexts/imageContext';

interface ImageSelectorProps {
  title?: string;
  selectedId: string | null;
  onChange: (id: string | null) => void;
  showSamples?: boolean;
  allowNone?: boolean;
}

export function ImageSelector({ title = '入力ソース', selectedId, onChange, showSamples = true, allowNone = false }: ImageSelectorProps) {
  const { userImages, addImages, removeImage } = useImages();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const ids = await addImages(files);
    if (ids.length) onChange(ids[0]);
  };

  const handleRemove = (id: string) => {
    if (!confirm('この画像を削除しますか？')) return;
    if (selectedId === id) onChange(allowNone ? null : SAMPLE_IMAGES[0].id);
    removeImage(id);
  };

  return (
    <div className="param-group">
      <div className="param-group-title">{title}</div>
      <div
        className="image-selector"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        {allowNone && (
          <button
            className={`image-btn image-btn-none${selectedId === null ? ' active' : ''}`}
            title="なし"
            onClick={() => onChange(null)}
          >なし</button>
        )}
        {showSamples && SAMPLE_IMAGES.map(img => (
          <button
            key={img.id}
            className={`image-btn${selectedId === img.id ? ' active' : ''}${!img.path ? ' grid-pattern' : ''}`}
            title={img.name}
            style={img.path ? { backgroundImage: `url(${img.path})` } : undefined}
            onClick={() => onChange(img.id)}
          />
        ))}
        {userImages.map(img => (
          <div key={img.id} className="image-btn-wrap">
            <button
              className={`image-btn checker${selectedId === img.id ? ' active' : ''}`}
              title={img.name}
              style={{ backgroundImage: `url(${img.url})` }}
              onClick={() => onChange(img.id)}
            />
            <button className="image-btn-remove" title="削除" onClick={() => handleRemove(img.id)}>×</button>
          </div>
        ))}
        <button className="image-btn image-btn-add" title="画像を追加（ドロップも可）" onClick={() => fileRef.current?.click()}>＋</button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>
    </div>
  );
}
