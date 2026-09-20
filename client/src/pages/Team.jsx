import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader, LoadingBlock, ErrorBlock, EmptyBlock } from '../components/ui.jsx';
import TeamCard from '../components/TeamCard.jsx';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';

export default function Team() {
  const { data, loading, error, reload } = useFetch((signal) => api.team.list(signal));
  const [filter, setFilter] = useState('All');

  const categories = data?.categories || [];
  const grouped = data?.grouped || {};

  const visible = useMemo(
    () => (filter === 'All' ? categories : categories.filter((c) => String(c.id) === filter)),
    [filter, categories]
  );

  return (
    <>
      <PageHeader
        eyebrow="Management Team"
        title="Executive Management Team"
        description="QIMA is run entirely by volunteers — practising managers who give their time to the association alongside demanding full-time roles across Qatar."
      />

      <section className="py-16 sm:py-24">
        <div className="container-qima">
          {loading && <LoadingBlock label="Loading management team…" />}
          {error && <ErrorBlock message={error} onRetry={reload} />}

          {!loading && !error && categories.length === 0 && (
            <EmptyBlock
              icon={Users}
              title="No team members published yet"
              hint="Add members from the Admin Panel → Team tab and they'll appear here immediately."
            />
          )}

          {!loading && !error && categories.length > 0 && (
            <>
              {/* Category filter */}
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: 'All', name: 'All', member_count: data?.list?.length || 0 }, ...categories].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilter(String(cat.id))}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      filter === String(cat.id)
                        ? 'bg-navy-900 text-white shadow-sm'
                        : 'border border-navy-200 bg-white text-navy-700 hover:border-navy-900'
                    }`}
                  >
                    {cat.name}
                    <span className={`ml-2 text-xs ${filter === String(cat.id) ? 'text-white/60' : 'text-navy-400'}`}>
                      {cat.member_count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-14 space-y-20">
                {visible.map((category) => (
                  <div key={category.id}>
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-navy-100 pb-5">
                      <div>
                        <h2 className="text-2xl font-bold text-navy-900 sm:text-3xl">{category.name}</h2>
                      </div>
                      <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                        {category.member_count}{' '}
                        {category.member_count === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {grouped[category.name].map((member) => (
                        <TeamCard key={member.id} member={member} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
