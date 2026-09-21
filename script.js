// ==========================================
// 🚀 CONFIGURATION & GLOBAL STATES
// ==========================================
const UNSPLASH_ACCESS_KEY = 'kmwR0yF5WD3sLP8plZ2r_oSGMcuw0eHfCksqSDEp__c';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const gallery = document.getElementById('wallpaperGallery');
const loading = document.getElementById('loading');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const recentSearchesContainer = document.getElementById('recentSearches');
const favCounter = document.getElementById('favCounter');

let currentQuery = '4k wallpaper';
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let isFavoritesView = false;
let isLiveWallpaperMode = false; // 🎬 Tracks Live Wallpaper Mode

let selectedOrientation = '';
let selectedColor = '';
let selectedSort = 'relevant';
let currentShareUrl = '';

const loadedImageIds = new Set();
let favorites = JSON.parse(localStorage.getItem('fav_wallpapers')) || [];
let recentSearches = JSON.parse(localStorage.getItem('recent_searches')) || [];
let downloadHistory = JSON.parse(localStorage.getItem('download_history')) || [];

// ==========================================
// 🌐 LANGUAGE TRANSLATIONS & RTL SYSTEM
// ==========================================
const translations = {
  en: {
    name: "English", siteLogo: "WallpaperHub", title: "JennWall 4K Wallpaper", subtitle: "Download ultra HD 4K wallpapers for your desktop & phone",
    searchPlaceholder: "Search here...", searchBtn: "Search",
    catAll: "All", catNature: "Nature", catAnime: "Anime", catCars: "Cars", catAesthetic: "Aesthetic", catDark: "Dark",
    lblSort: "Sort By:", optRelevant: "Relevant", optLatest: "Latest",
    lblColor: "Color:", optAllColors: "All Colors", optBW: "Black & White", optBlue: "Blue", optRed: "Red", optGreen: "Green", optYellow: "Yellow", optPurple: "Purple",
    lblOrientation: "Orientation:", optAllOrientations: "All", optLandscape: "Landscape", optPortrait: "Portrait", optSquare: "Square",
    loadingText: "Loading wallpapers...", btnDownload: "Download Original", btnFavorite: "Favorite", btnShare: "Share", relatedTitle: "Related Wallpapers",
    shareTitle: "Share Wallpaper", shareSub: "Copy the link or share directly to social media:", btnCopy: "Copy",
    menuHeading: "Menu", quickNav: "Quick Nav", settingsNav: "Settings & Info",
    navHome: "Home", navGallery: "Gallery", navExplore: "Explore", navSettings: "Settings", navAbout: "About Us"
  },
  ur: {
    name: "اردو", siteLogo: "وال پیپر ہب", title: "جین وال 4K وال پیپر", subtitle: "اپنے ڈیسک ٹاپ اور فون کے لیے الٹرا HD 4K وال پیپرز ڈاؤن لوڈ کریں",
    searchPlaceholder: "یہاں تلاش کریں...", searchBtn: "تلاش کریں",
    catAll: "سب", catNature: "قدرت", catAnime: "اینیم", catCars: "گاڑیاں", catAesthetic: "خوبصورت", catDark: "ڈارک",
    lblSort: "ترتیب:", optRelevant: "متعلقہ", optLatest: "تازہ ترین",
    lblColor: "رنگ:", optAllColors: "تمام رنگ", optBW: "سیاہ و سفید", optBlue: "نیلا", optRed: "سرخ", optGreen: "سبز", optYellow: "پیلا", optPurple: "جامنی",
    lblOrientation: "رخ:", optAllOrientations: "تمام", optLandscape: "زمین کی سمت (Landscape)", optPortrait: "عمودی (Portrait)", optSquare: "مربع (Square)",
    loadingText: "وال پیپرز لوڈ ہو رہے ہیں...", btnDownload: "اصل ڈاؤن لوڈ کریں", btnFavorite: "پسندیدہ", btnShare: "شیئر کریں", relatedTitle: "متعلقہ وال پیپرز",
    shareTitle: "وال پیپر شیئر کریں", shareSub: "لنک کاپی کریں یا سوشل میڈیا پر شیئر کریں:", btnCopy: "کاپی کریں",
    menuHeading: "مینو", quickNav: "فوری نیویگیشن", settingsNav: "سیٹنگز اور معلومات",
    navHome: "ہوم", navGallery: "گیلری", navExplore: "ایکسپلور", navSettings: "سیٹنگز", navAbout: "ہمارے بارے میں"
  },
  hi: {
    name: "हिन्दी", siteLogo: "वॉलपेपर हब", title: "जेनवॉल 4K वॉलपेपर", subtitle: "अपने डेस्कटॉप और फोन के लिए अल्ट्रा HD 4K वॉलपेपर डाउनलोड करें",
    searchPlaceholder: "यहाँ खोजें...", searchBtn: "खोजें",
    catAll: "सभी", catNature: "प्रकृति", catAnime: "एनिमे", catCars: "कारें", catAesthetic: "सुंदर", catDark: "डार्क",
    lblSort: "क्रमानुसा‍र:", optRelevant: "प्रासंगिक", optLatest: "नवीनतम",
    lblColor: "रंग:", optAllColors: "सभी रंग", optBW: "ब्लैक एंड व्हाइट", optBlue: "नीला", optRed: "लाल", optGreen: "हरा", optYellow: "पीला", optPurple: "बैंगनी",
    lblOrientation: "दिशा:", optAllOrientations: "सभी", optLandscape: "लैंडस्केप", optPortrait: "पोर्ट्रेट", optSquare: "वर्ग",
    loadingText: "वॉलपेपर लोड हो रहे हैं...", btnDownload: "मूल डाउनलोड करें", btnFavorite: "पसंदीदा", btnShare: "शेयर करें", relatedTitle: "संबंधित वॉलपेपर",
    shareTitle: "वॉलपेपर शेयर करें", shareSub: "लिंक कॉपी करें या सीधे सोशल मीडिया पर शेयर करें:", btnCopy: "कॉपी करें",
    menuHeading: "मेनू", quickNav: "त्वरित नेविगेशन", settingsNav: "सेटिंग्स और जानकारी",
    navHome: "होम", navGallery: "गैलरी", navExplore: "एक्सप्लोर", navSettings: "सेटिंग्स", navAbout: "हमारे बारे में"
  },
  es: {
    name: "Español", siteLogo: "WallpaperHub", title: "Fondo de Pantalla JennWall 4K", subtitle: "Descarga fondos de pantalla ultra HD 4K para tu PC y teléfono",
    searchPlaceholder: "Buscar aquí...", searchBtn: "Buscar",
    catAll: "Todo", catNature: "Naturaleza", catAnime: "Anime", catCars: "Coches", catAesthetic: "Estético", catDark: "Oscuro",
    lblSort: "Ordenar:", optRelevant: "Relevante", optLatest: "Más reciente",
    lblColor: "Color:", optAllColors: "Todos los colores", optBW: "Blanco y negro", optBlue: "Azul", optRed: "Rojo", optGreen: "Verde", optYellow: "Amarillo", optPurple: "Púrpura",
    lblOrientation: "Orientación:", optAllOrientations: "Todas", optLandscape: "Horizontal", optPortrait: "Vertical", optSquare: "Cuadrado",
    loadingText: "Cargando fondos...", btnDownload: "Descargar original", btnFavorite: "Favorito", btnShare: "Compartir", relatedTitle: "Fondos relacionados",
    shareTitle: "Compartir fondo", shareSub: "Copia el enlace o comparte directamente:", btnCopy: "Copiar",
    menuHeading: "Menú", quickNav: "Navegación rápida", settingsNav: "Ajustes e Info",
    navHome: "Inicio", navGallery: "Galería", navExplore: "Explorar", navSettings: "Ajustes", navAbout: "Sobre nosotros"
  },
  fr: {
    name: "Français", siteLogo: "WallpaperHub", title: "Fonds d'écran JennWall 4K", subtitle: "Téléchargez des fonds d'écran ultra HD 4K pour PC et mobile",
    searchPlaceholder: "Rechercher...", searchBtn: "Chercher",
    catAll: "Tout", catNature: "Nature", catAnime: "Animé", catCars: "Voitures", catAesthetic: "Esthétique", catDark: "Sombre",
    lblSort: "Trier par:", optRelevant: "Pertinent", optLatest: "Plus récent",
    lblColor: "Couleur:", optAllColors: "Toutes les couleurs", optBW: "Noir et blanc", optBlue: "Bleu", optRed: "Rouge", optGreen: "Vert", optYellow: "Jaune", optPurple: "Violet",
    lblOrientation: "Orientation:", optAllOrientations: "Toutes", optLandscape: "Paysage", optPortrait: "Portrait", optSquare: "Carré",
    loadingText: "Chargement...", btnDownload: "Télécharger l'original", btnFavorite: "Favori", btnShare: "Partager", relatedTitle: "Fonds d'écran associés",
    shareTitle: "Partager le fond d'écran", shareSub: "Copiez le lien ou partagez directement :", btnCopy: "Copier",
    menuHeading: "Menu", quickNav: "Navigation rapide", settingsNav: "Paramètres & Info",
    navHome: "Accueil", navGallery: "Galerie", navExplore: "Explorer", navSettings: "Paramètres", navAbout: "À propos"
  },
  ar: {
    name: "العربية", siteLogo: "وال بيبر هب", title: "خلفيات جين وال 4K", subtitle: "قم بتنزيل خلفيات فائقة الدقة 4K لجهاز الكمبيوتر والهاتف",
    searchPlaceholder: "ابحث هنا...", searchBtn: "بحث",
    catAll: "الكل", catNature: "طبيعة", catAnime: "أنيمي", catCars: "سيارات", catAesthetic: "جمالي", catDark: "داكن",
    lblSort: "فرز حسب:", optRelevant: "ذو صلة", optLatest: "الأحدث",
    lblColor: "اللون:", optAllColors: "جميع الألوان", optBW: "أبيض وأسود", optBlue: "أزرق", optRed: "أحمر", optGreen: "أخضر", optYellow: "أصفر", optPurple: "أرجواني",
    lblOrientation: "الاتجاه:", optAllOrientations: "الكل", optLandscape: "أفقي", optPortrait: "عمودي", optSquare: "مربع",
    loadingText: "جاري تحميل الخلفيات...", btnDownload: "تنزيل الأصلي", btnFavorite: "المفضلة", btnShare: "مشاركة", relatedTitle: "خلفيات ذات صلة",
    shareTitle: "مشاركة الخلفية", shareSub: "انسخ الرابط أو شاركه مباشرة على وسائل التواصل الاجتماعي:", btnCopy: "نسخ",
    menuHeading: "القائمة", quickNav: "التنقل السريع", settingsNav: "الإعدادات والمعلومات",
    navHome: "الرئيسية", navGallery: "المعرض", navExplore: "استكشاف", navSettings: "الإعدادات", navAbout: "معلومات عنا"
  },
  de: {
    name: "Deutsch", siteLogo: "WallpaperHub", title: "JennWall 4K Hintergrundbilder", subtitle: "Laden Sie Ultra HD 4K Hintergrundbilder für PC und Handy herunter",
    searchPlaceholder: "Hier suchen...", searchBtn: "Suchen",
    catAll: "Alle", catNature: "Natur", catAnime: "Anime", catCars: "Autos", catAesthetic: "Ästhetisch", catDark: "Dunkel",
    lblSort: "Sortieren:", optRelevant: "Relevant", optLatest: "Neueste",
    lblColor: "Farbe:", optAllColors: "Alle Farben", optBW: "Schwarz-Weiß", optBlue: "Blau", optRed: "Rot", optGreen: "Grün", optYellow: "Gelb", optPurple: "Lila",
    lblOrientation: "Ausrichtung:", optAllOrientations: "Alle", optLandscape: "Querformat", optPortrait: "Hochformat", optSquare: "Quadratisch",
    loadingText: "Lade Hintergrundbilder...", btnDownload: "Original herunterladen", btnFavorite: "Favorit", btnShare: "Teilen", relatedTitle: "Ähnliche Hintergrundbilder",
    shareTitle: "Hintergrundbild teilen", shareSub: "Link kopieren oder direkt teilen:", btnCopy: "Kopieren",
    menuHeading: "Menü", quickNav: "Schnellnavigation", settingsNav: "Einstellungen & Info",
    navHome: "Startseite", navGallery: "Galerie", navExplore: "Entdecken", navSettings: "Einstellungen", navAbout: "Über uns"
  },
  zh: {
    name: "中文", siteLogo: "壁纸中心", title: "JennWall 4K 壁纸", subtitle: "下载适用于电脑和手机的超高清 4K 壁纸",
    searchPlaceholder: "在此搜索...", searchBtn: "搜索",
    catAll: "全部", catNature: "自然", catAnime: "动漫", catCars: "汽车", catAesthetic: "唯美", catDark: "黑暗",
    lblSort: "排序方式:", optRelevant: "相关度", optLatest: "最新",
    lblColor: "颜色:", optAllColors: "所有颜色", optBW: "黑白", optBlue: "蓝色", optRed: "红色", optGreen: "绿色", optYellow: "黄色", optPurple: "紫色",
    lblOrientation: "方向:", optAllOrientations: "全部", optLandscape: "横向", optPortrait: "纵向", optSquare: "正方形",
    loadingText: "正在加载壁纸...", btnDownload: "下载原图", btnFavorite: "收藏", btnShare: "分享", relatedTitle: "相关壁纸",
    shareTitle: "分享壁纸", shareSub: "复制链接或直接分享到社交平台：", btnCopy: "复制",
    menuHeading: "菜单", quickNav: "快速导航", settingsNav: "设置与信息",
    navHome: "首页", navGallery: "画廊", navExplore: "探索", navSettings: "设置", navAbout: "关于我们"
  },
  tr: {
    name: "Türkçe", siteLogo: "WallpaperHub", title: "JennWall 4K Duvar Kağıtları", subtitle: "Masaüstünüz ve telefonunuz için ultra HD 4K duvar kağıtları indirin",
    searchPlaceholder: "Burada ara...", searchBtn: "Ara",
    catAll: "Tümü", catNature: "Doğa", catAnime: "Anime", catCars: "Arabalar", catAesthetic: "Estetik", catDark: "Koyu",
    lblSort: "Sıralama:", optRelevant: "İlgili", optLatest: "En Yeni",
    lblColor: "Renk:", optAllColors: "Tüm Renkler", optBW: "Siyah & Beyaz", optBlue: "Mavi", optRed: "Kırmızı", optGreen: "Yeşil", optYellow: "Sarı", optPurple: "Mor",
    lblOrientation: "Yönelim:", optAllOrientations: "Tümü", optLandscape: "Yatay", optPortrait: "Dikey", optSquare: "Kare",
    loadingText: "Duvar kağıtları yükleniyor...", btnDownload: "Orijinal Yükle", btnFavorite: "Favori", btnShare: "Paylaş", relatedTitle: "İlgili Duvar Kağıtları",
    shareTitle: "Duvar Kağıdını Paylaş", shareSub: "Bağlantıyı kopyalayın veya doğrudan paylaşın:", btnCopy: "Kopyala",
    menuHeading: "Menü", quickNav: "Hızlı Gezinme", settingsNav: "Ayarlar ve Bilgi",
    navHome: "Ana Sayfa", navGallery: "Galeri", navExplore: "Keşfet", navSettings: "Ayarlar", navAbout: "Hakkımızda"
  },
  ru: {
    name: "Русский", siteLogo: "WallpaperHub", title: "JennWall 4K Обои", subtitle: "Скачивайте обои ultra HD 4K для ПК и телефона",
    searchPlaceholder: "Поиск...", searchBtn: "Искать",
    catAll: "Все", catNature: "Природа", catAnime: "Аниме", catCars: "Машины", catAesthetic: "Эстетика", catDark: "Темные",
    lblSort: "Сортировка:", optRelevant: "По релевантности", optLatest: "Сначала новые",
    lblColor: "Цвет:", optAllColors: "Все цвета", optBW: "Черно-белые", optBlue: "Синий", optRed: "Красный", optGreen: "Зеленый", optYellow: "Желтый", optPurple: "Фиолетовый",
    lblOrientation: "Ориентация:", optAllOrientations: "Все", optLandscape: "Альбомная", optPortrait: "Портретная", optSquare: "Квадратная",
    loadingText: "Загрузка обоев...", btnDownload: "Скачать оригинал", btnFavorite: "Избранное", btnShare: "Поделиться", relatedTitle: "Похожие обои",
    shareTitle: "Поделиться обоями", shareSub: "Скопируйте ссылку или поделитесь в соцсетях:", btnCopy: "Копировать",
    menuHeading: "Главная", quickNav: "Быстрая навигация", settingsNav: "Настройки и инфо",
    navHome: "Главная", navGallery: "Галерея", navExplore: "Обзор", navSettings: "Настройки", navAbout: "О нас"
  }
};
const langKeys = Object.keys(translations);
let currentLang = localStorage.getItem('site_lang') || 'en';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('site_lang', lang);

  document.querySelectorAll('[data-key]').forEach(elem => {
    const key = elem.getAttribute('data-key');
    if (translations[lang] && translations[lang][key]) {
      elem.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('[data-key-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-key-placeholder');
    if (translations[lang] && translations[lang][key]) {
      elem.placeholder = translations[lang][key];
    }
  });

  document.body.dir = (lang === 'ur' || lang === 'ar') ? 'rtl' : 'ltr';
}

