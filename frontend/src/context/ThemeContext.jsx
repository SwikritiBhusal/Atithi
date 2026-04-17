
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEMES = {
  light:    { label: 'Light',         icon: '☀️' },
  dark:     { label: 'Dark',          icon: '🌙' },
  lavender: { label: 'Lavender',      icon: '🪻' },
  forest:   { label: 'Forest Green',  icon: '🌿' },
};

// Get storage key per user (so each user has their own theme)
const getThemeKey = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return `atithi_theme_${user.id}`;
    }
  } catch {}
  return 'atithi_theme_guest';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // Load theme on mount and when user changes
  useEffect(() => {
    const loadTheme = () => {
      const key = getThemeKey();
      const saved = localStorage.getItem(key) || 'light';
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    };

    loadTheme();

    // Re-load when user logs in/out
    window.addEventListener('storage', loadTheme);
    window.addEventListener('userChanged', loadTheme);
    return () => {
      window.removeEventListener('storage', loadTheme);
      window.removeEventListener('userChanged', loadTheme);
    };
  }, []);

  const changeTheme = (newTheme) => {
    const key = getThemeKey();
    localStorage.setItem(key, newTheme);
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);