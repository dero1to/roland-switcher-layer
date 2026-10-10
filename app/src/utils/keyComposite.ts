import { W, H } from './constants';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Fill 画像の RGB と Key 画像の輝度(白=不透明)を合成し、アルファ付き PNG の ObjectURL を返す */
export async function compositeFillKey(fillUrl: string, keyUrl: string, invert: boolean): Promise<string> {
  const [fill, key] = await Promise.all([loadImage(fillUrl), loadImage(keyUrl)]);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.drawImage(key, 0, 0, W, H);
  const keyData = ctx.getImageData(0, 0, W, H).data;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(fill, 0, 0, W, H);
  const out = ctx.getImageData(0, 0, W, H);
  const d = out.data;
  for (let i = 0; i < d.length; i += 4) {
    // Rec.709 輝度。Key 画像自体の透過部分は黒として扱う
    const luma = (0.2126 * keyData[i] + 0.7152 * keyData[i + 1] + 0.0722 * keyData[i + 2]) * (keyData[i + 3] / 255);
    d[i + 3] = invert ? 255 - luma : luma;
  }
  ctx.putImageData(out, 0, 0);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('toBlob failed');
  return URL.createObjectURL(blob);
}
