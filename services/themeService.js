
const THEME_KEY = 'ebook-reader-theme';

const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemPrefersDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }
};

const getSavedTheme = () => localStorage.getItem(THEME_KEY) || 'system';

export const initTheme = () => {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getSavedTheme() === 'system') {
            applyTheme('system');
        }
    });
};

export const toggleTheme = () => {
    const currentTheme = getSavedTheme();
    let newTheme;
    if (currentTheme === 'system') {
        newTheme = 'light';
    } else if (currentTheme === 'light') {
        newTheme = 'dark';
    } else {
        newTheme = 'system';
    }
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
    return newTheme;
};
