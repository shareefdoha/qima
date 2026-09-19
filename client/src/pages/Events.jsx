import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '../components/ui.jsx';
import EventCard from '../components/EventCard.jsx';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';

export default function Events() {
  const { data, loading, error, reload } = useFetch((signal) => api.events.grouped(signal));
  const [tab, setTab] = useState('upcoming');

  const upcoming = data?.upcoming || [];
  const past = data?.past || [];
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Seminars, conferences & forums"
        description="QIMA runs a year-round programme of professional development and networking events across Doha. Registration for each event is handled through its own form."
      />

      <section className="py-16 sm:py-24">
        <div className="container-qima">
          {loading && <LoadingBlock label="Loading events…" />}
          {error && <ErrorBlock message={error} onRetry={reload} />}

          {!loading && !error && (
            <>
              <div className="inline-flex rounded-full border border-navy-200 bg-white p-1">
                {[
                  { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
                  { key: 'past', label: 'Past events', count: past.length },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                      tab === t.key ? 'bg-navy-900 text-white' : 'text-navy-700 hover:text-accent-600'
                    }`}
                  >
                    {t.label}
                    <span className={`ml-2 text-xs ${tab === t.key ? 'text-white/60' : 'text-navy-400'}`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-12">
                {list.length === 0 ? (
                  <EmptyBlock
                    icon={CalendarDays}
                    title={tab === 'upcoming' ? 'No upcoming events yet' : 'No past events recorded'}
                    hint={
                      tab === 'upcoming'
                        ? 'New events are published here as soon as dates are confirmed.'
                        : 'Completed events will be archived on this tab.'
                    }
                  />
                ) : (
                  <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                    {list.map((event) => (
                      <EventCard key={event.id} event={event} past={tab === 'past'} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
