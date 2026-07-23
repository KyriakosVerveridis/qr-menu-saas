import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const langLabels = { el: 'ΕΛΛΗΝΙΚΑ', en: 'ENGLISH', de: 'DEUTSCH', fr: 'FRANÇAIS', bg: 'БЪЛГАРСКИ', ro: 'ROMÂNĂ', tr: 'TÜRKÇE' };

export default function MenuPage() {
  const { slug } = useParams();
  const [restaurantName, setRestaurantName] = useState(null);
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
      const parsed = JSON.parse(cached);
      applyData(parsed);
      setLoading(false);
    }

    axios.get(`${API_URL}/api/menu/public/${slug}/`)
      .then(res => {
        applyData(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
        setError(false);
      })
      .catch(err => {
        console.error("Σφάλμα φόρτωσης menu:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const applyData = (data) => {
    // Δέχεται είτε bare array (τρέχον backend) είτε {restaurant, categories} (μελλοντικό)
    if (Array.isArray(data)) {
      setGroups(data);
      setRestaurantName(null);
    } else {
      setGroups(data.categories || []);
      setRestaurantName(data.restaurant?.name || null);
    }
  };

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

  const visibleGroups = currentCat === 'all'
    ? groups
    : groups.filter(g => g.category.id === currentCat);

  if (loading && groups.length === 0) {
    return (
      <div className={isDark ? 'dark min-h-screen bg-neutral-900' : 'min-h-screen bg-gray-50'}>
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-neutral-800 rounded-2xl h-32 w-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && groups.length === 0) {
    return (
      <div className={isDark ? 'dark min-h-screen bg-neutral-900 flex items-center justify-center' : 'min-h-screen bg-gray-50 flex items-center justify-center'}>
        <p className="text-red-500 font-medium">Δεν ήταν δυνατή η φόρτωση του μενού.</p>
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark min-h-screen bg-neutral-900 text-gray-100' : 'min-h-screen bg-gray-50 text-gray-900'}>
      <header className={`sticky top-0 z-50 shadow-sm ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
        <div className="p-4 flex justify-between items-center max-w-lg mx-auto">
          <h1 className="font-black text-xl tracking-tight truncate">
            {restaurantName || slug}
          </h1>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleDark}
              className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-neutral-800 border-neutral-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`text-xs font-bold px-3 py-2 rounded-xl border ${isDark ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                {langLabels[currentLang] || currentLang.toUpperCase()}
              </button>
              {langMenuOpen && (
                <div className={`absolute right-0 mt-2 w-40 rounded-xl shadow-xl border overflow-hidden z-[100] ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-100'}`}>
                  {availableLanguages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => selectLang(lang)}
                      className={`w-full text-left px-4 py-3 text-xs font-bold border-b last:border-b-0 ${isDark ? 'border-neutral-700 text-white' : 'border-gray-50'}`}
                    >
                      {langLabels[lang] || lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className={`w-full flex overflow-x-auto no-scrollbar border-b px-4 py-3 gap-3 ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-100'}`}>
          <button
            onClick={() => setCurrentCat('all')}
            className={`whitespace-nowrap pb-1 font-bold text-sm uppercase px-2 border-b-[3px] ${
              currentCat === 'all' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400'
            }`}
          >
            Όλα
          </button>
          {groups.map(g => (
            <button
              key={g.category.id}
              onClick={() => setCurrentCat(g.category.id)}
              className={`whitespace-nowrap pb-1 font-bold text-sm uppercase px-2 border-b-[3px] ${
                currentCat === g.category.id ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400'
              }`}
            >
              {getTranslation(g.category.translations, currentLang).name}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {visibleGroups.flatMap(g => g.items).map(item => {
          const t = getTranslation(item.translations, currentLang);
          return (
            <div
              key={item.id}
              className={`rounded-2xl shadow-sm overflow-hidden flex border h-32 ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-100'}`}
            >
              <div className="w-32 h-full bg-gray-200 flex-shrink-0">
                <img
                  src={item.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/x8AAuMB8DtXNjkAAAAASUVORK5CYII='}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm leading-tight">{t.name}</h3>
                    <span className="font-black ml-2 text-sm whitespace-nowrap">{item.price}€</span>
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-2 italic leading-snug ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}