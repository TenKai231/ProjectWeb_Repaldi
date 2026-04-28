/* ============================================================ */
/*         MARKET PAGE JS — LEVIATHAN STORE                     */
/*         Abyss Arsenal Logic v2.0                             */
/* ============================================================ */

/* ─── CART ──────────────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('lev_cart') || '[]');

function saveCart() {
  localStorage.setItem('lev_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((sum, i) => sum + i.qty, 0);

  if (badge) {
    badge.textContent = total;
    badge.classList.toggle('hidden', total === 0);
  }
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }

  saveCart();
  updateCartBadge();
  showToast(`✅ ${name} added to cart!`);
}

/* ─── TOAST ─────────────────────────────────────────────────── */
function showToast(msg) {
  let toast = document.getElementById('lev-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lev-toast';
    toast.style.cssText =
      'position:fixed;bottom:2rem;right:2rem;background:#0ff2;color:#fff;' +
      'border:1px solid #0ff6;padding:0.75rem 1.25rem;border-radius:8px;' +
      'font-family:Orbitron,sans-serif;font-size:0.75rem;z-index:9999;' +
      'backdrop-filter:blur(12px);transition:opacity 0.4s';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2500);
}

/* ─── EXPAND CARD ───────────────────────────────────────────── */
function expandCard(btn) {
  const card = btn.closest('.product-card');
  if (!card) return;

  card.classList.toggle('expanded');
  const icon = btn.querySelector('i');

  if (card.classList.contains('expanded')) {
    if (icon) {
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    }
    btn.innerHTML = btn.innerHTML.replace('SELENGKAPNYA', 'TUTUP');
  } else {
    if (icon) {
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
    btn.innerHTML = btn.innerHTML.replace('TUTUP', 'SELENGKAPNYA');
  }
}

/* ─── FILTER STATE ──────────────────────────────────────────── */
let activeKasta = 'all';
let activeFormation = 'all';
let activeCategory = 'all';
let activeSearch = '';

function applyFilters() {
  const cards = document.querySelectorAll('.product-card');
  let visible = 0;

  cards.forEach(card => {
    const kasta = card.dataset.kasta || '';
    const formation = card.dataset.formation || '';
    const category = card.dataset.category || '';
    const name = (card.querySelector('.card-name')?.textContent || '').toLowerCase();

    const matchK = activeKasta === 'all' || kasta === activeKasta;
    const matchF = activeFormation === 'all' || formation === activeFormation;
    const matchC = activeCategory === 'all' || category === activeCategory;
    const matchS = !activeSearch || name.includes(activeSearch);

    const show = matchK && matchF && matchC && matchS;
    card.style.display = show ? '' : 'none';

    if (show) visible++;
  });

  /* Hide section jika semua card di dalamnya tersembunyi */
  document.querySelectorAll('.kasta-section').forEach(section => {
    const anyVisible = [...section.querySelectorAll('.product-card')]
      .some(card => card.style.display !== 'none');

    section.style.display = anyVisible ? '' : 'none';
  });

  /* Hide territory gap kalau section berikutnya ikut hilang */
  document.querySelectorAll('.territory-gap').forEach(gap => {
    const territory = gap.dataset.territory;
    if (!territory) return;

    const sectionId =
      'section' + territory.charAt(0).toUpperCase() + territory.slice(1);

    const section = document.getElementById(sectionId);
    gap.style.display = section && section.style.display !== 'none' ? '' : 'none';
  });

  const countEl = document.getElementById('filterCount');
  if (countEl) {
    countEl.textContent = `Showing ${visible} item${visible !== 1 ? 's' : ''}`;
  }
}

/* ─── FILTER ACTIONS ────────────────────────────────────────── */
document.getElementById('filterKasta')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;

  document.querySelectorAll('#filterKasta .filter-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
  activeKasta = btn.dataset.filter || 'all';
  applyFilters();
});

document.getElementById('filterFormation')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-formation]');
  if (!btn) return;

  document.querySelectorAll('#filterFormation .filter-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
  activeFormation = btn.dataset.formation || 'all';
  applyFilters();
});

document.getElementById('filterCategory')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-category]');
  if (!btn) return;

  document.querySelectorAll('#filterCategory .filter-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
  activeCategory = btn.dataset.category || 'all';
  applyFilters();
});

function clearAllFilters() {
  activeKasta = 'all';
  activeFormation = 'all';
  activeCategory = 'all';
  activeSearch = '';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isAllButton =
      btn.dataset.filter === 'all' ||
      btn.dataset.formation === 'all' ||
      btn.dataset.category === 'all';

    btn.classList.toggle('active', isAllButton);
  });

  const searchInput = document.getElementById('marketSearch');
  if (searchInput) searchInput.value = '';

  document.getElementById('searchClear')?.classList.add('hidden');
  document.getElementById('searchSuggestions')?.classList.add('hidden');

  applyFilters();
}

