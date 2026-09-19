import { createContext, useContext } from 'react';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';

const SettingsContext = createContext({ settings: {}, loading: true });

/**
 * Loads the `settings` table once and shares it app-wide, so the Navbar,
 * Footer, Membership page and Contact page all read the same values.
 */
export function SettingsProvider({ children }) {
  const { data, loading } = useFetch((signal) => api.settings.getAll(signal));
  return (
    <SettingsContext.Provider value={{ settings: data || {}, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
