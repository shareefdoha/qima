import { useCallback, useEffect, useState } from 'react';

/**
 * Shared CRUD state for the admin tabs.
 *
 *   const r = useResource(adminApi.team, (data) => data.list);
 *   r.items, r.loading, r.banner, r.save(id, payload), r.remove(id), r.reload()
 */
export function useResource(resource, pick = (d) => d) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resource.list();
      setItems(pick(data) || []);
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (id, payload, successMessage = 'Saved.') => {
      setSaving(true);
      setBanner(null);
      try {
        if (id) await resource.update(id, payload);
        else await resource.create(payload);
        await reload();
        setBanner({ type: 'success', message: successMessage });
        return true;
      } catch (err) {
        setBanner({ type: 'error', message: err.message });
        return false;
      } finally {
        setSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reload]
  );

  const remove = useCallback(
    async (id, successMessage = 'Deleted.') => {
      try {
        await resource.remove(id);
        await reload();
        setBanner({ type: 'success', message: successMessage });
        return true;
      } catch (err) {
        setBanner({ type: 'error', message: err.message });
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reload]
  );

  return { items, setItems, loading, saving, banner, setBanner, reload, save, remove };
}

export default useResource;
