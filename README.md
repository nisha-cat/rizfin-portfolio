# Cinematic Photography & Videography Portfolio

A luxury dark-themed portfolio website for a photographer and videographer. Built with cinematic scroll animations, smooth navigation, and a responsive image gallery powered entirely by local media uploads.

## Live Demo

**Website:** [Add your Vercel link here after deployment]

Example: `https://your-portfolio.vercel.app`

> After deploying on Vercel, replace the placeholder above with your live URL.

## Features

- Cinematic hero section with photo/video background
- Portfolio gallery grouped by category (street, landscape, model, portrait, editorial)
- Motion showreel / slideshow
- About, testimonials, and contact sections
- Smooth scrolling and scroll-triggered animations
- Fully responsive on mobile, tablet, and desktop
- Optimized images with lazy loading

## Tech Stack

- React + Vite
- Tailwind CSS
- GSAP (ScrollTrigger, SplitText)
- Framer Motion
- Lenis smooth scroll

## Media

Add photos and videos to:

```text
public/media
```

Supported formats:

- Images: `jpg`, `jpeg`, `png`, `webp`, `avif`
- Videos: `mp4`, `webm`, `mov`, `m4v`

## Run Locally

On Windows, double-click:

```text
start-portfolio.bat
```

Or run manually:

```bash
npm install
npm run prepare-media
npm run dev
```

Open `http://127.0.0.1:5173`

## Build

```bash
npm run build
```

`prepare-media` scans uploads and writes `src/data/media-manifest.json`. When the optional `sharp` package is available, it also creates responsive WebP variants in `public/optimized`; otherwise it falls back to the original uploaded files while keeping lazy loading and responsive sizing enabled.

## Deploy

This project is ready for [Vercel](https://vercel.com):

- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## Contact

- Instagram: [@_rizfin](https://www.instagram.com/_rizfin)
- Email: Rizfinrinu29@gmail.com
- WhatsApp: +91 7736631071

## License

Private project. All media and content belong to the portfolio owner.
