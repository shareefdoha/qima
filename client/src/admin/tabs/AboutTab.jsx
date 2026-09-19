import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, RotateCcw, FileText } from 'lucide-react';
import { adminApi } from '../../api/client.js';
import { TabPanel, Field, TextInput, TextArea, Banner, Modal, ConfirmDialog, SavingButton } from '../adminUi.jsx';
import { LoadingBlock } from '../../components/ui.jsx';

/** Editing guidance shown under each known section. */
const HINTS = {
  history: 'One paragraph per line. Blank lines are ignored.',
  mission: 'A single paragraph works best here.',
  vision: 'A single paragraph works best here.',
  values: 'One value per line, formatted as "Integrity — short description". The em dash splits the heading from the body.',
  objectives: 'One objective per line. Each renders as a ticked list item.',
  president_message: 'One paragraph per line. The first paragraph renders larger, as a lead.',
  leadership_pillars: 'One pillar per line, formatted as "Mentorship — short description".',
};

const ORDER = ['president_message', 'history', 'mission', 'vision', 'values', 'objectives', 'leadership_pillars'];

export default function AboutTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.about.list();
      const sorted = [...data.list].sort((a, b) => {
        const ai = ORDER.indexOf(a.section_key);
        const bi = ORDER.indexOf(b.section_key);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      setRows(sorted);
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

  const update = (key, field, value) => {
    setRows((r) => r.map((row) => (row.section_key === key ? { ...row, [field]: value } : row)));
    setDirty(true);
  };

  async function saveAll(e) {
    e?.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      await adminApi.about.saveAll(
        rows.map(({ section_key, title, content }) => ({ section_key, title, content }))
      );
      setBanner({ type: 'success', message: 'About Us page saved. Changes are live immediately.' });
      setDirty(false);
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function addSection(key, title) {
    try {
      await adminApi.about.save(key, { title, content: '' });
      setAddOpen(false);
      await load();
      setBanner({ type: 'success', message: `Section "${key}" created.` });
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    }
  }

  async function removeSection(key) {
    try {
      await adminApi.about.remove(key);
      setConfirmKey(null);
      await load();
      setBanner({ type: 'success', message: `Section "${key}" deleted.` });
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    }
  }

  if (loading) return <LoadingBlock label="Loading About Us content…" />;

  return (
    <TabPanel
      title="About Us page content"
      description="Everything on the public /about page is stored in the about_content table and edited here. No code changes required."
      actions={
        <>
          <button type="button" onClick={load} className="btn-outline !px-4 !py-2.5">
            <RotateCcw className="h-4 w-4" />
            Reload
          </button>
          <button type="button" onClick={() => setAddOpen(true)} className="btn-navy !px-4 !py-2.5">
            <Plus className="h-4 w-4" />
            New section
          </button>
        </>
      }
    >
      <Banner {...(banner || {})} onDismiss={() => setBanner(null)} />

      <form onSubmit={saveAll} className="space-y-6">
        {rows.map((row) => (
          <div key={row.section_key} className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 font-mono text-xs font-semibold text-navy-600">
                <FileText className="h-3.5 w-3.5" />
                {row.section_key}
              </span>
              <button
                type="button"
                onClick={() => setConfirmKey(row.section_key)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-navy-400 transition-colors hover:bg-accent-50 hover:text-accent-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>

            <div className="grid gap-5">
              <Field label="Heading shown on the page">
                <TextInput
                  value={row.title || ''}
                  onChange={(e) => update(row.section_key, 'title', e.target.value)}
                  placeholder="e.g. Our Mission"
                />
              </Field>

              <Field label="Content" hint={HINTS[row.section_key] || 'One paragraph or list item per line.'}>
                <TextArea
                  rows={row.section_key === 'history' || row.section_key === 'president_message' ? 9 : 6}
                  value={row.content || ''}
                  onChange={(e) => update(row.section_key, 'content', e.target.value)}
                />
              </Field>
            </div>
          </div>
        ))}

        <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 rounded-t-xl border-t border-navy-100 bg-white/95 px-1 py-4 backdrop-blur">
          <p className="text-sm text-navy-500">
            {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
          </p>
          <SavingButton saving={saving}>
            <Save className="h-4 w-4" />
            Save About Us page
          </SavingButton>
        </div>
      </form>

      <AddSectionModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={addSection} />

      <ConfirmDialog
        open={Boolean(confirmKey)}
        title="Delete section"
        message={`Delete the "${confirmKey}" section? It will disappear from the About Us page immediately. This cannot be undone.`}
        onCancel={() => setConfirmKey(null)}
        onConfirm={() => removeSection(confirmKey)}
      />
    </TabPanel>
  );
}

function AddSectionModal({ open, onClose, onCreate }) {
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (open) {
      setKey('');
      setTitle('');
    }
  }, [open]);

  return (
    <Modal open={open} title="New About Us section" onClose={onClose}>
      <div className="space-y-5">
        <Field label="Section key" required hint="Lowercase letters, numbers and underscores only — e.g. governance.">
          <TextInput
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
            placeholder="governance"
          />
        </Field>
        <Field label="Heading" required>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Governance" />
        </Field>
      </div>
      <div className="mt-7 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline !px-5 !py-2.5">
          Cancel
        </button>
        <button
          type="button"
          disabled={key.length < 2 || !title.trim()}
          onClick={() => onCreate(key, title.trim())}
          className="btn-primary !px-5 !py-2.5"
        >
          Create section
        </button>
      </div>
    </Modal>
  );
}
