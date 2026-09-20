import { useState } from 'react';
import { FolderCog, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client.js';
import { useResource } from '../useResource.js';
import { TabPanel, Banner, ConfirmDialog, Field, Modal, SavingButton, TextInput } from '../adminUi.jsx';
import { EmptyBlock, LoadingBlock } from '../../components/ui.jsx';

const BLANK = { name: '', display_order: 0 };

export default function CategoriesTab() {
  const r = useResource(adminApi.categories);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function submit(event) {
    event.preventDefault();
    const ok = await r.save(editing.id, editing, editing.id ? 'Category updated.' : 'Category added.');
    if (ok) setEditing(null);
  }

  return <TabPanel title="Team categories" description="Create and order the groups used by the Management Team page." actions={<button type="button" onClick={() => setEditing({ ...BLANK })} className="btn-primary !px-4 !py-2.5"><Plus className="h-4 w-4" />Add category</button>}>
    <Banner {...(r.banner || {})} onDismiss={() => r.setBanner(null)} />
    {r.loading ? <LoadingBlock label="Loading categories…" /> : r.items.length === 0 ? <EmptyBlock icon={FolderCog} title="No team categories" hint="Add a category before assigning team members." /> : <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card"><table className="w-full text-left text-sm"><thead className="bg-navy-50 text-xs uppercase tracking-wider text-navy-500"><tr><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-center">Order</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-navy-50">{r.items.map((category) => <tr key={category.id}><td className="px-5 py-4 font-semibold text-navy-900">{category.name}</td><td className="px-5 py-4 text-center text-navy-500">{category.display_order}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => setEditing({ ...category })} className="rounded-lg p-2 text-navy-400 hover:bg-navy-100"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => setConfirm(category)} className="rounded-lg p-2 text-navy-400 hover:bg-accent-50 hover:text-accent-700"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}
    <Modal open={Boolean(editing)} title={editing?.id ? 'Edit category' : 'Add category'} onClose={() => setEditing(null)}>{editing && <form onSubmit={submit} className="space-y-5"><Field label="Category name" required><TextInput required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Advisory Council" /></Field><Field label="Display order" hint="Lower numbers appear first."><TextInput type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></Field><div className="flex justify-end gap-2"><button type="button" className="btn-outline !px-5 !py-2.5" onClick={() => setEditing(null)}>Cancel</button><SavingButton saving={r.saving}>{editing.id ? 'Save changes' : 'Add category'}</SavingButton></div></form>}</Modal>
    <ConfirmDialog open={Boolean(confirm)} title="Delete category" message={`Delete "${confirm?.name}"? Categories with assigned members cannot be deleted.`} onCancel={() => setConfirm(null)} onConfirm={async () => { const ok = await r.remove(confirm.id, 'Category deleted.'); if (ok) setConfirm(null); }} />
  </TabPanel>;
}
