import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { adminApi, assetUrl } from '../../api/client.js';
import { Banner, Field, SavingButton, TabPanel, TextArea, TextInput } from '../adminUi.jsx';
import { LoadingBlock } from '../../components/ui.jsx';
import { IMAGE_ACCEPT, IMAGE_HELPER, validateImageFile } from '../fileValidation.js';

export default function HomeAboutTab() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    adminApi.homeAbout.get().then(setForm).catch((error) => setBanner({ type: 'error', message: error.message }));
  }, []);

  useEffect(() => {
    if (!form?.image) {
      setImagePreview(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(form.image);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form?.image]);

  async function submit(event) {
    event.preventDefault();
    if (!form.title?.trim() || !form.description?.trim()) {
      setBanner({ type: 'error', message: 'Heading and brief description are required.' });
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      const saved = await adminApi.homeAbout.save(form);
      setForm(saved);
      setBanner({ type: 'success', message: 'Home About section updated.' });
    } catch (error) {
      setBanner({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  }

  return <TabPanel title="Home About Section" description="Manage the brief QIMA overview and featured image displayed on the home page.">
    <Banner {...(banner || {})} onDismiss={() => setBanner(null)} />
    {!form ? <LoadingBlock label="Loading Home About section…" /> : <form onSubmit={submit} className="max-w-3xl space-y-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
      <Field label="Heading" required hint="The prominent title in the Home page overview."><TextInput required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
      <Field label="Brief description" required hint="Use a blank line to start the second paragraph."><TextArea required rows={7} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <Field label="Featured image" hint={IMAGE_HELPER}>
        <input type="file" accept={IMAGE_ACCEPT} onChange={(e) => {
          const file = e.target.files?.[0] || null;
          const error = validateImageFile(file);
          if (error) { e.target.value = ''; setBanner({ type: 'error', message: error }); return; }
          setForm({ ...form, image: file });
        }} className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:font-medium file:text-navy-800 hover:file:bg-navy-200" />
        {(imagePreview || form.image_url) && <div className="relative mt-4 overflow-hidden rounded-2xl bg-navy-100"><img src={imagePreview || assetUrl(form.image_url)} alt="Home About preview" className="h-56 w-full object-cover" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-700"><ImageIcon className="mr-1 inline h-3.5 w-3.5" />Preview</span></div>}
      </Field>
      <div className="flex justify-end border-t border-navy-100 pt-5"><SavingButton saving={saving}>Save Home About Section</SavingButton></div>
    </form>}
  </TabPanel>;
}
