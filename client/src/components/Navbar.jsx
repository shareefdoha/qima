import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import Logo from './Logo.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/team', label: 'Management Team' },
  { to: '/membership', label: 'Membership' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Transparent over the hero on the home page, solid everywhere else.
  const solid = scrolled || !isHome || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? 'bg-white/95 shadow-[0_1px_0_rgba(11,30,54,0.08)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="container-qima flex h-18 items-center justify-between py-3" aria-label="Main">
        <Link to="/" className="flex items-center gap-3" aria-label="QIMA — home">
          <Logo className="h-10 w-10 shrink-0" dark={!solid} />
          <span className="leading-tight">
            <span
              className={`block font-display text-lg font-bold tracking-tight ${
                solid ? 'text-navy-900' : 'text-white'
              }`}
            >
              QIMA
            </span>
            <span
              className={`hidden text-[10px] font-medium uppercase tracking-[0.14em] sm:block ${
                solid ? 'text-navy-500' : 'text-white/70'
              }`}
            >
              Qatar Indian Management Association
            </span>
          </span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  [
                    'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                    solid
                      ? isActive
                        ? 'text-accent-600'
                        : 'text-navy-700 hover:text-accent-600'
                      : isActive
                        ? 'text-white'
                        : 'text-white/80 hover:text-white',
                    isActive
                      ? 'after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-accent-500'
                      : '',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li className="ml-3">
            <Link to="/membership" className={solid ? 'btn-primary !px-5 !py-2.5' : 'btn-ghost-light !px-5 !py-2.5'}>
              Join QIMA
              <ChevronRight className="h-4 w-4" />
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className={`rounded-lg p-2 lg:hidden ${solid ? 'text-navy-900' : 'text-white'}`}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-navy-100 bg-white transition-[max-height] duration-300 lg:hidden ${
          open ? 'max-h-[80vh]' : 'max-h-0'
        }`}
      >
        <ul className="container-qima flex flex-col py-3">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-navy-50 py-3.5 text-base font-medium ${
                    isActive ? 'text-accent-600' : 'text-navy-800'
                  }`
                }
              >
                {link.label}
                <ChevronRight className="h-4 w-4 opacity-40" />
              </NavLink>
            </li>
          ))}
          <li className="py-4">
            <Link to="/membership" className="btn-primary w-full">
              Join QIMA
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
