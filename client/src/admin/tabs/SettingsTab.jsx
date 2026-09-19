import { useEffect, useState } from 'react';
import { Save, Plus, Link2, Phone, BarChart3, Share2, RotateCcw } from 'lucide-react';
import { adminApi } from '../../api/client.js';
import { TabPanel, Field, TextInput, Banner, Modal, SavingButton } from '../adminUi.jsx';
import { LoadingBlock } from '../../components/ui.jsx';

/**
 * Known settings, grouped for the UI. Any key in the DB that isn't listed
 * here still shows up, under "Other settings".
 */
const GROUPS = [
  {
    title: 'Google Forms',
    Icon: Link2,
    description: 'The membership form link used on /membership and in the footer. Per-event forms live on the Events tab.',
    keys: [
      { key: 'membership_google_form_url', label: 'Membership Google Form URL', placeholder: 'https://docs.google.com/forms/d/e/…/viewform' },
      { key: 'membership_intro', label: 'Membership intro line' },
    ],
  },
  {
    title: 'Contact details',
    Icon: Phone,
    description: 'Shown in the footer and on the Contact page.',
    keys: [
      { key: 'contact_email', label: 'Email address' },
      { key: 'contact_phone', label: 'Phone number' },
      { key: 'contact_address', label: 'Postal address' },
      { key: 'contact_map_embed', label: 'Google Maps embed URL', placeholder: 'https://www.google.com/maps?q=…&output=embed' },
    ],
  },
  {
    title: 'Home page statistics',
    Icon: BarChart3,
    description: 'The four figures in the stats strip under the hero.',
    keys: [
      { key: 'stat_members', label: 'Professional members' },
      { key: 'stat_events_per_year', label: 'Events each year' },
      { key: 'stat_industries', label: 'Industries represented' },
      { key: 'stat_founded_year', label: 'Serving Qatar since' },
    ],
  },
  {
    title: 'Social profiles',
    Icon: Share2,
    description: 'Leave a field blank to hide that icon in the footer.',
    keys: [
      { key: 'social_linkedin', label: 'LinkedIn' },
      { key: 'social_instagram', label: 'Instagram' },
      { key: 'social_facebook', label: 'Facebook' },
      { key: 'social_youtube', label: 'YouTube' },
    ],
  },
];

const KNOWN = new Set(GROUPS.flatMap((g) => g.keys.map((k) => k.key)));

export default function SettingsTab() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setValues(await adminApi.settings.getAll());
      setDirty(false);
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setDirty(true);
  };

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      setValues(await adminApi.settings.saveAll(values));
      setBanner({ type: 'success', message: 'Settings saved.' });
      setDirty(false);
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingBlock label="Loading settings…" />;

  const extras = Object.keys(values).filter((k) => !KNOWN.has(k));

  return (
    <TabPanel
      title="Site settings"
      description="Global key/value configuration stored in the settings table — Google Form links, contact details, statistics and social profiles."
      actions={
        <>
          <button type="button" onClick={load} className="btn-outline !px-4 !py-2.5">
            <RotateCcw className="h-4 w-4" />
            Reload
          </button>
          <button type="button" onClick={() => setAddOpen(true)} className="btn-navy !px-4 !py-2.5">
            <Plus className="h-4 w-4" />
            New setting
          </button>
        </>
      }
    >
      <Banner {...(banner || {})} onDismiss={() => setBanner(null)} />

      <form onSubmit={save} className="space-y-6">
        {GROUPS.map(({ title, Icon, description, keys }) => (
          <section key={title} className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-navy-900">{title}</h3>
                <p className="mt-0.5 text-sm text-navy-500">{description}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {keys.map(({ key, label, placeholder }) => (
                <Field key={key} label={label} hint={key}>
                  <TextInput value={values[key] ?? ''} onChange={set(key)} placeholder={placeholder} />
                </Field>
              ))}
            </div>
          </section>
        ))}

        {extras.length > 0 && (
          <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <h3 className="font-display text-lg font-bold text-navy-900">Other settings</h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {extras.map((key) => (
                <Field key={key} label={key}>
                  <TextInput value={values[key] ?? ''} onChange={set(key)} />
                </Field>
              ))}
            </div>
          </section>
        )}

        <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 rounded-t-xl border-t border-navy-100 bg-white/95 px-1 py-4 backdrop-blur">
          <p className="text-sm text-navy-500">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <SavingButton saving={saving}>
            <Save className="h-4 w-4" />
            Save settings
          </SavingButton>
        </div>
      </form>

      <NewSettingModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={(key, value) => {
          setValues((v) => ({ ...v, [key]: value }));
          setDirty(true);
          setAddOpen(false);
        }}
      />
    </TabPanel>
  );
}

function NewSettingModal({ open, onClose, onCreate }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setKey('');
      setValue('');
    }
  }, [open]);

  return (
    <Modal open={open} title="New setting" onClose={onClose}>
      <div className="space-y-5">
        <Field label="Key" required hint="Lowercase letters, numbers and underscores.">
          <TextInput
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
            placeholder="newsletter_signup_url"
          />
        </Field>
        <Field label="Value">
          <TextInput value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
      </div>
      <div className="mt-7 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline !px-5 !py-2.5">
          Cancel
        </button>
        <button
          type="button"
          disabled={key.length < 2}
          onClick={() => onCreate(key, value)}
          className="btn-primary !px-5 !py-2.5"
        >
          Add — then Save settings
        </button>
      </div>
    </Modal>
  );
}
