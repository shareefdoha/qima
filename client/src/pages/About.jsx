import { Link } from 'react-router-dom';
import {
  ArrowRight, Target, Eye, Landmark, Gem, ListChecks, Columns3, CheckCircle2,
} from 'lucide-react';
import { PageHeader, LoadingBlock, ErrorBlock, SectionHeading } from '../components/ui.jsx';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';

/**
 * /about is fully database-driven: every block below comes from `about_content`
 * and is edited in the Admin Panel → About Us tab. Section keys the admin adds
 * that aren't listed here still render, in the "More about QIMA" block.
 */
const KNOWN_KEYS = ['history', 'mission', 'vision', 'values', 'objectives', 'president_message', 'leadership_pillars'];

/** Splits a newline-separated textarea into a clean list of lines. */
const toLines = (text = '') =>
  String(text)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

/** "Integrity — We hold ourselves…" → { term, detail } */
function splitTerm(line) {
  const m = line.match(/^(.{2,40}?)\s*[—–-]\s+(.*)$/);
  return m ? { term: m[1], detail: m[2] } : { term: null, detail: line };
}

export default function About() {
  const { data, loading, error, reload } = useFetch((signal) => api.about.getAll(signal));
  const s = data?.sections || {};

  const extras = (data?.list || []).filter((row) => !KNOWN_KEYS.includes(row.section_key));

  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="The Qatar Indian Management Association"
        description="A non-political, non-profit professional body bringing together Indian management practitioners working across every sector of Qatar's economy."
      />

      {loading && <LoadingBlock label="Loading About Us content…" className="py-32" />}
      {error && <ErrorBlock message={error} onRetry={reload} className="py-32" />}

      {!loading && !error && (
        <>
          {/* ------------------------------------------------ History ----- */}
          {s.history && (
            <section className="py-20 sm:py-28">
              <div className="container-qima grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-4">
                  <span className="eyebrow">
                    <span className="h-px w-6 bg-current" aria-hidden="true" />
                    Our story
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">{s.history.title}</h2>
                  <div className="mt-8 hidden lg:block">
                    <Landmark className="h-28 w-28 text-navy-100" strokeWidth={1} />
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <div className="rich-text space-y-5 text-[17px] leading-[1.8] text-navy-700">
                    {toLines(s.history.content).map((para, i) => (
                      <p key={i} className={i === 0 ? 'text-lg font-medium text-navy-900' : ''}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ------------------------------------- Mission & Vision ------- */}
          {(s.mission || s.vision) && (
            <section className="bg-navy-900 py-20 sm:py-28">
              <div className="container-qima grid gap-8 md:grid-cols-2">
                {[
                  { item: s.mission, Icon: Target, tag: 'Mission' },
                  { item: s.vision, Icon: Eye, tag: 'Vision' },
                ].map(
                  ({ item, Icon, tag }) =>
                    item && (
                      <div
                        key={tag}
                        className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-10"
                      >
                        <span className="inline-flex rounded-xl bg-accent-600/20 p-3 text-accent-400">
                          <Icon className="h-7 w-7" />
                        </span>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
                          {tag}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{item.title}</h2>
                        <p className="rich-text mt-5 text-[17px] leading-[1.8] text-navy-200">
                          {item.content}
                        </p>
                      </div>
                    )
                )}
              </div>
            </section>
          )}

          {/* ------------------------------------------- Core values ------ */}
          {s.values && (
            <section className="py-20 sm:py-28">
              <div className="container-qima">
                <SectionHeading
                  align="center"
                  eyebrow="What we stand for"
                  title={s.values.title || 'Core Values'}
                  description="The principles every QIMA member, committee and initiative is held to."
                />

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {toLines(s.values.content).map((line, i) => {
                    const { term, detail } = splitTerm(line);
                    return (
                      <div
                        key={i}
                        className="card group p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                      >
                        <span className="inline-flex rounded-xl bg-accent-50 p-3 text-accent-600 transition-colors group-hover:bg-accent-600 group-hover:text-white">
                          <Gem className="h-5 w-5" />
                        </span>
                        {term && (
                          <h3 className="mt-5 font-display text-xl font-bold text-navy-900">{term}</h3>
                        )}
                        <p className="mt-2 text-sm leading-relaxed text-navy-600">{detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* -------------------------------------------- Objectives ------ */}
          {s.objectives && (
            <section className="bg-sand-100 py-20 sm:py-28">
              <div className="container-qima grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                  <span className="eyebrow">
                    <span className="h-px w-6 bg-current" aria-hidden="true" />
                    Our mandate
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-navy-900 sm:text-4xl">
                    {s.objectives.title || 'Our Objectives'}
                  </h2>
                  <p className="mt-5 leading-relaxed text-navy-600">
                    These are the commitments the association's constitution holds the Executive Committee
                    to, and the yardstick our annual programme is measured against.
                  </p>
                  <Link to="/membership" className="btn-primary mt-8">
                    Become a member
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="lg:col-span-7">
                  <ul className="space-y-4">
                    {toLines(s.objectives.content).map((line, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 rounded-xl border border-navy-100 bg-white p-5"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                        <span className="text-[15px] leading-relaxed text-navy-700">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* ------------------------------------ Leadership pillars ------ */}
          {s.leadership_pillars && (
            <section className="py-20 sm:py-28">
              <div className="container-qima">
                <SectionHeading
                  align="center"
                  eyebrow="How we deliver"
                  title={s.leadership_pillars.title || 'Leadership Pillars'}
                />
                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {toLines(s.leadership_pillars.content).map((line, i) => {
                    const { term, detail } = splitTerm(line);
                    return (
                      <div key={i} className="rounded-2xl border-l-4 border-accent-500 bg-navy-50/60 p-6">
                        <Columns3 className="h-5 w-5 text-accent-600" />
                        {term && <h3 className="mt-4 text-lg font-bold text-navy-900">{term}</h3>}
                        <p className="mt-1.5 text-sm leading-relaxed text-navy-600">{detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ----------------------- Any extra sections the admin added ---- */}
          {extras.length > 0 && (
            <section className="bg-sand-100 py-20 sm:py-24">
              <div className="container-qima space-y-12">
                <SectionHeading eyebrow="More about QIMA" title="Additional information" />
                {extras.map((row) => (
                  <div key={row.section_key} className="card p-8">
                    <div className="flex items-center gap-3">
                      <ListChecks className="h-5 w-5 text-accent-600" />
                      <h3 className="text-2xl font-bold text-navy-900">{row.title || row.section_key}</h3>
                    </div>
                    <p className="rich-text mt-4 text-[17px] leading-[1.8] text-navy-700">{row.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ------------------------------------------------- CTA -------- */}
          <section className="bg-navy-950 py-16">
            <div className="container-qima flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">Want to meet the team?</h2>
                <p className="mt-2 text-navy-300">
                  Our board, office bearers and advisory council are all practising professionals in Qatar.
                </p>
              </div>
              <Link to="/team" className="btn-primary shrink-0">
                View Management Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
