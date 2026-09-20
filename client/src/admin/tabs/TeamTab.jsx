import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Linkedin, Mail } from 'lucide-react';
import { adminApi, assetUrl } from '../../api/client.js';
import { useResource } from '../useResource.js';
import { useFetch } from '../../hooks/useApi.js';
import {
  TabPanel, Field, TextInput, TextArea, Select, Banner, Modal, ConfirmDialog, SavingButton,
} from '../adminUi.jsx';
import { LoadingBlock, EmptyBlock } from '../../components/ui.jsx';

const BLANK = {
  name: '',
  designation: '',
  category_id: '',
  bio: '',
  image_url: '',
  linkedin_url: '',
  email: '',
  display_order: 0,
};

export default function TeamTab() {
  const r = useResource(adminApi.team, (d) => d.list);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState('All');
  const { data: categories = [] } = useFetch(() => adminApi.categories.list());

  const visible = useMemo(
    () => (filter === 'All' ? r.items : r.items.filter((m) => String(m.category_id) === filter)),
    [r.items, filter]
  );

  async function submit(e) {
    e.preventDefault();
    const ok = await r.save(editing.id, editing, editing.id ? 'Member updated.' : 'Member added.');
    if (ok) setEditing(null);
  }

  return (
    <TabPanel
      title="Management team"
      description="Members shown on the public /team page, grouped by role category. Display order controls the sequence within each group."
      actions={
        <button type="button" onClick={() => setEditing({ ...BLANK })} className="btn-primary !px-4 !py-2.5">
          <Plus className="h-4 w-4" />
          Add member
        </button>
      }
    >
      <Banner {...(r.banner || {})} onDismiss={() => r.setBanner(null)} />

      {r.loading ? (
        <LoadingBlock label="Loading team…" />
      ) : r.items.length === 0 ? (
        <EmptyBlock icon={Users} title="No team members yet" hint="Add board members, office bearers and committee chairs here." />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {[{ id: 'All', name: 'All' }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(String(c.id))}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  filter === String(c.id) ? 'bg-navy-900 text-white' : 'border border-navy-200 bg-white text-navy-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase tracking-wider text-navy-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Category</th>
                  <th className="hidden px-5 py-3 font-semibold lg:table-cell">Links</th>
                  <th className="px-5 py-3 text-center font-semibold">Order</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {visible.map((m) => (
                  <tr key={m.id} className="hover:bg-navy-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {m.image_url ? (
                          <img src={m.image_url} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100 text-navy-400">
                            <Users className="h-4 w-4" />
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-navy-900">{m.name}</p>
                          <p className="text-xs text-navy-500">{m.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs text-navy-600">
                        {m.role_category}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <div className="flex gap-2 text-navy-400">
                        {m.email && <Mail className="h-4 w-4" title={m.email} />}
                        {m.linkedin_url && <Linkedin className="h-4 w-4" />}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center text-navy-500">{m.display_order}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                    onClick={() => setEditing({ ...m, category_id: String(m.category_id) })}
                          aria-label={`Edit ${m.name}`}
                          className="rounded-lg p-2 text-navy-400 hover:bg-navy-100 hover:text-navy-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirm(m)}
                          aria-label={`Delete ${m.name}`}
                          className="rounded-lg p-2 text-navy-400 hover:bg-accent-50 hover:text-accent-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={Boolean(editing)} wide title={editing?.id ? 'Edit team member' : 'Add team member'} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required>
                <TextInput required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Designation" required>
                <TextInput
                  required
                  value={editing.designation}
                  onChange={(e) => setEditing({ ...editing, designation: e.target.value })}
                  placeholder="President"
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field label="Role category" hint="Groups the member on the /team page.">
                  <Select value={editing.category_id || ''} required onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                    <option value="" disabled>Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Display order">
                <TextInput
                  type="number"
                  value={editing.display_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field label="Bio" hint="Two or three sentences reads best on the card.">
              <TextArea rows={4} value={editing.bio || ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
            </Field>

            <Field label="Profile photo" hint="Upload a portrait image (maximum 8 MB). Leave blank to keep the current photo when editing.">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditing({ ...editing, image: e.target.files?.[0] || null })}
                className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:font-medium file:text-navy-800 hover:file:bg-navy-200"
              />
              {(editing.image || editing.image_url) && (
                <img src={editing.image ? URL.createObjectURL(editing.image) : assetUrl(editing.image_url)} alt="Preview" className="mt-3 h-24 w-24 rounded-xl object-cover" />
              )}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email">
                <TextInput
                  type="email"
                  value={editing.email || ''}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  placeholder="name@qima.qa"
                />
              </Field>
              <Field label="LinkedIn URL">
                <TextInput
                  value={editing.linkedin_url || ''}
                  onChange={(e) => setEditing({ ...editing, linkedin_url: e.target.value })}
                  placeholder="https://www.linkedin.com/in/…"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline !px-5 !py-2.5">
                Cancel
              </button>
              <SavingButton saving={r.saving}>{editing.id ? 'Save changes' : 'Add member'}</SavingButton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Remove team member"
        message={`Remove ${confirm?.name} from the management team? This cannot be undone.`}
        confirmLabel="Remove"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await r.remove(confirm.id, 'Member removed.');
          setConfirm(null);
        }}
      />
    </TabPanel>
  );
}