document.getElementById('clearAllFilters')?.addEventListener('click', clearAllFilters);
document.getElementById('clearAllFiltersBottom')?.addEventListener('click', clearAllFilters);

/* ─── SEARCH ────────────────────────────────────────────────── */
const searchInput = document.getElementById('marketSearch');
const searchClearBtn = document.getElementById('searchClear');

searchInput?.addEventListener('input', () => {
  activeSearch = searchInput.value.trim().toLowerCase();
  searchClearBtn?.classList.toggle('hidden', !activeSearch);
  applyFilters();
});

searchClearBtn?.addEventListener('click', () => {
  if (!searchInput) return;

  searchInput.value = '';
  activeSearch = '';
  searchClearBtn.classList.add('hidden');
  document.getElementById('searchSuggestions')?.classList.add('hidden');
  applyFilters();
});

/* ─── DEPTH GAUGE ───────────────────────────────────────────── */
function updateDepthGauge() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  const maxDepth = 10000;
  const depth = Math.round(pct * maxDepth);

  const fill = document.getElementById('depthGaugeFill');
  const value = document.getElementById('depthCurrentValue');
  const bc = document.getElementById('bcDepth');

  if (fill) {
    fill.style.height = `${pct * 100}%`;

    let color;
    if (depth < 2000) {
      color = 'var(--nereid-color)';
    } else if (depth < 5500) {
      color = '#9b59b6';
    } else if (depth < 9000) {
      color = 'var(--leviathan-color)';
    } else {
      color = 'var(--sovereign-color)';
    }

  fill.style.backgroundColor = color;
  fill.style.boxShadow = `0 0 10px ${color}`;
}

  if (value) value.textContent = `${depth.toLocaleString('id-ID')}m`;
  if (bc) bc.textContent = `— ${depth.toLocaleString('id-ID')}m`;

  const labels = [
    { id: 'dgNereid', depth: 0 },
    { id: 'dgPoseidon', depth: 2020 },
    { id: 'dgLeviathan', depth: 5300 },
    { id: 'dgSovereign', depth: 8300 }
  ];

  let active = labels[0];
  labels.forEach(label => {
    if (depth >= label.depth) active = label;
  });

  labels.forEach(label => {
    const el = document.getElementById(label.id);
    if (el) el.classList.toggle('active', label.id === active.id);
  });
}

/* ─── AUTO HIDE HEADER + FILTER BAR ─────────────────────────── */
const header = document.getElementById('marketHeader');
const filterBar = document.getElementById('filterBar');
const breadcrumbs = document.getElementById('breadcrumbs');

let lastScrollY = window.scrollY;
const scrollThreshold = 8;

function handleHeaderAndFilterVisibility() {
  const currentScrollY = window.scrollY;
  const scrollDiff = currentScrollY - lastScrollY;

  if (Math.abs(scrollDiff) < scrollThreshold) return;

  /* Saat di paling atas halaman: semua kembali normal */
  if (currentScrollY <= 10) {
    header?.classList.remove('header-hidden');

    breadcrumbs?.classList.remove('header-hidden-state');

    filterBar?.classList.remove('filter-hidden');

    lastScrollY = currentScrollY;
    return;
  }

  const isScrollingDown = scrollDiff > 0;
  const isScrollingUp = scrollDiff < 0;

  /* Scroll down: header hilang, filter hilang, breadcrumbs naik ke atas */
  if (isScrollingDown && currentScrollY > 120) {
    header?.classList.add('header-hidden');

    breadcrumbs?.classList.add('header-hidden-state');

    filterBar?.classList.add('filter-hidden');
  }

  /* Scroll up: header muncul, filter muncul, breadcrumbs turun lagi */
  if (isScrollingUp) {
    header?.classList.remove('header-hidden');

    breadcrumbs?.classList.remove('header-hidden-state');

    filterBar?.classList.remove('filter-hidden');
  }

  lastScrollY = currentScrollY;
}

/* ─── HEADER SHADOW ─────────────────────────────────────────── */
function updateHeaderShadow() {
  header?.classList.toggle('scrolled', window.scrollY > 10);
}

/* ─── ABYSSAL DARK MODE TOGGLE ──────────────────────────────── */
const abyssToggle = document.getElementById('abyssToggle');
const sonar = document.getElementById('sonarAmbient');
let abyssOn = false;

