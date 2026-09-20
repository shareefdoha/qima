import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, CalendarDays, Building2, Award, Quote,
  GraduationCap, Handshake, Lightbulb, HeartHandshake, Briefcase, Target,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner.jsx';
import EventCard from '../components/EventCard.jsx';
import { SectionHeading, LoadingBlock } from '../components/ui.jsx';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';
import { useSettings } from '../context/SettingsContext.jsx';

const HIGHLIGHTS = [
  {
    Icon: GraduationCap,
    title: 'Professional Development',
    text: 'Seminars, masterclasses and certification guidance across core management disciplines, year-round.',
  },
  {
    Icon: Handshake,
    title: 'Networking & Community',
    text: 'Structured forums that connect members across industries, functions and levels of seniority.',
  },
  {
    Icon: Lightbulb,
    title: 'Mentorship',
    text: 'Senior leaders paired with emerging managers for guided, practical career development.',
  },
  {
    Icon: HeartHandshake,
    title: 'Social Responsibility',
    text: 'Volunteer-led initiatives that give back to the wider community here in Qatar.',
  },
];

const STAT_META = [
  { key: 'stat_members', label: 'Professional Members', Icon: Users, suffix: '+' },
  { key: 'stat_events_per_year', label: 'Events Each Year', Icon: CalendarDays, suffix: '' },
  { key: 'stat_industries', label: 'Industries Represented', Icon: Building2, suffix: '' },
  { key: 'stat_founded_year', label: 'Serving Qatar Since', Icon: Award, suffix: '' },
];

export default function Home() {
  const { settings } = useSettings();
  const { data: about } = useFetch((signal) => api.about.getAll(signal));
  const { data: events, loading: eventsLoading } = useFetch((signal) =>
    api.events.list('?scope=upcoming&limit=3', signal)
  );
  const { data: team } = useFetch((signal) => api.team.list(signal));

  const president = about?.sections?.president_message;
  const mission = about?.sections?.mission;
  const vision = about?.sections?.vision;

  const leadership = (team?.list || [])
    .filter((m) => ['Management Board', 'Office Bearers'].includes(m.role_category))
    .slice(0, 4);

  return (
    <>
      <HeroBanner />

      {/* ------------------------------------------------- Quick stats ---- */}
      <section className="relative z-10 -mt-16 sm:-mt-20">
        <div className="container-qima">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-navy-100 shadow-lift lg:grid-cols-4">
            {STAT_META.map(({ key, label, Icon, suffix }) => (
              <div key={key} className="bg-white px-5 py-7 text-center sm:px-6 sm:py-9">
                <Icon className="mx-auto h-6 w-6 text-accent-600" />
                <p className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                  {settings[key] || '—'}
                  {settings[key] && suffix}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-navy-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------- Welcome message ----- */}
      <section className="py-20 sm:py-28">
        <div className="container-qima grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <span className="eyebrow">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              Welcome
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-navy-900 sm:text-4xl lg:text-[2.75rem]">
              {president?.title || 'Message from the President'}
            </h2>
            <div className="mt-8 rounded-2xl border border-navy-100 bg-sand-100 p-6">
              <Quote className="h-7 w-7 text-accent-500" />
              <p className="mt-3 font-display text-lg italic leading-relaxed text-navy-800">
                Professionals grow fastest when they learn from one another — QIMA exists to make that
                exchange happen deliberately.
              </p>
              {leadership[0] && (
                <div className="mt-6 flex items-center gap-3 border-t border-navy-200/60 pt-5">
                  {leadership[0].image_url && (
                    <img
                      src={leadership[0].image_url}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{leadership[0].name}</p>
                    <p className="text-xs text-navy-500">{leadership[0].designation}, QIMA</p>
                  </div>
 <div className="lg:col-span-6">
    <div className="overflow-hidden rounded-3xl">
      <img
        src="/images/president.jpg"
        alt="President of QIMA"
        className="h-[420px] w-full object-cover"
        loading="lazy"
      />
    </div>
  </div>
                  
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            {president?.content ? (
              <div className="rich-text space-y-5 text-[17px] leading-[1.75] text-navy-700">
                {president.content.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className={i === 0 ? 'text-lg font-medium text-navy-900' : ''}>
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <LoadingBlock className="py-16" label="Loading welcome message…" />
            )}

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {[{ item: mission, Icon: Target }, { item: vision, Icon: Briefcase }].map(
                ({ item, Icon }, i) =>
                  item && (
                    <div key={i} className="card p-6">
                      <Icon className="h-6 w-6 text-accent-600" />
                      <h3 className="mt-4 text-lg font-bold text-navy-900">{item.title}</h3>
                      <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-navy-600">
                        {item.content}
                      </p>
                    </div>
                  )
              )}
            </div>

            <Link to="/about" className="btn-outline mt-8">
              Read more about QIMA
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Highlights ----- */}
      <section className="bg-navy-900 py-20 sm:py-28">
        <div className="container-qima">
          <SectionHeading
            light
            align="center"
            eyebrow="What we do"
            title="Four pillars of the association"
            description="Everything QIMA runs sits under one of these four commitments to our members and to Qatar."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-300 hover:border-accent-500/50 hover:bg-white/[0.08]"
              >
                <span className="inline-flex rounded-xl bg-accent-600/15 p-3 text-accent-400 transition-colors group-hover:bg-accent-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------ Leadership snapshot --- */}
      {leadership.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-qima">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Leadership"
                title="Meet the people behind QIMA"
                description="An elected board and volunteer committee of practising managers from across Qatar's industries."
              />
              <Link to="/team" className="btn-outline">
                Full management team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {leadership.map((m) => (
                <div key={m.id} className="group text-center">
                  <div className="mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-navy-100">
                    {m.image_url ? (
                      <img
                        src={m.image_url}
                        alt={m.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-navy-700 to-navy-950" />
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-navy-900">{m.name}</h3>
                  <p className="text-sm text-accent-600">{m.designation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------- Upcoming events ------ */}
      <section className="bg-sand-100 py-20 sm:py-28">
        <div className="container-qima">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="What's next"
              title="Upcoming events"
              description="Seminars, masterclasses and networking forums open to members and invited guests."
            />
            <Link to="/events" className="btn-outline">
              View all events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-14">
            {eventsLoading ? (
              <LoadingBlock label="Loading events…" />
            ) : events?.length ? (
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-navy-200 bg-white/60 py-14 text-center text-navy-500">
                No upcoming events published yet — check back shortly.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- CTA ------ */}
      <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 50%, #c32b41 0, transparent 40%), radial-gradient(circle at 80% 30%, #274069 0, transparent 45%)',
          }}
        />
        <div className="container-qima relative flex flex-col items-center gap-8 text-center">
          <h2 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Join a community of management professionals shaping Qatar
          </h2>
          <p className="max-w-2xl text-lg text-navy-200">
            Membership is open to management practitioners of Indian origin working in Qatar, across every
            industry and level of seniority.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/membership" className="btn-primary">
              Apply for Membership
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-ghost-light">
              Talk to the Secretariat
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
