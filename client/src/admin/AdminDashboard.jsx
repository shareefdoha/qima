import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, ImageIcon, Users, CalendarDays, Images, Settings as SettingsIcon,
  Inbox, LogOut, ExternalLink, Menu, X,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAdminAuth } from './AuthContext.jsx';
import AdminLogin from './AdminLogin.jsx';
import { LoadingBlock } from '../components/ui.jsx';

import AboutTab from './tabs/AboutTab.jsx';
import BannersTab from './tabs/BannersTab.jsx';
import TeamTab from './tabs/TeamTab.jsx';
import EventsTab from './tabs/EventsTab.jsx';
import GalleryTab from './tabs/GalleryTab.jsx';
import SettingsTab from './tabs/SettingsTab.jsx';
import MessagesTab from './tabs/MessagesTab.jsx';

const TABS = [
  { key: 'about', label: 'About Us Content', Icon: FileText, Component: AboutTab },
  { key: 'banners', label: 'Hero Banners', Icon: ImageIcon, Component: BannersTab },
  { key: 'team', label: 'Management Team', Icon: Users, Component: TeamTab },
  { key: 'events', label: 'Events', Icon: CalendarDays, Component: EventsTab },
  { key: 'gallery', label: 'Gallery', Icon: Images, Component: GalleryTab },
  { key: 'settings', label: 'Settings & Forms', Icon: SettingsIcon, Component: SettingsTab },
  { key: 'messages', label: 'Contact Messages', Icon: Inbox, Component: MessagesTab },
];

export default function AdminDashboard() {
  const { user, checking, logout } = useAdminAuth();
  const [active, setActive] = useState('about');
  const [navOpen, setNavOpen] = useState(false);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950">
        <LoadingBlock label="Checking your session…" />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  const ActiveTab = TABS.find((t) => t.key === active)?.Component || AboutTab;

  return (
    <div className="min-h-screen bg-sand-50">
      {/* ------------------------------------------------------ Top bar --- */}
      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="rounded-lg p-2 text-navy-700 lg:hidden"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo className="h-9 w-9" />
            <div className="leading-tight">
              <p className="font-display text-base font-bold text-navy-900">QIMA Admin</p>
              <p className="hidden text-[11px] text-navy-500 sm:block">Content Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-xs font-medium text-navy-700 transition-colors hover:border-navy-900 sm:inline-flex"
            >
              View site
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold text-navy-900">{user.name}</p>
              <p className="text-[11px] text-navy-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-8 px-4 py-8 sm:px-6">
        {/* ----------------------------------------------------- Sidebar -- */}
        <aside
          className={`${
            navOpen ? 'block' : 'hidden'
          } fixed inset-x-0 top-16 z-30 border-b border-navy-100 bg-white p-4 lg:static lg:block lg:w-64 lg:shrink-0 lg:border-0 lg:bg-transparent lg:p-0`}
        >
          <nav className="lg:sticky lg:top-24">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-400">
              Content
            </p>
            <ul className="space-y-1">
              {TABS.map(({ key, label, Icon }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(key);
                      setNavOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      active === key
                        ? 'bg-navy-900 text-white shadow-sm'
                        : 'text-navy-700 hover:bg-white hover:text-accent-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-navy-100 bg-white p-4">
              <p className="text-xs font-semibold text-navy-900">Everything here is live</p>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-500">
                Saved changes appear on the public site immediately — no rebuild or deployment needed.
              </p>
            </div>
          </nav>
        </aside>

        {/* -------------------------------------------------------- Main -- */}
        <main className="min-w-0 flex-1">
          <ActiveTab />
        </main>
      </div>
    </div>
  );
}