// ==========================================
// 🌐 LANGUAGE DATA WITH FLAGS
// ==========================================
const langDetails = {
  en: { name: "English", flag: "🇬🇧" },
  ur: { name: "اردو", flag: "🇵🇰" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
  es: { name: "Spanish", flag: "🇪🇸" },
  fr: { name: "French", flag: "🇫🇷" },
  de: { name: "German", flag: "🇩🇪" },
  ar: { name: "العربية", flag: "🇸🇦" },
  zh: { name: "Chinese", flag: "🇨🇳" },
  tr: { name: "Turkish", flag: "🇹🇷" },
  ru: { name: "Russian", flag: "🇷🇺" }
};

// ==========================================
// 🌐 POPUP DROPDOWN (DYNAMIC POSITIONING FIX)
// ==========================================
function toggleLanguage(e) {
  if (e) e.stopPropagation();

  let langBox = document.getElementById('langDropdownBox');

  if (langBox) {
    closeLanguageDropdown();
    return;
  }

  const isLightMode = document.body.classList.contains('light-mode');

  langBox = document.createElement('div');
  langBox.id = 'langDropdownBox';
  langBox.className = `custom-lang-popup ${isLightMode ? 'light-mode' : ''}`;

  let listHTML = langKeys.map(code => {
    const isSelected = code === currentLang;
    const flag = langDetails[code]?.flag || "🌐";
    const name = langDetails[code]?.name || translations[code]?.name;

    return `
      <button class="lang-row ${isSelected ? 'selected-blue' : ''}" onclick="selectLanguage('${code}')">
        <div class="lang-left">
          <span class="flag-icon">${flag}</span>
          <span class="lang-text">${name}</span>
        </div>
        ${isSelected ? '<span class="check-mark">✓</span>' : ''}
      </button>
    `;
  }).join('');

  langBox.innerHTML = `<div class="lang-popup-inner">${listHTML}</div>`;

  document.body.appendChild(langBox);

  const btn = e ? e.currentTarget : document.getElementById('langToggleBtn');
  const isRtl = document.body.dir === 'rtl';

  if (btn) {
    const rect = btn.getBoundingClientRect();
    langBox.style.position = 'fixed';
    
    if (isRtl) {
      langBox.style.right = `${window.innerWidth - rect.left + 10}px`;
      langBox.style.left = 'auto';
    } else {
      langBox.style.left = `${rect.right + 10}px`;
      langBox.style.right = 'auto';
    }

    const bottomSpace = window.innerHeight - rect.bottom;
    if (bottomSpace < 220) {
      langBox.style.bottom = '10px';
      langBox.style.top = 'auto';
    } else {
      langBox.style.top = `${rect.top}px`;
      langBox.style.bottom = 'auto';
    }

    langBox.style.zIndex = '999999';
  }
}

function selectLanguage(code) {
  applyLanguage(code);
  closeLanguageDropdown();
  showToast(`Language changed to ${langDetails[code]?.name || code}`);
}

function closeLanguageDropdown() {
  const langBox = document.getElementById('langDropdownBox');
  if (langBox) langBox.remove();
}

document.addEventListener('click', (e) => {
  const langBox = document.getElementById('langDropdownBox');
  const langBtn = document.getElementById('langToggleBtn');
  if (langBox && !langBox.contains(e.target) && (!langBtn || !langBtn.contains(e.target))) {
    closeLanguageDropdown();
  }
});

// ==========================================
// ⚙️ CORE HELPER & UI FUNCTIONS
// ==========================================
function formatUnsplashPhoto(item) {
  if (!item) return null;
  if (item.src && item.photographer !== undefined) return item;

  return {
    id: item.id,
    src: {
      large: item.urls?.regular || item.urls?.small || '',
      large2x: item.urls?.full || item.urls?.regular || '',
      original: item.urls?.raw || item.urls?.full || item.urls?.regular || '',
      medium: item.urls?.small || item.urls?.regular || ''
    },
    photographer: item.user?.name || item.user?.username || 'Unsplash',
    alt: item.alt_description || item.description || 'Wallpaper'
  };
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}


// ==========================================
// 📥 DOWNLOAD & FAVORITES LOGIC
// ==========================================
async function downloadImage(imgUrl, fileName) {
  showToast("Downloading started...");
  const cleanFileName = fileName ? fileName.replace(/[^a-zA-Z0-9_-]/g, "_") : "wallpaper";

  const exists = downloadHistory.some(item => item.url === imgUrl);
  if (!exists) {
    downloadHistory.unshift({ url: imgUrl, name: cleanFileName, id: Date.now() });
    if (downloadHistory.length > 30) downloadHistory.pop();
    localStorage.setItem('download_history', JSON.stringify(downloadHistory));
  }

  try {
    const response = await fetch(imgUrl);
    const originalBlob = await response.blob();
    const jpegBlob = new Blob([originalBlob], { type: 'image/jpeg' });
    const blobUrl = URL.createObjectURL(jpegBlob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${cleanFileName}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    showToast("Downloaded to device! 📁");
  } catch (error) {
    window.open(imgUrl, '_blank');
  }
}

function toggleFavorite(photo) {
  const index = favorites.findIndex(item => item.id === photo.id);
  if (index === -1) {
    favorites.push(photo);
    showToast("Added to Favorites ❤️");
  } else {
    favorites.splice(index, 1);
    showToast("Removed from Favorites 💔");
  }
  localStorage.setItem('fav_wallpapers', JSON.stringify(favorites));
  updateFavCount();

  if (isFavoritesView) {
    showFavorites();
  } else {
    const btn = document.getElementById(`fav-btn-${photo.id}`);
    if (btn) btn.classList.toggle('liked');

    const detailFavBtn = document.getElementById('detailFavBtn');
    if (detailFavBtn) {
      const isFavNow = favorites.some(item => item.id === photo.id);
      const favTxt = translations[currentLang]?.btnFavorite || "Favorite";
      detailFavBtn.innerHTML = isFavNow 
        ? `<i class="fa-solid fa-heart" style="color: #ff4757;"></i> ${favTxt}` 
        : `<i class="fa-regular fa-heart"></i> ${favTxt}`;
    }
  }
}

function showFavorites() {
  isFavoritesView = true;
  isLiveWallpaperMode = false;
  if (gallery) gallery.innerHTML = '';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

  if (favorites.length === 0) {
    if (gallery) {
      gallery.innerHTML = `
        <div class="empty-view-state">
          <i class="fa-regular fa-heart"></i>
          <h3>No Favorites Yet</h3>
          <p>Click on the heart icon on any wallpaper to save it here.</p>
        </div>`;
    }
    return;
  }

  favorites.forEach(photo => renderCard(photo));
}

// ==========================================
// 🔗 SHARE LOGIC
// ==========================================
function openShareModal(imgUrl) {
  currentShareUrl = imgUrl;
  const shareModal = document.getElementById('shareModal');
  const shareInput = document.getElementById('shareLinkInput');
  if (shareInput) shareInput.value = imgUrl;
  if (shareModal) shareModal.style.display = 'block';
}

function closeShareModal() {
  const shareModal = document.getElementById('shareModal');
  if (shareModal) shareModal.style.display = 'none';
}

function copyShareLink() {
  const shareInput = document.getElementById('shareLinkInput');
  if (!shareInput) return;
  navigator.clipboard.writeText(shareInput.value).then(() => {
    showToast("Link copied to clipboard! 📋");
    closeShareModal();
  });
}

function shareToSocial(platform) {
  const text = encodeURIComponent("Check out this amazing wallpaper!");
  const url = encodeURIComponent(currentShareUrl);
  let shareUrl = '';

  if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
  else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  else if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  else if (platform === 'pinterest') shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${url}&description=${text}`;

  window.open(shareUrl, '_blank');
}

// ==========================================
// 🔍 SEARCH & RECENT SEARCHES LOGIC
// ==========================================
function saveRecentSearch(query) {
  if (!query) return;
  recentSearches = recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
  recentSearches.unshift(query);
  if (recentSearches.length > 5) recentSearches.pop();
  localStorage.setItem('recent_searches', JSON.stringify(recentSearches));
}

function renderRecentSearches() {
  if (!recentSearchesContainer) return;
  if (recentSearches.length === 0) {
    recentSearchesContainer.classList.remove('show');
    return;
  }
  recentSearchesContainer.innerHTML = '';
  recentSearches.forEach(term => {
    const chip = document.createElement('span');
    chip.className = 'recent-chip';
    chip.innerHTML = `${term}`;
    chip.onclick = () => {
      if (searchInput) searchInput.value = term;
      recentSearchesContainer.classList.remove('show');
      handleSearch();
    };
    recentSearchesContainer.appendChild(chip);
  });
}

// ==========================================
// 🖼️ MODAL & RELATED WALLPAPERS
// ==========================================
function openWallpaperDetail(photo) {
  const modal = document.getElementById('wallpaperDetailModal');
  const mainImg = document.getElementById('detailMainImage');
  const downloadBtn = document.getElementById('detailDownloadBtn');
  const shareBtn = document.getElementById('detailShareBtn');
  const detailFavBtn = document.getElementById('detailFavBtn');

  if (!modal || !mainImg) return;

  const titleName = photo.alt ? photo.alt.replace(/[^a-zA-Z0-9]/g, "_") : `wallpaper_${photo.id}`;
  mainImg.src = photo.src.large2x || photo.src.original;

  if (downloadBtn) downloadBtn.onclick = () => downloadImage(photo.src.original, titleName);
  if (shareBtn) {
    shareBtn.onclick = (e) => {
      e.stopPropagation();
      openShareModal(photo.src.original);
    };
  }

  if (detailFavBtn) {
    const isFav = favorites.some(item => item.id === photo.id);
    const favTxt = translations[currentLang]?.btnFavorite || "Favorite";
    detailFavBtn.innerHTML = isFav 
      ? `<i class="fa-solid fa-heart" style="color: #ff4757;"></i> ${favTxt}` 
      : `<i class="fa-regular fa-heart"></i> ${favTxt}`;

    detailFavBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(photo);
    };
  }

  modal.style.display = 'block';
  loadRelatedWallpapers(photo.alt || currentQuery);
}

function closeWallpaperDetail() {
  const modal = document.getElementById('wallpaperDetailModal');
  if (modal) modal.style.display = 'none';
}

async function loadRelatedWallpapers(queryKeyword) {
  const relatedGrid = document.getElementById('relatedGrid');
  if (!relatedGrid) return;
  relatedGrid.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted); grid-column: 1/-1;">Loading related...</p>';

  try {
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(queryKeyword)}&per_page=6&client_id=${UNSPLASH_ACCESS_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    relatedGrid.innerHTML = '';
    const photos = data.results || [];
    if (photos.length > 0) {
      photos.forEach(rawItem => {
        const relPhoto = formatUnsplashPhoto(rawItem);
        const img = document.createElement('img');
        img.src = relPhoto.src.medium;
        img.alt = relPhoto.alt || 'Related';
        img.onclick = () => openWallpaperDetail(relPhoto);
        relatedGrid.appendChild(img);
      });
    } else {
      relatedGrid.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted); grid-column: 1/-1;">No related wallpapers found.</p>';
    }
  } catch (error) {
    relatedGrid.innerHTML = '';
  }
}

// ==========================================
// 🎨 RENDER & API FETCH
// ==========================================
function renderCard(photo) {
  if (!gallery) return;
  const card = document.createElement('div');
  card.classList.add('card');
  if (isLiveWallpaperMode) card.classList.add('live-card');

  const isFav = favorites.some(item => item.id === photo.id);
  const titleName = photo.alt ? photo.alt.replace(/[^a-zA-Z0-9]/g, "_") : `wallpaper_${photo.id}`;

  const liveBadgeHTML = isLiveWallpaperMode ? `
    <div style="position: absolute; top: 12px; left: 12px; z-index: 5; background: rgba(0, 0, 0, 0.65); color: #00f2fe; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; display: flex; align-items: center; gap: 5px; backdrop-filter: blur(4px); border: 1px solid rgba(0,242,254,0.3);">
      <i class="fa-solid fa-circle-play" style="font-size: 0.8rem; animation: pulse 1.5s infinite;"></i> LIVE 4K
    </div>` : '';

  card.innerHTML = `
    ${liveBadgeHTML}
    <img src="${photo.src.large}" alt="${photo.alt || 'Wallpaper'}" loading="lazy" style="${isLiveWallpaperMode ? 'transition: transform 8s ease-in-out; transform: scale(1.05);' : ''}" />
    <div class="overlay">
      <span class="photographer"><i class="fa-regular fa-user"></i> ${photo.photographer}</span>
      <div class="action-btns">
        <button class="icon-btn" title="Share" onclick="event.stopPropagation(); openShareModal('${photo.src.original}')">
          <i class="fa-solid fa-share-nodes"></i>
        </button>
        <button id="fav-btn-${photo.id}" class="icon-btn ${isFav ? 'liked' : ''}" title="Favorite" onclick="event.stopPropagation(); toggleFavorite(${JSON.stringify(photo).replace(/"/g, '&quot;')})">
          <i class="fa-solid fa-heart"></i>
        </button>
        <button class="icon-btn" title="Download" onclick="event.stopPropagation(); downloadImage('${photo.src.original}', '${titleName}')">
          <i class="fa-solid fa-download"></i>
        </button>
      </div>
    </div>
  `;

  if (isLiveWallpaperMode) {
    card.addEventListener('mouseenter', () => {
      const img = card.querySelector('img');
      if (img) img.style.transform = 'scale(1.25) rotate(1deg)';
    });
    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('img');
      if (img) img.style.transform = 'scale(1.05)';
    });
  }

  card.onclick = () => openWallpaperDetail(photo);
  gallery.appendChild(card);
}

async function fetchWallpapers(query, page = 1) {
  if (isLoading || !hasMore || isFavoritesView) return;
  isLoading = true;
  if (loading) loading.style.display = 'block';

  try {
    let apiUrl = '';
    const orientationParam = selectedOrientation === 'square' ? 'squarish' : selectedOrientation;

    if (!query || query === '4k wallpaper') {
      apiUrl = `https://api.unsplash.com/photos?page=${page}&per_page=30&client_id=${UNSPLASH_ACCESS_KEY}`;
      if (selectedSort) apiUrl += `&order_by=${selectedSort === 'latest' ? 'latest' : 'popular'}`;
    } else {
      apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=30&client_id=${UNSPLASH_ACCESS_KEY}`;
      if (orientationParam) apiUrl += `&orientation=${orientationParam}`;
      if (selectedColor) apiUrl += `&color=${selectedColor}`;
      if (selectedSort) apiUrl += `&order_by=${selectedSort === 'latest' ? 'latest' : 'relevant'}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    if (loading) loading.style.display = 'none';

    const rawPhotos = Array.isArray(data) ? data : (data.results || []);

    if (rawPhotos.length === 0 && page === 1) {
      if (gallery) gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No wallpapers found matching filters!</p>';
      isLoading = false;
      return;
    }

    rawPhotos.forEach(rawItem => {
      const photo = formatUnsplashPhoto(rawItem);
      if (photo && !loadedImageIds.has(photo.id)) {
        loadedImageIds.add(photo.id);
        renderCard(photo);
      }
    });

    isLoading = false;
  } catch (error) {
    if (loading) loading.style.display = 'none';
    isLoading = false;
  }
}

