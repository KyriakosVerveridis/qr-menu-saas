// 1. Αρχικοποίηση με έλεγχο στο LocalStorage
    let menuData = [];
    let currentLang = localStorage.getItem('prefLang') || 'GR';
    let currentCat = 'all';
    let isDark = localStorage.getItem('prefDark') === 'true';

    // Read the restaurant slug dynamically from the URL parameter (e.g., ?restaurant=open)
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantSlug = urlParams.get('restaurant') || 'open'; 

    // Dynamic API URL generation
    const url = `http://127.0.0.1:8000/api/menu/public/${restaurantSlug}/`;

    const catTranslations = {
        GR: { all: "Όλα", pizza: "Πίτσα", pasta: "Μακαρόνια", salad: "Σαλάτες", drinks: "Ποτά", coffee: "Καφές", icecream: "Παγωτό" },
        EN: { all: "All", pizza: "Pizza", pasta: "Pasta", salad: "Salads", drinks: "Drinks", coffee: "Coffee", icecream: "Ice Cream" },
        BG: { all: "Всичко", pizza: "Пица", pasta: "Паста", salad: "Салати", drinks: "Напитки", coffee: "Καфе", icecream: "Сλαδοлед" },
        RS: { all: "Све", pizza: "Пица", pasta: "Теστεнина", salad: "Саλατε", drinks: "Пића", coffee: "Каφα", icecream: "Сλαδοлед" },
        RO: { all: "Toate", pizza: "Pizza", pasta: "Paste", salad: "Salate", drinks: "Băuturi", coffee: "Cafea", icecream: "Înghețată" },
        DE: { all: "Alles", pizza: "Pizza", pasta: "Pasta", salad: "Salate", drinks: "Getränke", coffee: "Kaffee", icecream: "Eis" },
        TR: { all: "Hepsi", pizza: "Pizza", pasta: "Makarna", salad: "Salatalar", drinks: "İçecekler", coffee: "Kahve", icecream: "Dondurma" }
    };

    // Βοηθητικό αντικείμενο για τα ονόματα των γλωσσών στο κουμπί
    const langNames = { GR: 'ΕΛΛΗΝΙΚΑ', EN: 'ENGLISH', BG: 'БЪΛГАРΣΚИ', RS: 'SRPSKI', RO: 'ROMÂNĂ', DE: 'DEUTSCH', TR: 'TÜRKÇE' };

    async function init() {
        // 1. Load preferences
        isDark = localStorage.getItem('prefDark') === 'true';
        currentLang = localStorage.getItem('prefLang') || 'GR';
        currentCat = localStorage.getItem('prefCat') || 'all';

        // 2. Immediate Theme Apply
        if (isDark) {
            document.body.classList.add('dark');
            const icon = document.getElementById('dark-icon');
            if (icon) icon.setAttribute('data-lucide', 'sun');
        }

        // 3. Update UI Labels (using the global langNames)
        const langText = document.getElementById('current-lang-text');
        if (langText) langText.innerText = langNames[currentLang] || currentLang;

        // 4. Initial Render from Cache
        const cached = localStorage.getItem('menu_cache');
        if (cached) {
            menuData = JSON.parse(cached);
            render(); 
        }

        // 5. Fetch Updates
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
            const json = await response.json();
            
            menuData = json.flatMap(group => 
                group.items.map(item => ({ ...item, category: group.category }))
            );

            localStorage.setItem('menu_cache', JSON.stringify(menuData));
            render();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) { console.error("Update failed:", e); }
    }
    
    
    function render() {
        const container = document.getElementById('menu-list');
        if (!container) return;

        // 1. Update categories text in UI
        const langCats = catTranslations[currentLang];
        document.querySelectorAll('.category-item').forEach(btn => {
            const id = btn.id.replace('cat-', '');
            if (langCats[id]) btn.innerText = langCats[id];
        });

        // 2. Filter items based on selected category (category.GR or category.EN etc.)
        const filtered = menuData.filter(item => {
            if (currentCat === 'all') return true;
            
            // Get the current selected category key from translations (e.g., "coffee", "drinks")
            const activeTranslation = catTranslations[currentLang][currentCat]?.toLowerCase();
            if (!activeTranslation) return false;

            // Check if ANY language of the item's category matches our active translation
            return Object.values(item.category).some(val => 
                val?.toLowerCase() === activeTranslation
            );
        });

        let fullHtml = ''; 

        filtered.forEach(item => {
            const isDarkNow = document.body.classList.contains('dark');
            const textColor = isDarkNow ? "text-white" : "text-gray-900";
            
            // NEW MULTILINGUAL LOGIC FOR JSON FIELDS
            const itemName = item.name[currentLang] || item.name['GR'] || "N/A";
            const itemDesc = item.description ? (item.description[currentLang] || item.description['GR'] || "") : "";
            const itemCatName = item.category[currentLang] || item.category['GR'] || "";

            fullHtml += `
            <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden flex border border-gray-100 dark:border-neutral-700 h-32 transition-all">
                <div class="w-32 h-full bg-gray-200">
                    <img src="${item.image}" class="w-full h-full object-cover" loading="lazy" 
                        onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/x8AAuMB8DtXNjkAAAAASUVORK5CYII='">
                </div>
                <div class="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-sm leading-tight ${textColor}">${itemName}</h3>
                            <span class="font-black ml-2 text-sm ${textColor}">${item.price}€</span>
                        </div>
                        <p class="text-[11px] mt-1 line-clamp-2 italic leading-snug text-gray-500 dark:text-gray-400">
                            ${itemDesc}
                        </p>
                    </div>
                    <div class="text-[9px] uppercase text-gray-400 font-bold tracking-widest">${itemCatName}</div>
                </div>
            </div>`;
        });

        container.innerHTML = fullHtml;
    }

    function toggleDarkMode() {
        const body = document.body;
        body.classList.toggle('dark');
        
        // Save Dark Mode state to localStorage
        const isDarkNow = body.classList.contains('dark');
        localStorage.setItem('prefDark', isDarkNow);
        
        // Update the icon (Sun/Moon)
        const icon = document.getElementById('dark-icon');
        if (icon) {
            icon.setAttribute('data-lucide', isDarkNow ? 'sun' : 'moon');
            lucide.createIcons();
        }
        render();
    }

    function filterCat(cat) {
        currentCat = cat;
        // Save selected category to localStorage
        localStorage.setItem('prefCat', cat);

        // Update Navigation UI classes
        document.querySelectorAll('.category-item').forEach(el => {
            el.classList.remove('active-category');
            el.classList.add('text-gray-400');
        });

        const activeEl = document.getElementById('cat-' + cat);
        if (activeEl) {
            activeEl.classList.add('active-category');
            activeEl.classList.remove('text-gray-400');
        }
        render();
    }

    function toggleLangDropdown() { 
        // Show or hide the language selection menu
        document.getElementById('lang-dropdown').classList.toggle('hidden'); 
    }

    function selectLang(langCode, langName) {
        currentLang = langCode;
        // 4. Αποθήκευση επιλογής Γλώσσας
        localStorage.setItem('prefLang', langCode);
        
        document.getElementById('current-lang-text').innerText = langName;
        document.getElementById('lang-dropdown').classList.add('hidden');
        render();
    }

    window.onclick = function(event) {
        if (!event.target.closest('#lang-menu')) {
            const dropdown = document.getElementById('lang-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
        }
    }

    init();