import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';

export function formatEventDate(value) {
  if (!value) return { day: '--', month: '', full: '' };
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { day: '--', month: '', full: String(value) };
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleString('en-GB', { month: 'short' }).toUpperCase(),
    year: d.getFullYear(),
    full: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

export default function EventCard({ event, past = false }) {
  const date = formatEventDate(event.event_date);
  const hasForm = Boolean(event.google_form_url) && !event.google_form_url.includes('REPLACE_WITH');

  return (
    <article
      className={`card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
        past ? 'opacity-80' : ''
      }`}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-navy-100">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy-800 to-navy-950" />
        )}

        <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-center shadow-card">
          <span className="block font-display text-xl font-bold leading-none text-navy-900">{date.day}</span>
          <span className="mt-0.5 block text-[10px] font-semibold tracking-widest text-accent-600">
            {date.month}
          </span>
        </div>

        {past && (
          <span className="absolute right-4 top-4 rounded-full bg-navy-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Past event
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold leading-snug text-navy-900">{event.title}</h3>

        <ul className="mt-4 space-y-2 text-sm text-navy-600">
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-accent-600" />
            {date.full}
          </li>
          {event.event_time && (
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-accent-600" />
              {event.event_time}
            </li>
          )}
          {event.location && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
              <span>{event.location}</span>
            </li>
          )}
        </ul>

        {event.description && (
          <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-navy-600">{event.description}</p>
        )}

        <div className="mt-6 pt-2">
          {past ? (
            <span className="text-sm font-medium text-navy-400">Registration closed</span>
          ) : hasForm ? (
            <a
              href={event.google_form_url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-primary w-full !py-2.5"
            >
              Register Now
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-sm font-medium text-navy-400">Registration opening soon</span>
          )}
        </div>
      </div>
    </article>
  );
}