function applyFilters() {
  const orientationElem = document.getElementById('orientationFilter');
  const colorElem = document.getElementById('colorFilter');
  const sortElem = document.getElementById('sortFilter');

  if (orientationElem) selectedOrientation = orientationElem.value;
  if (colorElem) selectedColor = colorElem.value;
  if (sortElem) selectedSort = sortElem.value;

  resetGallery();
  fetchWallpapers(currentQuery, currentPage);
}

function resetGallery() {
  isFavoritesView = false;
  currentPage = 1;
  hasMore = true;
  if (gallery) gallery.innerHTML = '';
  loadedImageIds.clear();
}

function handleSearch() {
  if (!searchInput) return;
  const query = searchInput.value.trim();
  if (query) {
    saveRecentSearch(query);
    if (recentSearchesContainer) recentSearchesContainer.classList.remove('show');
    currentQuery = query;
    resetGallery();
    fetchWallpapers(currentQuery, currentPage);
  }
}

function filterCategory(categoryName, event) {
  currentQuery = categoryName;
  resetGallery();
  document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  } else if (window.event && window.event.target) {
    window.event.target.classList.add('active');
  }
  fetchWallpapers(currentQuery, currentPage);
}

// ==========================================
// 🚀 NAVIGATION VIEWS & SIDEBAR MENU
// ==========================================
function updateActiveNav(elementId) {
  document.querySelectorAll('.sidebar .nav-icon').forEach(icon => icon.classList.remove('active'));
  const activeElem = document.getElementById(elementId);
  if (activeElem) activeElem.classList.add('active');
}

