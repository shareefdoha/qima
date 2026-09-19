import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const QUICK_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/team', label: 'Management Team' },
  { to: '/membership', label: 'Membership' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact Us' },
];

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  const socials = [
    { key: 'social_linkedin', Icon: Linkedin, label: 'LinkedIn' },
    { key: 'social_instagram', Icon: Instagram, label: 'Instagram' },
    { key: 'social_facebook', Icon: Facebook, label: 'Facebook' },
    { key: 'social_youtube', Icon: Youtube, label: 'YouTube' },
  ].filter((s) => settings[s.key]);

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-qima grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11" dark />
            <span className="font-display text-xl font-bold text-white">QIMA</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-navy-300">
            The Qatar Indian Management Association — a professional forum for Indian management
            practitioners across every industry in Qatar.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="rounded-full border border-white/15 p-2.5 text-navy-200 transition-colors hover:border-accent-500 hover:bg-accent-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Quick Links</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-navy-300 transition-colors hover:text-accent-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Get in Touch</h3>
          <ul className="mt-5 space-y-4 text-sm">
            {settings.contact_address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                <span className="text-navy-300">{settings.contact_address}</span>
              </li>
            )}
            {settings.contact_email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                <a href={`mailto:${settings.contact_email}`} className="text-navy-300 hover:text-accent-400">
                  {settings.contact_email}
                </a>
              </li>
            )}
            {settings.contact_phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                <a
                  href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}
                  className="text-navy-300 hover:text-accent-400"
                >
                  {settings.contact_phone}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Membership</h3>
          <p className="mt-5 text-sm leading-relaxed text-navy-300">
            {settings.membership_intro ||
              'Open to management professionals across every industry and level of seniority in Qatar.'}
          </p>
          <Link to="/membership" className="btn-primary mt-6 !px-5 !py-2.5">
            Apply for Membership
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-qima flex flex-col items-center justify-between gap-3 py-6 text-xs text-navy-400 sm:flex-row">
          <p>&copy; {year} Qatar Indian Management Association. All rights reserved.</p>
          <p>
            A non-political, non-profit professional association &middot;{' '}
            <Link to="/admin" className="hover:text-navy-200">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
