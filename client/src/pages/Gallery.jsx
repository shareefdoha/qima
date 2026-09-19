import { useEffect, useMemo, useState } from 'react';
import { Images, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '../components/ui.jsx';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'photo', label: 'Photos' },
  { key: 'video', label: 'Videos' },
];

export default function Gallery() {
  const { data, loading, error, reload } = useFetch((signal) => api.gallery.list(signal));
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null); // index into `items`

  const items = useMemo(
    () => (data || []).filter((i) => filter === 'all' || i.type === filter),
    [data, filter]
  );

  useEffect(() => setLightbox(null), [filter]);

  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % items.length);
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + items.length) % items.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, items.length]);

  const active = lightbox === null ? null : items[lightbox];

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Moments from our programme"
        description="Photographs and video from QIMA conferences, masterclasses, networking forums and community initiatives."
      />

      <section className="py-16 sm:py-24">
        <div className="container-qima">
          {loading && <LoadingBlock label="Loading gallery…" />}
          {error && <ErrorBlock message={error} onRetry={reload} />}

          {!loading && !error && (
            <>
              <div className="inline-flex rounded-full border border-navy-200 bg-white p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                      filter === f.key ? 'bg-navy-900 text-white' : 'text-navy-700 hover:text-accent-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mt-12">
                {items.length === 0 ? (
                  <EmptyBlock
                    icon={Images}
                    title="Nothing in the gallery yet"
                    hint="Photos and videos added in the Admin Panel appear here."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLightbox(i)}
                        className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-navy-100 text-left"
                      >
                        {item.type === 'photo' ? (
                          <img
                            src={item.url}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                            <span className="rounded-full bg-accent-600 p-5 text-white transition-transform duration-300 group-hover:scale-110">
                              <Play className="h-7 w-7 fill-current" />
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-5 pt-12">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-navy-300">
                            {item.type}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* --------------------------------------------------- Lightbox ---- */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full border border-white/25 p-2.5 text-white transition-colors hover:bg-white hover:text-navy-900"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i - 1 + items.length) % items.length);
                }}
                className="absolute left-3 rounded-full border border-white/25 p-2.5 text-white transition-colors hover:bg-white hover:text-navy-900 sm:left-8"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i + 1) % items.length);
                }}
                className="absolute right-3 rounded-full border border-white/25 p-2.5 text-white transition-colors hover:bg-white hover:text-navy-900 sm:right-8"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <figure
            className="max-h-full w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {active.type === 'photo' ? (
              <img
                src={active.url}
                alt={active.title}
                className="mx-auto max-h-[78vh] w-auto rounded-xl object-contain"
              />
            ) : (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  title={active.title}
                  src={active.video_embed_url}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <figcaption className="mt-4 text-center text-sm text-navy-200">{active.title}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
