import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui.jsx';
import { api } from '../api/client.js';
import { useSettings } from '../context/SettingsContext.jsx';

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ state: 'sending', message: '' });
    try {
      const res = await api.contact.send(form);
      setStatus({ state: 'success', message: res?.message || 'Thank you — your message has been received.' });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Could not send your message.' });
    }
  }

  const details = [
    settings.contact_address && { Icon: MapPin, label: 'Address', value: settings.contact_address },
    settings.contact_email && {
      Icon: Mail,
      label: 'Email',
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
    },
    settings.contact_phone && {
      Icon: Phone,
      label: 'Phone',
      value: settings.contact_phone,
      href: `tel:${settings.contact_phone.replace(/\s/g, '')}`,
    },
    { Icon: Clock, label: 'Secretariat hours', value: 'Sunday – Thursday, 09:00 – 17:00 (AST)' },
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title="Get in touch with QIMA"
        description="Questions about membership, speaking at an event, or partnering with the association? The Secretariat will get back to you."
      />

      <section className="py-16 sm:py-24">
        <div className="container-qima grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ------------------------------------------------ Details ---- */}
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold text-navy-900 sm:text-3xl">Contact details</h2>
            <p className="mt-3 leading-relaxed text-navy-600">
              We aim to respond to every enquiry within two working days.
            </p>

            <ul className="mt-9 space-y-6">
              {details.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">{label}</p>
                    {href ? (
                      <a href={href} className="mt-0.5 block text-[15px] text-navy-900 hover:text-accent-600">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-[15px] leading-relaxed text-navy-900">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* --------------------------------------------------- Form ---- */}
          <div className="lg:col-span-7">
            <div className="card p-7 sm:p-9">
              <h2 className="text-2xl font-bold text-navy-900">Send us a message</h2>

              {status.state === 'success' && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{status.message}</p>
                </div>
              )}
              {status.state === 'error' && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{status.message}</p>
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
                {/* honeypot — hidden from people, filled by bots */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={form.website}
                  onChange={set('website')}
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">
                      Full name *
                    </label>
                    <input
                      id="name"
                      className="input"
                      required
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">
                      Email address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      required
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="label">
                    Subject
                  </label>
                  <input
                    id="subject"
                    className="input"
                    value={form.subject}
                    onChange={set('subject')}
                    placeholder="Membership enquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="label">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="input resize-y"
                    required
                    value={form.message}
                    onChange={set('message')}
                    placeholder="How can we help?"
                  />
                </div>

                <button type="submit" className="btn-primary w-full sm:w-auto" disabled={status.state === 'sending'}>
                  {status.state === 'sending' ? 'Sending…' : 'Send Message'}
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Map ----- */}
      {settings.contact_map_embed && (
        <section className="h-[420px] w-full bg-navy-100">
          <iframe
            title="QIMA location"
            src={settings.contact_map_embed}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </section>
      )}
    </>
  );
}
