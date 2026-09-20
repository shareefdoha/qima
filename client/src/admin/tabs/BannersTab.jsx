import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Video, Eye, EyeOff } from 'lucide-react';
import { adminApi, assetUrl } from '../../api/client.js';
import { useResource } from '../useResource.js';
import {
  TabPanel, Field, TextInput, TextArea, Select, Toggle, Banner, Modal, ConfirmDialog, SavingButton,
} from '../adminUi.jsx';
import { LoadingBlock, EmptyBlock } from '../../components/ui.jsx';
import { getYouTubeVideoId, toYouTubeEmbedUrl } from '../../utils/youtubeUtils.js';

const BLANK = {
  title: '',
  subtitle: '',
  media_type: 'image',
  media_url: '',
  cta_text: '',
  cta_link: '',
  is_active: true,
  display_order: 0,
};

export default function BannersTab() {
  const r = useResource(adminApi.banners);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function toggle(id) {
    try {
      await adminApi.banners.toggle(id);
      await r.reload();
    } catch (err) {
      r.setBanner({ type: 'error', message: err.message });
    }
  }

  async function submit(e) {
    e.preventDefault();
    const ok = await r.save(editing.id, editing, editing.id ? 'Banner updated.' : 'Banner added.');
    if (ok) setEditing(null);
  }

  return (
    <TabPanel
      title="Hero banners"
      description="Slides on the home page hero. Each can be a photo or a background video, with its own headline and call-to-action."
      actions={
        <button type="button" onClick={() => setEditing({ ...BLANK })} className="btn-primary !px-4 !py-2.5">
          <Plus className="h-4 w-4" />
          Add banner
        </button>
      }
    >
      <Banner {...(r.banner || {})} onDismiss={() => r.setBanner(null)} />

      {r.loading ? (
        <LoadingBlock label="Loading banners…" />
      ) : r.items.length === 0 ? (
        <EmptyBlock icon={ImageIcon} title="No banners yet" hint="Add one and it appears on the home page hero." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {r.items.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
              <div className="relative aspect-21/9 bg-navy-100">
                {b.media_type === 'video' ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                    <Video className="h-8 w-8 text-white/50" />
                  </div>
                ) : b.media_url ? (
                  <img src={assetUrl(b.media_url)} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="h-full w-full bg-navy-200" />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy-700">
                  #{b.display_order} · {b.media_type}
                </span>
                {!b.is_active && (
                  <span className="absolute right-3 top-3 rounded-full bg-navy-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Hidden
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-navy-900">{b.title || <em>Untitled</em>}</h3>
                {b.subtitle && <p className="mt-1 line-clamp-2 text-sm text-navy-500">{b.subtitle}</p>}
                {b.cta_text && (
                  <p className="mt-3 text-xs text-navy-400">
                    CTA: <span className="font-medium text-navy-600">{b.cta_text}</span> → {b.cta_link}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-2">
                  <button type="button" onClick={() => setEditing({ ...b })} className="btn-outline !px-3.5 !py-2 !text-xs">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button type="button" onClick={() => toggle(b.id)} className="btn-outline !px-3.5 !py-2 !text-xs">
                    {b.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {b.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(b)}
                    className="ml-auto rounded-lg p-2 text-navy-400 hover:bg-accent-50 hover:text-accent-700"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} wide title={editing?.id ? 'Edit banner' : 'Add banner'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <Field label="Headline" required>
              <TextInput
                required
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>

            <Field label="Subtitle">
              <TextArea
                rows={3}
                value={editing.subtitle || ''}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Media type">
                <Select
                  value={editing.media_type}
                  onChange={(e) => setEditing({ ...editing, media_type: e.target.value })}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                {editing.media_type === 'image' ? (
                  <Field label="Image upload" hint="Upload a hero image (maximum 8 MB). Leave blank to keep the existing image.">
                    <input type="file" accept="image/*" onChange={(e) => setEditing({ ...editing, image: e.target.files?.[0] || null })} className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:font-medium file:text-navy-800 hover:file:bg-navy-200" />
                    {(editing.image || editing.media_url) && <img src={editing.image ? URL.createObjectURL(editing.image) : assetUrl(editing.media_url)} alt="Preview" className="mt-3 h-28 w-full rounded-xl object-cover" />}
                  </Field>
                ) : (
                  <Field label="YouTube or MP4 video URL" required hint="Paste any YouTube watch/shorts/embed URL, or a direct MP4 URL.">
                    <TextInput required value={editing.media_url || ''} onChange={(e) => setEditing({ ...editing, media_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
                    {getYouTubeVideoId(editing.media_url) && <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black"><iframe title="YouTube preview" src={toYouTubeEmbedUrl(editing.media_url, { mute: '1' })} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" /></div>}
                  </Field>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Button text">
                <TextInput
                  value={editing.cta_text || ''}
                  onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })}
                  placeholder="Become a Member"
                />
              </Field>
              <Field label="Button link" hint="Internal path like /membership, or a full https:// URL.">
                <TextInput
                  value={editing.cta_link || ''}
                  onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })}
                  placeholder="/membership"
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl bg-navy-50 p-4">
              <Field label="Display order">
                <TextInput
                  type="number"
                  className="!w-28"
                  value={editing.display_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })}
                />
              </Field>
              <Toggle
                checked={Boolean(editing.is_active)}
                onChange={(v) => setEditing({ ...editing, is_active: v })}
                label="Active on the home page"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline !px-5 !py-2.5">
                Cancel
              </button>
              <SavingButton saving={r.saving}>{editing.id ? 'Save changes' : 'Add banner'}</SavingButton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete banner"
        message={`Delete "${confirm?.title || 'this banner'}"? This cannot be undone.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await r.remove(confirm.id, 'Banner deleted.');
          setConfirm(null);
        }}
      />
    </TabPanel>
  );
}
