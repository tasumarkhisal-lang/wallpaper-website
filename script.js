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

let selectedOrientation = '';
let selectedColor = '';
let currentShareUrl = '';

const loadedImageIds = new Set();
let favorites = JSON.parse(localStorage.getItem('fav_wallpapers')) || [];
let recentSearches = JSON.parse(localStorage.getItem('recent_searches')) || [];

// Theme Toggle
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
}

// Toast Notification
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// Download Image
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

// Favorites Logic
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

// Social Share
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

// Auto-Creating Dynamic Wallpaper Detail Modal
function openWallpaperDetail(photo) {
  let modal = document.getElementById('wallpaperDetailModal');
  
  // Dynamic Modal Creation if HTML is missing it
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'wallpaperDetailModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); z-index: 9999; display: flex;
      justify-content: center; align-items: center; padding: 20px;
      box-sizing: border-box; backdrop-filter: blur(5px);
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    document.body.appendChild(modal);
  }

  const titleName = photo.alt ? photo.alt.replace(/[^a-zA-Z0-9]/g, "_") : `wallpaper_${photo.id}`;

  modal.innerHTML = `
    <div style="background: #1e1e2e; color: white; padding: 20px; border-radius: 16px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; text-align: center;">
      <button onclick="document.getElementById('wallpaperDetailModal').style.display='none'" style="position: absolute; right: 15px; top: 15px; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 16px;">✕</button>
      <img src="${photo.src.large2x || photo.src.original}" style="width: 100%; max-height: 60vh; object-fit: contain; border-radius: 12px; margin-bottom: 15px;">
      <h3 style="margin: 10px 0; font-size: 1.1rem; font-weight: 500;">${photo.alt || 'HD Wallpaper'}</h3>
      <p style="color: #a6adc8; font-size: 0.9rem; margin-bottom: 15px;">By ${photo.photographer}</p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="modalDownloadBtn" style="padding: 10px 20px; background: #89b4fa; color: #11111b; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Download HD</button>
      </div>
    </div>
  `;

  document.getElementById('modalDownloadBtn').onclick = () => downloadImage(photo.src.original, titleName);
  modal.style.display = 'flex';
}

// Render Card Function
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

  // Entire Card Click Event
  card.onclick = () => openWallpaperDetail(photo);

  gallery.appendChild(card);
}

// Fetch Wallpapers API
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
    if (recentSearchesContainer) recentSearchesContainer.classList.remove('show');
    currentQuery = query;
    resetGallery();
    fetchWallpapers(currentQuery, currentPage);
  }
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

fetchWallpapers(currentQuery, currentPage);