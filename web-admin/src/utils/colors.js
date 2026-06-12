export const colors = {
  primary: '#8B0000',
  primaryDark: '#650000',
  primaryLight: '#A61B1B',
  primarySoft: 'var(--primary-soft)',
  white: 'var(--card)',
  bgPrimary: 'var(--bg-primary)',
  bgSecondary: 'var(--bg-secondary)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  success: '#15803D',
  warning: '#B45309',
  error: '#B91C1C',
  info: '#334155',
};

export const applyTheme = (isDark) => {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
};