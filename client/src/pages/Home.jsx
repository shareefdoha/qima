import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, CalendarDays, Building2, Award,
  GraduationCap, Handshake, Lightbulb, HeartHandshake,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner.jsx';
import EventCard from '../components/EventCard.jsx';
import { SectionHeading, LoadingBlock } from '../components/ui.jsx';
import { api, assetUrl } from '../api/client.js';
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
  const { data: homeAbout } = useFetch((signal) => api.homeAbout.get(signal));
  const { data: events, loading: eventsLoading } = useFetch((signal) =>
    api.events.list('?scope=upcoming&limit=3', signal)
  );
  const { data: team } = useFetch((signal) => api.team.list(signal));

  const aboutImage = homeAbout?.image_url || settings.home_about_image_url || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85';
  const overview = homeAbout?.description?.split('\n').filter(Boolean) || [
    'The Qatar Indian Management Association brings together Indian management professionals working across Qatar’s diverse economy. We create a trusted space for people to learn, exchange ideas and build meaningful professional relationships.',
    'As an affiliate of the All India Management Association, QIMA connects members with knowledge, leadership development and a community committed to contributing positively to Qatar’s future.',
  ];

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

      {/* ---------------------------------------- About QIMA overview ----- */}
      <section className="border-y border-navy-100 bg-slate-50 py-20 sm:py-28">
        <div className="container-qima grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-3 rounded-[2rem] border border-accent-500/20 bg-accent-50 sm:-inset-4" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-3xl bg-navy-100 shadow-lift">
              <img src={assetUrl(aboutImage)} alt="QIMA members at a professional event" className="h-[320px] w-full object-cover sm:h-[420px]" loading="lazy" />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="eyebrow !text-accent-600">
              <span className="h-px w-7 bg-current" aria-hidden="true" />
              About QIMA
            </span>
            <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight text-navy-900 sm:text-4xl lg:text-[2.75rem]">
              {homeAbout?.title || 'Empowering Management Professionals in Qatar'}
            </h2>
            <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-navy-700 sm:text-lg">
              {overview.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <Link to="/about" className="btn-primary mt-9">
              Read More About Us
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
