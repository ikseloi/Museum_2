import { getInitialLocale, fetchTranslations, updateDOM } from './i18n.js';
import { checkMuseumStatus } from './museum-status.js';
import { initCurrentYear } from './utils/_year.js';
import { initLangSelectDropdown } from './components/_lang-select.js';
import { initMobileMenu } from './components/_menu.js';

document.addEventListener('DOMContentLoaded', async () => {
  let currentLocale = getInitialLocale();

  // Update language selection interface (UA/EN)
  const updateLangSelectUI = (locale) => {
    document.querySelectorAll('.lang-select__summary').forEach((summary) => {
      summary.textContent = locale.toUpperCase();
    });
  };

  const updateMuseumStatus = (translations) => {
    const infoScheduleToday = document.getElementById('info-schedule-today');

    if (!infoScheduleToday) {
      return;
    }

    const status = checkMuseumStatus();

    if (status.isOpen && status.schedule) {
      infoScheduleToday.textContent = status.schedule;
    } else if (translations?.status?.closed) {
      infoScheduleToday.textContent = translations.status.closed.toUpperCase();
    }
  };

  const changeLanguage = async (locale) => {
    const translations = await fetchTranslations(locale);

    if (translations) {
      currentLocale = locale;
      window.localStorage.setItem('museum-language', locale);
      document.documentElement.setAttribute('lang', locale);

      updateDOM(translations);
      updateLangSelectUI(locale);
      updateMuseumStatus(translations);
    }
  };

  // --- Initialize base UI components and utilities ---
  initCurrentYear();
  initLangSelectDropdown();
  initMobileMenu();

  // --- Initialize i18n ---
  await changeLanguage(currentLocale);

  // Attach language change events to links (.lang-select__option)
  document.querySelectorAll('.lang-select__option').forEach((option) => {
    option.addEventListener('click', (event) => {
      event.preventDefault();

      const selectedLang = event.target.textContent.trim().toLowerCase();

      if (selectedLang === 'ua' && currentLocale !== 'uk') {
        changeLanguage('uk');
      } else if (selectedLang === 'en' && currentLocale !== 'en') {
        changeLanguage('en');
      }
    });
  });

  // Update museum status every minute (to check if it has closed)
  setInterval(async () => {
    const activeLocale = window.localStorage.getItem('museum-language') || 'uk';
    const translations = await fetchTranslations(activeLocale);

    updateMuseumStatus(translations);
  }, 60000);
});