abyssToggle?.addEventListener('click', async () => {
  abyssOn = !abyssOn;
  document.body.classList.toggle('abyss-mode', abyssOn);
  abyssToggle.classList.toggle('active', abyssOn);

  if (abyssOn) {
    try {
      await sonar?.play();
    } catch (err) {
      /* abaikan error autoplay */
    }
  } else {
    sonar?.pause();
  }
});

/* ─── AUTH ──────────────────────────────────────────────────── */
(function checkAuth() {
  try {
    const user = JSON.parse(localStorage.getItem('lev_user') || 'null');
    const container = document.getElementById('authContainer');
    if (!container) return;

    const isLoggedIn = user || localStorage.getItem('isLoggedIn') === 'true';
    const userName = user?.name || localStorage.getItem('userName') || sessionStorage.getItem('userName');
    const userEmail = user?.email || localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const userAvatar = user?.avatar || localStorage.getItem('userPicture') || '';

    if (isLoggedIn && userEmail) {
      const displayName = userName || userEmail.split('@')[0];
      const initial = displayName.charAt(0).toUpperCase();

      container.innerHTML = `
        <a href="leviathan_store_user.html" class="tool-btn" title="Hunter Profile" style="width:auto; padding:0 8px;">
          ${userAvatar ? 
            `<img src="${userAvatar}" class="user-avatar-img" alt="Avatar" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--monarch-blue);object-fit:cover;">` :
            `<span class="user-initial" style="width:30px;height:30px;display:grid;place-items:center;background:var(--monarch-blue);color:#000;border-radius:50%;font-weight:700;">${initial}</span>`
          }
          <span style="margin-left:6px;font-family:var(--font-hud);font-size:0.7rem;">${displayName}</span>
        </a>
        <button class="tool-btn" title="Logout" onclick="localStorage.clear();sessionStorage.clear();location.reload();">
          <i class="fas fa-sign-out-alt"></i>
        </button>`;
    }
  } catch (e) {}
})();

/* ─── WISHLIST ──────────────────────────────────────────────── */
let wishlist = JSON.parse(localStorage.getItem('lev_wishlist') || '[]');

function saveWishlist() {
  localStorage.setItem('lev_wishlist', JSON.stringify(wishlist));
}

function isInWishlist(id) {
  return wishlist.some(item => item.id === id);
}

function getProductDataFromCard(card) {
  return {
    id: card.dataset.id,
    name: card.querySelector('.card-name')?.textContent.trim() || 'Unknown Product',
    price: card.querySelector('.card-price')?.textContent.trim() || 'Rp 0',
    img: card.querySelector('.card-img-frame img')?.getAttribute('src') || '',
    kasta: card.dataset.kasta || 'nereid',
    category: card.dataset.category || 'unknown',
    formation: card.dataset.formation || 'single',
  };
}

function toggleWishlistFromCard(btn) {
  const card = btn.closest('.product-card');
  if (!card) return;

  const product = getProductDataFromCard(card);
  const existingIndex = wishlist.findIndex(item => item.id === product.id);

  if (existingIndex >= 0) {
    wishlist.splice(existingIndex, 1);
    btn.classList.remove('active');
    btn.innerHTML = '<i class="far fa-heart"></i> WISHLIST';
    showToast(`💔 ${product.name} removed from wishlist`);
  } else {
    wishlist.push(product);
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-heart"></i> SAVED';
    showToast(`💙 ${product.name} saved to wishlist`);
  }

  saveWishlist();
}

function initWishlistButtons() {
  document.querySelectorAll('.product-card').forEach(card => {
    const actions = card.querySelector('.card-actions');
    if (!actions || actions.querySelector('.btn-card-wishlist')) return;

    const product = getProductDataFromCard(card);
    const active = isInWishlist(product.id);

    const btn = document.createElement('button');
    btn.className = `btn-card-wishlist ${active ? 'active' : ''}`;
    btn.type = 'button';
    btn.innerHTML = active
      ? '<i class="fas fa-heart"></i> SAVED'
      : '<i class="far fa-heart"></i> WISHLIST';

    btn.addEventListener('click', () => toggleWishlistFromCard(btn));

    actions.appendChild(btn);
  });
}

/* ─── SCROLL LISTENERS ──────────────────────────────────────── */
window.addEventListener('scroll', () => {
  handleHeaderAndFilterVisibility();
  updateHeaderShadow();
  updateDepthGauge();
}, { passive: true });

/* ─── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  applyFilters();
  updateDepthGauge();
  updateHeaderShadow();
  initWishlistButtons();

  header?.classList.remove('header-hidden');
  filterBar?.classList.remove('filter-hidden');
  breadcrumbs?.classList.remove('header-hidden-state');
});

