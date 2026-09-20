import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { api } from '../api/client.js';
import { assetUrl } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';
import { getYouTubeVideoId, toYouTubeEmbedUrl } from '../utils/youtubeUtils.js';

const SLIDE_MS = 7000;

/** Fallback shown only while the API is unreachable or the banners table is empty. */
const FALLBACK = [
  {
    id: 'fallback',
    title: 'Qatar Indian Management Association',
    subtitle:
      'A professional forum for Indian management practitioners building their careers — and Qatar’s future.',
    media_type: 'image',
    media_url:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
    cta_text: 'Become a Member',
    cta_link: '/membership',
  },
];

function isInternal(link = '') {
  return link.startsWith('/');
}

export default function HeroBanner() {
  const { data } = useFetch((signal) => api.banners.list(signal));
  const slides = useMemo(() => (data?.length ? data : FALLBACK), [data]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => setIndex(0), [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const go = (delta) => setIndex((i) => (i + delta + slides.length) % slides.length);

  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-navy-950">
      {slides.map((slide, i) => (
        <div
          key={slide.id ?? i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={i !== index}
        >
          {slide.media_type === 'video' && getYouTubeVideoId(slide.media_url) ? (
            <iframe
              title=""
              aria-hidden="true"
              tabIndex="-1"
              src={toYouTubeEmbedUrl(slide.media_url, { autoplay: '1', mute: '1', loop: '1', playlist: getYouTubeVideoId(slide.media_url), controls: '0', playsinline: '1' })}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[160%] w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : slide.media_type === 'video' ? (
            <video
              className="h-full w-full object-cover"
              src={assetUrl(slide.media_url)}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={assetUrl(slide.media_url)}
              alt=""
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          )}
          {/* Legibility scrim — navy, not plain black, so it sits inside the palette */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/92 via-navy-950/70 to-navy-900/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-navy-950/40" />
        </div>
      ))}

      <div className="container-qima relative flex h-full items-center">
        <div key={index} className="max-w-3xl animate-fade-up pb-10 pt-24">
          <span className="eyebrow !text-accent-400">
            <span className="h-px w-8 bg-current" aria-hidden="true" />
            Doha, State of Qatar
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {slides[index]?.title}
          </h1>

          {slides[index]?.subtitle && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-100 sm:text-xl">
              {slides[index].subtitle}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {slides[index]?.cta_text && slides[index]?.cta_link && (
              isInternal(slides[index].cta_link) ? (
                <Link to={slides[index].cta_link} className="btn-primary">
                  {slides[index].cta_text}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={slides[index].cta_link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-primary"
                >
                  {slides[index].cta_text}
                  <ArrowRight className="h-4 w-4" />
                </a>
              )
            )}
            <Link to="/about" className="btn-ghost-light">
              About the Association
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="container-qima absolute inset-x-0 bottom-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id ?? i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-10 bg-accent-500' : 'w-5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}
              className="rounded-full border border-white/25 p-2 text-white/80 transition-colors hover:bg-white hover:text-navy-900"
            >
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="rounded-full border border-white/25 p-2 text-white/80 transition-colors hover:bg-white hover:text-navy-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="rounded-full border border-white/25 p-2 text-white/80 transition-colors hover:bg-white hover:text-navy-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
