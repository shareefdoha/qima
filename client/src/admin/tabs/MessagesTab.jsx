import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, RotateCcw, Inbox } from 'lucide-react';
import { adminApi } from '../../api/client.js';
import { TabPanel, Banner, ConfirmDialog } from '../adminUi.jsx';
import { LoadingBlock, EmptyBlock } from '../../components/ui.jsx';

export default function MessagesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null);
  const [open, setOpen] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await adminApi.messages.list());
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openMessage(msg) {
    setOpen(open?.id === msg.id ? null : msg);
    if (!msg.is_read) {
      try {
        await adminApi.messages.markRead(msg.id);
        setItems((list) => list.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
      } catch {
        /* non-critical */
      }
    }
  }

  const unread = items.filter((m) => !m.is_read).length;

  return (
    <TabPanel
      title="Contact messages"
      description="Submissions from the public contact form, newest first."
      actions={
        <button type="button" onClick={load} className="btn-outline !px-4 !py-2.5">
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      }
    >
      <Banner {...(banner || {})} onDismiss={() => setBanner(null)} />

      {loading ? (
        <LoadingBlock label="Loading messages…" />
      ) : items.length === 0 ? (
        <EmptyBlock icon={Inbox} title="No messages yet" hint="Enquiries from the Contact page land here." />
      ) : (
        <>
          {unread > 0 && (
            <p className="mb-5 text-sm text-navy-600">
              <span className="font-semibold text-accent-600">{unread}</span> unread message
              {unread === 1 ? '' : 's'}
            </p>
          )}

          <div className="space-y-3">
            {items.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border bg-white shadow-card transition-colors ${
                  m.is_read ? 'border-navy-100' : 'border-accent-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => openMessage(m)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      m.is_read ? 'bg-navy-50 text-navy-400' : 'bg-accent-50 text-accent-600'
                    }`}
                  >
                    {m.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className={`truncate ${m.is_read ? 'text-navy-800' : 'font-semibold text-navy-900'}`}>
                        {m.name}
                      </p>
                      <span className="truncate text-xs text-navy-400">{m.email}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-navy-500">
                      {m.subject || '(no subject)'} — {m.message}
                    </p>
                  </div>

                  <span className="hidden shrink-0 text-xs text-navy-400 sm:block">
                    {new Date(m.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </button>

                {open?.id === m.id && (
                  <div className="border-t border-navy-100 px-5 py-5">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-navy-700">{m.message}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your enquiry'}`)}`}
                        className="btn-primary !px-4 !py-2 !text-xs"
                      >
                        Reply by email
                      </a>
                      <button
                        type="button"
                        onClick={() => setConfirm(m)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-navy-400 hover:bg-accent-50 hover:text-accent-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                      <span className="ml-auto text-xs text-navy-400">
                        Received {new Date(m.created_at).toLocaleString('en-GB')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete message"
        message={`Delete the message from ${confirm?.name}? This cannot be undone.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          try {
            await adminApi.messages.remove(confirm.id);
            setOpen(null);
            setConfirm(null);
            await load();
            setBanner({ type: 'success', message: 'Message deleted.' });
          } catch (err) {
            setBanner({ type: 'error', message: err.message });
          }
        }}
      />
    </TabPanel>
  );
}
