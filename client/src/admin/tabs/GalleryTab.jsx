import { useState } from 'react';
import { Plus, Pencil, Trash2, Images, Play } from 'lucide-react';
import { adminApi, assetUrl } from '../../api/client.js';
import { useResource } from '../useResource.js';
import { TabPanel, Field, TextInput, Select, Banner, Modal, ConfirmDialog, SavingButton } from '../adminUi.jsx';
import { LoadingBlock, EmptyBlock } from '../../components/ui.jsx';
import { getYouTubeVideoId, toYouTubeEmbedUrl, youTubeThumbnail } from '../../utils/youtubeUtils.js';
import { IMAGE_ACCEPT, IMAGE_HELPER, validateImageFile, YOUTUBE_HELPER } from '../fileValidation.js';

const BLANK = { title: '', type: 'photo', url: '', video_embed_url: '' };

export default function GalleryTab() {
  const r = useResource(adminApi.gallery);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!editing.title?.trim()) {
      r.setBanner({ type: 'error', message: 'Gallery title is required.' });
      return;
    }
    if (editing.type === 'photo' && !editing.image && !editing.url) {
      r.setBanner({ type: 'error', message: 'Upload a gallery photo before saving.' });
      return;
    }
    if (editing.type === 'video' && !getYouTubeVideoId(editing.video_embed_url)) {
      r.setBanner({ type: 'error', message: 'Enter a valid full YouTube video URL.' });
      return;
    }
    const ok = await r.save(editing.id, editing, editing.id ? 'Item updated.' : 'Item added.');
    if (ok) setEditing(null);
  }

  return (
    <TabPanel
      title="Gallery"
      description="Upload local photos or add any normal YouTube link for videos."
      actions={
        <button type="button" onClick={() => setEditing({ ...BLANK })} className="btn-primary !px-4 !py-2.5">
          <Plus className="h-4 w-4" />
          Add item
        </button>
      }
    >
      <Banner {...(r.banner || {})} onDismiss={() => r.setBanner(null)} />

      {r.loading ? (
        <LoadingBlock label="Loading gallery…" />
      ) : r.items.length === 0 ? (
        <EmptyBlock icon={Images} title="Gallery is empty" hint="Add photos or video embeds to populate /gallery." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {r.items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
              <div className="relative aspect-4/3 bg-navy-100">
                {item.type === 'photo' ? (
                  <img src={assetUrl(item.url)} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                    {youTubeThumbnail(item.video_embed_url) && <img src={youTubeThumbnail(item.video_embed_url)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />}
                    <Play className="h-8 w-8 text-white/60" />
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy-700">
                  {item.type}
                </span>
              </div>
              <div className="flex items-center gap-2 p-4">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-navy-900">{item.title}</p>
                <button
                  type="button"
                  onClick={() => setEditing({ ...item })}
                  aria-label="Edit item"
                  className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(item)}
                  aria-label="Delete item"
                  className="rounded-lg p-1.5 text-navy-400 hover:bg-accent-50 hover:text-accent-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit gallery item' : 'Add gallery item'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <Field label="Title" required>
              <TextInput required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>

            <Field label="Type">
              <Select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </Select>
            </Field>

            {editing.type === 'photo' ? (
              <Field label="Photo upload" required hint={IMAGE_HELPER}>
                <input type="file" accept={IMAGE_ACCEPT} onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  const error = validateImageFile(file);
                  if (error) { e.target.value = ''; r.setBanner({ type: 'error', message: error }); return; }
                  setEditing({ ...editing, image: file });
                }} className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:font-medium file:text-navy-800 hover:file:bg-navy-200" />
                {(editing.image || editing.url) && <img src={editing.image ? URL.createObjectURL(editing.image) : assetUrl(editing.url)} alt="Preview" className="mt-3 h-28 w-full rounded-xl object-cover" />}
              </Field>
            ) : (
              <Field
                label="YouTube video URL"
                required
                hint={YOUTUBE_HELPER}
              >
                <TextInput
                  required
                  value={editing.video_embed_url || ''}
                  onChange={(e) => setEditing({ ...editing, video_embed_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
                {toYouTubeEmbedUrl(editing.video_embed_url) && <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black"><iframe title="YouTube preview" src={toYouTubeEmbedUrl(editing.video_embed_url)} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" /></div>}
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline !px-5 !py-2.5">
                Cancel
              </button>
              <SavingButton saving={r.saving}>{editing.id ? 'Save changes' : 'Add item'}</SavingButton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete gallery item"
        message={`Delete "${confirm?.title}"? This cannot be undone.`}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await r.remove(confirm.id, 'Item deleted.');
          setConfirm(null);
        }}
      />
    </TabPanel>
  );
}