function showHomeView(e) {
  if (e) e.preventDefault();
  isLiveWallpaperMode = false;
  updateActiveNav('navHome');
  currentQuery = '4k wallpaper';
  resetGallery();
  fetchWallpapers(currentQuery, currentPage);
}

function showGalleryView(e) {
  if (e) e.preventDefault();
  isLiveWallpaperMode = false;
  updateActiveNav('navGallery');
  currentQuery = 'hd wallpaper';
  resetGallery();
  fetchWallpapers(currentQuery, currentPage);
}

function showVideosView(e) {
  if (e) e.preventDefault();
  isLiveWallpaperMode = true;
  updateActiveNav('navVideos');
  currentQuery = 'live 4k wallpaper animated';
  resetGallery();
  fetchWallpapers(currentQuery, currentPage);
  showToast("🎬 Live 4K Mode Activated!");
}

function showExploreView(e) {
  if (e) e.preventDefault();
  isLiveWallpaperMode = false;
  updateActiveNav('navExplore');
  currentQuery = 'aesthetic desktop backgrounds';
  resetGallery();
  fetchWallpapers(currentQuery, currentPage);
}

function showDownloadsView(e) {
  if (e) e.preventDefault();
  isLiveWallpaperMode = false;
  updateActiveNav('navDownloads');
  isFavoritesView = true;
  if (gallery) gallery.innerHTML = '';

  if (downloadHistory.length === 0) {
    if (gallery) {
      gallery.innerHTML = `
        <div class="empty-view-state">
          <i class="fa-solid fa-download"></i>
          <h3>No Downloads Yet</h3>
          <p>Downloaded wallpapers will appear here for quick access.</p>
        </div>`;
    }
    return;
  }

  downloadHistory.forEach(item => {
    const photo = {
      id: item.id || Date.now(),
      src: { large: item.url, original: item.url },
      photographer: item.name || 'Downloaded Image',
      alt: item.name || 'Wallpaper'
    };
    renderCard(photo);
  });
}

function showBookmarksView(e) {
  if (e) e.preventDefault();
  updateActiveNav('navBookmarks');
  showFavorites();
}

// ==========================================
// 🌙 THEME TOGGLE & INITIALIZATION
// ==========================================
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('site_theme', isLight ? 'light' : 'dark');
  });
}

// Search Listeners
if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (searchInput) {
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  searchInput.addEventListener('focus', () => {
    renderRecentSearches();
    if (recentSearches.length > 0 && recentSearchesContainer) {
      recentSearchesContainer.classList.add('show');
    }
  });
}

// Close Recent Searches Box on Outside Click
document.addEventListener('click', (e) => {
  if (recentSearchesContainer && !recentSearchesContainer.contains(e.target) && e.target !== searchInput) {
    recentSearchesContainer.classList.remove('show');
  }
});

// Infinite Scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    if (!isLoading && hasMore && !isFavoritesView) {
      currentPage++;
      fetchWallpapers(currentQuery, currentPage);
    }
  }
});

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Restore Theme
  const savedTheme = localStorage.getItem('site_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  // Restore Language & Favorites Count
  applyLanguage(currentLang);
  updateFavCount();

  // Initial Fetch
  fetchWallpapers(currentQuery, currentPage);
});