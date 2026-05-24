import manifest from '../data/media-manifest.json';
import { fallbackImages, fallbackVideos } from '../data/fallbackMedia';

export const images = manifest.images.length ? manifest.images : fallbackImages;
export const videos = manifest.videos.length ? manifest.videos : fallbackVideos;
export const hasUploadedMedia = manifest.images.length > 0 || manifest.videos.length > 0;

export function resolveAssetPath(assetPath) {
  if (!assetPath) return '';
  const base = import.meta.env.BASE_URL || '/';
  const normalized = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const encoded = normalized
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');
  return `${base}${encoded}`.replace(/\/{2,}/g, '/');
}

export function pickImage(index = 0) {
  return images[index % images.length];
}

/** Full-resolution source for display (original JPEG when available). */
export function displaySource(image) {
  return resolveAssetPath(image?.original || image?.variants?.at(-1)?.src || '');
}

export function imageSource(image) {
  return displaySource(image);
}

export function srcSet(image) {
  const parts = (image?.variants ?? []).map(
    (variant) => `${resolveAssetPath(variant.src)} ${variant.width}w`,
  );
  if (image?.original && image?.width) {
    parts.push(`${resolveAssetPath(image.original)} ${image.width}w`);
  }
  return parts.length ? parts.join(', ') : undefined;
}
