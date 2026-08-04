const apiKey = 'AqInvPqZLEnPVxf4y72FAKybuAKUafbWNu6FjwIr9GZO9aYdEVfiti7F';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const gallery = document.getElementById('wallpaperGallery');
const loading = document.getElementById('loading');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const recentSearchesContainer = document.getElementById('recentSearches');

let currentQuery = '4k wallpaper';
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let isFavoritesView = false;

// Filter Variables
let selectedOrientation = '';
let selectedColor = '';
let currentShareUrl = '';

const loadedImageIds = new Set();
let favorites = JSON.parse(localStorage.getItem('fav_wallpapers')) || [];
let recentSearches = JSON.parse(localStorage.getItem('recent_searches')) || [];

// 1. Theme Toggle Logic
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
}

// 2. Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// 3. Download Image Function
async function downloadImage(imgUrl, fileName) {
  showToast("Downloading started...");
  try {
    const response = await fetch(imgUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${fileName}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    window.open(imgUrl, '_blank');
  }
}

// 4. Toggle Favorites
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
  
  if (isFavoritesView) {
    showFavorites();
  } else {
    const btn = document.getElementById(`fav-btn-${photo.id}`);
    if (btn) btn.classList.toggle('liked');
  }
}

// 5. Show Favorites Page
function showFavorites() {
  isFavoritesView = true;
  gallery.innerHTML = '';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

  if (favorites.length === 0) {
    gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No favorites saved yet!</p>';
    return;
  }

  favorites.forEach(photo => renderCard(photo));
}

// 6. Social Share Functions
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

// 7. Recent Searches Logic
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

// 8. Wallpaper Detail View & Related Wallpapers Logic (Matched with HTML IDs)
function openWallpaperDetail(photo) {
  const modal = document.getElementById('wallpaperDetailModal');
  const mainImg = document.getElementById('detailMainImage');
  const downloadBtn = document.getElementById('detailDownloadBtn');
  const shareBtn = document.getElementById('detailShareBtn');

  if (!modal || !mainImg) return;

  const titleName = photo.alt ? photo.alt.replace(/[^a-zA-Z0-9]/g, "_") : `wallpaper_${photo.id}`;

  mainImg.src = photo.src.large2x || photo.src.original;
  
  if (downloadBtn) {
    downloadBtn.onclick = () => downloadImage(photo.src.original, titleName);
  }
  
  // Detail Modal Share Button Fix
  if (shareBtn) {
    shareBtn.onclick = (e) => {
      e.stopPropagation();
      openShareModal(photo.src.original);
    };
  }

  modal.classList.add('show');
  modal.style.display = 'block';
  loadRelatedWallpapers(photo.alt || currentQuery);
}
function closeWallpaperDetail() {
  const modal = document.getElementById('wallpaperDetailModal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
}

async function loadRelatedWallpapers(queryKeyword) {
  const relatedGrid = document.getElementById('relatedGrid');
  if (!relatedGrid) return;
  relatedGrid.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">Loading related wallpapers...</p>';

  try {
    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(queryKeyword)}&per_page=6`;
    const response = await fetch(apiUrl, {
      headers: { Authorization: apiKey }
    });
    const data = await response.json();

    relatedGrid.innerHTML = '';
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach(relPhoto => {
        const img = document.createElement('img');
        img.src = relPhoto.src.medium;
        img.alt = relPhoto.alt || 'Related Wallpaper';
        img.onclick = () => openWallpaperDetail(relPhoto);
        relatedGrid.appendChild(img);
      });
    } else {
      relatedGrid.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No related wallpapers found.</p>';
    }
  } catch (error) {
    relatedGrid.innerHTML = '';
  }
}

// 9. Render Card Element (Connected to Entire Card)
function renderCard(photo) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.style.cursor = 'pointer';

  const isFav = favorites.some(item => item.id === photo.id);
  const titleName = photo.alt ? photo.alt.replace(/[^a-zA-Z0-9]/g, "_") : `wallpaper_${photo.id}`;

  const imgElem = document.createElement('img');
  imgElem.src = photo.src.large;
  imgElem.alt = photo.alt || 'Wallpaper';
  imgElem.loading = 'lazy';

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  const photographerSpan = document.createElement('span');
  photographerSpan.className = 'photographer';
  photographerSpan.innerHTML = `<i class="fa-regular fa-user"></i> ${photo.photographer}`;

  const actionBtns = document.createElement('div');
  actionBtns.className = 'action-btns';

  const shareBtn = document.createElement('button');
  shareBtn.className = 'icon-btn';
  shareBtn.title = 'Share';
  shareBtn.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
  shareBtn.onclick = (e) => {
    e.stopPropagation();
    openShareModal(photo.src.original);
  };

  const favBtn = document.createElement('button');
  favBtn.id = `fav-btn-${photo.id}`;
  favBtn.className = `icon-btn ${isFav ? 'liked' : ''}`;
  favBtn.title = 'Favorite';
  favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
  favBtn.onclick = (e) => {
    e.stopPropagation();
    toggleFavorite(photo);
  };

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'icon-btn';
  downloadBtn.title = 'Download';
  downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    downloadImage(photo.src.original, titleName);
  };

  actionBtns.appendChild(shareBtn);
  actionBtns.appendChild(favBtn);
  actionBtns.appendChild(downloadBtn);

  overlay.appendChild(photographerSpan);
  overlay.appendChild(actionBtns);

  card.appendChild(imgElem);
  card.appendChild(overlay);

  // Card par click karne se Detail Modal khulega
  card.onclick = () => openWallpaperDetail(photo);

  gallery.appendChild(card);
}

// 10. Fetch Wallpapers API
async function fetchWallpapers(query, page = 1) {
  if (isLoading || !hasMore || isFavoritesView) return;
  isLoading = true;
  if (loading) loading.style.display = 'block';

  try {
    let apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=30`;
    if (selectedOrientation) apiUrl += `&orientation=${selectedOrientation}`;
    if (selectedColor) apiUrl += `&color=${selectedColor}`;

    const response = await fetch(apiUrl, {
      headers: { Authorization: apiKey }
    });

    if (!response.ok) throw new Error('API Key error.');

    const data = await response.json();
    if (loading) loading.style.display = 'none';

    if (data.photos.length === 0 && page === 1) {
      gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No wallpapers found matching filters!</p>';
      isLoading = false;
      return;
    }

    data.photos.forEach(photo => {
      if (!loadedImageIds.has(photo.id)) {
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

// Apply Filters
function applyFilters() {
  const orientationElem = document.getElementById('orientationFilter');
  const colorElem = document.getElementById('colorFilter');
  if (orientationElem) selectedOrientation = orientationElem.value;
  if (colorElem) selectedColor = colorElem.value;
  
  resetGallery();
  fetchWallpapers(currentQuery, currentPage);
}

// Reset Logic
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

// Lightbox Modal Fallback
function closeModal() {
  const modal = document.getElementById('imageModal');
  if (modal) modal.style.display = "none";
}

// Event Listeners
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

// Window Outside Click Listener
window.addEventListener('click', (e) => {
  const shareModal = document.getElementById('shareModal');
  const detailModal = document.getElementById('wallpaperDetailModal');

  if (e.target === shareModal) {
    closeShareModal();
  }
  if (e.target === detailModal) {
    closeWallpaperDetail();
  }
});

// Initial Load
fetchWallpapers(currentQuery, currentPage);