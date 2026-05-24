export const PHOTO_SESSIONS = [
  { id: 'street', title: 'Street Photography' },
  { id: 'landscape', title: 'Landscape' },
  { id: 'model', title: 'Model' },
  { id: 'portrait', title: 'Portrait' },
  { id: 'editorial', title: 'Editorial' },
];

const SESSION_TITLES = Object.fromEntries(PHOTO_SESSIONS.map((s) => [s.id, s.title]));

function titleForCategory(category) {
  if (SESSION_TITLES[category]) return SESSION_TITLES[category];
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function groupImagesIntoSessions(imageList) {
  const hasFolders = imageList.some((image) => image.category && image.category !== 'portfolio');

  if (hasFolders) {
    const buckets = new Map();
    for (const image of imageList) {
      const key = image.category || 'portfolio';
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(image);
    }

    const ordered = PHOTO_SESSIONS.map((session) => session.id).filter((id) => buckets.has(id));
    const extras = [...buckets.keys()].filter((id) => !ordered.includes(id));

    return [...ordered, ...extras].map((id) => ({
      id,
      title: titleForCategory(id),
      images: buckets.get(id) ?? [],
    }));
  }

  return PHOTO_SESSIONS.map((session, sessionIndex) => ({
    ...session,
    images: imageList.filter((_, index) => index % PHOTO_SESSIONS.length === sessionIndex),
  })).filter((session) => session.images.length > 0);
}
