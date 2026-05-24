import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const mediaDir = path.join(root, 'public', 'media');
const optimizedDir = path.join(root, 'public', 'optimized');
const manifestPath = path.join(root, 'src', 'data', 'media-manifest.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const videoExtensions = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const widths = [640, 1080, 1600, 2200, 2800];
const WEBP_QUALITY = 92;
let sharp;

try {
  sharp = (await import('sharp')).default;
} catch {
  sharp = null;
}

async function listFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listFiles(full);
        return full;
      }),
    );
    return nested.flat();
  } catch {
    return [];
  }
}

function cleanName(file) {
  return path.basename(file, path.extname(file)).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function publicPath(file) {
  const relative = path.relative(path.join(root, 'public'), file).replaceAll(path.sep, '/');
  return `/${relative.split('/').map((segment) => encodeURIComponent(segment)).join('/')}`;
}

await fs.mkdir(path.dirname(manifestPath), { recursive: true });
if (sharp) await fs.mkdir(optimizedDir, { recursive: true });

const files = await listFiles(mediaDir);
const images = [];
const videos = [];

for (const file of files) {
  const ext = path.extname(file).toLowerCase();

  if (imageExtensions.has(ext)) {
    const name = cleanName(file);
    const rel = path.relative(mediaDir, file);
    const folder = path.dirname(rel);
    const category = folder && folder !== '.' ? cleanName(folder) : 'portfolio';
    const fallback = {
      id: name,
      alt: name.split('-').join(' '),
      category,
      original: publicPath(file),
      width: 1600,
      height: 1000,
      dominant: '#5a0010',
      variants: [{ width: 1600, src: publicPath(file) }],
    };

    if (!sharp) {
      images.push(fallback);
      continue;
    }

    const meta = await sharp(file).metadata();
    const variants = [];

    for (const width of widths.filter((w) => !meta.width || w <= meta.width * 1.15)) {
      const output = path.join(optimizedDir, `${name}-${width}.webp`);
      await sharp(file)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toFile(output);
      variants.push({ width, src: publicPath(output) });
    }

    images.push({
      id: name,
      alt: name.split('-').join(' '),
      category,
      original: publicPath(file),
      width: meta.width || fallback.width,
      height: meta.height || fallback.height,
      dominant: '#5a0010',
      variants: variants.length ? variants : fallback.variants,
    });
  }

  if (videoExtensions.has(ext)) {
    const name = cleanName(file);
    videos.push({
      id: name,
      alt: name.split('-').join(' '),
      src: publicPath(file),
      type: ext === '.webm' ? 'video/webm' : 'video/mp4',
    });
  }
}

if (sharp) {
  const keep = new Set(
    images.flatMap((image) => image.variants.map((variant) => path.basename(variant.src))),
  );
  const optimizedFiles = await fs.readdir(optimizedDir).catch(() => []);
  await Promise.all(
    optimizedFiles.map(async (file) => {
      if (keep.has(file)) return;
      await fs.unlink(path.join(optimizedDir, file));
    }),
  );
}

const manifest = {
  generatedAt: new Date().toISOString(),
  images,
  videos,
};

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared ${images.length} images and ${videos.length} videos.`);

if (images.length === 0) {
  console.error(
    'No images found in public/media. Add your photos to public/media and push them to Git before deploying.',
  );
  if (process.env.VERCEL) process.exit(1);
}
