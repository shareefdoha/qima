import { useState } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, ExternalLink, ImageIcon } from 'lucide-react';
import { adminApi, assetUrl } from '../../api/client.js';
import { useResource } from '../useResource.js';
import { TabPanel, Field, TextInput, TextArea, Banner, Modal, ConfirmDialog, SavingButton } from '../adminUi.jsx';
import { LoadingBlock, EmptyBlock } from '../../components/ui.jsx';
import { formatEventDate } from '../../components/EventCard.jsx';
import { IMAGE_ACCEPT, IMAGE_HELPER, validateImageFile } from '../fileValidation.js';

const BLANK = {
  title: '',
  event_date: '',
  event_time: '',
  location: '',
  description: '',
  image_url: '',
  google_form_url: '',
};

export default function EventsTab() {
  const r = useResource(adminApi.events);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!editing.title?.trim() || !editing.event_date || !editing.location?.trim() || !editing.description?.trim() || (!editing.image && !editing.image_url)) {
      r.setBanner({ type: 'error', message: 'Title, date, location, description, and cover image are required.' });
      return;
    }
    const payload = { ...editing, event_date: String(editing.event_date).slice(0, 10) };
    const ok = await r.save(editing.id, payload, editing.id ? 'Event updated.' : 'Event created.');
    if (ok) setEditing(null);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <TabPanel
      title="Events"
      description="Seminars, conferences and forums. Each event carries its own Google Form link for registration."
      actions={
        <button type="button" onClick={() => setEditing({ ...BLANK })} className="btn-primary !px-4 !py-2.5">
          <Plus className="h-4 w-4" />
          Add event
        </button>
      }
    >
      <Banner {...(r.banner || {})} onDismiss={() => r.setBanner(null)} />

      {r.loading ? (
        <LoadingBlock label="Loading events…" />
      ) : r.items.length === 0 ? (
        <EmptyBlock icon={CalendarDays} title="No events yet" hint="Published events appear on the home page and /events." />
      ) : (
        <div className="space-y-4">
          {r.items.map((ev) => {
            const d = formatEventDate(ev.event_date);
            const upcoming = String(ev.event_date).slice(0, 10) >= today;
            return (
              <div
                key={ev.id}
                className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:flex-row sm:items-center"
              >
                <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-navy-900 py-3 text-white">
                  <span className="font-display text-xl font-bold leading-none">{d.day}</span>
                  <span className="mt-1 text-[10px] font-semibold tracking-widest text-accent-400">{d.month}</span>
                  <span className="mt-0.5 text-[10px] text-navy-400">{d.year}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-navy-900">{ev.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        upcoming ? 'bg-emerald-50 text-emerald-700' : 'bg-navy-100 text-navy-500'
                      }`}
                    >
                      {upcoming ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-navy-500">
                    {[ev.event_time, ev.location].filter(Boolean).join(' · ') || '—'}
                  </p>
                  {ev.google_form_url && (
                    <a
                      href={ev.google_form_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent-600 hover:underline"
                    >
                      Registration form
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...ev, event_date: String(ev.event_date).slice(0, 10) })}
                    aria-label="Edit event"
                    className="rounded-lg p-2 text-navy-400 hover:bg-navy-100 hover:text-navy-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(ev)}
                    aria-label="Delete event"
                    className="rounded-lg p-2 text-navy-400 hover:bg-accent-50 hover:text-accent-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={Boolean(editing)} wide title={editing?.id ? 'Edit event' : 'Add event'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <Field label="Event title" required>
              <TextInput required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Date" required>
                <TextInput
                  type="date"
                  required
                  value={editing.event_date || ''}
                  onChange={(e) => setEditing({ ...editing, event_date: e.target.value })}
                />
              </Field>
              <Field label="Time" hint="Free text — shown exactly as typed.">
                <TextInput
                  value={editing.event_time || ''}
                  onChange={(e) => setEditing({ ...editing, event_time: e.target.value })}
                  placeholder="06:30 PM – 09:00 PM"
                />
              </Field>
            </div>

            <Field label="Location" required>
              <TextInput
                required
                value={editing.location || ''}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                placeholder="QIMA Hall, Al Sadd, Doha"
              />
            </Field>

            <Field label="Description" required>
              <TextArea
                required
                rows={4}
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>

            <Field label="Cover image" required hint={IMAGE_HELPER}>
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  const error = validateImageFile(file);
                  if (error) { e.target.value = ''; r.setBanner({ type: 'error', message: error }); return; }
                  setEditing({ ...editing, image: file });
                }}
                className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:font-medium file:text-navy-800 hover:file:bg-navy-200"
              />
              {(editing.image || editing.image_url) && (
                <div className="relative mt-3 overflow-hidden rounded-xl bg-navy-100">
                  <img src={editing.image ? URL.createObjectURL(editing.image) : assetUrl(editing.image_url)} alt="Event cover preview" className="h-40 w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-700"><ImageIcon className="mr-1 inline h-3.5 w-3.5" />Preview</span>
                </div>
              )}
            </Field>

            <Field label="Cover image URL" hint="Optional alternative to upload. A newly uploaded file takes priority.">
              <TextInput
                value={editing.image_url || ''}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                placeholder="https://…/event.jpg"
              />
            </Field>

            <Field
              label="Google Form URL"
              hint="Paste the form's share link. The Register button only appears when this is set."
            >
              <TextInput
                value={editing.google_form_url || ''}
                onChange={(e) => setEditing({ ...editing, google_form_url: e.target.value })}
                placeholder="https://docs.google.com/forms/d/e/…/viewform"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline !px-5 !py-2.5">
                Cancel
              </button>
              <SavingButton saving={r.saving}>{editing.id ? 'Save changes' : 'Add event'}</SavingButton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete event"
        message={`Delete "${confirm?.title}"? This cannot be undone.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await r.remove(confirm.id, 'Event deleted.');
          setConfirm(null);
        }}
      />
    </TabPanel>
  );
}
