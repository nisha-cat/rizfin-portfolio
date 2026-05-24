import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight, Camera, Clapperboard, Instagram, Mail, Pause, Play, Youtube, MessageCircle, Aperture } from 'lucide-react';
import { groupImagesIntoSessions } from './data/gallery-sessions';
import { displaySource, hasUploadedMedia, images, pickImage, resolveAssetPath, srcSet, videos } from './utils/media';
import './styles.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    return () => lenis.destroy();
  }, []);
}

function useGsap() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-split]').forEach((node) => {
        const split = new SplitText(node, { type: 'words,chars' });
        gsap.from(split.chars, {
          yPercent: 110,
          opacity: 0,
          rotateX: -70,
          transformOrigin: '50% 100%',
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.018,
          scrollTrigger: {
            trigger: node,
            start: 'top 88%',
          },
        });
      });

      gsap.utils.toArray('[data-reveal]').forEach((node) => {
        gsap.fromTo(
          node,
          { autoAlpha: 0, y: 70, filter: 'blur(18px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: node, start: 'top 84%' },
          },
        );
      });

      gsap.utils.toArray('[data-media]').forEach((node) => {
        gsap.fromTo(
          node,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: node, start: 'top 90%' },
          },
        );
      });

      gsap.utils.toArray('[data-parallax]').forEach((node) => {
        gsap.to(node, {
          yPercent: Number(node.dataset.parallax) || -12,
          ease: 'none',
          scrollTrigger: {
            trigger: node.closest('section') || node,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      gsap.fromTo('.hero-media', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, []);
}

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    const move = (event) => {
      gsap.to(dot.current, { x: event.clientX, y: event.clientY, duration: 0.15 });
      gsap.to(ring.current, { x: event.clientX, y: event.clientY, duration: 0.45, ease: 'power3.out' });
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </>
  );
}

function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <AnimatePresence>
      {loading && (
        <motion.div className="loader" exit={{ y: '-100%', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="loader-mark">
            CINEMATIC VISION
          </motion.div>
          <div className="loader-line"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1 }} /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Ambient() {
  return (
    <>
      <div className="film-grain" />
      <div className="cinema-bars" />
      <div className="ambient-light light-a" />
      <div className="ambient-light light-b" />
      <div className="dust">
        {Array.from({ length: 34 }).map((_, index) => <i key={index} style={{ '--x': `${(index * 29) % 100}%`, '--d': `${5 + (index % 9)}s`, '--s': `${2 + (index % 5)}px` }} />)}
      </div>
    </>
  );
}

function Picture({ image, className = '', sizes = '100vw', reveal = true, fit = 'contain' }) {
  const src = displaySource(image);
  if (!src) return <div className={`empty-media ${className}`}>Upload media to public/media</div>;
  return (
    <img
      {...(reveal ? { 'data-media': true } : {})}
      className={`${className} media-fit-${fit}`.trim()}
      src={src}
      srcSet={srcSet(image)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading="lazy"
      decoding="async"
    />
  );
}

function Video({ video, className = '', controls = false }) {
  if (!video) return null;
  return (
    <video data-media className={className} autoPlay muted loop playsInline controls={controls} preload="metadata">
      <source src={resolveAssetPath(video.src)} type={video.type} />
    </video>
  );
}

const REEL_INTERVAL_MS = 3200;

function ReelSlideshow({ className = '', playing = true }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!playing || images.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, REEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [playing]);

  if (!images.length) return null;

  return (
    <div className={`reel-slideshow ${className}`} aria-label="Portfolio showreel">
      {images.map((image, slideIndex) => (
        <Picture
          key={image.id}
          image={image}
          reveal={false}
          className={`reel-slide${slideIndex === index ? ' is-active' : ''}`}
          sizes="100vw"
        />
      ))}
    </div>
  );
}

function MediaHero() {
  const heroVideo = videos[0];
  return heroVideo ? (
    <Video video={heroVideo} className="hero-media media-fit-contain" />
  ) : (
    <Picture image={pickImage(0)} className="hero-media" sizes="100vw" fit="contain" />
  );
}

function Hero() {
  return (
    <section className="hero min-h-screen">
      <div className="hero-stage">
        <MediaHero />
        <div className="hero-overlay" />
      </div>
      <nav className="nav">
        <Aperture size={24} />
        <span>Visual Storyteller</span>
        <a href="#contact">Book a Shoot</a>
      </nav>
      <div className="hero-copy">
        <p data-reveal className="eyebrow">Creative Visual Storytelling</p>
        <h1>
          <span data-split>PHOTOGRAPHER</span>
          <span data-split>VIDEOGRAPHER</span>
        </h1>
        <div data-reveal className="hero-actions">
          <a href="#work" className="button primary">View Work <ArrowUpRight size={18} /></a>
          <a href="#showreel" className="button ghost"><Play size={17} /> Watch Reel</a>
        </div>
      </div>
      <div className="scroll-note">Scroll</div>
    </section>
  );
}

function About() {
  const skills = ['Portrait Photography', 'Cinematic Videography', 'Editing', 'Color Grading', 'Storytelling', 'Drone Cinematography'];
  return (
    <section className="section about">
      <div className="section-kicker">About</div>
      <div className="about-grid">
        <div>
          <h2 data-split>Frames that feel remembered before they are seen.</h2>
          <p data-reveal>
            A luxury visual portfolio shaped for intimate portraits, high-emotion films, and editorial campaigns. Every sequence is treated like a scene: light, rhythm, color, and silence working together.
          </p>
          <div className="counters" data-reveal>
            {['3+ Years', '30+ Stories', '20+ Brands'].map((item) => <strong key={item}>{item}</strong>)}
          </div>
        </div>
        <div className="portrait-stack" data-parallax="-8">
          <div className="media-frame portrait-frame">
            <Picture image={pickImage(1)} className="portrait-main" sizes="(max-width: 768px) 100vw, 42vw" fit="contain" />
          </div>
          <div className="gear-card glass" data-reveal>
            <Camera />
            <span>Full-frame cinema bodies, prime lenses, aerial rigs, calibrated color workflow.</span>
          </div>
        </div>
      </div>
      <div className="skills-grid">
        {skills.map((skill, index) => (
          <motion.div whileHover={{ y: -8, scale: 1.02 }} className="skill-card glass" data-reveal key={skill}>
            <span>0{index + 1}</span>
            <h3>{skill}</h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Portfolio() {
  const sessions = useMemo(() => groupImagesIntoSessions(images), []);

  return (
    <section id="work" className="section portfolio">
      <div className="portfolio-intro">
        <p className="section-kicker">Portfolio</p>
        <h2 data-split>Curated collections across disciplines.</h2>
        <p data-reveal className="portfolio-lead">
          Work grouped by genre — street, landscape, model, portrait, and editorial — with every frame shown in full, uncropped.
        </p>
        <nav className="session-nav" data-reveal aria-label="Jump to collection">
          {sessions.map((session) => (
            <a key={session.id} href={`#session-${session.id}`}>
              {session.title}
            </a>
          ))}
        </nav>
      </div>

      {sessions.map((session) => (
        <div className="portfolio-session" id={`session-${session.id}`} key={session.id}>
          <header className="session-header">
            <p className="section-kicker">{String(session.images.length).padStart(2, '0')} Images</p>
            <h3>{session.title}</h3>
          </header>
          <div className="portfolio-grid">
            {session.images.map((image) => (
              <figure className="portfolio-item" key={image.id}>
                <div className="media-frame">
                  <Picture
                    image={image}
                    className="portfolio-img"
                    sizes="(max-width: 680px) 100vw, (max-width: 1200px) 50vw, 420px"
                    fit="contain"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function Showreel() {
  const [playing, setPlaying] = useState(true);
  return (
    <section id="showreel" className="showreel">
      <p className="section-kicker showreel-kicker">Motion Reel</p>
      <div className="showreel-frame">
        {videos[0] ? (
          <Video video={videos[0]} className="showreel-video" controls />
        ) : (
          <ReelSlideshow className="showreel-video" playing={playing} />
        )}
        <div className="showreel-overlay" />
        <button
          type="button"
          className="play-button"
          aria-label={playing ? 'Pause reel' : 'Play reel'}
          onClick={() => setPlaying((current) => !current)}
        >
          {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        </button>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    ['Every frame felt expensive, intimate, and completely honest.', 'Editorial Client'],
    ['The film carried the day exactly as we remember it: warm, alive, cinematic.', 'Wedding Couple'],
    ['A rare eye for rhythm, shadow, and story.', 'Creative Director'],
  ];
  return (
    <section className="section testimonials">
      <p className="section-kicker">Testimonials</p>
      <div className="testimonial-grid">
        {quotes.map(([quote, author]) => (
          <div className="testimonial glass" data-reveal key={author}>
            <p>“{quote}”</p>
            <span>{author}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="contact-copy">
        <p className="section-kicker">Contact</p>
        <h2 data-split>Let’s Create Something Cinematic</h2>
        <div className="contact-links" data-reveal>
          <a href="https://instagram.https://www.instagram.com/_rizfin?igsh=MTJkZjE4MmR4d2s0OQ==" aria-label="Instagram"><Instagram /> Instagram</a>
          
          <a href="mailto:Rizfinrinu29@gmail.com" aria-label="Email"><Mail /> Email</a>
          <a href="https://wa.me/7736631071" aria-label="WhatsApp"><MessageCircle /> WhatsApp</a>
        </div>
      </div>
      <div className="contact-visual">
        <Picture image={pickImage(0)} className="contact-portrait" sizes="320px" fit="contain" />
        <div className="qr glass">
          <Clapperboard />
          <div className="qr-code" aria-label="QR code decorative block">
            {Array.from({ length: 49 }).map((_, i) => <i key={i} className={(i * 7 + i) % 3 ? '' : 'on'} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function MediaNotice() {
  if (hasUploadedMedia) return null;
  return (
    <div className="media-notice">
      Add your photos and videos to <strong>public/media</strong>, then run <strong>npm run prepare-media</strong>. The site is ready to use only those uploads.
    </div>
  );
}

function App() {
  useLenis();
  useGsap();
  return (
    <>
      <LoadingScreen />
      <Cursor />
      <Ambient />
      <MediaNotice />
      <Hero />
      <About />
      <Portfolio />
      <Showreel />
      <Testimonials />
      <Contact />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
