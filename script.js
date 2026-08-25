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

let selectedOrientation = '';
let selectedColor = '';
let selectedSort = 'relevant';
let currentShareUrl = '';

const loadedImageIds = new Set();
let favorites = JSON.parse(localStorage.getItem('fav_wallpapers')) || [];
let recentSearches = JSON.parse(localStorage.getItem('recent_searches')) || [];
let downloadHistory = JSON.parse(localStorage.getItem('download_history')) || [];

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

updateFavCount();

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function updateFavCount() {
  if (favCounter) {
    favCounter.innerText = `(${favorites.length})`;
  }
}

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
      detailFavBtn.innerHTML = isFavNow 
        ? '<i class="fa-solid fa-heart" style="color: #ff4757;"></i> Favorited' 
        : '<i class="fa-regular fa-heart"></i> Favorite';
    }
  }
}

function showFavorites() {
  isFavoritesView = true;
  gallery.innerHTML = '';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

  if (favorites.length === 0) {
    gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px 0;">No favorites saved yet! ❤️</p>';
    return;
  }

  favorites.forEach(photo => renderCard(photo));
}

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
      searchInput.value = term;
      recentSearchesContainer.classList.remove('show');
      handleSearch();
    };
    recentSearchesContainer.appendChild(chip);
  });
}

if (searchInput) {
  searchInput.addEventListener('focus', () => {
    renderRecentSearches();
    if (recentSearches.length > 0 && recentSearchesContainer) recentSearchesContainer.classList.add('show');
  });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box') && recentSearchesContainer) {
    recentSearchesContainer.classList.remove('show');
  }
});

function openWallpaperDetail(photo) {
  const modal = document.getElementById('wallpaperDetailModal');
  const mainImg = document.getElementById('detailMainImage');
  const downloadBtn = document.getElementById('detailDownloadBtn');
  const shareBtn = document.getElementById('detailShareBtn');
  const detailFavBtn = document.getElementById('detailFavBtn');

  if (!modal || !mainImg) return;

  const titleName = photo.alt ? photo.alt.replace(/[^a-zA-Z0-9]/g, "_") : `wallpaper_${photo.id}`;

  mainImg.src = photo.src.large2x || photo.src.original;

  if (downloadBtn) {
    downloadBtn.onclick = () => downloadImage(photo.src.original, titleName);
  }

  if (shareBtn) {
    shareBtn.onclick = (e) => {
      e.stopPropagation();
      openShareModal(photo.src.original);
    };
  }

  if (detailFavBtn) {
    const isFav = favorites.some(item => item.id === photo.id);
    detailFavBtn.innerHTML = isFav 
      ? '<i class="fa-solid fa-heart" style="color: #ff4757;"></i> Favorited' 
      : '<i class="fa-regular fa-heart"></i> Favorite';

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

function renderCard(photo) {
  const card = document.createElement('div');
  card.classList.add('card');

  const isFav = favorites.some(item => item.id === photo.id);
  const titleName = photo.alt ? photo.alt.replace(/[^a-zA-Z0-9]/g, "_") : `wallpaper_${photo.id}`;

  card.innerHTML = `
    <img src="${photo.src.large}" alt="${photo.alt || 'Wallpaper'}" loading="lazy" />
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
      gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No wallpapers found matching filters!</p>';
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
  gallery.innerHTML = '';
  loadedImageIds.clear();
}

function handleSearch() {
  const query = searchInput.value.trim();
  if (query) {
    saveRecentSearch(query);
    if (recentSearchesContainer) recentSearchesContainer.classList.remove('show');
    currentQuery = query;
    resetGallery();
    fetchWallpapers(currentQuery, currentPage);
  }
}

function filterCategory(categoryName) {
  currentQuery = categoryName;
  resetGallery();
  document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
  if (window.event && window.event.target) window.event.target.classList.add('active');
  fetchWallpapers(currentQuery, currentPage);
}

if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });

window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 800) {
    if (!isLoading && hasMore && !isFavoritesView) {
      currentPage++;
      fetchWallpapers(currentQuery, currentPage);
    }
  }
});

window.addEventListener('click', (e) => {
  const shareModal = document.getElementById('shareModal');
  const detailModal = document.getElementById('wallpaperDetailModal');

  if (e.target === shareModal) closeShareModal();
  if (e.target === detailModal) closeWallpaperDetail();
});

fetchWallpapers(currentQuery, currentPage);