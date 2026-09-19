import { AlertCircle, Loader2, Inbox } from 'lucide-react';

export function Spinner({ className = 'h-6 w-6' }) {
  return <Loader2 className={`animate-spin text-accent-600 ${className}`} aria-hidden="true" />;
}

export function LoadingBlock({ label = 'Loading…', className = 'py-24' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-navy-500">{label}</p>
    </div>
  );
}

export function ErrorBlock({ message, onRetry, className = 'py-20' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
      <AlertCircle className="h-8 w-8 text-accent-600" />
      <p className="max-w-md text-sm text-navy-600">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline !px-5 !py-2">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ title = 'Nothing here yet', hint, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-navy-200 bg-navy-50/40 py-16 text-center">
      <Icon className="h-8 w-8 text-navy-300" />
      <p className="font-display text-lg text-navy-800">{title}</p>
      {hint && <p className="max-w-sm text-sm text-navy-500">{hint}</p>}
    </div>
  );
}

/** Section heading used across the public pages. */
export function SectionHeading({ eyebrow, title, description, align = 'left', light = false }) {
  const centered = align === 'center';
  return (
    <div className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <span className={`eyebrow ${light ? '!text-accent-400' : ''}`}>
          <span className="h-px w-6 bg-current" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-3 text-3xl font-bold sm:text-4xl ${light ? 'text-white' : 'text-navy-900'}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 leading-relaxed ${light ? 'text-navy-200' : 'text-navy-600'}`}>{description}</p>
      )}
    </div>
  );
}

/** Dark hero strip used at the top of every inner page. */
export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden bg-navy-900 pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, #c32b41 0, transparent 45%), radial-gradient(circle at 85% 80%, #47648d 0, transparent 45%)',
        }}
      />
      <div className="container-qima relative">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && (
            <span className="eyebrow !text-accent-400">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">{title}</h1>
          {description && <p className="mt-5 text-lg leading-relaxed text-navy-200">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
