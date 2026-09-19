import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { AdminAuthProvider } from './admin/AuthContext.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Team from './pages/Team.jsx';
import Membership from './pages/Membership.jsx';
import Events from './pages/Events.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SettingsProvider>
        <Routes>
          {/* ------------------------------------------- public site ---- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ------------------------------------------ admin panel ----- */}
          <Route
            path="/admin"
            element={
              <AdminAuthProvider>
                <AdminDashboard />
              </AdminAuthProvider>
            }
          />
        </Routes>
      </SettingsProvider>
    </BrowserRouter>
  );
}
