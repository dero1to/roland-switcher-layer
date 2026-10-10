import { createContext, useContext } from 'react';
import { SAMPLE_IMAGES } from '../utils/constants';

export interface UserImage {
  id: string;
  name: string;
  url: string;
}

export interface ImageContextValue {
  userImages: UserImage[];
  addImages: (files: FileList | File[]) => Promise<string[]>;
  removeImage: (id: string) => void;
}

export const ImageContext = createContext<ImageContextValue>({
  userImages: [],
  addImages: async () => [],
  removeImage: () => {},
});

export function useImages() {
  const ctx = useContext(ImageContext);
  const resolveUrl = (id: string | null | undefined): string | null => {
    if (!id) return null;
    const user = ctx.userImages.find(img => img.id === id);
    if (user) return user.url;
    return SAMPLE_IMAGES.find(img => img.id === id)?.path ?? null;
  };
  return { ...ctx, resolveUrl };
}
