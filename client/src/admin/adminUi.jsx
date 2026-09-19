import { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

/* ------------------------------------------------------------ form bits -- */
export function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1 text-xs font-semibold uppercase tracking-wider text-navy-500">
        {label}
        {required && <span className="text-accent-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-navy-400">{hint}</span>}
    </label>
  );
}

export function TextInput(props) {
  return <input {...props} className={`input ${props.className || ''}`} />;
}

export function TextArea({ rows = 5, ...props }) {
  return <textarea rows={rows} {...props} className={`input resize-y ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`input ${props.className || ''}`}>
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-accent-600' : 'bg-navy-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
      {label && <span className="text-sm text-navy-700">{label}</span>}
    </button>
  );
}

/* -------------------------------------------------------------- layout --- */
export function TabPanel({ title, description, actions, children }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-navy-100 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">{title}</h2>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-navy-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="mt-7">{children}</div>
    </div>
  );
}

export function Modal({ open, title, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 backdrop-blur-sm sm:p-8">
      <div
        className={`my-auto w-full rounded-2xl bg-white shadow-lift ${wide ? 'max-w-3xl' : 'max-w-xl'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-navy-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-50 hover:text-navy-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-navy-700">{message}</p>
      </div>
      <div className="mt-7 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-outline !px-5 !py-2.5">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="btn-primary !px-5 !py-2.5">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

/* --------------------------------------------------------------- toast --- */
export function Banner({ type = 'info', message, onDismiss }) {
  if (!message) return null;
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-accent-200 bg-accent-50 text-accent-800',
    info: 'border-navy-200 bg-navy-50 text-navy-800',
  }[type];
  const Icon = type === 'success' ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SavingButton({ saving, children, ...props }) {
  return (
    <button type="submit" disabled={saving} className="btn-primary !px-5 !py-2.5" {...props}>
      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
