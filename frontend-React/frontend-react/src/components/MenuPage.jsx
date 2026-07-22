import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function MenuPage() {
  const { slug } = useParams();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('prefLang') || 'el');
  const [currentCat, setCurrentCat] = useState('all');
  const [isDark, setIsDark] = useState(localStorage.getItem('prefDark') === 'true');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const cacheKey = `menu_cache_${slug}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setGroups(JSON.parse(cached));
      setLoading(false);
    }

    axios.get(`${API_URL}/api/menu/public/${slug}/`)
      .then(res => {
        setGroups(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
        setError(false);
      })
      .catch(err => {
        console.error("Σφάλμα φόρτωσης menu:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const availableLanguages = useMemo(() => {
    const codes = new Set();
    groups.forEach(g => {
      g.category.translations.forEach(t => codes.add(t.language_code));
      g.items.forEach(item => item.translations.forEach(t => codes.add(t.language_code)));
    });
    return Array.from(codes);
  }, [groups]);

  useEffect(() => {
    if (availableLanguages.length && !availableLanguages.includes(currentLang)) {
      setCurrentLang(availableLanguages[0]);
    }
  }, [availableLanguages]);

  const getTranslation = (translations, lang) => {
    return translations.find(t => t.language_code === lang)
        || translations.find(t => t.language_code === 'el')
        || translations[0]
        || { name: '', description: '' };
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('prefDark', next);
  };

  const selectLang = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('prefLang', lang);
    setLangMenuOpen(false);
  };

  const langLabels = { el: 'Ελληνικά', en: 'English', de: 'Deutsch', fr: 'Français', bg: 'Български', ro: 'Română', tr: 'Türkçe' };

  const visibleGroups = currentCat === 'all'
    ? groups
    : groups.filter(g => g.category.id === currentCat);

  if (loading && groups.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Φόρτωση μενού...</div>;
  }

  if (error && groups.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Δεν ήταν δυνατή η φόρτωση του μενού.</div>;
  }

  return (
    <div className={isDark ? 'dark min-h-screen bg-slate-900' : 'min-h-screen bg-slate-50'}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Μενού</h1>
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                {langLabels[currentLang] || currentLang}
              </button>
              {langMenuOpen && (
                <div className={`absolute right-0 mt-2 rounded-xl shadow-lg border z-10 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  {availableLanguages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => selectLang(lang)}
                      className={`block w-full text-left px-4 py-2 text-sm whitespace-nowrap ${isDark ? 'text-white hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      {langLabels[lang] || lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleDark}
              className={`px-3 py-2 rounded-xl text-sm border ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-700 border-slate-200'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setCurrentCat('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
              currentCat === 'all'
                ? 'bg-blue-600 text-white'
                : isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Όλα
          </button>
          {groups.map(g => (
            <button
              key={g.category.id}
              onClick={() => setCurrentCat(g.category.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                currentCat === g.category.id
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {getTranslation(g.category.translations, currentLang).name}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {visibleGroups.map(g => (
            <div key={g.category.id}>
              <h2 className={`text-sm font-bold uppercase tracking-wide mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {getTranslation(g.category.translations, currentLang).name}
              </h2>
              <div className="space-y-3">
                {g.items.map(item => {
                  const t = getTranslation(item.translations, currentLang);
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-3 p-3 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                    >
                      {item.image && (
                        <img src={item.image} alt={t.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.name}</h3>
                          <span className={`font-bold text-sm whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.price}€</span>
                        </div>
                        {t.description && (
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}